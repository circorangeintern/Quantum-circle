import { Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import UserService from "./user.service";
import { AuthRequest } from "../auth/auth.middleware";
import {
  UpdateUserInput,
  GetUsersQuery,
  UpdatePermissionsInput,
  UpdatePreferencesInput,
} from "./user.types";

export class UserController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (
        req.adminRole === "school-admin" ||
        req.adminRole === "school-staff" ||
        !req.adminPermissions?.canViewAll
      ) {
        ApiResponse.forbidden(
          res,
          "You do not have permission to view all users",
        );
        return;
      }

      const query = req.query as GetUsersQuery;
      const includeStats = req.query.stats === "true";
      const result = await UserService.getUsers(query, includeStats);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (
        req.adminRole === "school-admin" ||
        req.adminRole === "school-staff" ||
        !req.adminPermissions?.canViewAll
      ) {
        ApiResponse.forbidden(
          res,
          "You do not have permission to view users details",
        );
        return;
      }

      const { id } = req.params;

      if (Array.isArray(id)) {
        ApiResponse.badRequest(res, "Invalid user ID");
        return;
      }

      const result = await UserService.getUserById(id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        ApiResponse.badRequest(res, "Invalid user ID");
        return;
      }

      const data = req.body as UpdateUserInput;

      if (req.adminId) {
        if (
          req.adminRole !== "system-admin" &&
          !req.adminPermissions?.canManageStaff
        ) {
          ApiResponse.forbidden(
            res,
            "You do not have permission to update users",
          );
          return;
        }
      }

      const result = await UserService.updateUser(id, data, req);
      ApiResponse.success(res, result, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updatePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        ApiResponse.badRequest(res, "Invalid user ID");
        return;
      }

      const permissions = req.body as UpdatePermissionsInput;
      const result = await UserService.updatePermissions(id, permissions, req);
      ApiResponse.success(res, result, "Permissions updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        ApiResponse.badRequest(res, "Invalid user ID");
        return;
      }

      const preferences = req.body as UpdatePreferencesInput;
      const result = await UserService.updatePreferences(id, preferences, req);
      ApiResponse.success(res, result, "Preferences updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        ApiResponse.badRequest(res, "Invalid user ID");
        return;
      }

      await UserService.deleteUser(id, req);
      ApiResponse.success(res, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (
        req.adminRole === "school-admin" ||
        req.adminRole === "school-staff" ||
        !req.adminPermissions?.canViewAll
      ) {
        ApiResponse.forbidden(
          res,
          "You do not have permission to view all users stats",
        );
        return;
      }

      const stats = await UserService.getUserStats();
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
