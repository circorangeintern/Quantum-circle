import axios from "axios";
import { env } from "../config/env.config";
import logger from "../utils/logger.util";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: number;
  params?: Record<string, any>;
  attachments?: Array<{
    name: string;
    content: string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
}

class EmailService {
  private apiKey: string;
  private apiUrl = "https://api.brevo.com/v3";

  constructor() {
    this.apiKey = env.BREVO_API_KEY || "";
    if (!this.apiKey) {
      logger.warn(
        "Brevo API key not configured. Email service will be disabled.",
      );
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "api-key": this.apiKey,
      Accept: "application/json",
    };
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    if (!this.apiKey) {
      logger.warn("Email not sent: Brevo API key not configured");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const payload: any = {
        sender: {
          name: env.EMAIL_FROM_NAME || "SpeakSafe",
          email: env.EMAIL_FROM || "noreply@speaksafe.com",
        },
        to: Array.isArray(options.to)
          ? options.to.map((email) => ({ email }))
          : [{ email: options.to }],
        subject: options.subject,
      };

      if (options.html) {
        payload.htmlContent = options.html;
      }

      if (options.text) {
        payload.textContent = options.text;
      }

      if (options.templateId) {
        payload.templateId = options.templateId;
        if (options.params) {
          payload.params = options.params;
        }
      }

      if (options.attachments) {
        payload.attachment = options.attachments.map((att) => ({
          name: att.name,
          content: att.content,
          contentType: att.contentType || "application/octet-stream",
        }));
      }

      const response = await axios.post(`${this.apiUrl}/smtp/email`, payload, {
        headers: this.getHeaders(),
      });

      logger.info(
        `Email sent to ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`,
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error("Failed to send email:", {
        error: error.message,
        response: error.response?.data,
        to: options.to,
        subject: options.subject,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // ==================== TEMPLATE MANAGEMENT ====================
  async createTemplate(templateData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/smtp/templates`,
        templateData,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error: any) {
      logger.error("Failed to create template:", error.message);
      throw error;
    }
  }

  async getTemplates(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/smtp/templates`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      logger.error("Failed to get templates:", error.message);
      throw error;
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
          <div class="header">
            <h1>🎓 Welcome to SpeakSafe</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your SpeakSafe authority account has been created. You can now log in to review and manage reports.</p>
            
            <div class="password-box">
              <p style="margin: 0 0 8px;">Your temporary password:</p>
              <div class="code">${tempPassword}</div>
              <p style="margin: 8px 0 0; font-size: 12px; color: #5B6B8C;">Please change this password after your first login.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.APP_URL || "https://speaksafe.com"}/login" class="btn">Login to SpeakSafe</a>
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
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your SpeakSafe password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
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
    const checkUrl = `${env.APP_URL || "https://speaksafe.com"}/status/${referenceCode}`;

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
          <div class="header">
            <h1>✅ Report Received</h1>
          </div>
          <div class="content">
            <h2>Thank you for speaking up.</h2>
            <p>Your report has been submitted and will be reviewed by a school authority. Keep your tracking code safe — it's the only way to check your report's status.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 8px; font-size: 13px; color: #5B6B8C;">Your Tracking Code:</p>
              <div class="code">${referenceCode}</div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${checkUrl}" class="btn">Check Report Status</a>
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

  async sendAdminNotificationEmail(
    to: string,
    subject: string,
    message: string,
    reportId?: string,
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
          .message-box { background: white; padding: 16px 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #4D68AF; }
          .btn { display: inline-block; background: #4D68AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; color: #93A0BD; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E1E7F5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 SpeakSafe Notification</h1>
          </div>
          <div class="content">
            <h2>Hello,</h2>
            <div class="message-box">
              <p style="margin: 0; font-size: 15px;">${message}</p>
            </div>
            
            ${
              reportId
                ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${env.APP_URL || "https://speaksafe.com"}/dashboard/reports/${reportId}" class="btn">View Report</a>
              </div>
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
