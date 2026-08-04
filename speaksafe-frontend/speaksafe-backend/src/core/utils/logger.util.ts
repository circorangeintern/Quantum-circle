import winston from "winston";
import { env } from "../config/env.config";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

export default logger;
