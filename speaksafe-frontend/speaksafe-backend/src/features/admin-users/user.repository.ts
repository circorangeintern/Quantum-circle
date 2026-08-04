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
    const { isActive, search, page = 1, limit = 20, sortBy = "newest" } = query;

    // Only fetch system-admins
    const filter: any = { role: "system-admin" };
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
  }> {
    const [total, active, inactive] = await Promise.all([
      Admin.countDocuments({ role: "system-admin" }),
      Admin.countDocuments({ role: "system-admin", isActive: true }),
      Admin.countDocuments({ role: "system-admin", isActive: false }),
    ]);

    return { total, active, inactive };
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

  async findActiveSystemAdmins(): Promise<IAdmin[]> {
    return Admin.find({ role: "system-admin", isActive: true })
      .select("-passwordHash -refreshToken")
      .sort({ name: 1 });
  }

  async findSystemAdminById(id: string): Promise<IAdmin | null> {
    return Admin.findOne({
      _id: new Types.ObjectId(id),
      role: "system-admin",
    }).select("-passwordHash -refreshToken");
  }

  // Prevent deleting the last system-admin
  async getSystemAdminCount(): Promise<number> {
    return Admin.countDocuments({ role: "system-admin" });
  }
}

export default new UserRepository();
