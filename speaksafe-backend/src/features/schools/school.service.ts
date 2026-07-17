import { ApiError } from "../../core/errors/api.error";
import { School, ISchool } from "../../core/models/school.model";
import { Admin } from "../../core/models/admin.model";
import { hashPassword } from "../../core/utils/bcrypt.util";
import { generateTokens } from "../../core/utils/jwt.util";
import EmailService from "../../core/services/email.service";

export interface RegisterSchoolInput {
  schoolName: string;
  domain: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}

export interface InviteAdminInput {
  email: string;
  name: string;
  role: "admin" | "viewer";
  permissions?: Partial<{
    canAssign: boolean;
    canResolve: boolean;
    canViewAll: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
  }>;
}

type SchoolUpdate = Pick<
  ISchool,
  "name" | "address" | "phone" | "email" | "website" | "logo" | "settings"
>;

export class SchoolService {
  async registerSchool(data: RegisterSchoolInput) {
    const { schoolName, domain, adminEmail, adminName, adminPassword } = data;

    // Check if school domain already exists
    const existingSchool = await School.findOne({
      domain: domain.toLowerCase(),
    });
    if (existingSchool) {
      throw new ApiError(409, "A school with this domain already exists");
    }

    // Check if admin email already exists
    const existingAdmin = await Admin.findOne({
      email: adminEmail.toLowerCase(),
    });
    if (existingAdmin) {
      throw new ApiError(409, "This email is already registered");
    }

    // Create school
    const school = new School({
      name: schoolName,
      domain: domain.toLowerCase(),
      isActive: true,
      settings: {
        allowAnonymous: true,
        requireApproval: true,
        maxAdmins: 10,
        retentionDays: 365,
        allowAttachments: true,
      },
      subscription: {
        plan: "free",
        features: [],
      },
      stats: {
        totalReports: 0,
        activeAdmins: 0,
        resolvedCases: 0,
        pendingCases: 0,
      },
    });

    await school.save();

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create super admin
    const admin = new Admin({
      email: adminEmail.toLowerCase(),
      passwordHash,
      name: adminName,
      schoolId: school._id,
      role: "super-admin",
      department: "Administration",
      isActive: true,
      permissions: {
        canAssign: true,
        canResolve: true,
        canViewAll: true,
        canDelete: true,
        canManageUsers: true,
      },
    });

    await admin.save();

    // Update school stats
    school.stats.activeAdmins = 1;
    await school.save();

    // Generate tokens
    const tokens = generateTokens({
      adminId: admin._id.toString(),
      email: admin.email,
    });

    // Store refresh token
    admin.refreshToken = tokens.refreshToken;
    await admin.save();

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(admin.email, admin.name, "");
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return {
      school: this.formatSchool(school),
      admin: this.formatAdmin(admin),
      tokens,
    };
  }

  async getSchoolById(schoolId: string, adminId: string) {
    // Verify admin belongs to this school or is super-admin
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (
      admin.schoolId.toString() !== schoolId &&
      admin.role !== "super-admin"
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
      admin.role !== "super-admin"
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

  async getSchoolAdmins(schoolId: string, adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (
      admin.schoolId.toString() !== schoolId &&
      admin.role !== "super-admin"
    ) {
      throw new ApiError(403, "Access denied to this school");
    }

    const admins = await Admin.find({ schoolId })
      .select("-passwordHash -refreshToken")
      .sort({ name: 1 });

    return admins.map((a) => this.formatAdmin(a));
  }

  async inviteAdmin(schoolId: string, adminId: string, data: InviteAdminInput) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    // Check if user has permission to manage users
    if (!admin.permissions.canManageUsers && admin.role !== "super-admin") {
      throw new ApiError(403, "Insufficient permissions to invite admins");
    }

    // Check if admin belongs to this school
    if (admin.schoolId.toString() !== schoolId) {
      throw new ApiError(403, "Access denied to this school");
    }

    const school = await School.findById(schoolId);
    if (!school) throw new ApiError(404, "School not found");

    // Check max admins limit
    const adminCount = await Admin.countDocuments({ schoolId, isActive: true });
    if (adminCount >= school.settings.maxAdmins) {
      throw new ApiError(400, "Maximum admin limit reached for this school");
    }

    // Check if email already exists
    const existing = await Admin.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "This email is already registered");
    }

    // Generate temporary password
    const tempPassword = this.generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Create admin
    const newAdmin = new Admin({
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      schoolId,
      role: data.role || "admin",
      department: "Student Affairs",
      isActive: true,
      permissions: {
        canAssign: data.permissions?.canAssign || false,
        canResolve: data.permissions?.canResolve || false,
        canViewAll: data.permissions?.canViewAll || false,
        canDelete: data.permissions?.canDelete || false,
        canManageUsers: data.permissions?.canManageUsers || false,
      },
    });

    await newAdmin.save();

    // Update school stats
    school.stats.activeAdmins += 1;
    await school.save();

    // Send welcome email with temporary password
    try {
      await EmailService.sendWelcomeEmail(
        newAdmin.email,
        newAdmin.name,
        tempPassword,
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return this.formatAdmin(newAdmin);
  }

  async removeAdmin(schoolId: string, adminId: string, targetAdminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    // Check if user has permission to manage users
    if (!admin.permissions.canManageUsers && admin.role !== "super-admin") {
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
    if (targetAdmin.role === "super-admin") {
      throw new ApiError(400, "Cannot remove super-admin");
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
      admin.role !== "super-admin"
    ) {
      throw new ApiError(403, "Access denied to this school");
    }

    const school = await School.findById(schoolId);
    if (!school) throw new ApiError(404, "School not found");

    // Get report stats for this school
    const Report = require("@/core/models/report.model").Report;
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
      subscription: school.subscription,
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
