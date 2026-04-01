import "dotenv/config";
import crypto from "crypto";
import dns from "dns/promises";
import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "./db.js";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  createOrder,
  updateOrderStatus,
  getStudioModels,
  getStudioModelById,
  addStudioModel,
  updateStudioModel,
  deleteStudioModel,
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  type ProductDoc,
  type OrderDoc,
  type OrderStatus,
  type StudioModelDoc,
  type ContactMessageStatus,
  subscribeNewsletter,
  getNewsletterSubscribers,
  getDashboardStats,
} from "./store.js";
import {
  AdminSettings,
  hashPassword,
  verifyPassword,
} from "./models/AdminSettings.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: true }));
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Admin auth — credentials stored in MongoDB with hardcoded fallback
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const TOKEN_SECRET = process.env.TOKEN_SECRET ?? "fallback-token-secret-change-me";

async function getOrCreateAdmin() {
  let admin = await AdminSettings.findOne();
  if (!admin) {
    const { hash, salt } = hashPassword(DEFAULT_ADMIN_PASSWORD);
    admin = await AdminSettings.create({
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hash,
      passwordSalt: salt,
    });
  }
  return admin;
}

function createAdminToken(email: string): string {
  const payload = `${email}:admin:${Date.now()}`;
  return "admin-" + crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
}

let _cachedToken: string | null = null;
let _cachedTokenEmail: string | null = null;

function isValidAdminToken(token: string): boolean {
  if (!token || !token.startsWith("admin-")) return false;
  if (_cachedToken && token === _cachedToken) return true;
  return false;
}

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = await getOrCreateAdmin();
    if (
      email.trim().toLowerCase() !== admin.email ||
      !verifyPassword(password, admin.passwordHash, admin.passwordSalt)
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createAdminToken(admin.email);
    _cachedToken = token;
    _cachedTokenEmail = admin.email;
    return res.json({ token, user: { id: admin.id, email: admin.email, role: "admin" } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token || !isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// --- Settings endpoints (admin only) ---

app.get("/api/settings/profile", requireAdmin, async (_req, res) => {
  try {
    const admin = await getOrCreateAdmin();
    res.json({ email: admin.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/settings/profile", requireAdmin, async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const admin = await getOrCreateAdmin();
    admin.email = trimmed;
    await admin.save();

    _cachedTokenEmail = trimmed;
    res.json({ email: admin.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/settings/password", requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ error: "Both current and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const admin = await getOrCreateAdmin();
    if (!verifyPassword(currentPassword, admin.passwordHash, admin.passwordSalt)) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const { hash, salt } = hashPassword(newPassword);
    admin.passwordHash = hash;
    admin.passwordSalt = salt;
    await admin.save();

    const token = createAdminToken(admin.email);
    _cachedToken = token;
    _cachedTokenEmail = admin.email;

    res.json({ message: "Password updated successfully", token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/settings/services", requireAdmin, async (_req, res) => {
  try {
    const services = {
      mongodb: { connected: true },
      cloudinary: {
        configured: !!(
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name"
        ),
      },
      emailVerification: {
        configured: !!process.env.ABSTRACTAPI_EMAIL_KEY,
      },
    };
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Image Upload endpoint
app.post("/api/upload", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      return res.status(500).json({ 
        error: "Cloudinary not configured", 
        message: "Please set up Cloudinary credentials in server/.env file" 
      });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "yoseph-design/products",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    res.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed", message: error.message });
  }
});

// PDF Upload endpoint
app.post("/api/upload-pdf", requireAdmin, pdfUpload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      return res.status(500).json({
        error: "Cloudinary not configured",
        message: "Please set up Cloudinary credentials in server/.env file"
      });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "yoseph-design/studio-pdfs",
          resource_type: "raw",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    res.status(500).json({ error: "PDF upload failed", message: error.message });
  }
});

// Products (public read; admin write)
app.get("/api/products", async (_req, res) => {
  try {
    res.json(await getProducts());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const p = await getProductById(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const body = req.body as Omit<ProductDoc, "id">;
    const created = await addProduct(body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders (client create; admin read/update)
app.get("/api/orders", requireAdmin, async (_req, res) => {
  try {
    res.json(await getOrders());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const body = req.body as Omit<OrderDoc, "id" | "date">;
    const created = await createOrder(body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body as { status: OrderStatus };
    const updated = await updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Email verification via AbstractAPI (optional) ---

async function verifyEmailAbstract(email: string): Promise<{ ok: boolean; reason?: string }> {
  const key = process.env.ABSTRACTAPI_EMAIL_KEY;
  if (!key) return { ok: true };

  try {
    const url = `https://emailreputation.abstractapi.com/v1/?api_key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    if (!res.ok) return { ok: true };

    const data = await res.json();
    const status = data.email_deliverability?.status;
    const quality = data.email_quality;

    if (status === "undeliverable") {
      return { ok: false, reason: "This email address does not exist or cannot receive mail." };
    }
    if (quality?.is_disposable) {
      return { ok: false, reason: "Disposable email addresses are not allowed." };
    }
    if (quality?.score !== null && quality?.score < 0.3) {
      return { ok: false, reason: "This email address appears to be invalid or low quality." };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// Contact form (public submit; admin list / manage)

const PROVIDER_RULES: Record<string, { minLocal: number; localPattern?: RegExp; label: string }> = {
  "gmail.com":      { minLocal: 6, localPattern: /^[a-zA-Z0-9.]+$/, label: "Gmail" },
  "googlemail.com": { minLocal: 6, localPattern: /^[a-zA-Z0-9.]+$/, label: "Gmail" },
  "yahoo.com":      { minLocal: 4, label: "Yahoo" },
  "ymail.com":      { minLocal: 4, label: "Yahoo" },
  "outlook.com":    { minLocal: 3, label: "Outlook" },
  "hotmail.com":    { minLocal: 3, label: "Hotmail" },
  "live.com":       { minLocal: 3, label: "Outlook" },
};

function validateEmailLocal(email: string): string | null {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "Invalid email address.";

  const rule = PROVIDER_RULES[domain.toLowerCase()];
  if (rule) {
    if (local.length < rule.minLocal) {
      return `${rule.label} usernames must be at least ${rule.minLocal} characters.`;
    }
    if (rule.localPattern && !rule.localPattern.test(local)) {
      return `${rule.label} usernames can only contain letters, numbers, and dots.`;
    }
  } else if (local.length < 2) {
    return "Email username is too short.";
  }
  return null;
}

async function verifyEmailDomain(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body ?? {};
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof category !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : "",
      category: category.trim(),
      message: message.trim(),
    };
    if (
      !trimmed.name ||
      !trimmed.email ||
      !trimmed.category ||
      !trimmed.message
    ) {
      return res
        .status(400)
        .json({ error: "Name, email, category, and message are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed.email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const localError = validateEmailLocal(trimmed.email);
    if (localError) {
      return res.status(400).json({ error: localError });
    }

    const domainValid = await verifyEmailDomain(trimmed.email);
    if (!domainValid) {
      return res.status(400).json({
        error: "This email domain does not exist or cannot receive mail. Please use a valid email address (e.g. Gmail, Yahoo, Outlook).",
      });
    }

    const abstractCheck = await verifyEmailAbstract(trimmed.email);
    if (!abstractCheck.ok) {
      return res.status(400).json({ error: abstractCheck.reason });
    }

    const created = await createContactMessage(trimmed);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/contact-messages", requireAdmin, async (_req, res) => {
  try {
    res.json(await getContactMessages());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/contact-messages/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body as { status?: ContactMessageStatus };
    const allowed: ContactMessageStatus[] = ["new", "read", "archived"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updated = await updateContactMessageStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/contact-messages/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await deleteContactMessage(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats (admin only)
app.get("/api/dashboard-stats", requireAdmin, async (_req, res) => {
  try {
    res.json(await getDashboardStats());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Newsletter (public subscribe; admin list)
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const domainValid = await verifyEmailDomain(trimmedEmail);
    if (!domainValid) {
      return res.status(400).json({
        error: "This email domain does not exist or cannot receive mail.",
      });
    }

    const abstractCheck = await verifyEmailAbstract(trimmedEmail);
    if (!abstractCheck.ok) {
      return res.status(400).json({ error: abstractCheck.reason });
    }

    const created = await subscribeNewsletter(trimmedEmail);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/newsletter", requireAdmin, async (_req, res) => {
  try {
    res.json(await getNewsletterSubscribers());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Studio models (public read; admin write)
app.get("/api/studio-models", async (_req, res) => {
  try {
    res.json(await getStudioModels());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/studio-models/:id", async (req, res) => {
  try {
    const m = await getStudioModelById(req.params.id);
    if (!m) return res.status(404).json({ error: "Not found" });
    res.json(m);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/studio-models", requireAdmin, async (req, res) => {
  try {
    const body = req.body as Omit<StudioModelDoc, "id">;
    const created = await addStudioModel(body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/studio-models/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await updateStudioModel(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/studio-models/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await deleteStudioModel(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
