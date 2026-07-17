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
    requireApproval: boolean;
    maxAdmins: number;
    retentionDays: number;
    allowAttachments: boolean;
  };
  subscription: {
    plan: "free" | "basic" | "premium" | "enterprise";
    expiryDate?: Date;
    features: string[];
  };
  stats: {
    totalReports: number;
    activeAdmins: number;
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
      description: "Email domain for school (e.g., stmarys.edu)",
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
    logo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowAnonymous: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
      maxAdmins: {
        type: Number,
        default: 10,
      },
      retentionDays: {
        type: Number,
        default: 365,
      },
      allowAttachments: {
        type: Boolean,
        default: true,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      expiryDate: Date,
      features: {
        type: [String],
        default: [],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
SchoolSchema.index({ domain: 1 });
SchoolSchema.index({ name: 1 });
SchoolSchema.index({ isActive: 1 });

// Pre-save hook to update stats
SchoolSchema.pre("save", function () {
  if (
    this.subscription.expiryDate &&
    this.subscription.expiryDate < new Date()
  ) {
    this.subscription.plan = "free";
    this.subscription.features = [];
  }
});

export const School = mongoose.model<ISchool>("School", SchoolSchema);
