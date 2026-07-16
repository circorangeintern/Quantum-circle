import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { morganMiddleware } from "./core/middlewares/logger.middleware";
import { corsOptions } from "./core/config/cors.config";
import { responseFormatter } from "./core/middlewares/response-formatter.middleware";
import { errorHandler } from "./core/middlewares/error-handler.middleware";
import { standardLimiter } from "./core/config/rate-limit.config";
import api from "./routes/api.route";
import path from "path";

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(cookieParser());

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Server Static File (API Documentation)
app.use(express.static(path.join(__dirname, "../public")));

// Logging
app.use(morganMiddleware);

// Response formatter
app.use(responseFormatter);

// Rate limiting
app.use(standardLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/openapi.yaml", (_req, res) => {
  res.sendFile(path.join(__dirname, "../docs/openapi.yaml"));
});

app.get("/docs", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/docs.html"));
});

// API routes
app.use("/api/v1", api);

// 404 handler
app.use((_req, res) => {
  res.sendError("Route not found", 404);
});

// Global error handler
app.use(errorHandler);

export default app;
