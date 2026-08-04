import { ApiError } from "../../core/errors/api.error";
import {
  SchoolRegistration,
  ISchoolRegistration,
} from "../../core/models/school-registration.model";
import { School } from "../../core/models/school.model";
import { Admin } from "../../core/models/admin.model";
import { hashPassword } from "../../core/utils/bcrypt.util";
import { generateTokens } from "../../core/utils/jwt.util";
import EmailService from "../../core/services/email.service";

export interface SubmitRegistrationInput {
  schoolName: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface ReviewRegistrationInput {
  status: "approved" | "rejected";
  reviewNotes?: string;
}

export interface GetRegistrationsQuery {
  status?: "pending" | "approved" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
}

export class RegistrationService {
  async submitRegistration(
    data: SubmitRegistrationInput,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { schoolName, domain, adminName, adminEmail, adminPassword } = data;

    // Check if domain already has a pending/approved registration
    const existingDomain = await SchoolRegistration.findOne({
      domain: domain.toLowerCase(),
      status: { $in: ["pending", "approved"] },
    });
    if (existingDomain) {
      throw new ApiError(
        409,
        "This domain already has a pending or approved registration",
      );
    }

    // Check if admin email already registered
    const existingAdmin = await Admin.findOne({
      email: adminEmail.toLowerCase(),
    });
    if (existingAdmin) {
      throw new ApiError(409, "This email is already registered");
    }

    // Check if admin email has pending registration
    const existingEmail = await SchoolRegistration.findOne({
      adminEmail: adminEmail.toLowerCase(),
      status: "pending",
    });
    if (existingEmail) {
      throw new ApiError(
        409,
        "A registration with this email is already pending",
      );
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create registration
    const registration = new SchoolRegistration({
      schoolName,
      domain: domain.toLowerCase(),
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      adminName,
      adminEmail: adminEmail.toLowerCase(),
      adminPasswordHash: passwordHash,
      status: "pending",
      ipAddress,
      userAgent,
    });

    await registration.save();

    // Send confirmation email
    try {
      await EmailService.sendEmail({
        to: adminEmail,
        subject: "SpeakSafe - Registration Received",
        html: `
          <h2>Registration Received</h2>
          <p>Hello ${adminName},</p>
          <p>Your school registration request has been received and is pending review.</p>
          <p>You will receive an email once your registration is approved.</p>
          <p>School: ${schoolName}</p>
          <p>Domain: ${domain}</p>
          <p>Thank you,<br>The SpeakSafe Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }

    return {
      id: registration._id,
      schoolName: registration.schoolName,
      domain: registration.domain,
      adminEmail: registration.adminEmail,
      status: registration.status,
      submittedAt: registration.submittedAt,
    };
  }

  async getRegistrations(query: GetRegistrationsQuery, adminId: string) {
    // Verify admin has permission (system-admin only)
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== "system-admin") {
      throw new ApiError(403, "Only system-admins can view registrations");
    }

    const { status, search, page = 1, limit = 20 } = query;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { schoolName: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } },
        { adminName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      SchoolRegistration.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      SchoolRegistration.countDocuments(filter),
    ]);

    return {
      registrations: registrations.map((r) => this.formatRegistration(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: await this.getRegistrationStats(),
    };
  }

  async reviewRegistration(
    registrationId: string,
    reviewerId: string,
    data: ReviewRegistrationInput,
  ) {
    // Verify reviewer has permission
    const reviewer = await Admin.findById(reviewerId);
    if (!reviewer || reviewer.role !== "system-admin") {
      throw new ApiError(403, "Only system-admins can review registrations");
    }

    const registration = await SchoolRegistration.findById(registrationId);
    if (!registration) {
      throw new ApiError(404, "Registration not found");
    }

    if (registration.status !== "pending") {
      throw new ApiError(400, `Registration already ${registration.status}`);
    }

    // If approved, create school and admin
    if (data.status === "approved") {
      const result = await this.approveRegistration(registration, reviewerId);
      return result;
    } else {
      // Reject registration
      registration.status = "rejected";
      registration.reviewedBy = reviewerId;
      registration.reviewedAt = new Date();
      registration.reviewNotes = data.reviewNotes || "Registration rejected";

      await registration.save();

      // Send rejection email
      try {
        await EmailService.sendEmail({
          to: registration.adminEmail,
          subject: "SpeakSafe - Registration Update",
          html: `
            <h2>Registration Update</h2>
            <p>Hello ${registration.adminName},</p>
            <p>Your school registration for "${registration.schoolName}" has been reviewed.</p>
            <p><strong>Status:</strong> Rejected</p>
            ${data.reviewNotes ? `<p><strong>Reason:</strong> ${data.reviewNotes}</p>` : ""}
            <p>If you have questions, please contact support.</p>
            <p>Thank you,<br>The SpeakSafe Team</p>
          `,
        });
      } catch (error) {
        console.error("Failed to send rejection email:", error);
      }

      return {
        id: registration._id,
        status: registration.status,
        message: "Registration rejected",
      };
    }
  }

  private async approveRegistration(
    registration: ISchoolRegistration,
    reviewerId: string,
  ) {
    // Create school
    const school = new School({
      name: registration.schoolName,
      domain: registration.domain,
      address: registration.address,
      phone: registration.phone,
      email: registration.email,
      website: registration.website,
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
        activeAdmins: 1,
        resolvedCases: 0,
        pendingCases: 0,
      },
    });

    await school.save();

    // Create SCHOOL ADMIN (first admin for this school)
    const admin = new Admin({
      email: registration.adminEmail,
      passwordHash: registration.adminPasswordHash,
      name: registration.adminName,
      schoolId: school._id,
      role: "school-admin",
      isActive: true,
    });
    await admin.save();

    // Update registration
    registration.status = "approved";
    registration.approvedSchoolId = school.id;
    registration.approvedAdminId = admin.id;
    registration.reviewedBy = reviewerId;
    registration.reviewedAt = new Date();

    await registration.save();

    // Update school stats
    school.stats.activeAdmins = 1;
    await school.save();

    // Generate tokens for auto-login
    const tokens = generateTokens({
      adminId: admin._id.toString(),
      email: admin.email,
    });

    // Send approval email with login instructions
    try {
      await EmailService.sendWelcomeEmail(
        admin.email,
        admin.name,
        "Please use the login button below",
      );

      await EmailService.sendEmail({
        to: admin.email,
        subject: "SpeakSafe - Registration Approved!",
        html: `
          <h2>🎉 Registration Approved!</h2>
          <p>Hello ${admin.name},</p>
          <p>Your school "${registration.schoolName}" has been approved!</p>
          <p>You can now log in to your SpeakSafe dashboard:</p>
          <p><a href="${process.env.APP_URL}/login" style="background:#4D68AF;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Login to Dashboard</a></p>
          <p><strong>School:</strong> ${school.name}</p>
          <p><strong>Domain:</strong> ${school.domain}</p>
          <p>Thank you,<br>The SpeakSafe Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send approval email:", error);
    }

    return {
      id: registration._id,
      status: registration.status,
      school: {
        id: school._id,
        name: school.name,
        domain: school.domain,
      },
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
      tokens,
      message: "Registration approved successfully",
    };
  }

  async getRegistrationStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      SchoolRegistration.countDocuments(),
      SchoolRegistration.countDocuments({ status: "pending" }),
      SchoolRegistration.countDocuments({ status: "approved" }),
      SchoolRegistration.countDocuments({ status: "rejected" }),
    ]);

    return { total, pending, approved, rejected };
  }

  private formatRegistration(registration: ISchoolRegistration) {
    return {
      id: registration._id,
      schoolName: registration.schoolName,
      domain: registration.domain,
      address: registration.address,
      phone: registration.phone,
      email: registration.email,
      website: registration.website,
      adminName: registration.adminName,
      adminEmail: registration.adminEmail,
      status: registration.status,
      reviewNotes: registration.reviewNotes,
      reviewedAt: registration.reviewedAt,
      approvedSchoolId: registration.approvedSchoolId,
      approvedAdminId: registration.approvedAdminId,
      submittedAt: registration.submittedAt,
      updatedAt: registration.updatedAt,
    };
  }
}

export default new RegistrationService();
