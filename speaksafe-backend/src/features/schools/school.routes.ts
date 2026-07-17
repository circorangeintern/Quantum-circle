import { Router } from "express";
import { SchoolController } from "./school.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  registerSchoolSchema,
  updateSchoolSchema,
  inviteAdminSchema,
} from "./school.validators";

const router = Router();
const controller = new SchoolController();

// ==================== PUBLIC ROUTES ====================
// Register a new school (creates first super admin)
router.post(
  "/register",
  validate(registerSchoolSchema),
  controller.registerSchool.bind(controller),
);

// ==================== PROTECTED ROUTES ====================
// Get school details
router.get("/:id", authenticate, controller.getSchool.bind(controller));

// Update school settings
router.put(
  "/:id",
  authenticate,
  requirePermission("canManageUsers"),
  validate(updateSchoolSchema),
  controller.updateSchool.bind(controller),
);

// Get school admins
router.get(
  "/:id/admins",
  authenticate,
  controller.getSchoolAdmins.bind(controller),
);

// Invite new admin
router.post(
  "/:id/invite",
  authenticate,
  requirePermission("canManageUsers"),
  validate(inviteAdminSchema),
  controller.inviteAdmin.bind(controller),
);

// Remove admin
router.delete(
  "/:id/admins/:adminId",
  authenticate,
  requirePermission("canManageUsers"),
  controller.removeAdmin.bind(controller),
);

// Get school stats
router.get(
  "/:id/stats",
  authenticate,
  controller.getSchoolStats.bind(controller),
);

export default router;
