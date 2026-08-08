import { ApiError } from "../../core/errors/api.error";
import { UserRepository } from "./user.repository";
import {
  UpdateUserInput,
  UserResponse,
  GetUsersQuery,
  PaginatedUsersResponse,
  UpdatePermissionsInput,
  UpdatePreferencesInput,
  UserPermissions,
  UserPreferences,
} from "./user.types";
import { Admin } from "../../core/models/admin.model";
import logger from "../../core/utils/logger.util";
import { AuthRequest } from "../auth/auth.middleware";

const DEFAULT_PERMISSIONS: UserPermissions = {
  canAssign: false,
  canResolve: true,
  canViewAll: false,
  canDelete: false,
  canManageStaff: false,
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
    updatedBy: AuthRequest,
  ): Promise<UserResponse> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if the updater is a school-admin and belongs to the same school as the user
    if (
      updatedBy.adminRole === "school-admin" &&
      updatedBy.adminSchoolId !== user.schoolId.toString()
    ) {
      throw new ApiError(403, "You do not have permission to update this user");
    }

    // Don't allow changing own role/permissions
    if (updatedBy.adminId === userId) {
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

    if (
      updatedBy.adminPermissions &&
      !updatedBy.adminPermissions.canManageStaff
    ) {
      throw new ApiError(403, "You do not have permission to update users");
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
    await this.repository.logUserAction(
      "user_updated",
      updatedBy.adminId ?? "",
      userId,
      {
        changes: data,
      },
    );

    logger.info(`User updated: ${user.email} by ${updatedBy.adminId}`);

    return this.formatUser(updated);
  }

  async updatePermissions(
    userId: string,
    permissions: UpdatePermissionsInput,
    updatedBy: AuthRequest,
  ): Promise<UserResponse> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if the updater is a school-admin and belongs to the same school as the user
    if (
      updatedBy.adminRole === "school-admin" &&
      updatedBy.adminSchoolId !== user.schoolId.toString()
    ) {
      throw new ApiError(
        403,
        "You do not have permission to update this user's permissions",
      );
    }

    // Don't allow changing own permissions
    if (updatedBy.adminId === userId) {
      throw new ApiError(403, "Cannot change your own permissions");
    }

    // Don't allow changing permissions of a system-admin
    if (user.role === "system-admin") {
      throw new ApiError(403, "Cannot change permissions of a system-admin");
    }

    // Don't allow changing permissions of a userif the updater is can not manage staff
    if (
      updatedBy.adminPermissions &&
      !updatedBy.adminPermissions.canManageStaff
    ) {
      throw new ApiError(
        403,
        "You do not have permission to update permissions",
      );
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
      updatedBy.adminId ?? "",
      userId,
      { permissions },
    );

    logger.info(
      `Permissions updated for ${user.email} by ${updatedBy.adminId ?? ""}`,
    );

    return this.formatUser(updated);
  }

  async updatePreferences(
    userId: string,
    preferences: UpdatePreferencesInput,
    updatedBy: AuthRequest,
  ): Promise<UserResponse> {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Allow only the user themselves or a system-admin with manage_staff permission to update preferences
    if (
      updatedBy.adminId !== userId &&
      (updatedBy.adminRole !== "system-admin" ||
        !updatedBy.adminPermissions?.canManageStaff)
    ) {
      throw new ApiError(
        403,
        "You do not have permission to update this user's preferences",
      );
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

  async deleteUser(userId: string, deletedBy: AuthRequest): Promise<void> {
    // Don't allow deleting self
    if (userId === deletedBy.adminId) {
      throw new ApiError(403, "Cannot delete your own account");
    }

    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (
      deletedBy.adminRole === "school-admin" &&
      deletedBy.adminSchoolId !== user.schoolId.toString()
    ) {
      throw new ApiError(403, "You do not have permission to delete this user");
    }

    // Don't allow deleting system-admin from this route
    if (user.role === "system-admin") {
      throw new ApiError(403, "Cannot delete a system-admin");
    }

    // Don't allow deleting the last school-admin
    if (user.role === "school-admin") {
      const superAdmins = await Admin.countDocuments({ role: "school-admin" });
      if (superAdmins <= 1) {
        throw new ApiError(400, "Cannot delete the last school-admin");
      }
    }

    // Don't allow deleting a user if the deleter does not have manage_staff permission
    if (
      deletedBy.adminPermissions &&
      !deletedBy.adminPermissions.canManageStaff
    ) {
      throw new ApiError(403, "You do not have permission to delete this user");
    }

    const deleted = await this.repository.deleteUser(userId);
    if (!deleted) {
      throw new ApiError(500, "Failed to delete user");
    }

    // Log action
    await this.repository.logUserAction(
      "user_deleted",
      deletedBy.adminId ?? "",
      userId,
      {
        email: user.email,
      },
    );

    logger.info(`User deleted: ${user.email} by ${deletedBy.adminId ?? ""}`);
  }

  async getUserStats(): Promise<any> {
    return this.repository.getUsersStats();
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
