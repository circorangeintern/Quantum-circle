import { Request, IRequest } from "../../core/models/request.model";
import { Types } from "mongoose";
import { GetRequestsQuery } from "./request.types";
import { AuditAction, AuditLog } from "../../core/models/audit-log.model";

export class RequestRepository {
  async createRequest(requestData: Partial<IRequest>): Promise<IRequest> {
    const request = new Request(requestData);
    return request.save();
  }

  async findById(id: string): Promise<IRequest | null> {
    return Request.findById(new Types.ObjectId(id));
  }

  async findByEmail(email: string): Promise<IRequest | null> {
    return Request.findOne({ email: email.toLowerCase() });
  }

  async getRequests(query: GetRequestsQuery): Promise<{
    requests: IRequest[];
    total: number;
  }> {
    const { status, search, page = 1, limit = 20, sortBy = "newest" } = query;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { school: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any =
      sortBy === "newest" ? { createdAt: -1 } : { createdAt: 1 };

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(filter).sort(sort).skip(skip).limit(limit),
      Request.countDocuments(filter),
    ]);

    return { requests, total };
  }

  async updateRequestStatus(
    requestId: string,
    status: "approved" | "rejected",
    reviewedBy: string,
    reviewNotes?: string,
  ): Promise<IRequest | null> {
    return Request.findByIdAndUpdate(
      new Types.ObjectId(requestId),
      {
        status,
        reviewedBy: new Types.ObjectId(reviewedBy),
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "",
      },
      { new: true },
    );
  }

  async getRequestStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      Request.countDocuments(),
      Request.countDocuments({ status: "pending" }),
      Request.countDocuments({ status: "approved" }),
      Request.countDocuments({ status: "rejected" }),
    ]);

    return { total, pending, approved, rejected };
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

  async deleteRequest(requestId: string): Promise<boolean> {
    const result = await Request.findByIdAndDelete(
      new Types.ObjectId(requestId),
    );
    return !!result;
  }

  async getPendingRequests(): Promise<IRequest[]> {
    return Request.find({ status: "pending" }).sort({ createdAt: 1 });
  }

  async getApprovedRequests(): Promise<IRequest[]> {
    return Request.find({ status: "approved" }).sort({ createdAt: -1 });
  }
}

export default new RequestRepository();
