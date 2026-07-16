import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordReset extends Document {
  adminId: string;
  token: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    adminId: {
      type: String,
      ref: "Admin",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for finding valid tokens
PasswordResetSchema.index({ token: 1, used: 1, expiresAt: 1 });

export const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  PasswordResetSchema,
);
