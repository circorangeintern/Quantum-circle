import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import UserRepository from "./user.repository";
import { ApiError } from "../../core/errors/api.error";

export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (Array.isArray(id)) {
      throw new ApiError(400, "Invalid user ID");
    }
    const user = await UserRepository.findSystemAdminById(id);

    if (!user) {
      ApiResponse.notFound(res, "System admin not found");
      return;
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
      ApiResponse.forbidden(res, "Cannot delete your own system-admin account");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const preventLastSystemAdminDeletion = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const count = await UserRepository.getSystemAdminCount();
    if (count <= 1) {
      ApiResponse.badRequest(res, "Cannot delete the last system-admin");
      return;
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

export const ensureSystemAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = (req as any).adminId;
    const admin = await UserRepository.findById(adminId);

    if (!admin || admin.role !== "system-admin") {
      ApiResponse.forbidden(res, "Only system-admins can access this resource");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
