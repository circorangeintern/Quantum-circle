import { Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import SchoolService from "./school.service";
import { AuthRequest } from "../auth/auth.middleware";
import { InviteStaffInput } from "./school.service";
import { ApiError } from "../../core/errors/api.error";

export class SchoolController {
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

  async getSchoolStaffs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      const result = await SchoolService.getSchoolStaffs(id, req.adminId!);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async inviteStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      const data = req.body as InviteStaffInput;
      const result = await SchoolService.inviteStaff(id, req.adminId!, data);
      ApiResponse.created(res, result, "Staff member invited successfully");
    } catch (error) {
      next(error);
    }
  }

  async removeStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, staffId } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }

      if (Array.isArray(staffId)) {
        throw new ApiError(400, "Invalid staff ID");
      }

      const result = await SchoolService.removeStaff(id, req.adminId!, staffId);
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
