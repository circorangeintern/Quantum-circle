import { ApiError } from "../../core/errors/api.error";
import {
  generateReferenceCode,
  normalizeReferenceCode,
} from "../../core/utils/reference-code.util";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../core/config/cloudinary.config";
import { ReportRepository } from "./report.repository";
import {
  CreateReportRequest,
  CreateReportResponse,
  GetReportsQuery,
  UpdateReportRequest,
  DashboardResponse,
  ReportDetailResponse,
  StatusCheckResponse,
} from "./report.types";
import {
  ReportStatus,
  ReportUrgency,
} from "../../core/constants/report.constants";
import { Report, IReport } from "../../core/models/report.model";
import { Admin } from "../../core/models/admin.model";
import NotificationService from "../../core/services/notification.service";
import EmailService from "../../core/services/email.service";
import { Types } from "mongoose";
import { generateCSV, generatePDF } from "../../core/utils/export.util";

export class ReportService {
  private repository: ReportRepository;

  constructor() {
    this.repository = new ReportRepository();
  }

  async createReport(
    data: CreateReportRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<CreateReportResponse> {
    const {
      category,
      title,
      description,
      incidentDate,
      location,
      peopleInvolved,
      isAnonymous,
      contactEmail,
      attachments,
      schoolId,
    } = data;

    // Validate contact email if provided
    if (contactEmail && !isAnonymous) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        throw new ApiError(400, "Invalid email format");
      }
    }

    // Generate reference code
    let referenceCode = generateReferenceCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await this.repository.findByReferenceCode(referenceCode);
      if (!existing) {
        isUnique = true;
      } else {
        referenceCode = generateReferenceCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new ApiError(500, "Failed to generate unique reference code");
    }

    // Prepare report data
    const reportData: Partial<IReport> = {
      category,
      title,
      description,
      referenceCode,
      schoolId,
      status: "new",
      urgency: "medium",
      reporterIdentity: {
        isAnonymous: isAnonymous !== false,
        contactEmail: !isAnonymous ? contactEmail : undefined,
        ipAddress,
        userAgent,
      },
      incidentDate: incidentDate ? new Date(incidentDate) : undefined,
      location,
      peopleInvolved,
      attachments: [],
      isEscalated: false,
    };

    // Upload attachments
    if (attachments && attachments.length > 0) {
      const uploadedAttachments = [];
      for (const file of attachments) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, {
            folder: "speaksafe/reports",
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto" },
            ],
          });

          const thumbnailResult = await uploadToCloudinary(file.buffer, {
            folder: "speaksafe/reports/thumbnails",
            transformation: [
              { width: 300, height: 300, crop: "fill" },
              { quality: "auto" },
            ],
          });

          uploadedAttachments.push({
            filename: file.originalname,
            url: uploadResult.secure_url,
            thumbnailUrl: thumbnailResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedAt: new Date(),
            fileType: file.mimetype,
            fileSize: file.size,
          });
        } catch (error) {
          console.error("Failed to upload attachment:", error);
          // Continue with other attachments
        }
      }
      reportData.attachments = uploadedAttachments;
    }

    const report = await this.repository.createReport(reportData);

    // Send email confirmation if contact email provided
    if (contactEmail) {
      try {
        await EmailService.sendReportConfirmationEmail(
          contactEmail,
          referenceCode,
        );
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
      }
    }

    // Log audit
    await this.repository.logReportCreation(report.id, ipAddress);

    // Create notifications for admins
    await NotificationService.notifyNewReport(report);

    // If urgency is high or urgent, send urgent notifications
    if (report.urgency === "high" || report.urgency === "urgent") {
      await NotificationService.notifyUrgentReport(report);
    }

    return {
      referenceCode: report.referenceCode,
      status: report.status,
      submittedAt: report.submittedAt,
    };
  }

  async checkStatus(referenceCode: string): Promise<StatusCheckResponse> {
    const normalizedCode = normalizeReferenceCode(referenceCode);
    const report = await this.repository.findByReferenceCode(normalizedCode);

    if (!report) {
      throw new ApiError(
        404,
        "Report not found. Please check your reference code.",
      );
    }

    // Only return public-safe information
    const publicTimeline = report.publicTimeline
      .filter((event) => event.isPublic)
      .map((event) => ({
        date: event.date,
        event: event.event,
      }));

    return {
      status: report.status,
      category: report.category,
      title: report.title,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
      timeline: publicTimeline,
      hasAttachments: report.attachments.length > 0,
    };
  }

  async getDashboardReports(
    query: GetReportsQuery,
    adminId: string,
  ): Promise<DashboardResponse> {
    // Get admin's school
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    const {
      status,
      category,
      urgency,
      assignedTo,
      search,
      dateFrom,
      schoolId,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = "newest",
    } = query;

    // Build filter
    const filter: any = { schoolId: admin.schoolId };

    // If school-admin and schoolId param provided, override
    if (admin.role === "school-admin" && schoolId) {
      filter.schoolId = schoolId;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (assignedTo)
      filter["assignedTo.adminId"] = new Types.ObjectId(assignedTo);
    if (dateFrom) filter.submittedAt = { $gte: new Date(dateFrom) };
    if (dateTo) {
      filter.submittedAt = {
        ...filter.submittedAt,
        $lte: new Date(dateTo),
      };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { referenceCode: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    let sort: any = { submittedAt: -1 };
    if (sortBy === "oldest") sort = { submittedAt: 1 };
    if (sortBy === "urgent") sort = { urgency: -1, submittedAt: -1 };
    if (sortBy === "status") sort = { status: 1, submittedAt: -1 };

    const skip = (page - 1) * limit;

    const [reports, total, summary] = await Promise.all([
      this.repository.findDashboardReports(filter, sort, skip, limit),
      this.repository.countReports(filter),
      this.repository.getReportSummary(filter),
    ]);

    return {
      reports: this.formatReportsForDashboard(reports),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  }

  async getReportDetail(
    reportId: string,
    adminId: string,
  ): Promise<ReportDetailResponse> {
    const report = await this.repository.findById(reportId);
    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    // Log view
    await this.repository.logReportView(reportId, adminId);

    return {
      id: report._id.toString(),
      referenceCode: report.referenceCode,
      title: report.title,
      category: report.category,
      description: report.description,
      status: report.status,
      urgency: report.urgency,
      isAnonymous: report.reporterIdentity?.isAnonymous !== false,
      contactEmail: report.reporterIdentity?.contactEmail,
      incidentDate: report.incidentDate,
      location: report.location,
      peopleInvolved: report.peopleInvolved,
      statusHistory: report.statusHistory,
      assignedTo: report.assignedTo
        ? {
            adminId: report.assignedTo.adminId.toString(),
            name: report.assignedTo.name,
            assignedAt: report.assignedTo.assignedAt,
          }
        : undefined,
      attachments: report.attachments.map((a) => ({
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        filename: a.filename,
        uploadedAt: a.uploadedAt,
      })),
      internalNotes: report.internalNotes.map((n) => ({
        adminId: n.adminId.toString(),
        adminName: n.adminName,
        note: n.note,
        timestamp: n.timestamp,
      })),
      publicTimeline: report.publicTimeline,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
      resolvedAt: report.resolvedAt,
      timeToFirstReview: report.timeToFirstReview,
      timeToResolution: report.timeToResolution,
      isEscalated: report.isEscalated,
      escalationReason: report.escalationReason,
    };
  }

  async updateStatus(
    reportId: string,
    status: ReportStatus,
    adminId: string,
    note?: string,
  ) {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const report = await this.repository.updateReportStatus(
      reportId,
      status,
      adminId,
      note,
    );
    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    // If resolved, notify reporter via email if they provided contact
    if (status === "resolved" && report.reporterIdentity?.contactEmail) {
      try {
        await EmailService.sendEmail({
          to: report.reporterIdentity.contactEmail,
          subject: `SpeakSafe Report ${report.referenceCode} - Resolved`,
          html: `
            <h2>Your report has been resolved</h2>
            <p>Report: ${report.title}</p>
            <p>Reference: ${report.referenceCode}</p>
            <p>You can check the status anytime at: ${process.env.APP_URL}/status/${report.referenceCode}</p>
          `,
        });
      } catch (error) {
        console.error("Failed to send resolution email:", error);
      }
    }

    // Notify assigned admin
    if (report.assignedTo && report.assignedTo.adminId.toString() !== adminId) {
      await NotificationService.createNotification(
        "update",
        "Status Updated",
        `${admin.name} updated status to ${status} for ${report.referenceCode}`,
        report.assignedTo.adminId.toString(),
        report._id.toString(),
        { status, note },
      );
    }

    return {
      id: report._id.toString(),
      status: report.status,
      updatedAt: report.updatedAt,
    };
  }

  async updateUrgency(
    reportId: string,
    urgency: ReportUrgency,
    adminId: string,
  ) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const oldUrgency = report.urgency;
    report.urgency = urgency;

    // If urgency is high/urgent, escalate
    if ((urgency === "high" || urgency === "urgent") && !report.isEscalated) {
      report.isEscalated = true;
      report.escalationReason = `Urgency escalated to ${urgency} by ${admin.name}`;
    }

    report.activityLog.push({
      action: "urgency_updated",
      adminId,
      details: { oldUrgency, newUrgency: urgency },
      timestamp: new Date(),
    });

    await report.save();

    // If urgency is high/urgent, send urgent notifications
    if (urgency === "high" || urgency === "urgent") {
      await NotificationService.notifyUrgentReport(report);
    }

    return {
      id: report._id.toString(),
      urgency: report.urgency,
      isEscalated: report.isEscalated,
    };
  }

  async assignReport(
    reportId: string,
    adminId: string,
    assignToAdminId: string,
  ) {
    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const admin = await Admin.findById(assignToAdminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    const oldAssignee = report.assignedTo;

    report.assignedTo = {
      adminId: admin.id,
      name: admin.name,
      assignedAt: new Date(),
    };

    report.activityLog.push({
      action: "report_assigned",
      adminId,
      details: {
        oldAssignee: oldAssignee?.name,
        newAssignee: admin.name,
      },
      timestamp: new Date(),
    });

    report.publicTimeline.push({
      date: new Date(),
      event: `Assigned to ${admin.name}`,
      isPublic: true,
    });

    await report.save();

    // Notify assigned admin
    await NotificationService.createNotification(
      "assign",
      "Report Assigned to You",
      `Report ${report.referenceCode} has been assigned to you`,
      admin._id.toString(),
      report._id.toString(),
      { assignedBy: adminId },
    );

    // Send email notification to assigned admin
    try {
      await EmailService.sendAdminNotificationEmail(
        admin.email,
        `SpeakSafe: Report ${report.referenceCode} Assigned to You`,
        `You have been assigned to review report: ${report.title}\nReference: ${report.referenceCode}`,
        report._id.toString(),
      );
    } catch (error) {
      console.error("Failed to send assignment email:", error);
    }

    return {
      id: report._id.toString(),
      assignedTo: report.assignedTo,
    };
  }

  async updateReport(
    reportId: string,
    data: UpdateReportRequest,
    adminId: string,
  ) {
    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    const updateData: any = {};
    const changes: string[] = [];

    if (data.title && data.title !== report.title) {
      updateData.title = data.title;
      changes.push("title");
    }
    if (data.description && data.description !== report.description) {
      updateData.description = data.description;
      changes.push("description");
    }
    if (data.category && data.category !== report.category) {
      updateData.category = data.category;
      changes.push("category");
    }
    if (data.incidentDate) {
      updateData.incidentDate = new Date(data.incidentDate);
      changes.push("incidentDate");
    }
    if (data.location !== undefined && data.location !== report.location) {
      updateData.location = data.location;
      changes.push("location");
    }
    if (
      data.peopleInvolved !== undefined &&
      data.peopleInvolved !== report.peopleInvolved
    ) {
      updateData.peopleInvolved = data.peopleInvolved;
      changes.push("peopleInvolved");
    }

    if (changes.length === 0) {
      throw new ApiError(400, "No changes to update");
    }

    Object.assign(report, updateData);

    report.activityLog.push({
      action: "report_updated",
      adminId,
      details: { changes },
      timestamp: new Date(),
    });

    await report.save();

    return {
      id: report._id.toString(),
      updated: changes,
      updatedAt: report.updatedAt,
    };
  }

  async addNote(reportId: string, adminId: string, note: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    report.internalNotes.push({
      adminId: admin.id,
      adminName: admin.name,
      note,
      timestamp: new Date(),
      isPrivate: true,
    });

    report.activityLog.push({
      action: "note_added",
      adminId,
      details: { noteLength: note.length },
      timestamp: new Date(),
    });

    await report.save();

    // Notify assigned authority
    if (report.assignedTo && report.assignedTo.adminId.toString() !== adminId) {
      await NotificationService.createNotification(
        "update",
        "New Note Added",
        `${admin.name} added a note to ${report.referenceCode}`,
        report.assignedTo.adminId.toString(),
        report._id.toString(),
        { note },
      );
    }

    return {
      id: report._id.toString(),
      note,
      addedBy: admin.name,
      timestamp: new Date(),
    };
  }

  async getAnalytics(_adminId: string) {
    const totalReports = await Report.countDocuments();
    const activeReports = await Report.countDocuments({
      status: { $in: ["new", "open", "investigating"] },
    });
    const resolvedReports = await Report.countDocuments({
      status: "resolved",
    });
    const urgentReports = await Report.countDocuments({
      urgency: { $in: ["high", "urgent"] },
    });

    const categoryBreakdown = await Report.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statusBreakdown = await Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const urgencyBreakdown = await Report.aggregate([
      { $group: { _id: "$urgency", count: { $sum: 1 } } },
    ]);

    const monthlyTrends = await Report.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    const avgResolutionTime = await Report.aggregate([
      { $match: { status: "resolved", resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionHours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$submittedAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$resolutionHours" },
          min: { $min: "$resolutionHours" },
          max: { $max: "$resolutionHours" },
        },
      },
    ]);

    // Assignment performance
    const assignmentStats = await Report.aggregate([
      { $match: { "assignedTo.adminId": { $exists: true } } },
      {
        $group: {
          _id: "$assignedTo.adminId",
          name: { $first: "$assignedTo.name" },
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          name: 1,
          count: 1,
          resolved: 1,
          resolutionRate: {
            $multiply: [{ $divide: ["$resolved", "$count"] }, 100],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      overview: {
        totalReports,
        activeReports,
        resolvedReports,
        urgentReports,
        resolutionRate:
          totalReports > 0
            ? Number(((resolvedReports / totalReports) * 100).toFixed(1))
            : 0,
      },
      breakdown: {
        categories: categoryBreakdown,
        statuses: statusBreakdown,
        urgencies: urgencyBreakdown,
      },
      trends: {
        monthly: monthlyTrends,
      },
      performance: {
        averageResolutionTime: avgResolutionTime[0] || null,
        adminAssignments: assignmentStats,
      },
    };
  }

  async exportReports(filters: any, format: "csv" | "pdf", _adminId: string) {
    const reports = await Report.find(filters)
      .populate("assignedTo.adminId", "name email")
      .sort({ submittedAt: -1 });

    const sanitized = reports.map((r) => ({
      referenceCode: r.referenceCode,
      title: r.title,
      category: r.category,
      status: r.status,
      urgency: r.urgency,
      submittedAt: r.submittedAt,
      resolvedAt: r.resolvedAt,
      assignedTo: r.assignedTo?.name || "Unassigned",
      isAnonymous: r.reporterIdentity?.isAnonymous,
      hasAttachments: r.attachments.length > 0,
    }));

    if (format === "csv") {
      return generateCSV(sanitized);
    } else {
      return generatePDF(sanitized);
    }
  }

  async bulkUpdateStatus(
    reportIds: string[],
    status: ReportStatus,
    adminId: string,
    note?: string,
  ) {
    const results = await Promise.allSettled(
      reportIds.map((id) => this.updateStatus(id, status, adminId, note)),
    );

    return {
      total: reportIds.length,
      succeeded: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };
  }

  async deleteReport(reportId: string, adminId: string) {
    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    // Delete attachments from Cloudinary
    for (const attachment of report.attachments) {
      try {
        await deleteFromCloudinary(attachment.publicId);
      } catch (error) {
        console.error("Failed to delete attachment:", error);
      }
    }

    await report.deleteOne();

    // Log deletion
    await this.repository.logReportDeletion(reportId, adminId);

    return true;
  }

  private formatReportsForDashboard(reports: any[]) {
    return reports.map((report) => ({
      id: report._id.toString(),
      referenceCode: report.referenceCode,
      title: report.title,
      category: report.category,
      status: report.status,
      urgency: report.urgency,
      description:
        report.description.length > 100
          ? `${report.description.substring(0, 100)}...`
          : report.description,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
      assignedTo: report.assignedTo?.name || "Unassigned",
      isAnonymous: report.reporterIdentity?.isAnonymous !== false,
      attachments: report.attachments.map((a: any) => ({
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        filename: a.filename,
      })),
      hasAttachments: report.attachments.length > 0,
    }));
  }
}

export default new ReportService();
