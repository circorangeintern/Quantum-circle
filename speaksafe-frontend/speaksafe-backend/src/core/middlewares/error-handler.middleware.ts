import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/api-response.util";
import logger from "../utils/logger.util";

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: Array<{ field: string; message: string }>;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log error
  logger.error(`Error: ${message}`, {
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Send appropriate response
  if (err.errors) {
    return ApiResponse.validationError(res, err.errors, message);
  }

  if (statusCode === 404) {
    return ApiResponse.notFound(res, message);
  }

  if (statusCode === 401) {
    return ApiResponse.unauthorized(res, message);
  }

  if (statusCode === 403) {
    return ApiResponse.forbidden(res, message);
  }

  if (statusCode === 400) {
    return ApiResponse.badRequest(res, message);
  }

  if (statusCode === 409) {
    return ApiResponse.conflict(res, message);
  }

  // Default server error
  return ApiResponse.serverError(res, message);
};
