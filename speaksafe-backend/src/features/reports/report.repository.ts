import { Report, IReport } from "../../core/models/report.model";
import { AuditLog } from "../../core/models/audit-log.model";
import { ReportStatus } from "../../core/constants/report.constants";

export class ReportRepository {
  async createReport(reportData: Partial<IReport>): Promise<IReport> {
    const report = new Report(reportData);
    return report.save();
  }

  async findByReferenceCode(referenceCode: string): Promise<IReport | null> {
    return Report.findOne({ referenceCode });
  }

  async findById(id: string): Promise<IReport | null> {
    return Report.findById(id);
  }

  async findDashboardReports(
    filter: any,
    sort: any,
    skip: number,
    limit: number,
  ): Promise<IReport[]> {
    return Report.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("assignedTo.adminId", "name email");
  }

  async countReports(filter: any): Promise<number> {
    return Report.countDocuments(filter);
  }

  async getReportSummary(filter: any): Promise<{
    total: number;
    new: number;
    open: number;
    investigating: number;
    resolved: number;
    active: number;
  }> {
    const [total, newCount, open, investigating, resolved] = await Promise.all([
      Report.countDocuments(filter),
      Report.countDocuments({ ...filter, status: "new" }),
      Report.countDocuments({ ...filter, status: "open" }),
      Report.countDocuments({ ...filter, status: "investigating" }),
      Report.countDocuments({ ...filter, status: "resolved" }),
    ]);

    return {
      total,
      new: newCount,
      open,
      investigating,
      resolved,
      active: newCount + open + investigating,
    };
  }

  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    adminId: string,
    note?: string,
  ): Promise<IReport | null> {
    const report = await Report.findById(reportId);
    if (!report) return null;

    const oldStatus = report.status;

    report.status = status;

    report.statusHistory.push({
      status,
      updatedBy: adminId,
      timestamp: new Date(),
      note,
    });

    if (status === "resolved" && oldStatus !== "resolved") {
      report.resolvedAt = new Date();
      const timeToResolution =
        (new Date().getTime() - report.submittedAt.getTime()) /
        (1000 * 60 * 60 * 24);
      report.timeToResolution = Math.round(timeToResolution);
    }

    if (
      status === "investigating" &&
      oldStatus === "new" &&
      !report.timeToFirstReview
    ) {
      const timeToFirstReview =
        (new Date().getTime() - report.submittedAt.getTime()) / (1000 * 60);
      report.timeToFirstReview = Math.round(timeToFirstReview);
    }

    report.publicTimeline.push({
      date: new Date(),
      event: `Status updated to ${status}`,
      isPublic: true,
    });

    await report.save();

    await AuditLog.create({
      action: "status_update",
      adminId,
      reportId: report.id,
      details: {
        oldStatus,
        newStatus: status,
        note,
      },
    });

    return report;
  }

  async logReportCreation(reportId: string, ipAddress?: string): Promise<void> {
    await AuditLog.create({
      action: "report_created",
      reportId: reportId,
      details: { ipAddress },
    });
  }

  async logReportView(reportId: string, adminId: string): Promise<void> {
    await AuditLog.create({
      action: "report_viewed",
      adminId,
      reportId: reportId,
    });
  }

  async logReportDeletion(reportId: string, adminId: string): Promise<void> {
    await AuditLog.create({
      action: "report_deleted",
      adminId,
      reportId: reportId,
      details: { deletedAt: new Date() },
    });
  }

  async getReportsByAssignedAdmin(adminId: string): Promise<IReport[]> {
    return Report.find({
      "assignedTo.adminId": adminId,
    }).sort({ submittedAt: -1 });
  }

  async getEscalatedReports(): Promise<IReport[]> {
    return Report.find({ isEscalated: true }).sort({
      urgency: -1,
      submittedAt: -1,
    });
  }

  async getReportsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<IReport[]> {
    return Report.find({
      submittedAt: { $gte: startDate, $lte: endDate },
    }).sort({ submittedAt: -1 });
  }

  async getUrgentUnassignedReports(): Promise<IReport[]> {
    return Report.find({
      urgency: { $in: ["high", "urgent"] },
      "assignedTo.adminId": { $exists: false },
      status: { $ne: "resolved" },
    }).sort({ submittedAt: 1 });
  }
}

export const reportRepository = new ReportRepository();
