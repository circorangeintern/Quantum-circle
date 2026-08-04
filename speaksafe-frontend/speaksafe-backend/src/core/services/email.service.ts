import axios from "axios";
import { env } from "../config/env.config";
import logger from "../utils/logger.util";
import { ReportViewToken } from "../models/report-view-token.model";
import { randomBytes } from "crypto";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  params?: Record<string, any>;
  attachments?: Array<{
    name: string;
    content: string; // Base64 encoded for SendGrid
    contentType?: string;
  }>;
}

class EmailService {
  private apiKey: string;
  private apiUrl = "https://api.sendgrid.com/v3";
  private logoUrl: string;

  constructor() {
    this.apiKey = env.SENDGRID_API_KEY || "";
    this.logoUrl =
      env.COMPANY_LOGO_URL ||
      "https://res.cloudinary.com/arlksjrh/image/upload/v1785392817/speaksafe-logo_ili6ey.png";

    if (!this.apiKey) {
      logger.warn(
        "SendGrid API key not configured. Email service will be disabled.",
      );
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private getLogoHeaderHtml(): string {
    if (!this.logoUrl) return "";
    return `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${this.logoUrl}" alt="SpeakSafe Logo" style="max-height: 50px; width: auto;" />
      </div>
    `;
  }

  /**
   * Generate a unique token for one-time report view
   */
  private async generateReportViewToken(reportId: string): Promise<string> {
    // Generate a secure random token
    const token = randomBytes(32).toString("hex");

    // Set expiry to 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save to database
    await ReportViewToken.create({
      reportId,
      token,
      viewed: false,
      expiresAt,
    });

    return token;
  }

  // ==================== SEND EMAIL METHODS ====================

  async sendEmail(options: EmailOptions): Promise<any> {
    if (!this.apiKey) {
      logger.warn("Email not sent: SendGrid API key not configured");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      const payload: any = {
        personalizations: [
          {
            to: toAddresses.map((email) => ({ email })),
          },
        ],
        from: {
          name: env.EMAIL_FROM_NAME || "SpeakSafe",
          email: env.EMAIL_FROM || "noreply@speaksafe.com",
        },
        subject: options.subject,
        content: [],
      };

      if (options.templateId) {
        payload.template_id = options.templateId;
        if (options.params) {
          payload.personalizations[0].dynamic_template_data = options.params;
        }
      } else {
        if (options.text) {
          payload.content.push({ type: "text/plain", value: options.text });
        }
        if (options.html) {
          payload.content.push({ type: "text/html", value: options.html });
        }
      }

      if (options.attachments) {
        payload.attachments = options.attachments.map((att) => ({
          filename: att.name,
          content: att.content,
          type: att.contentType || "application/octet-stream",
          disposition: "attachment",
        }));
      }

      const response = await axios.post(`${this.apiUrl}/mail/send`, payload, {
        headers: this.getHeaders(),
      });

      logger.info(`Email sent via SendGrid to ${toAddresses.join(", ")}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error("Failed to send email via SendGrid:", {
        error: error.message,
        response: error.response?.data,
        to: options.to,
        subject: options.subject,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // ==================== TEMPLATED EMAILS ====================

  async sendWelcomeEmail(
    to: string,
    name: string,
    tempPassword: string,
  ): Promise<any> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1B2540; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #142353; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #F5F7FC; padding: 30px; border-radius: 0 0 8px 8px; }
          .password-box { background: white; border: 2px solid #E1E7F5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
          .password-box .code { font-family: 'IBM Plex Mono', monospace; font-size: 24px; font-weight: bold; color: #142353; letter-spacing: 2px; }
          .btn { display: inline-block; background: #4D68AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #93A0BD; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E1E7F5; }
        </style>
      </head>
      <body>
        <div class="container">
          ${this.getLogoHeaderHtml()}
          <div class="header"><h1>🎓 Welcome to SpeakSafe</h1></div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your SpeakSafe authority account has been created. You can now log in to review and manage reports.</p>
            <div class="password-box">
              <p style="margin: 0 0 8px;">Your temporary password:</p>
              <div class="code">${tempPassword}</div>
              <p style="margin: 8px 0 0; font-size: 12px; color: #5B6B8C;">Please change this password after your first login.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.WEBSITE_URL || "https://speaksafe.com"}/login" class="btn" style="color: white;">Login to SpeakSafe</a>
            </div>
            <p><strong>Security Tip:</strong> Never share your password with anyone. SpeakSafe will never ask for your password via email.</p>
          </div>
          <div class="footer">
            <p>SpeakSafe — Anonymous Reporting for Safer Schools</p>
            <p>© ${new Date().getFullYear()} SpeakSafe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: "Welcome to SpeakSafe — Your Authority Account",
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string,
  ): Promise<any> {
    const resetUrl = `${env.APP_URL || "https://speaksafe.com"}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1B2540; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #142353; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #F5F7FC; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #4D68AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .warning { background: #FBEACB; border-left: 4px solid #C98A1E; padding: 12px 16px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; color: #93A0BD; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E1E7F5; }
        </style>
      </head>
      <body>
        <div class="container">
          ${this.getLogoHeaderHtml()}
          <div class="header"><h1>🔐 Password Reset Request</h1></div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your SpeakSafe password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="btn" style="color: white;">Reset Password</a>
            </div>
            <div class="warning">
              <p style="margin: 0; font-weight: bold;">⚠️ This link expires in 1 hour</p>
              <p style="margin: 4px 0 0; font-size: 13px;">If you didn't request this, please ignore this email.</p>
            </div>
            <p style="font-size: 13px;">Alternatively, copy this link into your browser:</p>
            <p style="font-size: 13px; color: #4D68AF; word-break: break-all;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>SpeakSafe — Anonymous Reporting for Safer Schools</p>
            <p>© ${new Date().getFullYear()} SpeakSafe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: "Reset Your SpeakSafe Password",
      html,
    });
  }

  async sendReportConfirmationEmail(
    to: string,
    referenceCode: string,
  ): Promise<any> {
    const checkUrl = `${env.APP_URL || "https://speaksafe.com"}/report-confirmation?ref=${referenceCode}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1B2540; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4D68AF; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #F5F7FC; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background: white; border: 2px solid #E1E7F5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
          .code-box .code { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: bold; color: #142353; letter-spacing: 3px; }
          .btn { display: inline-block; background: #4D68AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #93A0BD; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E1E7F5; }
        </style>
      </head>
      <body>
        <div class="container">
          ${this.getLogoHeaderHtml()}
          <div class="header"><h1>✅ Report Received</h1></div>
          <div class="content">
            <h2>Thank you for speaking up.</h2>
            <p>Your report has been submitted and will be reviewed by a school authority. Keep your tracking code safe — it's the only way to check your report's status.</p>
            <div class="code-box">
              <p style="margin: 0 0 8px; font-size: 13px; color: #5B6B8C;">Your Tracking Code:</p>
              <div class="code">${referenceCode}</div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${checkUrl}" class="btn" style="color: white;">Check Report Status</a>
            </div>
            <p style="font-size: 13px; color: #5B6B8C;">You can always check your report status anytime using this tracking code.</p>
          </div>
          <div class="footer">
            <p>SpeakSafe — Anonymous Reporting for Safer Schools</p>
            <p>© ${new Date().getFullYear()} SpeakSafe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: "Your SpeakSafe Report Tracking Code",
      html,
    });
  }

  /**
   * Send admin notification email with one-time view link
   */
  async sendAdminNotificationEmail(
    to: string,
    subject: string,
    message: string,
    reportId?: string,
  ): Promise<any> {
    let viewUrl = "";
    let oneTimeNote = "";

    if (reportId) {
      // Generate a one-time view token
      const token = await this.generateReportViewToken(reportId);
      viewUrl = `${env.APP_URL || "https://speaksafe.com"}/report-view?token=${token}`;
      oneTimeNote =
        "⚠️ This link is for <strong>one-time viewing only</strong>. For continued access, please log in to your dashboard.";
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1B2540; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #142353; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #F5F7FC; padding: 30px; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 16px 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #4D68AF; }
          .warning-box { background: #FBEACB; border-left: 4px solid #C98A1E; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13px; }
          .btn { display: inline-block; background: #4D68AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #93A0BD; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E1E7F5; }
        </style>
      </head>
      <body>
        <div class="container">
          ${this.getLogoHeaderHtml()}
          <div class="header"><h1>📋 SpeakSafe Notification</h1></div>
          <div class="content">
            <h2>Hello,</h2>
            <div class="message-box">
              <p style="margin: 0; font-size: 15px;">${message}</p>
            </div>
            ${
              reportId
                ? `
              ${oneTimeNote ? `<div class="warning-box">${oneTimeNote}</div>` : ""}
              <div style="text-align: center; margin: 30px 0;">
                <a href="${viewUrl}" class="btn" style="color: white;">🔍 View Report</a>
              </div>
              <p style="font-size: 12px; color: #5B6B8C; text-align: center;">
                This link will expire in 7 days.
              </p>
            `
                : ""
            }
          </div>
          <div class="footer">
            <p>SpeakSafe — Anonymous Reporting for Safer Schools</p>
            <p>© ${new Date().getFullYear()} SpeakSafe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }
}

export default new EmailService();
