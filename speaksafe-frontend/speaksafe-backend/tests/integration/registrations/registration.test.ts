import request from "supertest";
import app from "../../../src/app";
import { SchoolRegistration } from "../../../src/core/models/school-registration.model";
import { School } from "../../../src/core/models/school.model";
import { Admin } from "../../../src/core/models/admin.model";
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

describe("Registration API Integration Tests", () => {
  let systemAdmin: any;
  let accessToken: string;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create system admin
    systemAdmin = await createTestSystemAdmin();

    // Login to get token
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: systemAdmin.email,
      password: "SystemAdmin123!",
    });

    const rawCookies = loginResponse.headers["set-cookie"] as unknown as
      string[] | undefined;
    const cookies: string[] = Array.isArray(rawCookies)
      ? rawCookies
      : rawCookies
        ? [rawCookies]
        : [];

    const accessCookie = cookies.find((c: string) =>
      c.startsWith("accessToken="),
    );
    accessToken = accessCookie ? accessCookie.split(";")[0].split("=")[1] : "";
  });

  describe("POST /api/v1/registrations", () => {
    it("should submit a registration successfully", async () => {
      const response = await request(app).post("/api/v1/registrations").send({
        schoolName: "St. Mary's School",
        domain: "stmarys.edu",
        adminName: "John Smith",
        adminEmail: "admin@stmarys.edu",
        adminPassword: "AdminPassword123!",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.schoolName).toBe("St. Mary's School");
      expect(response.body.data.domain).toBe("stmarys.edu");
      expect(response.body.data.adminEmail).toBe("admin@stmarys.edu");
      expect(response.body.data.status).toBe("pending");

      const saved = await SchoolRegistration.findOne({ domain: "stmarys.edu" });
      expect(saved).toBeDefined();
      expect(saved?.status).toBe("pending");
    });

    it("should submit registration with optional fields", async () => {
      const response = await request(app).post("/api/v1/registrations").send({
        schoolName: "New School",
        domain: "newschool.edu",
        adminName: "Jane Doe",
        adminEmail: "admin@newschool.edu",
        adminPassword: "AdminPassword123!",
        address: "456 Main St",
        phone: "123-456-7890",
        email: "contact@newschool.edu",
        website: "https://newschool.edu",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const saved = await SchoolRegistration.findOne({
        domain: "newschool.edu",
      });
      expect(saved?.address).toBe("456 Main St");
      expect(saved?.phone).toBe("123-456-7890");
      expect(saved?.email).toBe("contact@newschool.edu");
      expect(saved?.website).toBe("https://newschool.edu");
    });

    it("should reject registration with existing domain", async () => {
      await request(app).post("/api/v1/registrations").send({
        schoolName: "St. Mary's School",
        domain: "stmarys.edu",
        adminName: "John Smith",
        adminEmail: "admin@stmarys.edu",
        adminPassword: "AdminPassword123!",
      });

      const response = await request(app).post("/api/v1/registrations").send({
        schoolName: "Another School",
        domain: "stmarys.edu",
        adminName: "Jane Doe",
        adminEmail: "admin@another.edu",
        adminPassword: "AdminPassword123!",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/domain.*already exists/i);
    });

    it("should reject registration with existing admin email", async () => {
      await request(app).post("/api/v1/registrations").send({
        schoolName: "St. Mary's School",
        domain: "stmarys.edu",
        adminName: "John Smith",
        adminEmail: "admin@stmarys.edu",
        adminPassword: "AdminPassword123!",
      });

      const response = await request(app).post("/api/v1/registrations").send({
        schoolName: "Another School",
        domain: "another.edu",
        adminName: "John Smith",
        adminEmail: "admin@stmarys.edu",
        adminPassword: "AdminPassword123!",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/email.*already.*pending/i);
    });

    it("should reject registration with short school name", async () => {
      const response = await request(app).post("/api/v1/registrations").send({
        schoolName: "A",
        domain: "testschool.edu",
        adminName: "Test Admin",
        adminEmail: "admin@testschool.edu",
        adminPassword: "AdminPassword123!",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();

      const errors = response.body.errors;
      expect(Array.isArray(errors)).toBe(true);
      if (Array.isArray(errors)) {
        expect(errors.some((e: any) => e.field === "body.schoolName")).toBe(
          true,
        );
      }
    });

    it("should reject registration with invalid domain", async () => {
      const response = await request(app).post("/api/v1/registrations").send({
        schoolName: "Test School",
        domain: "invalid-domain",
        adminName: "Test Admin",
        adminEmail: "admin@testschool.edu",
        adminPassword: "AdminPassword123!",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/registrations", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/registrations").send({
        schoolName: "School One",
        domain: "schoolone.edu",
        adminName: "Admin One",
        adminEmail: "admin@schoolone.edu",
        adminPassword: "AdminPassword123!",
      });

      await request(app).post("/api/v1/registrations").send({
        schoolName: "School Two",
        domain: "schooltwo.edu",
        adminName: "Admin Two",
        adminEmail: "admin@schooltwo.edu",
        adminPassword: "AdminPassword123!",
      });
    });

    it("should get all registrations (system admin only)", async () => {
      // Pass the access cookie explicitly to authenticate the route
      const response = await request(app)
        .get("/api/v1/registrations")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("should reject access if no authentication token is provided", async () => {
      const response = await request(app).get("/api/v1/registrations");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
