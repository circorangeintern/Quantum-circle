import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../core/utils/api-response.util";
import RequestRepository from "./request.repository";
import { ApiError } from "../../core/errors/api.error";

export const checkRequestExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      throw new ApiError(400, "Invalid review ID");
    }

    const request = await RequestRepository.findById(id);

    if (!request) {
      ApiResponse.notFound(res, "Request not found");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkEmailUniqueness = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    const existing = await RequestRepository.findByEmail(email);

    if (existing && existing.status === "pending") {
      ApiResponse.conflict(res, "A request with this email is already pending");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
