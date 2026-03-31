import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "pending"
  | "processed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

export interface ICustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface IOrder extends Document {
  orderId: string;
  date: string;
  status: OrderStatus;
  items: IOrderItem[];
  total: number;
  customer: ICustomerInfo;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const CustomerInfoSchema = new Schema<ICustomerInfo>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    customer: { type: CustomerInfoSchema, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: any, ret: any) {
        ret.id = ret.orderId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
