import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive().max(65535))
    .default(5000),

  // Database
  MONGODB_URI: z.url().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("speaksafe"),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.any().default("15m"),
  JWT_REFRESH_EXPIRY: z.any().default("7d"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Brevo Email
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.email().default("noreply@speaksafe.com"),
  EMAIL_FROM_NAME: z.string().default("SpeakSafe"),
  APP_URL: z.string().url().default("https://speaksafe.com"),

  // Admin
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  LOGIN_RATE_LIMIT_MAX: z.string().transform(Number).default(5),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 2),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
