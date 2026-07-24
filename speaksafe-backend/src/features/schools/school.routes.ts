import { Router } from "express";
import { SchoolController } from "./school.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import { updateSchoolSchema, inviteStaffSchema } from "./school.validators";

const router = Router();
const controller = new SchoolController();

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

// Get school staff
router.get(
  "/:id/staffs",
  authenticate,
  controller.getSchoolStaffs.bind(controller),
);

// Invite new staff member
router.post(
  "/:id/invite",
  authenticate,
  requirePermission("canManageUsers"),
  validate(inviteStaffSchema),
  controller.inviteStaff.bind(controller),
);

// Remove staff member
router.delete(
  "/:id/staffs/:staffId",
  authenticate,
  requirePermission("canManageUsers"),
  controller.removeStaff.bind(controller),
);

// Get school stats
router.get(
  "/:id/stats",
  authenticate,
  controller.getSchoolStats.bind(controller),
);

export default router;
