import request from "supertest";
import app from "../../../src/app";
import { Admin } from "../../../src/core/models/admin.model";
import { School } from "../../../src/core/models/school.model";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestSystemAdmin,
  createTestSchool,
  createTestSchoolAdmin,
} from "../../fixtures/mock-db";

import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

describe("Auth API Integration Tests", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/v1/auth/login", () => {
    let systemAdmin: any;
    let school: any;
    let schoolAdmin: any;

    beforeEach(async () => {
      systemAdmin = await createTestSystemAdmin();
      school = await createTestSchool();
      schoolAdmin = await createTestSchoolAdmin(school._id.toString());
    });

    it("should login successfully with valid credentials (system-admin)", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: systemAdmin.email,
        password: "SystemAdmin123!",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admin).toBeDefined();
      expect(response.body.data.admin.email).toBe(systemAdmin.email);
      expect(response.body.data.admin.role).toBe("system-admin");
      expect(response.body.data.school).toBeUndefined();

      // Safely type-cast the header array to eliminate the compiler error
      const cookies = response.headers["set-cookie"] as unknown as
        string[] | undefined;
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      if (cookies && Array.isArray(cookies)) {
        expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
        expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
      }
    });

    it("should login successfully with valid credentials (school-admin)", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: schoolAdmin.email,
        password: "SchoolAdmin123!",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admin).toBeDefined();
      expect(response.body.data.admin.email).toBe(schoolAdmin.email);
      expect(response.body.data.admin.role).toBe("school-admin");
      expect(response.body.data.school).toBeDefined();
      expect(response.body.data.school.id).toBe(school._id.toString());
    });

    it("should reject login with invalid email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "wrong@email.com",
        password: "SystemAdmin123!",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });

    it("should reject login with invalid password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: systemAdmin.email,
        password: "WrongPassword123!",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });

    it("should reject login with missing email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        password: "SystemAdmin123!",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();

      const errors = response.body.errors;
      expect(Array.isArray(errors)).toBe(true);
      if (Array.isArray(errors)) {
        expect(errors.some((e: any) => e.field === "body.email")).toBe(true);
      }
    });

    it("should reject login with missing password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: systemAdmin.email,
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();

      const errors = response.body.errors;
      expect(Array.isArray(errors)).toBe(true);
      if (Array.isArray(errors)) {
        expect(errors.some((e: any) => e.field === "body.password")).toBe(true);
      }
    });

    it("should reject login with invalid email format", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "invalid-email",
        password: "SystemAdmin123!",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject login with short password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: systemAdmin.email,
        password: "short",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should rate limit login attempts", async () => {
      const attempts = 6;
      const promises = Array.from({ length: attempts }, () =>
        request(app).post("/api/v1/auth/login").send({
          email: systemAdmin.email,
          password: "WrongPassword123!",
        }),
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some((res) => res.status === 429);
      expect(rateLimited).toBe(true);
    });

    it("should reject login for deactivated admin", async () => {
      await Admin.findByIdAndUpdate(systemAdmin._id, { isActive: false });

      const response = await request(app).post("/api/v1/auth/login").send({
        email: systemAdmin.email,
        password: "SystemAdmin123!",
      });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/account is deactivated/i);
    });

    it("should reject login for deactivated school", async () => {
      await School.findByIdAndUpdate(school._id, { isActive: false });

      const response = await request(app).post("/api/v1/auth/login").send({
        email: schoolAdmin.email,
        password: "SchoolAdmin123!",
      });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/school is deactivated/i);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    let systemAdmin: any;
    let validRefreshToken: string;

    beforeEach(async () => {
      systemAdmin = await createTestSystemAdmin();

      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: systemAdmin.email,
        password: "SystemAdmin123!",
      });

      const cookies = loginResponse.headers["set-cookie"] as unknown as
        string[] | undefined;
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      if (cookies && Array.isArray(cookies)) {
        const refreshCookie = cookies.find((c) =>
          c.startsWith("refreshToken="),
        );
        expect(refreshCookie).toBeDefined();
        if (refreshCookie) {
          validRefreshToken = refreshCookie.split(";")[0].split("=")[1];
        }
      }
    });

    it("should refresh tokens successfully", async () => {
      const response = await request(app).post("/api/v1/auth/refresh").send({
        refreshToken: validRefreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const cookies = response.headers["set-cookie"] as unknown as
        string[] | undefined;
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      if (cookies && Array.isArray(cookies)) {
        expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
        expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
      }
    });

    it("should reject refresh with invalid token", async () => {
      const response = await request(app).post("/api/v1/auth/refresh").send({
        refreshToken: "invalid-token",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject refresh with missing token", async () => {
      const response = await request(app).post("/api/v1/auth/refresh").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
