import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  getUsersQuerySchema,
  deleteUserSchema,
  resetPasswordSchema,
} from "./user.validators";
import {
  checkUserExists,
  preventDeleteSelf,
  preventLastSystemAdminDeletion,
  validateEmailUniqueness,
  ensureSystemAdmin,
} from "./user.middleware";

const router = Router();
const controller = new UserController();

// ALL routes require authentication AND system-admin role
router.use(authenticate);
router.use(ensureSystemAdmin);

// Get user stats
router.get(
  "/stats",
  requirePermission("canViewAll"),
  controller.getStats.bind(controller),
);

// Get users (only system-admins)
router.get(
  "/",
  requirePermission("canViewAll"),
  validate(getUsersQuerySchema),
  controller.getUsers.bind(controller),
);

// Get user by ID
router.get(
  "/:id",
  requirePermission("canViewAll"),
  validate(deleteUserSchema),
  checkUserExists,
  controller.getUserById.bind(controller),
);

// Create system-admin
router.post(
  "/",
  requirePermission("canManageUsers"),
  validate(createUserSchema),
  validateEmailUniqueness,
  controller.createUser.bind(controller),
);

// Update system-admin
router.put(
  "/:id",
  requirePermission("canManageUsers"),
  validate(updateUserSchema),
  checkUserExists,
  validateEmailUniqueness,
  controller.updateUser.bind(controller),
);

// Reset system-admin password
router.post(
  "/:id/reset-password",
  requirePermission("canManageUsers"),
  validate(resetPasswordSchema),
  checkUserExists,
  controller.resetPassword.bind(controller),
);

// Delete system-admin
router.delete(
  "/:id",
  requirePermission("canManageUsers"),
  validate(deleteUserSchema),
  checkUserExists,
  preventDeleteSelf,
  preventLastSystemAdminDeletion,
  controller.deleteUser.bind(controller),
);

export default router;
