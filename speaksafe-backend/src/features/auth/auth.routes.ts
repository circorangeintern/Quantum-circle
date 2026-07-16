import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate, requirePermission } from "./auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validators";
import { loginLimiter } from "../../core/config/rate-limit.config";

const router = Router();
const controller = new AuthController();

// Public routes
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  controller.login.bind(controller),
);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  controller.refresh.bind(controller),
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword.bind(controller),
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword.bind(controller),
);

// Protected routes
router.post("/logout", authenticate, controller.logout.bind(controller));

router.get("/me", authenticate, controller.me.bind(controller));

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  controller.changePassword.bind(controller),
);

router.get(
  "/permissions",
  authenticate,
  controller.permissions.bind(controller),
);

// Super-admin only routes (for managing other admins)
router.post(
  "/create-admin",
  authenticate,
  requirePermission("canManageUsers"),
  // This would be handled by the UserService
  // controller.createAdmin.bind(controller),
);

export default router;
