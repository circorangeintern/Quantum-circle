import { Notification } from "../models/notification.model";
import { Admin } from "../models/admin.model";
import { IReport } from "../models/report.model";

export class NotificationService {
  async createNotification(
    type: "new" | "urgent" | "assign" | "update" | "resolved",
    title: string,
    message: string,
    adminId: string,
    reportId?: string,
    metadata?: Record<string, any>,
  ) {
    return Notification.create({
      type,
      title,
      message,
      adminId,
      reportId,
      metadata: metadata || {},
    });
  }

  async getUnreadCount(adminId: string): Promise<number> {
    return Notification.countDocuments({
      adminId,
      read: false,
    });
  }

  async getNotifications(
    adminId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ adminId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ adminId }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, adminId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, adminId },
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(adminId: string) {
    return Notification.updateMany(
      { adminId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  async notifyNewReport(report: IReport) {
    // Find all active admins who should be notified
    const admins = await Admin.find({
      isActive: true,
      "preferences.notifications.newReports": true,
    });

    for (const admin of admins) {
      await this.createNotification(
        "new",
        "New Report Submitted",
        `A new ${report.category} report has been submitted (${report.referenceCode})`,
        admin._id.toString(),
        report._id.toString(),
        { reportId: report.referenceCode, category: report.category },
      );
    }
  }

  async notifyUrgentReport(report: IReport) {
    // Only notify admins who want urgent alerts
    const admins = await Admin.find({
      isActive: true,
      "preferences.notifications.urgentCases": true,
    });

    for (const admin of admins) {
      await this.createNotification(
        "urgent",
        "⚠️ Urgent Report",
        `URGENT: ${report.title} (${report.referenceCode})`,
        admin._id.toString(),
        report._id.toString(),
        { reportId: report.referenceCode, urgency: report.urgency },
      );
    }
  }
}

export default new NotificationService();
