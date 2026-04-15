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
import { ClientUser } from "./models/ClientUser.js";
import { Order } from "./models/Order.js";
import { Product } from "./models/Product.js";
import { ClientModelAccess } from "./models/ClientModelAccess.js";

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
  fileFilter: (
    _req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (
    _req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const MODEL_FILE_EXTENSIONS: Record<string, string[]> = {
  RVT: [".rvt"],
  FBX: [".fbx"],
  OBJ: [".obj"],
  SKP: [".skp"],
  "3DS": [".3ds"],
  DWG: [".dwg"],
};

const modelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (
    req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const format = String(req.params.format ?? "")
      .trim()
      .toUpperCase();
    const allowedExts = MODEL_FILE_EXTENSIONS[format];

    if (!allowedExts) {
      cb(new Error("Unsupported model format"));
      return;
    }

    const lower = file.originalname.toLowerCase();
    const isAllowed = allowedExts.some((ext) => lower.endsWith(ext));
    if (!isAllowed) {
      cb(
        new Error(
          `Invalid file extension for ${format}. Expected ${allowedExts.join(
            ", ",
          )}`,
        ),
      );
      return;
    }

    cb(null, true);
  },
});

// Admin auth — credentials stored in MongoDB with hardcoded fallback
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const TOKEN_SECRET =
  process.env.TOKEN_SECRET ?? "fallback-token-secret-change-me";
const CLIENT_TOKEN_SECRET =
  process.env.CLIENT_TOKEN_SECRET ?? "fallback-client-secret-change-me";

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
  return (
    "admin-" +
    crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex")
  );
}

let _cachedToken: string | null = null;
let _cachedTokenEmail: string | null = null;

type ClientAuthPayload = {
  userId: string;
  email: string;
  exp: number;
};

type ClientRequest = express.Request & {
  clientUser?: { id: string; email: string };
};

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function createClientToken(userId: string, email: string): string {
  const payload: ClientAuthPayload = {
    userId,
    email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = crypto
    .createHmac("sha256", CLIENT_TOKEN_SECRET)
    .update(encodedPayload)
    .digest("hex");
  return `client-${encodedPayload}.${signature}`;
}

function verifyClientToken(token: string): ClientAuthPayload | null {
  if (!token || !token.startsWith("client-")) return null;
  const raw = token.slice("client-".length);
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;

  const encodedPayload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  const expected = crypto
    .createHmac("sha256", CLIENT_TOKEN_SECRET)
    .update(encodedPayload)
    .digest("hex");

  if (signature.length !== expected.length) return null;
  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const payload = safeJsonParse<ClientAuthPayload>(decoded);
  if (!payload?.userId || !payload?.email || !payload?.exp) return null;
  if (payload.exp < Date.now()) return null;
  return payload;
}

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
    return res.json({
      token,
      user: { id: admin.id, email: admin.email, role: "admin" },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token || !isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function hasConfirmedPurchase(
  userId: string,
  productId: string,
): Promise<boolean> {
  const paidOrder = await Order.findOne({
    userId,
    status: { $in: ["processed", "shipped", "delivered"] },
    "items.id": productId,
  });
  return !!paidOrder;
}

function requireClient(
  req: ClientRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyClientToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.clientUser = { id: payload.userId, email: payload.email };
  next();
}

app.post("/api/client/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const exists = await ClientUser.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const { hash, salt } = hashPassword(password);
    const user = await ClientUser.create({
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
    });

    const token = createClientToken(String(user.id), user.email);
    return res.status(201).json({
      token,
      user: { id: String(user.id), email: user.email, role: "client" },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/client/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await ClientUser.findOne({ email: normalizedEmail });
    if (
      !user ||
      !verifyPassword(password, user.passwordHash, user.passwordSalt)
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createClientToken(String(user.id), user.email);
    return res.json({
      token,
      user: { id: String(user.id), email: user.email, role: "client" },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get(
  "/api/client/auth/me",
  requireClient,
  async (req: ClientRequest, res) => {
    try {
      const clientUser = req.clientUser;
      if (!clientUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await ClientUser.findById(clientUser.id);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      res.json({
        user: { id: String(user.id), email: user.email, role: "client" },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

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
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "Both current and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const admin = await getOrCreateAdmin();
    if (
      !verifyPassword(currentPassword, admin.passwordHash, admin.passwordSalt)
    ) {
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
app.post(
  "/api/upload",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name"
      ) {
        return res.status(500).json({
          error: "Cloudinary not configured",
          message: "Please set up Cloudinary credentials in server/.env file",
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
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file!.buffer);
      });

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed", message: error.message });
    }
  },
);

// PDF Upload endpoint
app.post(
  "/api/upload-pdf",
  requireAdmin,
  pdfUpload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file provided" });
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name"
      ) {
        return res.status(500).json({
          error: "Cloudinary not configured",
          message: "Please set up Cloudinary credentials in server/.env file",
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
          },
        );
        uploadStream.end(req.file!.buffer);
      });

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error: any) {
      console.error("PDF upload error:", error);
      res
        .status(500)
        .json({ error: "PDF upload failed", message: error.message });
    }
  },
);

// 3D model file upload endpoint
app.post(
  "/api/upload-model-file/:format",
  requireAdmin,
  modelUpload.single("file"),
  async (req, res) => {
    try {
      const format = String(req.params.format ?? "")
        .trim()
        .toUpperCase();
      const allowedExts = MODEL_FILE_EXTENSIONS[format];

      if (!allowedExts) {
        return res.status(400).json({ error: "Unsupported model format" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No model file provided" });
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name"
      ) {
        return res.status(500).json({
          error: "Cloudinary not configured",
          message: "Please set up Cloudinary credentials in server/.env file",
        });
      }

      const baseName = req.file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 48);
      const publicId = `${format}-${Date.now()}-${baseName || "model"}`;

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "yoseph-design/model-files",
            resource_type: "raw",
            public_id: publicId,
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file!.buffer);
      });

      res.json({
        format,
        fileName: req.file.originalname,
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error: any) {
      console.error("Model upload error:", error);
      res.status(500).json({
        error: "Model upload failed",
        message: error.message,
      });
    }
  },
);

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
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
    const payload = token ? verifyClientToken(token) : null;
    const created = await createOrder({
      ...body,
      userId: payload?.userId,
    });
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

app.get("/api/admin/client-access/users", requireAdmin, async (_req, res) => {
  try {
    const users = await ClientUser.find().sort({ createdAt: -1 });

    const paidOrders = await Order.find({
      userId: { $exists: true, $ne: null },
      status: { $in: ["processed", "shipped", "delivered"] },
    });

    const purchasedByUser = new Map<string, Set<string>>();
    for (const order of paidOrders) {
      if (!order.userId) continue;
      const set = purchasedByUser.get(order.userId) ?? new Set<string>();
      for (const item of order.items) {
        if (item.id) set.add(item.id);
      }
      purchasedByUser.set(order.userId, set);
    }

    const allPurchasedModelIds = Array.from(
      new Set(
        Array.from(purchasedByUser.values()).flatMap((set) => Array.from(set)),
      ),
    );

    const products = allPurchasedModelIds.length
      ? await Product.find({ _id: { $in: allPurchasedModelIds } })
      : [];

    const productMap = new Map(
      products.map((p) => [
        String(p._id),
        {
          id: String(p._id),
          name: p.name,
          formats: (p.modelFiles ?? []).map((file) => file.format),
        },
      ]),
    );

    const userIds = users.map((u) => String(u.id));
    const grants = userIds.length
      ? await ClientModelAccess.find({ userId: { $in: userIds } })
      : [];

    const grantedByUser = new Map<string, Set<string>>();
    for (const grant of grants) {
      const set = grantedByUser.get(grant.userId) ?? new Set<string>();
      set.add(grant.productId);
      grantedByUser.set(grant.userId, set);
    }

    const payload = users.map((user) => {
      const uid = String(user.id);
      const purchasedModelIds = Array.from(purchasedByUser.get(uid) ?? []);
      const purchasedModels = purchasedModelIds
        .map((id) => productMap.get(id))
        .filter(
          (p): p is { id: string; name: string; formats: string[] } => !!p,
        );

      return {
        id: uid,
        email: user.email,
        createdAt: user.createdAt,
        purchasedModels,
        grantedModelIds: Array.from(grantedByUser.get(uid) ?? []),
      };
    });

    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/admin/client-access/users/:userId/models/:productId",
  requireAdmin,
  async (req, res) => {
    try {
      const { userId, productId } = req.params;
      const { allowed } = req.body as { allowed?: boolean };

      if (typeof allowed !== "boolean") {
        return res.status(400).json({ error: "allowed must be boolean" });
      }

      const user = await ClientUser.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Client user not found" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!allowed) {
        await ClientModelAccess.findOneAndDelete({ userId, productId });
        return res.json({ userId, productId, allowed: false });
      }

      const purchased = await hasConfirmedPurchase(userId, productId);
      if (!purchased) {
        return res.status(400).json({
          error:
            "This user has no confirmed purchase for the selected model. Access can only be granted for purchased models.",
        });
      }

      const adminEmail = _cachedTokenEmail ?? "admin";
      await ClientModelAccess.findOneAndUpdate(
        { userId, productId },
        { userId, productId, grantedBy: adminEmail },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return res.json({ userId, productId, allowed: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.get(
  "/api/models/:productId/download",
  requireClient,
  async (req: ClientRequest, res) => {
    try {
      const clientUser = req.clientUser;
      const productId = req.params.productId;
      const format = String(req.query.format ?? "")
        .trim()
        .toUpperCase();

      if (!clientUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!format) {
        return res.status(400).json({ error: "format query is required" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const matchedFile = (product.modelFiles ?? []).find(
        (file) => file.format.toUpperCase() === format,
      );

      if (!matchedFile || !matchedFile.url) {
        return res.status(404).json({ error: "Model file not found" });
      }

      const paidOrder = await Order.findOne({
        userId: clientUser.id,
        status: { $in: ["processed", "shipped", "delivered"] },
        "items.id": productId,
      });

      if (!paidOrder) {
        return res.status(403).json({
          error: "You need a confirmed purchase to download this 3D model",
        });
      }

      const accessGrant = await ClientModelAccess.findOne({
        userId: clientUser.id,
        productId,
      });

      if (!accessGrant) {
        return res.status(403).json({
          error:
            "Download is currently disabled for your account. Please contact admin to enable this model.",
        });
      }

      res.json({
        productId,
        format,
        url: matchedFile.url,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

// --- Email verification via AbstractAPI (optional) ---

async function verifyEmailAbstract(
  email: string,
): Promise<{ ok: boolean; reason?: string }> {
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
      return {
        ok: false,
        reason: "This email address does not exist or cannot receive mail.",
      };
    }
    if (quality?.is_disposable) {
      return {
        ok: false,
        reason: "Disposable email addresses are not allowed.",
      };
    }
    if (quality?.score !== null && quality?.score < 0.3) {
      return {
        ok: false,
        reason: "This email address appears to be invalid or low quality.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// Contact form (public submit; admin list / manage)

const PROVIDER_RULES: Record<
  string,
  { minLocal: number; localPattern?: RegExp; label: string }
> = {
  "gmail.com": { minLocal: 6, localPattern: /^[a-zA-Z0-9.]+$/, label: "Gmail" },
  "googlemail.com": {
    minLocal: 6,
    localPattern: /^[a-zA-Z0-9.]+$/,
    label: "Gmail",
  },
  "yahoo.com": { minLocal: 4, label: "Yahoo" },
  "ymail.com": { minLocal: 4, label: "Yahoo" },
  "outlook.com": { minLocal: 3, label: "Outlook" },
  "hotmail.com": { minLocal: 3, label: "Hotmail" },
  "live.com": { minLocal: 3, label: "Outlook" },
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
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    const localError = validateEmailLocal(trimmed.email);
    if (localError) {
      return res.status(400).json({ error: localError });
    }

    const domainValid = await verifyEmailDomain(trimmed.email);
    if (!domainValid) {
      return res.status(400).json({
        error:
          "This email domain does not exist or cannot receive mail. Please use a valid email address (e.g. Gmail, Yahoo, Outlook).",
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
