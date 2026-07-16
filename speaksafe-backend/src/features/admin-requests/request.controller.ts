import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import RequestService from "./request.service";
import { AuthRequest } from "../auth/auth.middleware";
import {
  CreateRequestInput,
  ReviewRequestInput,
  GetRequestsQuery,
} from "./request.types";
import { ApiError } from "../../core/errors/api.error";

export class RequestController {
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateRequestInput;
      const result = await RequestService.createRequest(data);
      ApiResponse.created(res, result, "Request submitted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as GetRequestsQuery;
      const includeStats = req.query.stats === "true";
      const result = await RequestService.getRequests(query, includeStats);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async reviewRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid review ID");
      }

      const data = req.body as ReviewRequestInput;
      const result = await RequestService.reviewRequest(id, req.adminId!, data);
      ApiResponse.success(res, result, `Request ${data.status} successfully`);
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await RequestService.getRequestStats();
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async deleteRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid review ID");
      }

      await RequestService.deleteRequest(id);
      ApiResponse.success(res, null, "Request deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
