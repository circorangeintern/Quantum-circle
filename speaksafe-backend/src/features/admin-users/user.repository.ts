import { Admin, IAdmin } from "../../core/models/admin.model";
import { AuditAction, AuditLog } from "../../core/models/audit-log.model";
import { Types } from "mongoose";
import { GetUsersQuery } from "./user.types";

export class UserRepository {
  async createUser(userData: Partial<IAdmin>): Promise<IAdmin> {
    const user = new Admin(userData);
    return user.save();
  }

  async findById(id: string): Promise<IAdmin | null> {
    return Admin.findById(new Types.ObjectId(id)).select(
      "-passwordHash -refreshToken",
    );
  }

  async findByIdWithPassword(id: string): Promise<IAdmin | null> {
    return Admin.findById(new Types.ObjectId(id));
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email: email.toLowerCase() });
  }

  async getUsers(query: GetUsersQuery): Promise<{
    users: IAdmin[];
    total: number;
  }> {
    const {
      role,
      isActive,
      search,
      page = 1,
      limit = 20,
      sortBy = "newest",
    } = query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    let sort: any = { createdAt: -1 };
    if (sortBy === "oldest") sort = { createdAt: 1 };
    if (sortBy === "name") sort = { name: 1 };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      Admin.find(filter)
        .select("-passwordHash -refreshToken")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Admin.countDocuments(filter),
    ]);

    return { users, total };
  }

  async updateUser(
    userId: string,
    updateData: Partial<IAdmin>,
  ): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: updateData },
      { new: true },
    ).select("-passwordHash -refreshToken");
  }

  async updateUserWithPassword(
    userId: string,
    updateData: Partial<IAdmin>,
  ): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: updateData },
      { new: true },
    );
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await Admin.findByIdAndDelete(new Types.ObjectId(userId));
    return !!result;
  }

  async getUsersStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    roles: {
      "super-admin": number;
      admin: number;
      viewer: number;
    };
  }> {
    const [total, active, inactive, superAdmin, admin, viewer] =
      await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ isActive: true }),
        Admin.countDocuments({ isActive: false }),
        Admin.countDocuments({ role: "super-admin" }),
        Admin.countDocuments({ role: "admin" }),
        Admin.countDocuments({ role: "viewer" }),
      ]);

    return {
      total,
      active,
      inactive,
      roles: {
        "super-admin": superAdmin,
        admin,
        viewer,
      },
    };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await Admin.findByIdAndUpdate(new Types.ObjectId(userId), {
      lastLoginAt: new Date(),
    });
  }

  async logUserAction(
    action: AuditAction,
    userId: string,
    targetUserId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
  ): Promise<void> {
    await AuditLog.create({
      action,
      adminId: userId,
      details: {
        targetUserId,
        ...details,
      },
      ipAddress,
    });
  }

  async findActiveAdmins(): Promise<IAdmin[]> {
    return Admin.find({ isActive: true })
      .select("-passwordHash -refreshToken")
      .sort({ name: 1 });
  }

  async findAdminsWithPermission(
    permission: keyof IAdmin["permissions"],
  ): Promise<IAdmin[]> {
    return Admin.find({
      isActive: true,
      [`permissions.${permission}`]: true,
    }).select("-passwordHash -refreshToken");
  }
}

export default new UserRepository();
