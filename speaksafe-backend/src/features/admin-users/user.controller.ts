import { Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import UserService from "./user.service";
import { AuthRequest } from "../auth/auth.middleware";
import { CreateUserInput, UpdateUserInput, GetUsersQuery } from "./user.types";
import { ApiError } from "../../core/errors/api.error";

export class UserController {
  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateUserInput;
      const result = await UserService.createUser(data, req.adminId!);
      ApiResponse.created(res, result, "System admin created successfully");
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
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
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid user ID");
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
        throw new ApiError(400, "Invalid user ID");
      }
      const data = req.body as UpdateUserInput;
      const result = await UserService.updateUser(id, data, req.adminId!);
      ApiResponse.success(res, result, "System admin updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid user ID");
      }
      await UserService.deleteUser(id, req.adminId!);
      ApiResponse.success(res, null, "System admin deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid user ID");
      }
      const tempPassword = await UserService.resetPassword(id, req.adminId!);
      ApiResponse.success(
        res,
        { temporaryPassword: tempPassword },
        "Password reset successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await UserService.getUserStats();
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
