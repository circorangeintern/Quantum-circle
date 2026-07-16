import { ApiError } from "../../core/errors/api.error";
import { UserRepository } from "./user.repository";
import {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
  GetUsersQuery,
  PaginatedUsersResponse,
  UpdatePermissionsInput,
  UpdatePreferencesInput,
  UserPermissions,
  UserPreferences,
} from "./user.types";
import {
  hashPassword,
  generateTemporaryPassword,
} from "../../core/utils/bcrypt.util";
import { Admin } from "../../core/models/admin.model";
import logger from "../../core/utils/logger.util";
import EmailService from "../../core/services/email.service";

const DEFAULT_PERMISSIONS: UserPermissions = {
  canAssign: false,
  canResolve: false,
  canViewAll: false,
  canDelete: false,
  canManageUsers: false,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: {
    newReports: true,
    urgentCases: true,
    weeklySummary: false,
    assignments: true,
  },
  emailDigest: false,
  dashboardView: "list",
};

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async createUser(
    data: CreateUserInput,
    createdBy: string,
  ): Promise<UserResponse> {
    // Check if email already exists
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    const userData: any = {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: data.role || "admin",
      department: data.department || "Student Affairs",
      isActive: true,
      permissions: data.permissions || DEFAULT_PERMISSIONS,
      preferences: DEFAULT_PREFERENCES,
    };

    const user = await this.repository.createUser(userData);

    // Log action
    await this.repository.logUserAction("user_created", createdBy, user.id, {
      email: user.email,
      role: user.role,
    });

    logger.info(`New user created: ${user.email} by ${createdBy}`);

    // Send welcome email with temporal password
    try {
      await EmailService.sendWelcomeEmail(user.email, user.name, tempPassword);
    } catch (error: any) {
      console.error("Failed to send welcome email:", error);

      await this.repository.logUserAction(
        "user_temporal_password_failed",
        user.id,
        undefined,
        { userEmail: user.email, error: error.message },
      );
    }

    await this.repository.logUserAction(
      "user_temporal_password",
      user.id,
      undefined,
      {
        userEmail: user.email,
        exists: true,
      },
    );

    return this.formatUser(user);
  }

  async getUsers(
    query: GetUsersQuery,
    includeStats: boolean = false,
  ): Promise<PaginatedUsersResponse> {
    const { users, total } = await this.repository.getUsers(query);

    const stats = includeStats
      ? await this.repository.getUsersStats()
      : undefined;

    return {
      users: users.map((u) => this.formatUser(u)),
      pagination: {
        total,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
      stats,
    };
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return this.formatUser(user);
  }

  async updateUser(
    userId: string,
    data: UpdateUserInput,
    updatedBy: string,
  ): Promise<UserResponse> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Don't allow changing own role/permissions
    if (updatedBy === userId) {
      const disallowedFields = ["role", "permissions", "isActive"];
      const attemptedChange = Object.keys(data).some((key) =>
        disallowedFields.includes(key),
      );
      if (attemptedChange) {
        throw new ApiError(
          403,
          "Cannot change your own role, permissions, or active status",
        );
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.department) updateData.department = data.department;
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.permissions) {
      updateData.permissions = {
        ...user.permissions,
        ...data.permissions,
      };
    }
    if (data.preferences) {
      updateData.preferences = {
        ...user.preferences,
        ...data.preferences,
      };
    }

    const updated = await this.repository.updateUser(userId, updateData);
    if (!updated) {
      throw new ApiError(500, "Failed to update user");
    }

    // Log action
    await this.repository.logUserAction("user_updated", updatedBy, userId, {
      changes: data,
    });

    logger.info(`User updated: ${user.email} by ${updatedBy}`);

    return this.formatUser(updated);
  }

  async updatePermissions(
    userId: string,
    permissions: UpdatePermissionsInput,
    updatedBy: string,
  ): Promise<UserResponse> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Don't allow changing own permissions
    if (updatedBy === userId) {
      throw new ApiError(403, "Cannot change your own permissions");
    }

    // Super-admin always has all permissions
    if (user.role === "super-admin") {
      throw new ApiError(400, "Super-admin permissions cannot be modified");
    }

    const updated = await this.repository.updateUser(userId, {
      permissions: {
        ...user.permissions,
        ...permissions,
      },
    });

    if (!updated) {
      throw new ApiError(500, "Failed to update permissions");
    }

    // Log action
    await this.repository.logUserAction(
      "permissions_updated",
      updatedBy,
      userId,
      { permissions },
    );

    logger.info(`Permissions updated for ${user.email} by ${updatedBy}`);

    return this.formatUser(updated);
  }

  async updatePreferences(
    userId: string,
    preferences: UpdatePreferencesInput,
  ): Promise<UserResponse> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const updated = await this.repository.updateUser(userId, {
      preferences: {
        notifications: {
          ...user.preferences.notifications,
          ...preferences.notifications,
        },
        emailDigest: preferences.emailDigest ?? user.preferences.emailDigest,
        dashboardView:
          preferences.dashboardView ?? user.preferences.dashboardView,
      },
    });

    if (!updated) {
      throw new ApiError(500, "Failed to update preferences");
    }

    return this.formatUser(updated);
  }

  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    // Don't allow deleting self
    if (userId === deletedBy) {
      throw new ApiError(403, "Cannot delete your own account");
    }

    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Don't allow deleting super-admin
    if (user.role === "super-admin") {
      const superAdmins = await Admin.countDocuments({ role: "super-admin" });
      if (superAdmins <= 1) {
        throw new ApiError(400, "Cannot delete the last super-admin");
      }
    }

    const deleted = await this.repository.deleteUser(userId);
    if (!deleted) {
      throw new ApiError(500, "Failed to delete user");
    }

    // Log action
    await this.repository.logUserAction("user_deleted", deletedBy, userId, {
      email: user.email,
    });

    logger.info(`User deleted: ${user.email} by ${deletedBy}`);
  }

  async resetPassword(userId: string, resetBy: string): Promise<string> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate new temporary password
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    await this.repository.updateUserWithPassword(userId, { passwordHash });

    // Log action
    await this.repository.logUserAction(
      "password_reset_requested",
      resetBy,
      userId,
      {
        email: user.email,
      },
    );

    logger.info(`Password reset for ${user.email} by ${resetBy}`);

    // Send reset email with token
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name,
        passwordHash,
      );
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      await this.repository.logUserAction(
        "password_reset_email_failed",
        user.id,
        undefined,
        { userEmail: user.email, error: error.message },
      );
    }

    await this.repository.logUserAction(
      "password_reset_requested",
      user.id,
      undefined,
      {
        userEmail: user.email,
        exists: true,
      },
    );

    return tempPassword;
  }

  async getUserStats(): Promise<any> {
    return this.repository.getUsersStats();
  }

  async getAvailableAdmins(): Promise<UserResponse[]> {
    const admins = await this.repository.findActiveAdmins();
    return admins.map((u) => this.formatUser(u));
  }

  private formatUser(user: any): UserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || "Student Affairs",
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      permissions: user.permissions || DEFAULT_PERMISSIONS,
      preferences: user.preferences || DEFAULT_PREFERENCES,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();
