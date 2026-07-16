import { Admin, IAdmin } from "../../core/models/admin.model";
import { AuditAction, AuditLog } from "../../core/models/audit-log.model";
import { Types } from "mongoose";

export class AuthRepository {
  async findAdminByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email: email.toLowerCase() });
  }

  async findAdminById(id: string): Promise<IAdmin | null> {
    return Admin.findById(new Types.ObjectId(id));
  }

  async findAdminByIdWithPassword(id: string): Promise<IAdmin | null> {
    return Admin.findById(new Types.ObjectId(id));
  }

  async updateRefreshToken(
    adminId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await Admin.findByIdAndUpdate(new Types.ObjectId(adminId), {
      refreshToken: refreshToken || undefined,
    });
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await Admin.findByIdAndUpdate(new Types.ObjectId(adminId), {
      lastLoginAt: new Date(),
    });
  }

  async logAudit(
    action: AuditAction,
    adminId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await AuditLog.create({
      action,
      adminId,
      details,
      ipAddress,
      userAgent,
    });
  }

  async getAdminById(adminId: string): Promise<IAdmin | null> {
    return Admin.findById(new Types.ObjectId(adminId)).select(
      "-passwordHash -refreshToken",
    );
  }

  async updatePassword(adminId: string, passwordHash: string): Promise<void> {
    await Admin.findByIdAndUpdate(new Types.ObjectId(adminId), {
      passwordHash,
    });
  }

  async updateAdmin(
    adminId: string,
    updateData: Partial<IAdmin>,
  ): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(
      new Types.ObjectId(adminId),
      { $set: updateData },
      { new: true },
    );
  }

  async getActiveAdmins(): Promise<IAdmin[]> {
    return Admin.find({ isActive: true })
      .select("-passwordHash -refreshToken")
      .sort({ name: 1 });
  }

  async getAdminPermissions(adminId: string): Promise<any> {
    const admin = await Admin.findById(new Types.ObjectId(adminId)).select(
      "permissions role",
    );

    if (!admin) return null;

    // Super-admin has all permissions
    if (admin.role === "super-admin") {
      return {
        canAssign: true,
        canResolve: true,
        canViewAll: true,
        canDelete: true,
        canManageUsers: true,
      };
    }

    return admin.permissions;
  }

  async isAdminActive(adminId: string): Promise<boolean> {
    const admin = await Admin.findById(new Types.ObjectId(adminId)).select(
      "isActive",
    );
    return admin?.isActive || false;
  }
}

export default new AuthRepository();
