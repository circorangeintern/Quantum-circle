import { ApiError } from "../../core/errors/api.error";
import { School, ISchool } from "../../core/models/school.model";
import { Admin } from "../../core/models/admin.model";
import { hashPassword } from "../../core/utils/bcrypt.util";
import EmailService from "../../core/services/email.service";

export interface InviteStaffInput {
  email: string;
  name: string;
  permissions?: Partial<{
    canAssign: boolean;
    canResolve: boolean;
    canViewAll: boolean;
    canManageStaff: boolean;
    canDelete: boolean;
    canManageSchool: boolean;
  }>;
}

type SchoolUpdate = Pick<
  ISchool,
  "name" | "address" | "phone" | "email" | "website" | "logo" | "settings"
>;

export class SchoolService {
  async getSchoolById(schoolId: string, adminId: string) {
    // Verify admin belongs to this school or is super-admin
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (
      admin.schoolId.toString() !== schoolId &&
      admin.role !== "school-admin" &&
      admin.role !== "system-admin"
    ) {
      throw new ApiError(403, "Access denied to this school");
    }

    const school = await School.findById(schoolId);
    if (!school) throw new ApiError(404, "School not found");

    return this.formatSchool(school);
  }

  async updateSchool(
    schoolId: string,
    adminId: string,
    data: Partial<ISchool>,
  ) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (
      admin.schoolId.toString() !== schoolId &&
      admin.role !== "school-admin" &&
      admin.role !== "system-admin"
    ) {
      throw new ApiError(403, "Access denied to this school");
    }

    const school = await School.findById(schoolId);
    if (!school) throw new ApiError(404, "School not found");

    // Only allow certain fields to be updated
    const allowedUpdates: Array<keyof SchoolUpdate> = [
      "name",
      "address",
      "phone",
      "email",
      "website",
      "logo",
      "settings",
    ];

    const updateData: Partial<SchoolUpdate> = {};

    for (const field of allowedUpdates) {
      const value = data[field];

      if (value != null) {
        (updateData as Record<typeof field, typeof value>)[field] = value;
      }
    }

    Object.assign(school, updateData);
    await school.save();

    return this.formatSchool(school);
  }

  async getSchoolStaffs(schoolId: string, adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "School Admin not found");

    if (
      admin.schoolId.toString() !== schoolId &&
      admin.role !== "school-admin" &&
      admin.role !== "system-admin"
    ) {
      throw new ApiError(403, "Access denied to this school");
    }

    const admins = await Admin.find({ schoolId })
      .select("-passwordHash -refreshToken")
      .sort({ name: 1 });

    return admins.map((a) => this.formatAdmin(a));
  }

  async inviteStaff(schoolId: string, adminId: string, data: InviteStaffInput) {
    // Verify admin has permission (school-admin or system-admin)
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (admin.role === "system-admin") {
      // System admin can create school-admin? Yes, but let's restrict
      // They should use the registration flow
      throw new ApiError(403, "Use registration flow for school-admins");
    }

    if (admin.role === "school-admin") {
      // Check if they belong to this school
      if (admin.schoolId.toString() !== schoolId) {
        throw new ApiError(403, "Access denied");
      }

      // Check if they have manage staff permission
      if (!admin.permissions.canManageStaff) {
        throw new ApiError(403, "Insufficient permissions to invite staff");
      }
    }

    // Check if email already exists
    const existing = await Admin.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }

    // Generate temp password
    const tempPassword = this.generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Create school-staff
    const staff = new Admin({
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      schoolId: schoolId,
      role: "school-staff", // ← Creates school staff
      isActive: true,
      permissions: {
        canAssign: false, // Staff cannot assign
        canResolve: data.permissions?.canResolve || true,
        canViewAll: false, // Staff cannot view all
        canManageStaff: false,
        canDelete: false,
        canManageSchool: false,
      },
    });

    await staff.save();

    // Send welcome email with temp password
    await EmailService.sendWelcomeEmail(staff.email, staff.name, tempPassword);

    return {
      id: staff._id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      permissions: staff.permissions,
    };
  }

  async removeStaff(schoolId: string, adminId: string, targetAdminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    // Check if user has permission to manage users
    if (!admin.permissions.canManageStaff && admin.role !== "school-admin") {
      throw new ApiError(403, "Insufficient permissions");
    }

    // Check if admin belongs to this school
    if (admin.schoolId.toString() !== schoolId) {
      throw new ApiError(403, "Access denied to this school");
    }

    // Cannot remove yourself
    if (adminId === targetAdminId) {
      throw new ApiError(400, "Cannot remove yourself");
    }

    const targetAdmin = await Admin.findById(targetAdminId);
    if (!targetAdmin) throw new ApiError(404, "Admin not found");

    // Cannot remove super-admin
    if (targetAdmin.role === "school-admin") {
      throw new ApiError(400, "Cannot remove school-admin");
    }

    // Cannot remove if admin belongs to different school
    if (targetAdmin.schoolId.toString() !== schoolId) {
      throw new ApiError(400, "Admin does not belong to this school");
    }

    targetAdmin.isActive = false;
    await targetAdmin.save();

    // Update school stats
    const school = await School.findById(schoolId);
    if (school) {
      school.stats.activeAdmins = Math.max(0, school.stats.activeAdmins - 1);
      await school.save();
    }

    return { success: true, message: "Admin removed successfully" };
  }

  async getSchoolStats(schoolId: string, adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (
      admin.schoolId.toString() !== schoolId &&
      admin.role !== "school-admin"
    ) {
      throw new ApiError(403, "Access denied to this school");
    }

    const school = await School.findById(schoolId);
    if (!school) throw new ApiError(404, "School not found");

    // Get report stats for this school
    const Report = require("../../core/models/report.model").Report;
    const [total, resolved, pending] = await Promise.all([
      Report.countDocuments({ schoolId }),
      Report.countDocuments({ schoolId, status: "resolved" }),
      Report.countDocuments({
        schoolId,
        status: { $in: ["new", "open", "investigating"] },
      }),
    ]);

    return {
      school: this.formatSchool(school),
      reports: {
        total,
        resolved,
        pending,
        resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      },
      admins: {
        total: school.stats.activeAdmins,
      },
    };
  }

  private formatSchool(school: ISchool) {
    return {
      id: school.id,
      name: school.name,
      domain: school.domain,
      address: school.address,
      phone: school.phone,
      email: school.email,
      website: school.website,
      logo: school.logo,
      isActive: school.isActive,
      settings: school.settings,
      stats: school.stats,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    };
  }

  private formatAdmin(admin: any) {
    return {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      department: admin.department,
      isActive: admin.isActive,
      permissions: admin.permissions,
      preferences: admin.preferences,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  private generateTemporaryPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 14; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export default new SchoolService();
