import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  updatePermissionsSchema,
  updatePreferencesSchema,
  getUsersQuerySchema,
  deleteUserSchema,
  resetPasswordSchema,
  getAvailableAdminsSchema,
} from "./user.validators";

const router = Router();
const controller = new UserController();

// Get available admins (for assignment dropdown)
router.get(
  "/available",
  authenticate,
  validate(getAvailableAdminsSchema),
  controller.getAvailableAdmins.bind(controller),
);

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

// Create user
router.post(
  "/",
  authenticate,
  requirePermission("canManageUsers"),
  validate(createUserSchema),
  controller.createUser.bind(controller),
);

// Update user
router.put(
  "/:id",
  authenticate,
  requirePermission("canManageUsers"),
  validate(updateUserSchema),
  controller.updateUser.bind(controller),
);

// Update user permissions
router.put(
  "/:id/permissions",
  authenticate,
  requirePermission("canManageUsers"),
  validate(updatePermissionsSchema),
  controller.updatePermissions.bind(controller),
);

// Update user preferences
router.put(
  "/:id/preferences",
  authenticate,
  validate(updatePreferencesSchema),
  controller.updatePreferences.bind(controller),
);

// Reset user password
router.post(
  "/:id/reset-password",
  authenticate,
  requirePermission("canManageUsers"),
  validate(resetPasswordSchema),
  controller.resetPassword.bind(controller),
);

// Delete user
router.delete(
  "/:id",
  authenticate,
  requirePermission("canManageUsers"),
  validate(deleteUserSchema),
  controller.deleteUser.bind(controller),
);

export default router;
