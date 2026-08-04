import { ApiError } from "../../core/errors/api.error";
import { UserRepository } from "./user.repository";
import {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
  GetUsersQuery,
  PaginatedUsersResponse,
} from "./user.types";
import {
  hashPassword,
  generateTemporaryPassword,
} from "../../core/utils/bcrypt.util";
import logger from "../../core/utils/logger.util";
import EmailService from "../../core/services/email.service";
import { IAdmin } from "../../core/models/admin.model";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  // ONLY system-admins can be created here
  async createUser(
    data: CreateUserInput,
    createdBy: string,
  ): Promise<UserResponse> {
    // Verify creator is system-admin
    const creator = await this.repository.findById(createdBy);
    if (!creator || creator.role !== "system-admin") {
      throw new ApiError(403, "Only system-admins can create system-admins");
    }

    // Check if email already exists
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Only system-admin role allowed
    const userData: Partial<IAdmin> = {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: "system-admin",
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    const user = await this.repository.createUser(userData);

    // Log action
    await this.repository.logUserAction("user_created", createdBy, user.id, {
      email: user.email,
      role: user.role,
    });

    logger.info(`New system-admin created: ${user.email} by ${createdBy}`);

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user.email, user.name, tempPassword);
    } catch (error: any) {
      console.error("Failed to send welcome email:", error);
    }

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
    // Only return if it's a system-admin
    const user = await this.repository.findSystemAdminById(userId);
    if (!user) {
      throw new ApiError(404, "System admin not found");
    }
    return this.formatUser(user);
  }

  async updateUser(
    userId: string,
    data: UpdateUserInput,
    updatedBy: string,
  ): Promise<UserResponse> {
    // Verify user is a system-admin
    const user = await this.repository.findSystemAdminById(userId);
    if (!user) {
      throw new ApiError(404, "System admin not found");
    }

    // Don't allow changing own account
    if (updatedBy === userId) {
      throw new ApiError(403, "Cannot modify your own system-admin account");
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.repository.updateUser(userId, updateData);
    if (!updated) {
      throw new ApiError(500, "Failed to update user");
    }

    // Log action
    await this.repository.logUserAction("user_updated", updatedBy, userId, {
      changes: data,
    });

    logger.info(`System-admin updated: ${user.email} by ${updatedBy}`);

    return this.formatUser(updated);
  }

  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    // Don't allow deleting self
    if (userId === deletedBy) {
      throw new ApiError(403, "Cannot delete your own system-admin account");
    }

    // Verify user is a system-admin
    const user = await this.repository.findSystemAdminById(userId);
    if (!user) {
      throw new ApiError(404, "System admin not found");
    }

    // Prevent deleting the last system-admin
    const count = await this.repository.getSystemAdminCount();
    if (count <= 1) {
      throw new ApiError(400, "Cannot delete the last system-admin");
    }

    const deleted = await this.repository.deleteUser(userId);
    if (!deleted) {
      throw new ApiError(500, "Failed to delete user");
    }

    // Log action
    await this.repository.logUserAction("user_deleted", deletedBy, userId, {
      email: user.email,
    });

    logger.info(`System-admin deleted: ${user.email} by ${deletedBy}`);
  }

  async resetPassword(userId: string, resetBy: string): Promise<string> {
    // Verify user is a system-admin
    const user = await this.repository.findSystemAdminById(userId);
    if (!user) {
      throw new ApiError(404, "System admin not found");
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
      { email: user.email },
    );

    logger.info(`Password reset for system-admin: ${user.email} by ${resetBy}`);

    // Send reset email
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name,
        tempPassword,
      );
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
    }

    return tempPassword;
  }

  async getUserStats(): Promise<any> {
    return this.repository.getUsersStats();
  }

  private formatUser(user: any): UserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: "system-admin",
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();
