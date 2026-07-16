export const APP_NAME = "SpeakSafe";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION =
  "Anonymous reporting system for boarding schools";

export const API_PREFIX = "/api";
export const API_VERSION = "v1";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  LOGIN_MAX: 5,
  STATUS_CHECK_MAX: 20,
  REPORT_SUBMIT_MAX: 5,
} as const;

export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  REFERENCE_CODE: /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
} as const;

export const JWT = {
  ACCESS_EXPIRY: "15m",
  REFRESH_EXPIRY: "7d",
} as const;

export const DATABASE = {
  MAX_RETRIES: 5,
  RETRY_DELAY_MS: 5000,
  CONNECTION_TIMEOUT_MS: 5000,
  SOCKET_TIMEOUT_MS: 45000,
} as const;

export const CLOUDINARY = {
  FOLDER: "speaksafe/reports",
  THUMBNAIL_FOLDER: "speaksafe/reports/thumbnails",
  TRANSFORMATIONS: {
    width: 1200,
    crop: "limit",
    quality: "auto",
  },
  THUMBNAIL_TRANSFORMATIONS: {
    width: 300,
    height: 300,
    crop: "fill",
    quality: "auto",
  },
} as const;

export const AUDIT_ACTIONS = {
  LOGIN: "login",
  LOGOUT: "logout",
  STATUS_UPDATE: "status_update",
  REPORT_VIEWED: "report_viewed",
  REPORT_SUBMITTED: "report_submitted",
  REFRESH: "refresh",
} as const;

export const CACHE_KEYS = {
  REPORT_SUMMARY: "report_summary",
  DASHBOARD: "dashboard",
} as const;

export const DEFAULT_ADMIN = {
  NAME: "School Administrator",
  ROLE: "super-admin",
} as const;
