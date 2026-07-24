import {
  ReportCategory,
  ReportStatus,
  ReportUrgency,
} from "../../src/core/constants/report.constants";
import { Types } from "mongoose";

// ==================== Admin Test Data ====================
export const testSystemAdminData = {
  email: "system@speaksafe.com",
  password: "SystemAdmin123!",
  name: "System Administrator",
  role: "system-admin",
  isActive: true,
};

export const testSchoolAdminData = {
  email: "schooladmin@testschool.edu",
  password: "SchoolAdmin123!",
  name: "School Administrator",
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
};

export const testSchoolStaffData = {
  email: "staff@testschool.edu",
  password: "Staff123!",
  name: "School Staff",
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
};

// ==================== School Test Data ====================
export const testSchoolData = {
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
};

// ==================== Registration Test Data ====================
export const testRegistrationData = {
  schoolName: "New Test School",
  domain: "newtestschool.edu",
  adminName: "New Admin",
  adminEmail: "newadmin@newtestschool.edu",
  adminPassword: "Registration123!",
};

export const testRegistrationWithAddress = {
  schoolName: "New Test School",
  domain: "newtestschool.edu",
  adminName: "New Admin",
  adminEmail: "newadmin@newtestschool.edu",
  adminPassword: "Registration123!",
  address: "456 New St",
  phone: "987-654-3210",
  email: "contact@newtestschool.edu",
  website: "https://newtestschool.edu",
};

export const invalidRegistrationData = {
  shortSchoolName: {
    schoolName: "A",
    domain: "testschool.edu",
    adminName: "Test Admin",
    adminEmail: "admin@testschool.edu",
    adminPassword: "Password123!",
  },
  invalidDomain: {
    schoolName: "Test School",
    domain: "invalid-domain",
    adminName: "Test Admin",
    adminEmail: "admin@testschool.edu",
    adminPassword: "Password123!",
  },
  invalidEmail: {
    schoolName: "Test School",
    domain: "testschool.edu",
    adminName: "Test Admin",
    adminEmail: "invalid-email",
    adminPassword: "Password123!",
  },
  shortPassword: {
    schoolName: "Test School",
    domain: "testschool.edu",
    adminName: "Test Admin",
    adminEmail: "admin@testschool.edu",
    adminPassword: "short",
  },
};

// ==================== Report Test Data ====================
export const testReportData = {
  category: "bullying" as ReportCategory,
  title: "Test Report",
  description:
    "A senior student has been threatening me and taking my lunch money. This has been happening for 3 weeks.",
  status: "new" as ReportStatus,
  urgency: "medium" as ReportUrgency,
  referenceCode: "TEST-CODE",
  isAnonymous: true,
};

export const testReportWithContact = {
  category: "harassment" as ReportCategory,
  title: "Harassment Report",
  description: "I received threatening messages on my phone.",
  isAnonymous: false,
  contactEmail: "reporter@student.edu",
};

export const generateMultipleReports = (count: number, baseData?: any) => {
  const categories: ReportCategory[] = [
    "bullying",
    "harassment",
    "violence",
    "discrimination",
    "mental-health",
    "safety-hazard",
    "other",
  ];
  const statuses: ReportStatus[] = [
    "new",
    "open",
    "investigating",
    "resolved",
    "closed",
  ];
  const urgencies: ReportUrgency[] = ["low", "medium", "high", "urgent"];
  const titles = [
    "Student was pushed in the hallway",
    "Received threatening messages on social media",
    "Fire hazard in the dormitory",
    "Witnessed verbal abuse in the classroom",
    "Physical altercation during lunch break",
    "Cybersecurity concerns with school network",
    "Bullying in the locker room",
    "Harassment from senior students",
    "Unsafe equipment in the science lab",
    "Discrimination based on background",
  ];

  return Array.from({ length: count }, (_, i) => ({
    category: categories[i % categories.length],
    title: titles[i % titles.length] + ` (Test ${i + 1})`,
    description: `Detailed description for test report ${i + 1}`,
    status: statuses[i % statuses.length],
    urgency: urgencies[i % urgencies.length],
    referenceCode: `TST-${String(i + 1).padStart(4, "0")}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    ...baseData,
  }));
};

export const invalidReportData = {
  emptyCategory: {
    category: "" as any,
    title: "Test",
    description: "This should fail validation.",
  },
  emptyTitle: {
    category: "bullying" as ReportCategory,
    title: "",
    description: "This should fail validation.",
  },
  shortTitle: {
    category: "bullying" as ReportCategory,
    title: "Tst",
    description: "This should fail validation.",
  },
  emptyDescription: {
    category: "bullying" as ReportCategory,
    title: "Test Report",
    description: "",
  },
  shortDescription: {
    category: "bullying" as ReportCategory,
    title: "Test Report",
    description: "Too short",
  },
  invalidCategory: {
    category: "invalid-category" as any,
    title: "Test Report",
    description: "This has an invalid category.",
  },
  invalidEmail: {
    category: "bullying" as ReportCategory,
    title: "Test Report",
    description: "Valid description here",
    isAnonymous: false,
    contactEmail: "invalid-email",
  },
};

// ==================== Auth Test Data ====================
export const authTestData = {
  validLogin: {
    email: "admin@school.edu",
    password: "AdminPassword123!",
  },
  invalidEmail: {
    email: "wrong@email.com",
    password: "AdminPassword123!",
  },
  invalidPassword: {
    email: "admin@school.edu",
    password: "WrongPassword123!",
  },
  missingEmail: {
    password: "AdminPassword123!",
  },
  missingPassword: {
    email: "admin@school.edu",
  },
  shortPassword: {
    email: "admin@school.edu",
    password: "short",
  },
};

// ==================== Password Reset Test Data ====================
export const passwordResetTestData = {
  validEmail: "admin@school.edu",
  invalidEmail: "nonexistent@school.edu",
  validToken: "valid-reset-token",
  invalidToken: "invalid-token",
  expiredToken: "expired-token",
  newPassword: "NewPassword123!",
  shortNewPassword: "short",
};

// ==================== Status Test Data ====================
export const statusTestData = {
  validReferenceCode: "ABCD-EFGH",
  invalidReferenceCode: "INVALID-CODE",
  malformedReferenceCode: "1234-567",
  statuses: ["open", "investigating", "resolved", "closed"] as ReportStatus[],
};

// ==================== Dashboard Query Test Data ====================
export const dashboardTestQueries = {
  default: {},
  filterByStatus: { status: "new" },
  filterByCategory: { category: "bullying" },
  filterByUrgency: { urgency: "high" },
  filterByStatusAndCategory: {
    status: "investigating",
    category: "harassment",
  },
  withPagination: { page: 2, limit: 10 },
  sortByNewest: { sortBy: "newest" },
  sortByOldest: { sortBy: "oldest" },
  sortByUrgent: { sortBy: "urgent" },
  sortByStatus: { sortBy: "status" },
  withSearch: { search: "threatening" },
  withDateRange: {
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateTo: new Date().toISOString(),
  },
};

// ==================== Update Status Test Data ====================
export const updateStatusTestData = {
  toOpen: { status: "open" },
  toInvestigating: { status: "investigating" },
  toResolved: { status: "resolved" },
  toClosed: { status: "closed" },
  withNote: {
    status: "investigating",
    note: "Investigating this report further.",
  },
  invalidStatus: { status: "invalid-status" },
  emptyStatus: {},
};

// ==================== Assignment Test Data ====================
export const assignmentTestData = {
  validAdminId: new Types.ObjectId().toString(),
  invalidAdminId: new Types.ObjectId().toString(),
};

// ==================== Urgency Test Data ====================
export const urgencyTestData = {
  toHigh: { urgency: "high" },
  toUrgent: { urgency: "urgent" },
  toMedium: { urgency: "medium" },
  toLow: { urgency: "low" },
};

// ==================== Staff Management Test Data ====================
export const staffTestData = {
  validInvite: {
    email: "newstaff@testschool.edu",
    name: "New Staff Member",
    permissions: {
      canResolve: true,
    },
  },
  invalidEmail: {
    email: "invalid-email",
    name: "Invalid Staff",
  },
  shortName: {
    email: "staff@testschool.edu",
    name: "A",
  },
};
