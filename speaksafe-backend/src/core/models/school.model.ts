import mongoose, { Document, Schema } from "mongoose";

export interface ISchool extends Document {
  id: string;
  name: string;
  domain: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  settings: {
    allowAnonymous: boolean;
    allowAttachments: boolean;
    retentionDays: number;
  };
  stats: {
    totalReports: number;
    activeAdmins: number; // school-admin + school-staff
    resolvedCases: number;
    pendingCases: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    address: String,
    phone: String,
    email: String,
    website: String,
    logo: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowAnonymous: {
        type: Boolean,
        default: true,
      },
      allowAttachments: {
        type: Boolean,
        default: true,
      },
      retentionDays: {
        type: Number,
        default: 365,
      },
    },
    stats: {
      totalReports: {
        type: Number,
        default: 0,
      },
      activeAdmins: {
        type: Number,
        default: 0,
      },
      resolvedCases: {
        type: Number,
        default: 0,
      },
      pendingCases: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

SchoolSchema.index({ domain: 1 });
SchoolSchema.index({ isActive: 1 });

export const School = mongoose.model<ISchool>("School", SchoolSchema);
