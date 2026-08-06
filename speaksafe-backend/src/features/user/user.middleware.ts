import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import UserRepository from "./user.repository";
import { Admin } from "../../core/models/admin.model";

export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (Array.isArray(id)) {
      ApiResponse.badRequest(res, "Invalid user ID");
      return;
    }

    const user = await UserRepository.findById(id);

    if (!user) {
      ApiResponse.notFound(res, "User not found");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const preventSelfModification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).adminId;

    if (Array.isArray(id)) {
      ApiResponse.badRequest(res, "Invalid user ID");
      return;
    }

    if (id === adminId) {
      const { body } = req;
      const sensitiveFields = ["role", "permissions", "isActive"];
      const hasSensitiveChange = Object.keys(body).some((field) =>
        sensitiveFields.includes(field),
      );

      if (hasSensitiveChange) {
        ApiResponse.forbidden(
          res,
          "Cannot modify your own role, permissions, or active status",
        );
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const preventDeleteSelf = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).adminId;

    if (id === adminId) {
      ApiResponse.forbidden(res, "Cannot delete your own account");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const preventLastSuperAdminDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      ApiResponse.badRequest(res, "Invalid user ID");
      return;
    }

    const user = await UserRepository.findByIdWithPassword(id);

    if (user && user.role === "school-admin") {
      const superAdminCount = await Admin.countDocuments({
        role: "school-admin",
      });
      if (superAdminCount <= 1) {
        ApiResponse.badRequest(res, "Cannot delete the last school-admin");
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateEmailUniqueness = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    if (!email) {
      next();
      return;
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing && existing._id.toString() !== id) {
      ApiResponse.conflict(res, "User with this email already exists");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
