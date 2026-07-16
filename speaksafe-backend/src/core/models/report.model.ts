import mongoose, { Document, Schema } from "mongoose";
import {
  ReportCategory,
  ReportStatus,
  ReportUrgency,
} from "../constants/report.constants";

export interface IReport extends Document {
  id: string;

  // Core fields
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  urgency: ReportUrgency;
  referenceCode: string;

  // Reporter identity (stored separately from report to maintain anonymity)
  reporterIdentity?: {
    isAnonymous: boolean;
    contactEmail?: string; // Only if they choose to identify
    ipAddress?: string; // For rate limiting and abuse prevention only
    userAgent?: string;
  };

  // Report details
  incidentDate?: Date;
  location?: string;
  peopleInvolved?: string;

  // Attachments
  attachments: Array<{
    filename: string;
    url: string;
    thumbnailUrl?: string;
    publicId: string;
    uploadedAt: Date;
    fileType: string;
    fileSize: number;
  }>;

  // Status tracking
  statusHistory: Array<{
    status: ReportStatus;
    updatedBy?: string; // Admin ID
    timestamp: Date;
    note?: string;
  }>;

  // Assignment
  assignedTo?: {
    adminId: string;
    name: string;
    assignedAt: Date;
  };

  // Timeline (public-facing)
  publicTimeline: Array<{
    date: Date;
    event: string;
    isPublic: boolean;
  }>;

  // Internal notes (authorities only)
  internalNotes: Array<{
    adminId: string;
    adminName: string;
    note: string;
    timestamp: Date;
    isPrivate: boolean;
  }>;

  // Activity log (system audit)
  activityLog: Array<{
    action: string;
    adminId?: string;
    details: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
  }>;

  // Analytics
  submittedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  timeToFirstReview?: number; // minutes
  timeToResolution?: number; // days
  isEscalated: boolean;
  escalationReason?: string;
}

const ReportSchema = new Schema<IReport>(
  {
    category: {
      type: String,
      enum: [
        "bullying",
        "harassment",
        "violence",
        "discrimination",
        "mental-health",
        "safety-hazard",
        "other",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["new", "open", "investigating", "resolved", "closed"],
      default: "new",
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reporterIdentity: {
      isAnonymous: {
        type: Boolean,
        default: true,
      },
      contactEmail: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true,
      },
      ipAddress: String,
      userAgent: String,
    },
    incidentDate: Date,
    location: {
      type: String,
      trim: true,
    },
    peopleInvolved: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        thumbnailUrl: String,
        publicId: String,
        uploadedAt: Date,
        fileType: String,
        fileSize: Number,
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["new", "open", "investigating", "resolved", "closed"],
          required: true,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "Admin",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    assignedTo: {
      adminId: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
      name: String,
      assignedAt: Date,
    },
    publicTimeline: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        event: String,
        isPublic: {
          type: Boolean,
          default: true,
        },
      },
    ],
    internalNotes: [
      {
        adminId: {
          type: Schema.Types.ObjectId,
          ref: "Admin",
        },
        adminName: String,
        note: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isPrivate: {
          type: Boolean,
          default: true,
        },
      },
    ],
    activityLog: [
      {
        action: String,
        adminId: {
          type: Schema.Types.ObjectId,
          ref: "Admin",
        },
        details: Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
      },
    ],
    resolvedAt: Date,
    timeToFirstReview: Number,
    timeToResolution: Number,
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalationReason: String,
  },
  {
    timestamps: {
      createdAt: "submittedAt",
      updatedAt: "updatedAt",
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
ReportSchema.index({ referenceCode: 1 });
ReportSchema.index({ status: 1, submittedAt: -1 });
ReportSchema.index({ category: 1, status: 1 });
ReportSchema.index({ urgency: 1, status: 1 });
ReportSchema.index({ "assignedTo.adminId": 1, status: 1 });
ReportSchema.index({ submittedAt: -1 });

// Pre-save middleware
ReportSchema.pre("save", async function () {
  if (this.isNew) {
    this.statusHistory = [
      {
        status: "new",
        timestamp: new Date(),
      },
    ];
    this.publicTimeline = [
      {
        date: new Date(),
        event: "Report submitted",
        isPublic: true,
      },
    ];
    this.activityLog = [
      {
        action: "report_created",
        details: {
          category: this.category,
          isAnonymous: this.reporterIdentity?.isAnonymous,
        },
        timestamp: new Date(),
      },
    ];
  }
});

// Virtual for time since submission
ReportSchema.virtual("age").get(function () {
  if (!this.submittedAt) return 0;
  return Math.floor(
    (Date.now() - this.submittedAt.getTime()) / (1000 * 60 * 60),
  );
});

export const Report = mongoose.model<IReport>("Report", ReportSchema);
