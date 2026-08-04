import { Response } from "express";

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Request successful",
    statusCode = 200,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message = "An error occurred",
    statusCode = 500,
    errors?: Array<{ field: string; message: string }>,
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Resource created successfully",
  ): Response {
    return this.success(res, data, message, 201);
  }

  static badRequest(
    res: Response,
    message = "Bad request",
    errors?: Array<{ field: string; message: string }>,
  ): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message = "Unauthorized"): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = "Forbidden"): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = "Resource not found"): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message = "Conflict"): Response {
    return this.error(res, message, 409);
  }

  static validationError(
    res: Response,
    errors: Array<{ field: string; message: string }>,
    message = "Validation failed",
  ): Response {
    return this.error(res, message, 422, errors);
  }

  static serverError(
    res: Response,
    message = "Internal server error",
  ): Response {
    return this.error(res, message, 500);
  }
}
