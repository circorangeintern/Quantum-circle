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
  UpdateReportRequest,
  BulkUpdateStatusRequest,
} from "./report.types";
import { ApiError } from "../../core/errors/api.error";

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
      const result = await ReportService.getDashboardReports(
        query,
        req.adminId!,
      );
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
      const result = await ReportService.getReportDetail(id, req.adminId!);
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
      const result = await ReportService.updateStatus(
        id,
        status,
        req.adminId!,
        note,
      );
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
      const result = await ReportService.updateUrgency(
        id,
        urgency,
        req.adminId!,
      );
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
      const result = await ReportService.assignReport(
        id,
        req.adminId!,
        adminId,
      );
      ApiResponse.success(res, result, "Report assigned successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid report ID");
      }
      const data = req.body as UpdateReportRequest;
      const result = await ReportService.updateReport(id, data, req.adminId!);
      ApiResponse.success(res, result, "Report updated successfully");
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
      const result = await ReportService.addNote(id, req.adminId!, note);
      ApiResponse.success(res, result, "Note added successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ReportService.getAnalytics(req.adminId!);
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
        req.adminId!,
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
      await ReportService.deleteReport(id, req.adminId!);
      ApiResponse.success(res, null, "Report deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportIds, status } = req.body as BulkUpdateStatusRequest;
      const result = await ReportService.bulkUpdateStatus(
        reportIds,
        status,
        req.adminId!,
      );
      ApiResponse.success(res, result, "Bulk status update completed");
    } catch (error) {
      next(error);
    }
  }
}
