import { ApiError } from "../../core/errors/api.error";
import { comparePassword, hashPassword } from "../../core/utils/bcrypt.util";
import {
  generateTokens,
  JwtPayload,
  verifyRefreshToken,
} from "../../core/utils/jwt.util";
import { AuthRepository } from "./auth.repository";
import {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "./auth.types";
import { Admin } from "../../core/models/admin.model";
import { School } from "../../core/models/school.model";
import EmailService from "../../core/services/email.service";
import { PasswordReset } from "../../core/models/password-reset.model";
import { randomBytes } from "crypto";

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async login(
    credentials: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const { email, password } = credentials;

    const admin = await this.repository.findAdminByEmail(email);
    if (!admin) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!admin.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    const isPasswordValid = await comparePassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Get school info (if admin belongs to a school)
    let school = null;
    if (admin.schoolId) {
      school = await School.findById(admin.schoolId);
      if (!school) {
        throw new ApiError(404, "School not found");
      }
      if (!school.isActive) {
        throw new ApiError(403, "School is deactivated");
      }
    }

    // Generate tokens
    const tokens = generateTokens({
      adminId: admin._id.toString(),
      email: admin.email,
    });

    // Update refresh token
    admin.refreshToken = tokens.refreshToken;
    admin.lastLoginAt = new Date();
    await admin.save();

    // Log audit
    await this.repository.logAudit(
      "login",
      admin.id,
      { email },
      ipAddress,
      userAgent,
    );

    // Build response based on role
    const response: LoginResponse = {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        permissions: admin.permissions,
        preferences: admin.preferences,
      },
      tokens,
    };

    // Add school info if not system-admin
    if (admin.role !== "system-admin" && school) {
      response.school = {
        id: school.id,
        name: school.name,
        domain: school.domain,
        settings: school.settings,
      };
    }

    return response;
  }

  async getCurrentAdmin(adminId: string) {
    const admin = await Admin.findById(adminId).select(
      "-passwordHash -refreshToken",
    );

    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const response: any = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      permissions: admin.permissions,
      preferences: admin.preferences,
      lastLoginAt: admin.lastLoginAt,
    };

    // Add school info if not system-admin
    if (admin.role !== "system-admin" && admin.schoolId) {
      const school = await School.findById(admin.schoolId).select(
        "name domain settings isActive stats",
      );
      if (school) {
        response.school = {
          id: school._id,
          name: school.name,
          domain: school.domain,
          settings: school.settings,
          isActive: school.isActive,
          stats: school.stats,
        };
      }
    }

    return response;
  }

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find admin
      const admin = await this.repository.findAdminById(payload.adminId);
      if (!admin) {
        throw new ApiError(401, "Invalid token");
      }

      // Check if admin is active
      if (!admin.isActive) {
        throw new ApiError(403, "Account is deactivated");
      }

      // Check if refresh token matches
      if (admin.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid token");
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        adminId: admin.id,
        email: admin.email,
      };
      const tokens = generateTokens(newPayload);

      // Update refresh token
      await this.repository.updateRefreshToken(admin.id, tokens.refreshToken);

      await this.repository.logAudit(
        "refresh",
        admin.id,
        {},
        ipAddress,
        userAgent,
      );

      return tokens;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }

  async logout(
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.repository.updateRefreshToken(adminId, null);
    await this.repository.logAudit("logout", adminId, {}, ipAddress, userAgent);
  }

  async changePassword(
    adminId: string,
    data: ChangePasswordRequest,
    ipAddress?: string,
  ): Promise<void> {
    const { currentPassword, newPassword } = data;

    // Find admin with password
    const admin = await this.repository.findAdminByIdWithPassword(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      admin.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await this.repository.updatePassword(adminId, passwordHash);

    // Log password change
    await this.repository.logAudit("password_changed", adminId, {}, ipAddress);
  }

  async forgotPassword(
    data: ForgotPasswordRequest,
    ipAddress?: string,
  ): Promise<void> {
    const { email } = data;

    const admin = await this.repository.findAdminByEmail(email);
    if (!admin) {
      await this.repository.logAudit(
        "password_reset_requested",
        undefined,
        { email, exists: false },
        ipAddress,
      );
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await PasswordReset.create({
      adminId: admin.id,
      token: resetToken,
      used: false,
      expiresAt: resetTokenExpiry,
    });

    // Send reset email with token
    try {
      await EmailService.sendPasswordResetEmail(
        admin.email,
        admin.name,
        resetToken,
      );
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);

      await this.repository.logAudit(
        "password_reset_email_failed",
        admin.id,
        { email, error: error.message },
        ipAddress,
      );
    }

    await this.repository.logAudit(
      "password_reset_requested",
      admin.id,
      { email, exists: true },
      ipAddress,
    );
  }

  async resetPassword(
    data: ResetPasswordRequest,
    ipAddress?: string,
  ): Promise<void> {
    const { token, newPassword } = data;

    // Verify token
    const reset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    // Find admin
    const admin = await this.repository.findAdminById(reset.adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await this.repository.updatePassword(admin.id, passwordHash);

    // Mark token as used
    reset.used = true;
    await reset.save();

    // Revoke all refresh tokens for this admin (force re-login)
    await this.repository.updateRefreshToken(admin.id, null);

    // Log password reset
    await this.repository.logAudit(
      "password_reset_completed",
      admin.id,
      {},
      ipAddress,
    );

    // Send confirmation email
    try {
      await EmailService.sendEmail({
        to: admin.email,
        subject: "SpeakSafe Password Reset Successful",
        html: `
          <h2>Your password has been reset</h2>
          <p>Hello ${admin.name},</p>
          <p>Your SpeakSafe password was successfully reset. If you didn't perform this action, please contact your administrator immediately.</p>
          <p>You can now log in with your new password.</p>
          <p>Stay safe,<br>The SpeakSafe Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send password reset confirmation:", error);
    }
  }

  async getAdminPermissions(adminId: string): Promise<any> {
    return this.repository.getAdminPermissions(adminId);
  }

  async validateAdmin(adminId: string): Promise<boolean> {
    return this.repository.isAdminActive(adminId);
  }
}

export default new AuthService();
