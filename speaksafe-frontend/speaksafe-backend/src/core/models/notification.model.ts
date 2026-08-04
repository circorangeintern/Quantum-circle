import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  type: "new" | "urgent" | "assign" | "update" | "resolved";
  title: string;
  message: string;
  adminId: string;
  reportId?: string;
  read: boolean;
  readAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["new", "urgent", "assign", "update", "resolved"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: "Report",
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

NotificationSchema.index({ adminId: 1, read: 1 });
NotificationSchema.index({ adminId: 1, createdAt: -1 });
NotificationSchema.index({ reportId: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
