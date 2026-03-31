import mongoose, { Schema, Document } from "mongoose";

export type ModelFormat = "RVT" | "FBX" | "OBJ" | "SKP" | "3DS" | "DWG";

export interface IStudioModel extends Document {
  name: string;
  description: string;
  price?: number;
  format?: ModelFormat;
  category: string;
  image: string;
  featured?: boolean;
  pdfUrl?: string;
}

const StudioModelSchema = new Schema<IStudioModel>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    format: { type: String, enum: ["RVT", "FBX", "OBJ", "SKP", "3DS", "DWG"] },
    category: { type: String, required: true },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    pdfUrl: { type: String },
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

export const StudioModel = mongoose.model<IStudioModel>(
  "StudioModel",
  StudioModelSchema
);
