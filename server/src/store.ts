import { Product, type IProduct } from "./models/Product.js";
import {
  StudioModel,
  type IStudioModel,
  type ModelFormat,
} from "./models/StudioModel.js";
import { Order, type IOrder, type OrderStatus } from "./models/Order.js";
import {
  ContactMessage,
  type IContactMessage,
  type ContactMessageStatus,
} from "./models/ContactMessage.js";
import { Newsletter } from "./models/Newsletter.js";

export type { OrderStatus, ModelFormat, ContactMessageStatus };

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
  userId?: string;
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
    phone: string;
  };
};

export type ContactMessageDoc = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
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
  p: Omit<ProductDoc, "id">,
): Promise<ProductDoc> {
  const doc = await Product.create(p);
  return doc.toJSON() as unknown as ProductDoc;
}

export async function updateProduct(
  id: string,
  p: Partial<ProductDoc>,
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
  order: Omit<OrderDoc, "id" | "date">,
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
  status: OrderStatus,
): Promise<OrderDoc | null> {
  const doc = await Order.findOneAndUpdate(
    { orderId },
    { status },
    { new: true },
  );
  return doc ? (doc.toJSON() as unknown as OrderDoc) : null;
}

// --- Studio Models ---

export async function getStudioModels(): Promise<StudioModelDoc[]> {
  const docs = await StudioModel.find().sort({ createdAt: -1 });
  return docs.map((d) => d.toJSON() as unknown as StudioModelDoc);
}

export async function getStudioModelById(
  id: string,
): Promise<StudioModelDoc | null> {
  const doc = await StudioModel.findById(id);
  return doc ? (doc.toJSON() as unknown as StudioModelDoc) : null;
}

export async function addStudioModel(
  m: Omit<StudioModelDoc, "id">,
): Promise<StudioModelDoc> {
  const doc = await StudioModel.create(m);
  return doc.toJSON() as unknown as StudioModelDoc;
}

export async function updateStudioModel(
  id: string,
  m: Partial<StudioModelDoc>,
): Promise<StudioModelDoc | null> {
  const doc = await StudioModel.findByIdAndUpdate(id, m, { new: true });
  return doc ? (doc.toJSON() as unknown as StudioModelDoc) : null;
}

export async function deleteStudioModel(id: string): Promise<boolean> {
  const result = await StudioModel.findByIdAndDelete(id);
  return result !== null;
}

// --- Contact messages (public submit; admin read/update/delete) ---

function toContactMessageDoc(doc: IContactMessage): ContactMessageDoc {
  const j = doc.toJSON() as Record<string, unknown>;
  const iso = (v: unknown) =>
    v instanceof Date ? v.toISOString() : String(v ?? "");
  return {
    id: String(j.id),
    name: String(j.name),
    email: String(j.email),
    phone: String(j.phone ?? ""),
    category: String(j.category),
    message: String(j.message),
    status: j.status as ContactMessageDoc["status"],
    createdAt: iso(j.createdAt),
    updatedAt: iso(j.updatedAt),
  };
}

export async function createContactMessage(
  input: Omit<ContactMessageDoc, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<ContactMessageDoc> {
  const doc = await ContactMessage.create({
    name: input.name,
    email: input.email,
    phone: input.phone || "",
    category: input.category,
    message: input.message,
  });
  return toContactMessageDoc(doc);
}

export async function getContactMessages(): Promise<ContactMessageDoc[]> {
  const docs = await ContactMessage.find().sort({ createdAt: -1 });
  return docs.map((d) => toContactMessageDoc(d));
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessageDoc | null> {
  const doc = await ContactMessage.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
  return doc ? toContactMessageDoc(doc) : null;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const result = await ContactMessage.findByIdAndDelete(id);
  return result !== null;
}

// --- Newsletter ---

export type NewsletterDoc = {
  id: string;
  email: string;
  createdAt: string;
};

export async function subscribeNewsletter(
  email: string,
): Promise<NewsletterDoc> {
  const doc = await Newsletter.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { email: email.toLowerCase().trim() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const j = doc.toJSON() as unknown as Record<string, unknown>;
  return {
    id: String(j.id),
    email: String(j.email),
    createdAt:
      j.createdAt instanceof Date
        ? j.createdAt.toISOString()
        : String(j.createdAt ?? ""),
  };
}

export async function getNewsletterCount(): Promise<number> {
  return Newsletter.countDocuments();
}

export async function getNewsletterSubscribers(): Promise<NewsletterDoc[]> {
  const docs = await Newsletter.find().sort({ createdAt: -1 });
  return docs.map((d) => {
    const j = d.toJSON() as unknown as Record<string, unknown>;
    return {
      id: String(j.id),
      email: String(j.email),
      createdAt:
        j.createdAt instanceof Date
          ? j.createdAt.toISOString()
          : String(j.createdAt ?? ""),
    };
  });
}

// --- Dashboard Stats ---

export interface DashboardStats {
  currentMonth: { revenue: number; orderCount: number };
  previousMonth: { revenue: number; orderCount: number };
  totalProducts: number;
  newsletterCount: number;
  ordersByStatus: Record<string, number>;
  revenueByCategory: Record<string, number>;
  topCategory: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const allOrders = await Order.find();

  let curRevenue = 0;
  let curCount = 0;
  let prevRevenue = 0;
  let prevCount = 0;
  const ordersByStatus: Record<string, number> = {};
  const revenueByCategory: Record<string, number> = {};

  for (const order of allOrders) {
    const orderDate = new Date(order.date);

    if (orderDate >= currentMonthStart) {
      curRevenue += order.total;
      curCount++;
    } else if (
      orderDate >= previousMonthStart &&
      orderDate < currentMonthStart
    ) {
      prevRevenue += order.total;
      prevCount++;
    }

    const status = order.status || "pending";
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;

    for (const item of order.items) {
      const cat = item.category || "Uncategorized";
      revenueByCategory[cat] =
        (revenueByCategory[cat] || 0) + item.price * item.quantity;
    }
  }

  const topCategory =
    Object.entries(revenueByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "N/A";

  const [totalProducts, newsletterCount] = await Promise.all([
    Product.countDocuments(),
    getNewsletterCount(),
  ]);

  return {
    currentMonth: { revenue: curRevenue, orderCount: curCount },
    previousMonth: { revenue: prevRevenue, orderCount: prevCount },
    totalProducts,
    newsletterCount,
    ordersByStatus,
    revenueByCategory,
    topCategory,
  };
}
