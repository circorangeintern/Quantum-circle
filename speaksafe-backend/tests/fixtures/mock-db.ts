import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { hashPassword } from "../../src/core/utils/bcrypt.util";
import { Admin } from "../../src/core/models/admin.model";
import { Report } from "../../src/core/models/report.model";
import { School } from "../../src/core/models/school.model";
import { SchoolRegistration } from "../../src/core/models/school-registration.model";
import { PasswordReset } from "../../src/core/models/password-reset.model";
import { AuditLog } from "../../src/core/models/audit-log.model";
import { Notification } from "../../src/core/models/notification.model";
import { setServers } from "dns/promises";

// Keep one global instance variable to manage the database lifetime safely
let mongoServer: MongoMemoryServer | null = null;

/**
 * Connect to in-memory database for testing
 * Uses active connection guards to avoid multi-connection Mongoose crashes
 */
export const connectTestDB = async (): Promise<MongoMemoryServer | void> => {
  setServers(["0.0.0.0", "1.1.1.1", "8.8.8.8"]);

  // Guard: If connection is already alive or connecting, skip initialization
  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }

  // Spin up an isolated instance if it doesn't exist yet
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }

  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri; // Expose to the app environment natively

  await mongoose.connect(uri, {
    dbName: "test_db",
    serverSelectionTimeoutMS: 5000,
  });

  return mongoServer;
};

/**
 * Disconnect and clean up test database cleanly
 */
export const disconnectTestDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

/**
 * Clear all collections in the test database between tests
 */
export const clearTestDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Create test school
 */
export const createTestSchool = async (data?: Partial<any>) => {
  const defaultData = {
    name: "Test School",
    domain: "testschool.edu",
    address: "123 Test St",
    phone: "123-456-7890",
    email: "school@testschool.edu",
    website: "https://testschool.edu",
    isActive: true,
    settings: {
      allowAnonymous: true,
      allowAttachments: true,
      retentionDays: 365,
    },
    stats: {
      totalReports: 0,
      activeAdmins: 0,
      resolvedCases: 0,
      pendingCases: 0,
    },
  };

  const school = new School({ ...defaultData, ...data });
  await school.save();
  return school;
};

/**
 * Create test system admin
 */
export const createTestSystemAdmin = async (data?: Partial<any>) => {
  const passwordHash = await hashPassword("SystemAdmin123!");
  const defaultData = {
    email: "system@speaksafe.com",
    name: "System Administrator",
    passwordHash,
    role: "system-admin",
    isActive: true,
  };

  const admin = new Admin({ ...defaultData, ...data });
  await admin.save();
  return admin;
};

/**
 * Create test school admin
 */
export const createTestSchoolAdmin = async (
  schoolId: string,
  data?: Partial<any>,
) => {
  const passwordHash = await hashPassword("SchoolAdmin123!");
  const defaultData = {
    email: "schooladmin@testschool.edu",
    name: "School Administrator",
    passwordHash,
    schoolId,
    role: "school-admin",
    department: "Administration",
    isActive: true,
    permissions: {
      canAssign: true,
      canResolve: true,
      canViewAll: true,
      canManageStaff: true,
      canDelete: true,
      canManageSchool: true,
    },
    preferences: {
      notifications: {
        newReports: true,
        urgentCases: true,
        weeklySummary: false,
        assignments: true,
      },
      emailDigest: false,
      dashboardView: "list",
    },
  };

  const admin = new Admin({ ...defaultData, ...data });
  await admin.save();
  return admin;
};

/**
 * Create test school staff
 */
export const createTestSchoolStaff = async (
  schoolId: string,
  data?: Partial<any>,
) => {
  const passwordHash = await hashPassword("Staff123!");
  const defaultData = {
    email: "staff@testschool.edu",
    name: "School Staff",
    passwordHash,
    schoolId,
    role: "school-staff",
    department: "Student Affairs",
    isActive: true,
    permissions: {
      canAssign: false,
      canResolve: true,
      canViewAll: false,
      canManageStaff: false,
      canDelete: false,
      canManageSchool: false,
    },
    preferences: {
      notifications: {
        newReports: true,
        urgentCases: true,
        weeklySummary: false,
        assignments: true,
      },
      emailDigest: false,
      dashboardView: "list",
    },
  };

  const admin = new Admin({ ...defaultData, ...data });
  await admin.save();
  return admin;
};

/**
 * Create test school registration
 */
export const createTestSchoolRegistration = async (data?: Partial<any>) => {
  const passwordHash = await hashPassword("Registration123!");
  const defaultData = {
    schoolName: "New Test School",
    domain: "newtestschool.edu",
    adminName: "New Admin",
    adminEmail: "newadmin@newtestschool.edu",
    adminPasswordHash: passwordHash,
    status: "pending",
  };

  const registration = new SchoolRegistration({ ...defaultData, ...data });
  await registration.save();
  return registration;
};

/**
 * Create test report
 */
export const createTestReport = async (
  schoolId: string,
  data?: Partial<any>,
) => {
  const defaultData = {
    category: "bullying",
    title: "Test Report",
    description: "This is a test report for testing purposes.",
    status: "new",
    urgency: "medium",
    referenceCode: `TST-${Date.now().toString().slice(-6)}`,
    schoolId,
    reporterIdentity: {
      isAnonymous: true,
    },
    attachments: [],
    statusHistory: [
      {
        status: "new",
        timestamp: new Date(),
      },
    ],
    publicTimeline: [
      {
        date: new Date(),
        event: "Report submitted",
        isPublic: true,
      },
    ],
    activityLog: [
      {
        action: "report_created",
        details: { category: "bullying" },
        timestamp: new Date(),
      },
    ],
    isEscalated: false,
  };

  const report = new Report({ ...defaultData, ...data });
  await report.save();
  return report;
};

/**
 * Create test password reset token
 */
export const createTestPasswordReset = async (
  adminId: string,
  data?: Partial<any>,
) => {
  const defaultData = {
    adminId,
    token: `reset-${Date.now()}`,
    used: false,
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
  };

  const reset = new PasswordReset({ ...defaultData, ...data });
  await reset.save();
  return reset;
};

/**
 * Create test audit log
 */
export const createTestAuditLog = async (data?: Partial<any>) => {
  const defaultData = {
    action: "login",
    adminId: new mongoose.Types.ObjectId().toString(),
    details: { test: true },
    timestamp: new Date(),
  };

  const log = new AuditLog({ ...defaultData, ...data });
  await log.save();
  return log;
};

/**
 * Create test notification
 */
export const createTestNotification = async (data?: Partial<any>) => {
  const defaultData = {
    type: "new",
    title: "Test Notification",
    message: "This is a test notification",
    adminId: new mongoose.Types.ObjectId().toString(),
    read: false,
  };

  const notification = new Notification({ ...defaultData, ...data });
  await notification.save();
  return notification;
};

/**
 * Create mock request object with admin context
 */
export const createMockRequest = (adminId?: string, adminEmail?: string) => {
  return {
    adminId: adminId || new mongoose.Types.ObjectId().toString(),
    adminEmail: adminEmail || "test-admin@school.edu",
    ip: "127.0.0.1",
    get: (header: string) => {
      if (header === "user-agent") return "Test-Agent/1.0";
      return null;
    },
    cookies: {},
    body: {},
    query: {},
    params: {},
    headers: {},
  };
};

/**
 * Create mock response object and complete incomplete closure snippet
 */
export const createMockResponse = () => {
  const res: any = {
    statusCode: 200,
    body: null,
    cookies: {},
    status: function (code: number) {
      this.statusCode = code;
      return this;
    },
    json: function (data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
};
