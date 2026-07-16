import { Request, Response, NextFunction } from "express";

// Extend Express Response type
declare global {
  namespace Express {
    interface Response {
      sendSuccess: <T>(data: T, message?: string, statusCode?: number) => void;
      sendError: (
        message?: string,
        statusCode?: number,
        errors?: any[],
      ) => void;
    }
  }
}

export const responseFormatter = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.sendSuccess = function <T>(
    data: T,
    message = "Request successful",
    statusCode = 200,
  ) {
    return this.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.sendError = function (
    message = "An error occurred",
    statusCode = 500,
    errors?: any[],
  ) {
    const response: any = {
      success: false,
      message,
    };
    if (errors) {
      response.errors = errors;
    }
    return this.status(statusCode).json(response);
  };

  next();
};
