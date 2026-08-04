import mongoose, { Document, Schema } from "mongoose";

export type Role = "system-admin" | "school-admin" | "school-staff";

export interface IAdmin extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  schoolId: Schema.Types.ObjectId | string; // Reference to School
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  refreshToken?: string;
  // Only for school-admin and school-staff
  permissions: {
    canAssign: boolean; // Assign reports to staff
    canResolve: boolean; // Resolve cases
    canViewAll: boolean; // View all school reports
    canManageStaff: boolean; // Invite/remove staff
    canDelete: boolean; // Delete reports
    canManageSchool: boolean; // Update school settings
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
      required: function (this: IAdmin) {
        return this.role !== "system-admin"; // System admin has no school
      },
    },
    role: {
      type: String,
      enum: ["system-admin", "school-admin", "school-staff"],
      required: true,
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
      canManageStaff: {
        type: Boolean,
        default: false,
      },
      canDelete: {
        type: Boolean,
        default: false,
      },
      canManageSchool: {
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
  },
);

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ schoolId: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ schoolId: 1, role: 1 });

// Default permissions based on role
AdminSchema.pre<IAdmin>("save", function () {
  if (this.isNew || this.isModified("role")) {
    if (this.role === "system-admin") {
      this.permissions = {
        canAssign: true,
        canResolve: true,
        canViewAll: true,
        canManageStaff: true,
        canDelete: true,
        canManageSchool: true,
      };
    } else if (this.role === "school-admin") {
      this.permissions = {
        canAssign: true,
        canResolve: true,
        canViewAll: true,
        canManageStaff: true,
        canDelete: true,
        canManageSchool: true,
      };
    } else if (this.role === "school-staff") {
      this.permissions = {
        canAssign: false,
        canResolve: true,
        canViewAll: false,
        canManageStaff: false,
        canDelete: false,
        canManageSchool: false,
      };
    }
  }
});

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
