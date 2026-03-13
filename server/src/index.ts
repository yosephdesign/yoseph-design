import express from "express";
import cors from "cors";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  createOrder,
  updateOrderStatus,
  type Product,
  type Order,
  type OrderStatus,
} from "./store";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: true }));
app.use(express.json());

// Simple admin auth (demo only – use proper auth in production)
const ADMIN_SECRET = "admin123";
const adminTokens = new Set<string>();

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (email === "admin@example.com" && password === ADMIN_SECRET) {
    const token = `admin-${Date.now()}`;
    adminTokens.add(token);
    return res.json({ token, user: { id: "1", email, role: "admin" } });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Products (public read; admin write)
app.get("/api/products", (_req, res) => {
  res.json(getProducts());
});

app.get("/api/products/:id", (req, res) => {
  const p = getProductById(req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

app.post("/api/products", requireAdmin, (req, res) => {
  const body = req.body as Omit<Product, "id">;
  const created = addProduct(body);
  res.status(201).json(created);
});

app.put("/api/products/:id", requireAdmin, (req, res) => {
  const updated = updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const ok = deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// Orders (client create; admin read/update)
app.get("/api/orders", requireAdmin, (_req, res) => {
  res.json(getOrders());
});

app.post("/api/orders", (req, res) => {
  const body = req.body as Omit<Order, "id" | "date">;
  const created = createOrder(body);
  res.status(201).json(created);
});

app.put("/api/orders/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body as { status: OrderStatus };
  const updated = updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
