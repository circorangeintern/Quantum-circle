import {
  ReportCategory,
  ReportStatus,
  ReportUrgency,
} from "../../core/constants/report.constants";

export interface CreateReportRequest {
  category: ReportCategory;
  title: string;
  description: string;
  incidentDate?: string;
  location?: string;
  peopleInvolved?: string;
  isAnonymous: boolean;
  contactEmail?: string;
  attachments: Express.Multer.File[];
}

export interface CreateReportResponse {
  referenceCode: string;
  status: ReportStatus;
  submittedAt: Date;
}

export interface StatusCheckResponse {
  status: ReportStatus;
  category: ReportCategory;
  title: string;
  submittedAt: Date;
  updatedAt: Date;
  timeline: Array<{
    date: Date;
    event: string;
  }>;
  hasAttachments: boolean;
}

export interface DashboardReport {
  id: string;
  referenceCode: string;
  title: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  urgency: ReportUrgency;
  submittedAt: Date;
  updatedAt: Date;
  assignedTo: string;
  isAnonymous: boolean;
  attachments: Array<{
    url: string;
    thumbnailUrl?: string;
    filename: string;
  }>;
  hasAttachments: boolean;
}

export interface DashboardResponse {
  reports: DashboardReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    total: number;
    new: number;
    open: number;
    investigating: number;
    resolved: number;
    active: number;
  };
}

export interface ReportDetailResponse {
  id: string;
  referenceCode: string;
  title: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  urgency: ReportUrgency;
  isAnonymous: boolean;
  contactEmail?: string;
  incidentDate?: Date;
  location?: string;
  peopleInvolved?: string;
  statusHistory: Array<{
    status: ReportStatus;
    updatedBy?: string;
    timestamp: Date;
    note?: string;
  }>;
  assignedTo?: {
    adminId: string;
    name: string;
    assignedAt: Date;
  };
  attachments: Array<{
    url: string;
    thumbnailUrl?: string;
    filename: string;
    uploadedAt: Date;
  }>;
  internalNotes: Array<{
    adminId: string;
    adminName: string;
    note: string;
    timestamp: Date;
  }>;
  publicTimeline: Array<{
    date: Date;
    event: string;
    isPublic: boolean;
  }>;
  submittedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  timeToFirstReview?: number;
  timeToResolution?: number;
  isEscalated: boolean;
  escalationReason?: string;
}

export interface GetReportsQuery {
  status?: ReportStatus;
  category?: ReportCategory;
  urgency?: ReportUrgency;
  assignedTo?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "urgent" | "status";
}

export interface UpdateStatusRequest {
  status: Exclude<ReportStatus, "new">;
  note?: string;
}

export interface UpdateUrgencyRequest {
  urgency: ReportUrgency;
}

export interface AssignReportRequest {
  adminId: string;
}

export interface AddNoteRequest {
  note: string;
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  category?: ReportCategory;
  incidentDate?: string;
  location?: string;
  peopleInvolved?: string;
}

export interface BulkUpdateStatusRequest {
  reportIds: string[];
  status: ReportStatus;
}
