import mongoose, { Schema, Document } from "mongoose";

export interface IModelFile {
  format: string;
  url?: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  featured?: boolean;
  modelFiles?: IModelFile[];
}

const ModelFileSchema = new Schema<IModelFile>(
  {
    format: { type: String, required: true },
    url: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    modelFiles: { type: [ModelFileSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: any, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
