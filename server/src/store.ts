import { Product, type IProduct } from "./models/Product.js";
import { StudioModel, type IStudioModel, type ModelFormat } from "./models/StudioModel.js";
import { Order, type IOrder, type OrderStatus } from "./models/Order.js";

export type { OrderStatus, ModelFormat };

export type ProductDoc = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  featured?: boolean;
  modelFiles?: { format: string; url?: string }[];
};

export type StudioModelDoc = {
  id: string;
  name: string;
  description: string;
  price?: number;
  format?: ModelFormat;
  category: string;
  image: string;
  featured?: boolean;
  pdfUrl?: string;
};

export type OrderDoc = {
  id: string;
  date: string;
  status: OrderStatus;
  items: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    quantity: number;
  }[];
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
};

// --- Products ---

export async function getProducts(): Promise<ProductDoc[]> {
  const docs = await Product.find().sort({ createdAt: -1 });
  return docs.map((d) => d.toJSON() as unknown as ProductDoc);
}

export async function getProductById(id: string): Promise<ProductDoc | null> {
  const doc = await Product.findById(id);
  return doc ? (doc.toJSON() as unknown as ProductDoc) : null;
}

export async function addProduct(
  p: Omit<ProductDoc, "id">
): Promise<ProductDoc> {
  const doc = await Product.create(p);
  return doc.toJSON() as unknown as ProductDoc;
}

export async function updateProduct(
  id: string,
  p: Partial<ProductDoc>
): Promise<ProductDoc | null> {
  const doc = await Product.findByIdAndUpdate(id, p, { new: true });
  return doc ? (doc.toJSON() as unknown as ProductDoc) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await Product.findByIdAndDelete(id);
  return result !== null;
}

// --- Orders ---

export async function getOrders(): Promise<OrderDoc[]> {
  const docs = await Order.find().sort({ createdAt: -1 });
  return docs.map((d) => d.toJSON() as unknown as OrderDoc);
}

export async function createOrder(
  order: Omit<OrderDoc, "id" | "date">
): Promise<OrderDoc> {
  const doc = await Order.create({
    ...order,
    orderId: `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    date: new Date().toISOString(),
  });
  return doc.toJSON() as unknown as OrderDoc;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderDoc | null> {
  const doc = await Order.findOneAndUpdate(
    { orderId },
    { status },
    { new: true }
  );
  return doc ? (doc.toJSON() as unknown as OrderDoc) : null;
}

// --- Studio Models ---

export async function getStudioModels(): Promise<StudioModelDoc[]> {
  const docs = await StudioModel.find().sort({ createdAt: -1 });
  return docs.map((d) => d.toJSON() as unknown as StudioModelDoc);
}

export async function getStudioModelById(
  id: string
): Promise<StudioModelDoc | null> {
  const doc = await StudioModel.findById(id);
  return doc ? (doc.toJSON() as unknown as StudioModelDoc) : null;
}

export async function addStudioModel(
  m: Omit<StudioModelDoc, "id">
): Promise<StudioModelDoc> {
  const doc = await StudioModel.create(m);
  return doc.toJSON() as unknown as StudioModelDoc;
}

export async function updateStudioModel(
  id: string,
  m: Partial<StudioModelDoc>
): Promise<StudioModelDoc | null> {
  const doc = await StudioModel.findByIdAndUpdate(id, m, { new: true });
  return doc ? (doc.toJSON() as unknown as StudioModelDoc) : null;
}

export async function deleteStudioModel(id: string): Promise<boolean> {
  const result = await StudioModel.findByIdAndDelete(id);
  return result !== null;
}
