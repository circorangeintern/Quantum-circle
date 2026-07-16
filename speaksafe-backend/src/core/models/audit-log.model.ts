import mongoose, { Document, Schema } from "mongoose";

export type AuditAction =
  | "login"
  | "logout"
  | "status_update"
  | "report_viewed"
  | "report_created"
  | "report_deleted"
  | "report_updated"
  | "report_assigned"
  | "note_added"
  | "urgency_updated"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "password_reset_email_failed"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "permissions_updated"
  | "refresh"
  | "request_approved"
  | "request_rejected"
  | "request_created"
  | "user_temporal_password"
  | "user_temporal_password_failed";

export interface IAuditLog extends Document {
  id: string;
  action: AuditAction;
  adminId?: string;
  reportId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: [
        "login",
        "logout",
        "status_update",
        "report_viewed",
        "report_created",
        "report_deleted",
        "report_updated",
        "report_assigned",
        "note_added",
        "urgency_updated",
        "password_changed",
        "password_reset_requested",
        "password_reset_completed",
        "password_reset_email_failed",
        "user_created",
        "user_updated",
        "user_deleted",
        "permissions_updated",
        "refresh",
        "request_approved",
        "request_rejected",
        "request_created",
      ],
      required: true,
    },
    adminId: {
      type: String,
      ref: "Admin",
      index: true,
    },
    reportId: {
      type: String,
      ref: "Report",
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for efficient querying
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ reportId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// Auto-remove logs older than 90 days
AuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 }, // 90 days
);

// Virtual for formatted date
AuditLogSchema.virtual("formattedDate").get(function () {
  return this.timestamp.toLocaleString();
});

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
