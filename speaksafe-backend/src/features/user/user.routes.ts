import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  updateUserSchema,
  updatePermissionsSchema,
  updatePreferencesSchema,
  getUsersQuerySchema,
  deleteUserSchema,
} from "./user.validators";

const router = Router();
const controller = new UserController();

// Get user stats
router.get(
  "/stats",
  authenticate,
  requirePermission("canViewAll"),
  controller.getStats.bind(controller),
);

// Get users
router.get(
  "/",
  authenticate,
  requirePermission("canViewAll"),
  validate(getUsersQuerySchema),
  controller.getUsers.bind(controller),
);

// Get user by ID
router.get(
  "/:id",
  authenticate,
  requirePermission("canViewAll"),
  validate(deleteUserSchema),
  controller.getUserById.bind(controller),
);

// Update user
router.put(
  "/:id",
  authenticate,
  requirePermission("canManageStaff"),
  validate(updateUserSchema),
  controller.updateUser.bind(controller),
);

// Update user permissions
router.put(
  "/:id/permissions",
  authenticate,
  requirePermission("canManageStaff"),
  validate(updatePermissionsSchema),
  controller.updatePermissions.bind(controller),
);

// Update user preferences
router.put(
  "/:id/preferences",
  authenticate,
  requirePermission("canManageStaff"),
  validate(updatePreferencesSchema),
  controller.updatePreferences.bind(controller),
);

// Delete user
router.delete(
  "/:id",
  authenticate,
  requirePermission("canManageStaff"),
  validate(deleteUserSchema),
  controller.deleteUser.bind(controller),
);

export default router;
