export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Array<{ field: string; message: string }>;
  code?: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: Array<{ field: string; message: string }>,
    code?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ) {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static validation(errors: Array<{ field: string; message: string }>) {
    return new ApiError(422, "Validation failed", true, errors);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}
