import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import SchoolService from "./school.service";
import { AuthRequest } from "../auth/auth.middleware";
import { RegisterSchoolInput, InviteAdminInput } from "./school.service";
import { ApiError } from "../../core/errors/api.error";

export class SchoolController {
  async registerSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterSchoolInput;
      const result = await SchoolService.registerSchool(data);
      ApiResponse.created(res, result, "School registered successfully");
    } catch (error) {
      next(error);
    }
  }

  async getSchool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }
      const result = await SchoolService.getSchoolById(id, req.adminId!);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateSchool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }
      const data = req.body;
      const result = await SchoolService.updateSchool(id, req.adminId!, data);
      ApiResponse.success(res, result, "School updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async getSchoolAdmins(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      const result = await SchoolService.getSchoolAdmins(id, req.adminId!);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async inviteAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      const data = req.body as InviteAdminInput;
      const result = await SchoolService.inviteAdmin(id, req.adminId!, data);
      ApiResponse.created(res, result, "Admin invited successfully");
    } catch (error) {
      next(error);
    }
  }

  async removeAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, adminId } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      if (Array.isArray(adminId)) {
        throw new ApiError(400, "Invalid admin ID");
      }

      const result = await SchoolService.removeAdmin(id, req.adminId!, adminId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSchoolStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      const result = await SchoolService.getSchoolStats(id, req.adminId!);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
