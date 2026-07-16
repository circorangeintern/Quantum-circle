import { Router } from "express";
import { ReportController } from "./report.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  createReportSchema,
  statusCheckSchema,
  dashboardQuerySchema,
  updateStatusSchema,
  updateReportSchema,
  addNoteSchema,
  assignReportSchema,
  updateUrgencySchema,
} from "./report.validators";
import {
  reportSubmissionLimiter,
  statusCheckLimiter,
} from "../../core/config/rate-limit.config";
import { uploadMiddleware, handleUploadError } from "./report.middleware";

const router = Router();
const controller = new ReportController();

// Submit report (with optional attachments)
router.post(
  "/",
  reportSubmissionLimiter,
  uploadMiddleware,
  handleUploadError,
  validate(createReportSchema),
  controller.createReport.bind(controller),
);

// Check report status (public)
router.get(
  "/status/:referenceCode",
  statusCheckLimiter,
  validate(statusCheckSchema),
  controller.checkStatus.bind(controller),
);

// Get all reports with filters
router.get(
  "/dashboard",
  authenticate,
  validate(dashboardQuerySchema),
  controller.getDashboard.bind(controller),
);

// Get report details
router.get(
  "/:id",
  authenticate,
  validate(updateReportSchema.pick({ params: true })),
  controller.getDetail.bind(controller),
);

// Update report status
router.put(
  "/:id/status",
  authenticate,
  requirePermission("canResolve"),
  validate(updateStatusSchema),
  controller.updateStatus.bind(controller),
);

// Update report urgency
router.put(
  "/:id/urgency",
  authenticate,
  requirePermission("canAssign"),
  validate(updateUrgencySchema),
  controller.updateUrgency.bind(controller),
);

// Assign report to authority
router.put(
  "/:id/assign",
  authenticate,
  requirePermission("canAssign"),
  validate(assignReportSchema),
  controller.assignReport.bind(controller),
);

// Update report details
router.put(
  "/:id",
  authenticate,
  requirePermission("canResolve"),
  validate(updateReportSchema),
  controller.updateReport.bind(controller),
);

// Add internal note
router.post(
  "/:id/notes",
  authenticate,
  validate(addNoteSchema),
  controller.addNote.bind(controller),
);

// Get report analytics (authorities only)
router.get(
  "/analytics/summary",
  authenticate,
  controller.getAnalytics.bind(controller),
);

// Export reports (CSV/PDF)
router.get(
  "/export",
  authenticate,
  requirePermission("canViewAll"),
  controller.exportReports.bind(controller),
);

// =================== ADMIN ONLY ROUTES ===================
// Delete report (super-admin only)
router.delete(
  "/:id",
  authenticate,
  requirePermission("canDelete"),
  controller.deleteReport.bind(controller),
);

// Bulk update status
router.put(
  "/bulk/status",
  authenticate,
  requirePermission("canResolve"),
  controller.bulkUpdateStatus.bind(controller),
);

export default router;
