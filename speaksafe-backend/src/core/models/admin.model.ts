import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "super-admin" | "admin" | "viewer";
  department: string;
  isActive: boolean;
  lastLoginAt?: Date;
  refreshToken?: string;
  preferences: {
    notifications: {
      newReports: boolean;
      urgentCases: boolean;
      weeklySummary: boolean;
      assignments: boolean;
    };
    emailDigest: boolean;
    dashboardView: "list" | "grid";
  };
  permissions: {
    canAssign: boolean;
    canResolve: boolean;
    canViewAll: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "viewer"],
      default: "admin",
    },
    department: {
      type: String,
      default: "Student Affairs",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
    refreshToken: String,
    preferences: {
      notifications: {
        newReports: {
          type: Boolean,
          default: true,
        },
        urgentCases: {
          type: Boolean,
          default: true,
        },
        weeklySummary: {
          type: Boolean,
          default: false,
        },
        assignments: {
          type: Boolean,
          default: true,
        },
      },
      emailDigest: {
        type: Boolean,
        default: false,
      },
      dashboardView: {
        type: String,
        enum: ["list", "grid"],
        default: "list",
      },
    },
    permissions: {
      canAssign: {
        type: Boolean,
        default: false,
      },
      canResolve: {
        type: Boolean,
        default: false,
      },
      canViewAll: {
        type: Boolean,
        default: false,
      },
      canDelete: {
        type: Boolean,
        default: false,
      },
      canManageUsers: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
