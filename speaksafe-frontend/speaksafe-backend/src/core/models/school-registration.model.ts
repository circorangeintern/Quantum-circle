import mongoose, { Document, Schema } from "mongoose";

export interface ISchoolRegistration extends Document {
  // School Information
  schoolName: string;
  domain: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;

  // Admin Information (first admin)
  adminName: string;
  adminEmail: string;
  adminPasswordHash: string; // Hashed password

  // Request Status
  status: "pending" | "approved" | "rejected";

  // Review Information
  reviewedBy?: string; // Admin ID who reviewed
  reviewedAt?: Date;
  reviewNotes?: string;

  // Approved School & Admin References
  approvedSchoolId?: Schema.Types.ObjectId | string; // Reference to School document
  approvedAdminId?: Schema.Types.ObjectId | string; // Reference to Admin document

  // Metadata
  ipAddress?: string;
  userAgent?: string;

  // Timestamps
  submittedAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

const SchoolRegistrationSchema = new Schema<ISchoolRegistration>(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    adminPasswordHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: String,
      ref: "Admin",
    },
    reviewedAt: Date,
    reviewNotes: {
      type: String,
      trim: true,
    },
    approvedSchoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
    },
    approvedAdminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "submittedAt",
      updatedAt: "updatedAt",
    },
  },
);

// Indexes
SchoolRegistrationSchema.index({ domain: 1, status: 1 });
SchoolRegistrationSchema.index({ adminEmail: 1, status: 1 });
SchoolRegistrationSchema.index({ status: 1, submittedAt: -1 });
SchoolRegistrationSchema.index({ approvedSchoolId: 1 });
SchoolRegistrationSchema.index({ approvedAdminId: 1 });

export const SchoolRegistration = mongoose.model<ISchoolRegistration>(
  "SchoolRegistration",
  SchoolRegistrationSchema,
);
