import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import AuthService from "./auth.service";
import { AuthRequest } from "./auth.middleware";
import {
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "./auth.types";
import { env } from "../../core/config/env.config";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = req.body as LoginRequest;
      const result = await AuthService.login(
        credentials,
        req.ip,
        req.get("user-agent"),
      );

      // Set cookies
      const isProduction = env.NODE_ENV === "production";

      res.cookie("accessToken", result.tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      ApiResponse.success(
        res,
        {
          admin: result.admin,
        },
        "Login successful",
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshTokenRequest;
      const tokens = await AuthService.refreshToken(
        refreshToken,
        req.ip,
        req.get("user-agent"),
      );

      const isProduction = env.NODE_ENV === "production";

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      ApiResponse.success(res, null, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.adminId) {
        await AuthService.logout(req.adminId, req.ip, req.get("user-agent"));
      }

      // Clear cookies
      res.clearCookie("accessToken", {
        path: "/",
        httpOnly: true,
      });
      res.clearCookie("refreshToken", {
        path: "/",
        httpOnly: true,
      });

      ApiResponse.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.adminId) {
        ApiResponse.unauthorized(res);
        return;
      }

      const admin = await AuthService.getCurrentAdmin(req.adminId);
      ApiResponse.success(res, admin);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.adminId) {
        ApiResponse.unauthorized(res);
        return;
      }

      const data = req.body as ChangePasswordRequest;
      await AuthService.changePassword(req.adminId, data, req.ip);
      ApiResponse.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ForgotPasswordRequest;
      await AuthService.forgotPassword(data, req.ip);
      ApiResponse.success(
        res,
        null,
        "Password reset email sent if account exists",
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ResetPasswordRequest;
      await AuthService.resetPassword(data, req.ip);
      ApiResponse.success(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }

  async permissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.adminId) {
        ApiResponse.unauthorized(res);
        return;
      }

      const permissions = await AuthService.getAdminPermissions(req.adminId);
      ApiResponse.success(res, {
        permissions,
        role: req.adminRole,
      });
    } catch (error) {
      next(error);
    }
  }
}
