/// <reference types="jest" />
import { afterAll, beforeAll, beforeEach, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";

// Import your database helpers directly
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
} from "./fixtures/mock-db";

// Increase timeout for all tests (useful for in-memory DB spins)
jest.setTimeout(30000);

// Set up test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-min-32-characters-for-testing";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-min-32-characters";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";
process.env.BREVO_API_KEY = "test-brevo-key";
process.env.EMAIL_FROM = "test@speaksafe.com";
process.env.EMAIL_FROM_NAME = "SpeakSafe Test";
process.env.APP_URL = "http://localhost:3000";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
process.env.RATE_LIMIT_MAX_REQUESTS = "100";
process.env.LOGIN_RATE_LIMIT_MAX = "50";

let mongoServer: MongoMemoryServer;

// Global setup BEFORE ALL test suites run
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;

  // Connect globally ONCE here. Remove `connectTestDB` from individual spec files.
  await connectTestDB();
});

// Clear database cleanly between individual test items
beforeEach(async () => {
  await clearTestDB();
});

// Global teardown AFTER ALL test suites finish running
afterAll(async () => {
  await disconnectTestDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Silence console tracking during test runs with clean TypeScript compliance
global.console = {
  ...console,
  log: jest.fn() as unknown as typeof console.log,
  debug: jest.fn() as unknown as typeof console.debug,
  info: jest.fn() as unknown as typeof console.info,
  warn: jest.fn() as unknown as typeof console.warn,
  error: jest.fn() as unknown as typeof console.error,
};

// Mock External Third-Party Network Services (Good practice)
// Mock Email Service with safe TypeScript assertions
jest.mock("../src/core/services/email.service", () => ({
  sendEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue({ success: true }),
  sendWelcomeEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    success: true,
  }),
  sendPasswordResetEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    success: true,
  }),
  sendReportConfirmationEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    success: true,
  }),
  sendAdminNotificationEmail: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    success: true,
  }),
}));

// Mock Cloudinary with safe TypeScript assertions
jest.mock("../src/core/config/cloudinary.config", () => ({
  uploadToCloudinary: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    secure_url: "https://test-cloudinary.com/test.jpg",
    public_id: "test-id-123",
  }),
  deleteFromCloudinary: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    result: "ok",
  }),
}));
