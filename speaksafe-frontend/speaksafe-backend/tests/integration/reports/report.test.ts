import request from "supertest";
import app from "../../../src/app";
import { Report } from "../../../src/core/models/report.model";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestSchool,
  createTestSchoolAdmin,
  createTestSystemAdmin,
} from "../../fixtures/mock-db";

import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";

describe("Report API Integration Tests", () => {
  let school: any;
  let schoolAdmin: any;
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

    // Create school and admin
    school = await createTestSchool();
    schoolAdmin = await createTestSchoolAdmin(school._id.toString());
    systemAdmin = await createTestSystemAdmin();

    // Login to get token
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: schoolAdmin.email,
      password: "SchoolAdmin123!",
    });

    const rawCookies = loginResponse.headers["set-cookie"];
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

  describe("POST /api/v1/reports", () => {
    it("should create a report successfully", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Test Report",
        description: "A senior student has been threatening me daily.",
        isAnonymous: true,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.referenceCode).toMatch(
        /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
      );
      expect(response.body.data.status).toBe("new");

      // Verify report was saved with schoolId
      const savedReport = await Report.findOne({
        referenceCode: response.body.data.referenceCode,
      });
      expect(savedReport).toBeDefined();
      expect(savedReport?.schoolId.toString()).toBe(school._id.toString());
    });

    it("should create an anonymous report without storing PII", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "harassment",
        title: "Anonymous Report",
        description: "This report should be anonymous.",
        isAnonymous: true,
      });

      expect(response.status).toBe(201);

      const savedReport = await Report.findOne({
        referenceCode: response.body.data.referenceCode,
      });
      expect(savedReport?.reporterIdentity?.isAnonymous).toBe(true);
      expect(savedReport?.reporterIdentity?.contactEmail).toBeUndefined();
    });

    it("should create an identified report with contact email", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "violence",
        title: "Identified Report",
        description: "This report has contact info.",
        isAnonymous: false,
        contactEmail: "reporter@student.edu",
      });

      expect(response.status).toBe(201);

      const savedReport = await Report.findOne({
        referenceCode: response.body.data.referenceCode,
      });
      expect(savedReport?.reporterIdentity?.isAnonymous).toBe(false);
      expect(savedReport?.reporterIdentity?.contactEmail).toBe(
        "reporter@student.edu",
      );
    });

    it("should reject report without title", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        description: "This should fail validation.",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject report without description", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Test Report",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject report with short title", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Tst",
        description: "Valid description here.",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it("should reject report with short description", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Test Report",
        description: "Too short",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it("should reject report with invalid category", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "invalid-category",
        title: "Test Report",
        description: "This should fail validation.",
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it("should reject report with invalid email when identified", async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Test Report",
        description: "Valid description here.",
        isAnonymous: false,
        contactEmail: "invalid-email",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/reports/status/:referenceCode", () => {
    let referenceCode: string;

    beforeEach(async () => {
      const response = await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Status Test Report",
        description: "Test report for status check",
      });
      referenceCode = response.body.data.referenceCode;
    });

    it("should return status for valid reference code", async () => {
      const response = await request(app).get(
        `/api/v1/reports/status/${referenceCode}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("new");
      expect(response.body.data.category).toBe("bullying");
      expect(response.body.data.title).toBe("Status Test Report");
      expect(response.body.data.timeline).toBeDefined();
      expect(response.body.data.timeline.length).toBeGreaterThan(0);
    });

    it("should return 404 for invalid reference code", async () => {
      const response = await request(app).get(
        "/api/v1/reports/status/INVALID-CODE",
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/report not found/i);
    });

    it("should not expose internal data in status check", async () => {
      const response = await request(app).get(
        `/api/v1/reports/status/${referenceCode}`,
      );

      expect(response.body.data).not.toHaveProperty("internalNotes");
      expect(response.body.data).not.toHaveProperty("activityLog");
      expect(response.body.data).not.toHaveProperty("assignedTo");
    });
  });

  describe("GET /api/v1/reports/dashboard", () => {
    beforeEach(async () => {
      // Create multiple reports
      await request(app).post("/api/v1/reports").send({
        category: "bullying",
        title: "Report 1",
        description: "First test report.",
      });

      await request(app).post("/api/v1/reports").send({
        category: "harassment",
        title: "Report 2",
        description: "Second test report.",
      });

      await request(app).post("/api/v1/reports").send({
        category: "violence",
        title: "Report 3",
        description: "Third test report.",
        urgency: "high",
      });
    });

    it("should get dashboard reports with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/reports/dashboard")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reports).toBeDefined();
      expect(response.body.data.reports.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
    });

    it("should filter reports by category", async () => {
      const response = await request(app)
        .get("/api/v1/reports/dashboard?category=bullying")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(
        response.body.data.reports.every((r: any) => r.category === "bullying"),
      ).toBe(true);
    });

    it("should filter reports by status", async () => {
      const response = await request(app)
        .get("/api/v1/reports/dashboard?status=new")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(
        response.body.data.reports.every((r: any) => r.status === "new"),
      ).toBe(true);
    });

    it("should filter reports by urgency", async () => {
      const response = await request(app)
        .get("/api/v1/reports/dashboard?urgency=high")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(
        response.body.data.reports.every((r: any) => r.urgency === "high"),
      ).toBe(true);
    });

    it("should support search", async () => {
      const response = await request(app)
        .get("/api/v1/reports/dashboard?search=First")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(
        response.body.data.reports.some((r: any) => r.title.includes("First")),
      ).toBe(true);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/reports/dashboard?page=1&limit=2")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.reports.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it("should reject without authentication", async () => {
      const response = await request(app).get("/api/v1/reports/dashboard");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
