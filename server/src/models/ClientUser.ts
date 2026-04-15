import mongoose, { Schema, Document } from "mongoose";

export interface IClientUser extends Document {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientUserSchema = new Schema<IClientUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: any, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.passwordSalt;
        return ret;
      },
    },
  },
);

export const ClientUser = mongoose.model<IClientUser>(
  "ClientUser",
  ClientUserSchema,
);
