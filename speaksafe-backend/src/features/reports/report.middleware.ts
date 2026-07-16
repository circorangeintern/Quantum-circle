import multer from "multer";
import { photoValidation } from "./report.validators";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  photoValidation.fileFilter(req, file, cb);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: photoValidation.limits,
});

export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      ApiResponse.badRequest(res, "File is too large. Maximum size is 5MB.");
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      ApiResponse.badRequest(res, "Too many files. Maximum is 5.");
      return;
    }
    ApiResponse.badRequest(res, err.message);
    return;
  }
  if (err) {
    ApiResponse.badRequest(res, err.message);
    return;
  }
  next();
};

// Multer memory storage for Cloudinary
export const uploadMiddleware = upload.array("attachments", 5);
