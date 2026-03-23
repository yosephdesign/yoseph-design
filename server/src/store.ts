import { Product, PRODUCTS } from "./data/products.js";
import { StudioModel, STUDIO_MODELS } from "./data/studioModels.js";

export type { Product, StudioModel };

export type OrderStatus = "pending" | "processed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  customer: CustomerInfo;
}

const products: Product[] = [...PRODUCTS];
const orders: Order[] = [];
const studioModels: StudioModel[] = [...STUDIO_MODELS];

export function getProducts(): Product[] {
  return [...products].reverse(); // newest first (recently added)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function addProduct(p: Omit<Product, "id">): Product {
  const newProduct: Product = {
    ...p,
    id: Math.random().toString(36).substring(2, 9),
  };
  products.push(newProduct);
  return newProduct;
}

export function updateProduct(id: string, p: Partial<Product>): Product | undefined {
  const i = products.findIndex((x) => x.id === id);
  if (i === -1) return undefined;
  products[i] = { ...products[i], ...p };
  return products[i];
}

export function deleteProduct(id: string): boolean {
  const i = products.findIndex((x) => x.id === id);
  if (i === -1) return false;
  products.splice(i, 1);
  return true;
}

export function getOrders(): Order[] {
  return [...orders];
}

export function createOrder(order: Omit<Order, "id" | "date">): Order {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    date: new Date().toISOString(),
  };
  orders.push(newOrder);
  return newOrder;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const o = orders.find((x) => x.id === id);
  if (!o) return undefined;
  o.status = status;
  return o;
}

// Studio models (3D models for Studio page)
export function getStudioModels(): StudioModel[] {
  return [...studioModels].reverse(); // newest first (recently added)
}

export function getStudioModelById(id: string): StudioModel | undefined {
  return studioModels.find((m) => m.id === id);
}

export function addStudioModel(m: Omit<StudioModel, "id">): StudioModel {
  const newModel: StudioModel = {
    ...m,
    id: `sm-${Math.random().toString(36).substring(2, 9)}`,
  };
  studioModels.push(newModel);
  return newModel;
}

export function updateStudioModel(id: string, m: Partial<StudioModel>): StudioModel | undefined {
  const i = studioModels.findIndex((x) => x.id === id);
  if (i === -1) return undefined;
  studioModels[i] = { ...studioModels[i], ...m };
  return studioModels[i];
}

export function deleteStudioModel(id: string): boolean {
  const i = studioModels.findIndex((x) => x.id === id);
  if (i === -1) return false;
  studioModels.splice(i, 1);
  return true;
}
