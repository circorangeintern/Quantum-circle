import { ApiError } from "../../core/errors/api.error";
import { RequestRepository } from "./request.repository";
import {
  CreateRequestInput,
  ReviewRequestInput,
  RequestResponse,
  GetRequestsQuery,
  PaginatedRequestsResponse,
  RequestStats,
} from "./request.types";
import { Admin } from "../../core/models/admin.model";
import { IRequest } from "../../core/models/request.model";
import {
  hashPassword,
  generateTemporaryPassword,
} from "../../core/utils/bcrypt.util";
import logger from "../../core/utils/logger.util";
import EmailService from "../../core/services/email.service";

export class RequestService {
  private repository: RequestRepository;

  constructor() {
    this.repository = new RequestRepository();
  }

  async createRequest(data: CreateRequestInput): Promise<RequestResponse> {
    // Check if email already exists in requests
    const existingRequest = await this.repository.findByEmail(data.email);
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        throw new ApiError(
          409,
          "A request with this email is already pending approval",
        );
      }
      if (existingRequest.status === "approved") {
        throw new ApiError(409, "This email is already registered");
      }
    }

    // Check if email already exists in admins
    const existingAdmin = await Admin.findOne({ email: data.email });
    if (existingAdmin) {
      throw new ApiError(409, "This email is already registered");
    }

    const request = await this.repository.createRequest({
      name: data.name,
      email: data.email.toLowerCase(),
      school: data.school,
      role: data.role,
      status: "pending",
    });

    logger.info(`New admin request created: ${data.email}`);

    return this.formatRequest(request);
  }

  async getRequests(
    query: GetRequestsQuery,
    includeStats: boolean = false,
  ): Promise<PaginatedRequestsResponse> {
    const { requests, total } = await this.repository.getRequests(query);

    const stats = includeStats
      ? await this.repository.getRequestStats()
      : undefined;

    return {
      requests: requests.map((r) => this.formatRequest(r)),
      pagination: {
        total,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
      stats,
    };
  }

  async reviewRequest(
    requestId: string,
    reviewerId: string,
    data: ReviewRequestInput,
  ): Promise<RequestResponse> {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Request not found");
    }

    if (request.status !== "pending") {
      throw new ApiError(400, `Request already ${request.status}`);
    }

    const reviewer = await Admin.findById(reviewerId);
    if (!reviewer) {
      throw new ApiError(404, "Reviewer not found");
    }

    // Update request status
    const updated = await this.repository.updateRequestStatus(
      requestId,
      data.status,
      reviewerId,
      data.reviewNotes,
    );

    if (!updated) {
      throw new ApiError(500, "Failed to update request");
    }

    // If approved, create admin account
    if (data.status === "approved") {
      await this.createAdminFromRequest(updated, reviewerId);
      logger.info(
        `Admin request approved: ${request.email} by ${reviewer.name}`,
      );
    } else {
      logger.info(
        `Admin request rejected: ${request.email} by ${reviewer.name}`,
      );
    }

    return this.formatRequest(updated);
  }

  private async createAdminFromRequest(
    request: IRequest,
    _reviewerId: string,
  ): Promise<void> {
    // Generate a temporary password
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Create admin
    const admin = new Admin({
      email: request.email,
      passwordHash,
      name: request.name,
      role: "admin",
      department: "Student Affairs",
      isActive: true,
      permissions: {
        canAssign: false,
        canResolve: false,
        canViewAll: false,
        canDelete: false,
        canManageUsers: false,
      },
      preferences: {
        notifications: {
          newReports: true,
          urgentCases: true,
          weeklySummary: false,
          assignments: true,
        },
        emailDigest: false,
        dashboardView: "list",
      },
    });

    await admin.save();

    // Send welcome email with temporal password
    try {
      await EmailService.sendWelcomeEmail(
        admin.email,
        admin.name,
        tempPassword,
      );
    } catch (error: any) {
      console.error("Failed to send welcome email:", error);

      await this.repository.logUserAction(
        "user_temporal_password_failed",
        admin.id,
        undefined,
        { adminEmail: admin.email, error: error.message },
      );
    }

    await this.repository.logUserAction(
      "user_temporal_password",
      admin.id,
      undefined,
      {
        adminEmail: admin.email,
        exists: true,
      },
    );

    logger.info(`Admin created for: ${request.email} with temp password`);
  }

  async getRequestStats(): Promise<RequestStats> {
    return this.repository.getRequestStats();
  }

  async deleteRequest(requestId: string): Promise<boolean> {
    const deleted = await this.repository.deleteRequest(requestId);
    if (!deleted) {
      throw new ApiError(404, "Request not found");
    }
    return true;
  }

  private formatRequest(request: IRequest): RequestResponse {
    return {
      id: request._id.toString(),
      name: request.name,
      email: request.email,
      school: request.school,
      role: request.role,
      status: request.status,
      reviewNotes: request.reviewNotes,
      reviewedAt: request.reviewedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}

export default new RequestService();
