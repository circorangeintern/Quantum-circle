import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../core/utils/jwt.util";
import { ApiResponse } from "../../core/utils/api-response.util";
import AuthService from "./auth.service";

export interface AuthRequest extends Request {
  adminId?: string;
  adminEmail?: string;
  adminRole?: string;
  adminSchoolId?: string;
  adminPermissions?: {
    canAssign: boolean;
    canResolve: boolean;
    canViewAll: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      ApiResponse.unauthorized(res, "Authentication required");
      return;
    }

    const payload = verifyAccessToken(token);
    req.adminId = payload.adminId;
    req.adminEmail = payload.email;

    // Get admin permissions
    const permissions = await AuthService.getAdminPermissions(payload.adminId);
    req.adminPermissions = permissions;

    // Get admin role
    const admin = await AuthService.getCurrentAdmin(payload.adminId);
    if (!admin) {
      ApiResponse.unauthorized(res, "Admin not found");
      return;
    }

    req.adminRole = admin.role;
    req.adminSchoolId = admin.school?.id;

    // Validate admin is active
    const isValid = await AuthService.validateAdmin(payload.adminId);
    if (!isValid) {
      ApiResponse.forbidden(res, "Account is deactivated");
      return;
    }

    next();
  } catch (error) {
    ApiResponse.unauthorized(res, "Invalid or expired token");
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (token) {
      const payload = verifyAccessToken(token);
      req.adminId = payload.adminId;
      req.adminEmail = payload.email;

      const permissions = await AuthService.getAdminPermissions(
        payload.adminId,
      );
      req.adminPermissions = permissions;

      const admin = await AuthService.getCurrentAdmin(payload.adminId);
      req.adminRole = admin.role;
    }

    next();
  } catch {
    next();
  }
};

export const requirePermission = (
  permission: keyof NonNullable<AuthRequest["adminPermissions"]>,
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // First authenticate
      await authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      // Check permission
      if (!req.adminPermissions) {
        ApiResponse.forbidden(res, "Insufficient permissions");
        return;
      }

      // Super-admin has all permissions
      if (req.adminRole === "super-admin") {
        next();
        return;
      }

      const hasPermission = req.adminPermissions[permission];
      if (!hasPermission) {
        ApiResponse.forbidden(
          res,
          `Insufficient permissions: ${permission} required`,
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyPermission = (
  permissions: Array<keyof NonNullable<AuthRequest["adminPermissions"]>>,
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      if (!req.adminPermissions) {
        ApiResponse.forbidden(res, "Insufficient permissions");
        return;
      }

      if (req.adminRole === "super-admin") {
        next();
        return;
      }

      const hasPermission = permissions.some((p) => req.adminPermissions![p]);
      if (!hasPermission) {
        ApiResponse.forbidden(res, "Insufficient permissions");
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRole = (roles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      if (!req.adminRole || !roles.includes(req.adminRole)) {
        ApiResponse.forbidden(res, "Insufficient role permissions");
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireOwnership = (
  getResourceOwnerId: (req: Request) => string,
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      const ownerId = getResourceOwnerId(req);

      // Super-admin can access everything
      if (req.adminRole === "super-admin") {
        next();
        return;
      }

      // Allow if user is the owner or has appropriate permissions
      if (req.adminId === ownerId || req.adminPermissions?.canViewAll) {
        next();
        return;
      }

      ApiResponse.forbidden(
        res,
        "You don't have permission to access this resource",
      );
    } catch (error) {
      next(error);
    }
  };
};
