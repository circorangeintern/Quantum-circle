import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  schoolId: Schema.Types.ObjectId | string;
  role: "super-admin" | "admin" | "viewer";
  department: string;
  isActive: boolean;
  lastLoginAt?: Date;
  refreshToken?: string;
  permissions: {
    canAssign: boolean;
    canResolve: boolean;
    canViewAll: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
  };
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
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ schoolId: 1 });
AdminSchema.index({ schoolId: 1, role: 1 });
AdminSchema.index({ schoolId: 1, isActive: 1 });

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
