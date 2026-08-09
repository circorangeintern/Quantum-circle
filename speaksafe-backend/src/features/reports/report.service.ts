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
import { School } from "../../core/models/school.model";
import logger from "../../core/utils/logger.util";
import { AuthRequest } from "../auth/auth.middleware";

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

    // ===== HANDLE SCHOOL ID =====
    let finalSchoolId = schoolId;

    // If no schoolId provided, randomly pick an active school
    if (!finalSchoolId) {
      // For MVP: Get all active schools
      const activeSchools = await School.find({ isActive: true }).select("_id");

      if (activeSchools.length === 0) {
        throw new ApiError(
          500,
          "No active schools available. Please contact support.",
        );
      }

      // Pick a random school
      const randomIndex = Math.floor(Math.random() * activeSchools.length);
      finalSchoolId = activeSchools[randomIndex].id;

      // Log this for debugging
      logger.info(
        `Report ${title} assigned to random school: ${finalSchoolId}`,
      );
    } else {
      // Verify the provided school exists and is active
      const school = await School.findOne({
        _id: finalSchoolId,
        isActive: true,
      });

      if (!school) {
        throw new ApiError(404, "School not found or inactive");
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
      schoolId: finalSchoolId,
      status: "new",
      urgency: "medium",
      reporterIdentity: {
        isAnonymous: isAnonymous !== false,
        contactEmail: !isAnonymous ? contactEmail : undefined,
        ipAddress: !isAnonymous ? ipAddress : undefined,
        userAgent: !isAnonymous ? userAgent : undefined,
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
    authAdmin: AuthRequest,
  ): Promise<DashboardResponse> {
    console.log(authAdmin);

    // Check if the auth Admin has a schoolId
    if (!authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to view reports for this school",
      );
    }

    // Get admin's school
    const admin = await Admin.findById(authAdmin.adminId).select(
      "role schoolId",
    );
    if (!admin) throw new ApiError(404, "Admin not found");

    // Check if the admin's schoolId matches the authAdmin's schoolId
    if (
      authAdmin.adminSchoolId &&
      authAdmin.adminSchoolId !== admin.schoolId?.toString()
    ) {
      throw new ApiError(
        403,
        "You do not have permission to view reports for this school",
      );
    }

    const {
      status,
      category,
      urgency,
      assignedTo,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = "newest",
    } = query;

    // Build filter
    const filter: any = { schoolId: authAdmin.adminSchoolId };

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
    authAdmin: AuthRequest,
  ): Promise<ReportDetailResponse> {
    // Check if the auth Admin has a schoolId
    if (!authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to view reports for this school",
      );
    }

    const report = await this.repository.findById(reportId);
    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    // Check if the report belongs to the same school as the authAdmin
    if (report.schoolId?.toString() !== authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to view reports for this school",
      );
    }

    // Check if report is assigned to the authAdmin (who has role of school-staff)
    if (authAdmin.adminRole === "school-staff") {
      if (report.assignedTo?.adminId?.toString() !== authAdmin.adminId) {
        const message = report.assignedTo
          ? "This report is assigned to another admin."
          : "This report has not been assigned to you.";

        throw new ApiError(
          403,
          `You do not have permission to view this report. ${message}`,
        );
      }
    }

    // Log view
    await this.repository.logReportView(reportId, authAdmin.adminId ?? "");

    return {
      id: report.id,
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
            adminId: report.assignedTo?.adminId?.toString(),
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
        adminId: n.adminId?.toString(),
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
    authAdmin: AuthRequest,
    note?: string,
  ) {
    // Check if the auth Admin has a schoolId
    if (!authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to view reports for this school",
      );
    }

    const report = await this.repository.updateReportStatus(
      reportId,
      status,
      authAdmin,
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
    if (
      report.assignedTo &&
      report.assignedTo.adminId.toString() !== authAdmin.adminId
    ) {
      await NotificationService.createNotification(
        "update",
        "Status Updated",
        `${authAdmin.adminName} updated status to ${status} for ${report.referenceCode}`,
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
    authAdmin: AuthRequest,
  ) {
    if (authAdmin.adminRole !== "school-admin") {
      throw new ApiError(
        403,
        "You do not have permission to update report urgency",
      );
    }

    if (!authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to update report urgency for this school",
      );
    }

    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    if (report.schoolId?.toString() !== authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to update report urgency for this school",
      );
    }

    const oldUrgency = report.urgency;
    report.urgency = urgency;

    // If urgency is high/urgent, escalate
    if ((urgency === "high" || urgency === "urgent") && !report.isEscalated) {
      report.isEscalated = true;
      report.escalationReason = `Urgency escalated to ${urgency} by ${authAdmin.adminName}`;
    }

    report.activityLog.push({
      action: "urgency_updated",
      adminId: authAdmin.adminId,
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
    authAdmin: AuthRequest,
    assignToAdminId: string,
  ) {
    if (authAdmin.adminRole !== "school-admin") {
      throw new ApiError(403, "You do not have permission to assign reports");
    }

    if (!authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to assign reports for this school",
      );
    }

    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    // Check if the report belongs to the same school as the authAdmin
    if (report.schoolId?.toString() !== authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to assign reports for this school",
      );
    }

    const admin = await Admin.findById(assignToAdminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    // Check if the admin belongs to the same school as the authAdmin
    if (admin.schoolId?.toString() !== authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "Report can only be assigned to an admin from the same school",
      );
    }

    const oldAssignee = report.assignedTo;

    report.assignedTo = {
      adminId: admin.id,
      name: admin.name,
      assignedAt: new Date(),
    };

    report.activityLog.push({
      action: "report_assigned",
      adminId: authAdmin.adminId,
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
      { assignedBy: authAdmin.adminId },
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

  async addNote(reportId: string, authAdmin: AuthRequest, note: string) {
    // Check for adminId and adminSchoolId in authAdmin
    if (!authAdmin.adminId || !authAdmin.adminSchoolId) {
      throw new ApiError(400, "Invalid admin credentials");
    }

    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    // Check if report belongs to the same school as the authAdmin
    if (report.schoolId?.toString() !== authAdmin.adminSchoolId) {
      throw new ApiError(
        403,
        "You do not have permission to add notes to this report",
      );
    }

    // Check if the report is assigned to the authAdmin (if they are school-staff)
    if (authAdmin.adminRole === "school-staff") {
      if (report.assignedTo?.adminId?.toString() !== authAdmin.adminId) {
        const message = report.assignedTo
          ? "This report is assigned to another admin."
          : "This report has not been assigned to you.";

        throw new ApiError(
          403,
          `You do not have permission to add notes to this report. ${message}`,
        );
      }
    }

    report.internalNotes.push({
      adminId: authAdmin.adminId,
      adminName: authAdmin.adminName ?? "",
      note,
      timestamp: new Date(),
      isPrivate: true,
    });

    report.activityLog.push({
      action: "note_added",
      adminId: authAdmin.adminId,
      details: { noteLength: note.length },
      timestamp: new Date(),
    });

    await report.save();

    // Notify assigned authority
    if (
      report.assignedTo &&
      report.assignedTo.adminId.toString() !== authAdmin.adminId
    ) {
      await NotificationService.createNotification(
        "update",
        "New Note Added",
        `${authAdmin.adminName} added a note to ${report.referenceCode}`,
        report.assignedTo.adminId.toString(),
        report._id.toString(),
        { note },
      );
    }

    return {
      id: report._id.toString(),
      note,
      addedBy: authAdmin.adminName,
      timestamp: new Date(),
    };
  }

  async getAnalytics(authAdmin: AuthRequest) {
    // Check for adminId and adminSchoolId in authAdmin
    if (!authAdmin.adminId || !authAdmin.adminSchoolId) {
      throw new ApiError(400, "Invalid admin credentials");
    }

    // Only allow school-admins and system-admins to access analytics
    if (
      authAdmin.adminRole !== "school-admin" &&
      authAdmin.adminRole !== "system-admin"
    ) {
      throw new ApiError(403, "You do not have permission to access analytics");
    }

    const isSystemAdmin = authAdmin.adminRole === "system-admin";

    // Build filter for school-admins
    const schoolFilter = isSystemAdmin
      ? {}
      : { schoolId: authAdmin.adminSchoolId };

    const totalReports = await Report.countDocuments(schoolFilter);
    const activeReports = await Report.countDocuments({
      ...schoolFilter,
      status: { $in: ["new", "open", "investigating"] },
    });

    const resolvedReports = await Report.countDocuments({
      ...schoolFilter,
      status: "resolved",
    });

    const urgentReports = await Report.countDocuments({
      ...schoolFilter,
      urgency: { $in: ["high", "urgent"] },
    });

    // Breakdown by category, status, urgency based on the school filter
    const categoryBreakdown = await Report.aggregate([
      { $match: schoolFilter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statusBreakdown = await Report.aggregate([
      { $match: schoolFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const urgencyBreakdown = await Report.aggregate([
      { $match: schoolFilter },
      { $group: { _id: "$urgency", count: { $sum: 1 } } },
    ]);

    const monthlyTrends = await Report.aggregate([
      { $match: schoolFilter },
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
      {
        $match: {
          ...schoolFilter,
          status: "resolved",
          resolvedAt: { $exists: true },
        },
      },
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
      { $match: { ...schoolFilter, "assignedTo.adminId": { $exists: true } } },
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

  async exportReports(
    filters: any,
    format: "csv" | "pdf",
    authAdmin: AuthRequest,
  ) {
    // Check for adminId and adminSchoolId in authAdmin
    if (!authAdmin.adminId || !authAdmin.adminSchoolId) {
      throw new ApiError(400, "Invalid admin credentials");
    }

    // Only allow school-admins and system-admins to export reports
    if (
      authAdmin.adminRole !== "school-admin" &&
      authAdmin.adminRole !== "system-admin"
    ) {
      throw new ApiError(403, "Access denied");
    }

    const schoolFilter =
      authAdmin.adminRole === "school-admin"
        ? { schoolId: authAdmin.adminSchoolId }
        : {};

    const reports = await Report.find({
      ...filters,
      ...schoolFilter,
    })
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

  async deleteReport(reportId: string, authAdmin: AuthRequest) {
    // Check for adminId and adminSchoolId in authAdmin
    if (!authAdmin.adminId || !authAdmin.adminSchoolId) {
      throw new ApiError(400, "Invalid admin credentials");
    }

    // Only allow school-admins and system-admins to delete reports
    if (
      authAdmin.adminRole !== "school-admin" &&
      authAdmin.adminRole !== "system-admin"
    ) {
      throw new ApiError(403, "Access denied");
    }

    const report = await this.repository.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    // Check if the report belongs to the same school as the authAdmin
    if (report.schoolId?.toString() !== authAdmin.adminSchoolId) {
      throw new ApiError(403, "Access denied");
    }

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
    await this.repository.logReportDeletion(reportId, authAdmin.adminId);

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
