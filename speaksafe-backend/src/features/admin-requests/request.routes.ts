import { Router } from "express";
import { RequestController } from "./request.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  createRequestSchema,
  reviewRequestSchema,
  getRequestsQuerySchema,
  deleteRequestSchema,
} from "./request.validators";
import { standardLimiter } from "../../core/config/rate-limit.config";

const router = Router();
const controller = new RequestController();

// Public - Submit admin request
router.post(
  "/",
  standardLimiter,
  validate(createRequestSchema),
  controller.createRequest.bind(controller),
);

// Protected - Get all requests (super-admin only)
router.get(
  "/",
  authenticate,
  requirePermission("canManageUsers"),
  validate(getRequestsQuerySchema),
  controller.getRequests.bind(controller),
);

// Protected - Get request stats (super-admin only)
router.get(
  "/stats",
  authenticate,
  requirePermission("canManageUsers"),
  controller.getStats.bind(controller),
);

// Protected - Review request (super-admin only)
router.put(
  "/:id/review",
  authenticate,
  requirePermission("canManageUsers"),
  validate(reviewRequestSchema),
  controller.reviewRequest.bind(controller),
);

// Protected - Delete request (super-admin only)
router.delete(
  "/:id",
  authenticate,
  requirePermission("canManageUsers"),
  validate(deleteRequestSchema),
  controller.deleteRequest.bind(controller),
);

export default router;
