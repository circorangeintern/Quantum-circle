import rateLimit from "express-rate-limit";
import { env } from "./env.config";
import { ApiResponse } from "../utils/api-response.util";

export const standardLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      "Too many requests. Please try again later.",
      429,
    );
  },
});

export const reportSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      "Too many reports submitted. Please try again later.",
      429,
    );
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.LOGIN_RATE_LIMIT_MAX,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      "Too many login attempts. Please try again later.",
      429,
    );
  },
});

export const statusCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      "Too many status checks. Please try again later.",
      429,
    );
  },
});
