import mongoose, { Document, Schema } from "mongoose";

export interface IReportViewToken extends Document {
  reportId: Schema.Types.ObjectId | string;
  token: string;
  viewed: boolean;
  viewedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportViewTokenSchema = new Schema<IReportViewToken>(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
    viewedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete when expired
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for faster lookups
ReportViewTokenSchema.index({ token: 1, viewed: 1 });

export const ReportViewToken = mongoose.model<IReportViewToken>(
  "ReportViewToken",
  ReportViewTokenSchema,
);
