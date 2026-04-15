import mongoose, { Schema, Document } from "mongoose";

export interface IClientModelAccess extends Document {
  userId: string;
  productId: string;
  grantedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientModelAccessSchema = new Schema<IClientModelAccess>(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    grantedBy: { type: String },
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
  },
);

ClientModelAccessSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const ClientModelAccess = mongoose.model<IClientModelAccess>(
  "ClientModelAccess",
  ClientModelAccessSchema,
);
