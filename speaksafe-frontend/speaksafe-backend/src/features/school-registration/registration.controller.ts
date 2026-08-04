import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import RegistrationService from "./registration.service";
import { AuthRequest } from "../auth/auth.middleware";
import {
  SubmitRegistrationInput,
  ReviewRegistrationInput,
} from "./registration.service";
import { ApiError } from "../../core/errors/api.error";

export class RegistrationController {
  async submitRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as SubmitRegistrationInput;
      const result = await RegistrationService.submitRegistration(
        data,
        req.ip,
        req.get("user-agent"),
      );
      ApiResponse.created(res, result, "Registration submitted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const result = await RegistrationService.getRegistrations(
        query,
        req.adminId!,
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async reviewRegistration(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      if (Array.isArray(id)) {
        throw new ApiError(400, "Invalid school ID");
      }
      const data = req.body as ReviewRegistrationInput;
      const result = await RegistrationService.reviewRegistration(
        id,
        req.adminId!,
        data,
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await RegistrationService.getRegistrationStats();
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
