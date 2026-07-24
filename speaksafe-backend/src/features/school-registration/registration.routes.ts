import { Router } from "express";
import { RegistrationController } from "./registration.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  submitRegistrationSchema,
  reviewRegistrationSchema,
  getRegistrationsQuerySchema,
} from "./registration.validators";

const router = Router();
const controller = new RegistrationController();

// ==================== PUBLIC ROUTES ====================
// Submit school registration (anyone)
router.post(
  "/",
  validate(submitRegistrationSchema),
  controller.submitRegistration.bind(controller),
);

// ==================== PROTECTED ROUTES (System Admin Only) ====================
// Get all registrations
router.get(
  "/",
  authenticate,
  requirePermission("canManageUsers"),
  validate(getRegistrationsQuerySchema),
  controller.getRegistrations.bind(controller),
);

// Get registration stats
router.get(
  "/stats",
  authenticate,
  requirePermission("canManageUsers"),
  controller.getStats.bind(controller),
);

// Review registration (approve/reject)
router.put(
  "/:id/review",
  authenticate,
  requirePermission("canManageUsers"),
  validate(reviewRegistrationSchema),
  controller.reviewRegistration.bind(controller),
);

export default router;
