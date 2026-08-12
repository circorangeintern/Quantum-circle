import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import ReportService from "./report.service";
import { AuthRequest } from "../auth/auth.middleware";
import {
  CreateReportRequest,
  GetReportsQuery,
  UpdateStatusRequest,
  UpdateUrgencyRequest,
  AssignReportRequest,
  AddNoteRequest,
} from "./report.types";
import { ApiError } from "../../core/errors/api.error";
import { Report } from "../../core/models/report.model";
import { ReportViewToken } from "../../core/models/report-view-token.model";
import { AuditLog } from "../../core/models/audit-log.model";

export class ReportController {
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const data: CreateReportRequest = {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        incidentDate: req.body.incidentDate,
        location: req.body.location,
        peopleInvolved: req.body.peopleInvolved,
        isAnonymous:
          req.body.isAnonymous === "true" || req.body.isAnonymous === true,
        contactEmail: req.body.contactEmail,
        attachments: files || [],
        schoolId: req.body.schoolId,
      };

      const result = await ReportService.createReport(
        data,
        req.ip,
        req.get("user-agent"),
      );

      ApiResponse.created(
        res,
        result,
        "Report submitted successfully. Please save your reference code!",
      );
    } catch (error) {
      next(error);
    }
  }

  async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { referenceCode } = req.params;

      if (Array.isArray(referenceCode)) {
        throw new ApiError(400, "Invalid reference code");
      }

      const result = await ReportService.checkStatus(referenceCode);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as GetReportsQuery;
      const result = await ReportService.getDashboardReports(query, req);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      const result = await ReportService.getReportDetail(id, req);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      const { status, note } = req.body as UpdateStatusRequest;
      const result = await ReportService.updateStatus(id, status, req, note);
      ApiResponse.success(res, result, "Status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateUrgency(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      const { urgency } = req.body as UpdateUrgencyRequest;
      const result = await ReportService.updateUrgency(id, urgency, req);
      ApiResponse.success(res, result, "Urgency updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async assignReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      const { adminId } = req.body as AssignReportRequest;
      const result = await ReportService.assignReport(id, req, adminId);
      ApiResponse.success(res, result, "Report assigned successfully");
    } catch (error) {
      next(error);
    }
  }

  async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      const { note } = req.body as AddNoteRequest;
      const result = await ReportService.addNote(id, req, note);
      ApiResponse.success(res, result, "Note added successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ReportService.getAnalytics(req);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async exportReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as string) || "csv";
      const filters = req.query.filters
        ? JSON.parse(req.query.filters as string)
        : {};

      const result = await ReportService.exportReports(
        filters,
        format as "csv" | "pdf",
        req,
      );

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=reports-${new Date().toISOString().slice(0, 10)}.csv`,
        );
        res.send(result);
      } else {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=reports-${new Date().toISOString().slice(0, 10)}.pdf`,
        );
        res.send(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      await ReportService.deleteReport(id, req);
      ApiResponse.success(res, null, "Report deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async viewReportOnce(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token) {
        return ApiResponse.badRequest(res, "View token is required");
      }

      // Find the token
      const viewToken = await ReportViewToken.findOne({
        token: token as string,
        viewed: false,
        expiresAt: { $gt: new Date() },
      });

      if (!viewToken) {
        // Check if token exists but is expired or already viewed
        const existingToken = await ReportViewToken.findOne({
          token: token as string,
        });

        if (existingToken) {
          if (existingToken.viewed) {
            return ApiResponse.error(
              res,
              "This link has already been used",
              410,
            );
          }
          if (existingToken.expiresAt <= new Date()) {
            return ApiResponse.error(res, "This link has expired", 410);
          }
        }

        return ApiResponse.notFound(res, "Invalid or expired view token");
      }

      // Get the report
      const report = await Report.findById(viewToken.reportId);
      if (!report) {
        return ApiResponse.notFound(res, "Report not found");
      }

      // Mark token as viewed
      viewToken.viewed = true;
      viewToken.viewedAt = new Date();
      await viewToken.save();

      // Log the view
      await AuditLog.create({
        action: "report_viewed_via_email",
        reportId: report.id,
        details: {
          tokenId: viewToken._id,
          viewedAt: viewToken.viewedAt,
        },
      });

      // Return report data (sanitized for public view)
      const reportData = {
        referenceCode: report.referenceCode,
        title: report.title,
        category: report.category,
        status: report.status,
        urgency: report.urgency,
        description: report.description,
        location: report.location,
        peopleInvolved: report.peopleInvolved,
        submittedAt: report.submittedAt,
        updatedAt: report.updatedAt,
        assignedTo: report.assignedTo,
        publicTimeline: report.publicTimeline,
      };

      return ApiResponse.success(res, reportData);
    } catch (error) {
      return next(error);
    }
  }
}
