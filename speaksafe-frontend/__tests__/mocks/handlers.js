import { http, HttpResponse } from "msw";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ---------------------------------------------------------------------------
// Default response stubs — all handlers return minimal valid shapes.
// Individual tests override these via server.use(...) as needed.
// ---------------------------------------------------------------------------

export const handlers = [
  // -------------------------------------------------------------------------
  // Auth endpoints
  // -------------------------------------------------------------------------

  // POST /auth/login
  http.post(`${BASE_URL}/auth/login`, () => {
    return HttpResponse.json(
      {
        admin: {
          id: "admin-1",
          email: "admin@example.com",
          name: "Test Admin",
          role: "system-admin",
          isActive: true,
          permissions: {
            canAssign: true,
            canResolve: true,
            canViewAll: true,
            canManageStaff: true,
            canDelete: true,
            canManageSchool: true,
          },
        },
        school: null,
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      },
      { status: 200 },
    );
  }),

  // POST /auth/logout
  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully" }, { status: 200 });
  }),

  // GET /auth/me
  http.get(`${BASE_URL}/auth/me`, () => {
    return HttpResponse.json(
      {
        admin: {
          id: "admin-1",
          email: "admin@example.com",
          name: "Test Admin",
          role: "system-admin",
          isActive: true,
          permissions: {
            canAssign: true,
            canResolve: true,
            canViewAll: true,
            canManageStaff: true,
            canDelete: true,
            canManageSchool: true,
          },
        },
        school: null,
      },
      { status: 200 },
    );
  }),

  // POST /auth/change-password
  http.post(`${BASE_URL}/auth/change-password`, () => {
    return HttpResponse.json({ message: "Password changed successfully" }, { status: 200 });
  }),

  // POST /auth/forgot-password
  http.post(`${BASE_URL}/auth/forgot-password`, () => {
    return HttpResponse.json(
      { message: "If that email is registered you will receive a reset link" },
      { status: 200 },
    );
  }),

  // POST /auth/reset-password
  http.post(`${BASE_URL}/auth/reset-password`, () => {
    return HttpResponse.json({ message: "Password reset successfully" }, { status: 200 });
  }),

  // POST /auth/refresh
  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json(
      {
        tokens: {
          accessToken: "new-mock-access-token",
          refreshToken: "new-mock-refresh-token",
        },
      },
      { status: 200 },
    );
  }),

  // -------------------------------------------------------------------------
  // Registrations endpoints
  // -------------------------------------------------------------------------

  // POST /registrations
  http.post(`${BASE_URL}/registrations`, () => {
    return HttpResponse.json(
      {
        id: "reg-1",
        schoolName: "Test School",
        domain: "testschool.edu",
        adminEmail: "admin@testschool.edu",
        status: "pending",
        submittedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // GET /registrations
  http.get(`${BASE_URL}/registrations`, () => {
    return HttpResponse.json(
      {
        registrations: [
          {
            id: "reg-1",
            schoolName: "Test School",
            domain: "testschool.edu",
            adminEmail: "admin@testschool.edu",
            status: "pending",
            submittedAt: new Date().toISOString(),
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      },
      { status: 200 },
    );
  }),

  // GET /registrations/stats
  http.get(`${BASE_URL}/registrations/stats`, () => {
    return HttpResponse.json(
      { total: 10, pending: 3, approved: 6, rejected: 1 },
      { status: 200 },
    );
  }),

  // PUT /registrations/:id/review
  http.put(`${BASE_URL}/registrations/:id/review`, () => {
    return HttpResponse.json(
      {
        id: "reg-1",
        status: "approved",
        reviewedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // -------------------------------------------------------------------------
  // Reports endpoints
  // -------------------------------------------------------------------------

  // GET /reports/dashboard
  http.get(`${BASE_URL}/reports/dashboard`, () => {
    return HttpResponse.json(
      {
        reports: [
          {
            id: "report-1",
            referenceCode: "ABCD-1234",
            title: "Test Report",
            category: "bullying",
            status: "new",
            urgency: "medium",
            description: "Test description",
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assignedTo: null,
            isAnonymous: true,
            hasAttachments: false,
            attachments: [],
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
        summary: {
          total: 1,
          new: 1,
          open: 0,
          investigating: 0,
          resolved: 0,
          active: 1,
        },
      },
      { status: 200 },
    );
  }),

  // GET /reports/analytics/summary
  http.get(`${BASE_URL}/reports/analytics/summary`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          overview: {
            totalReports: 0,
            activeReports: 0,
            resolvedReports: 0,
            urgentReports: 0,
            resolutionRate: 0,
          },
          breakdown: {
            categories: [],
            statuses: [],
            urgencies: [],
          },
          trends: {
            monthly: [],
          },
          performance: {
            averageResolutionTime: null,
            adminAssignments: [],
          },
        },
      },
      { status: 200 },
    );
  }),

  // GET /reports/export
  http.get(`${BASE_URL}/reports/export`, () => {
    return new HttpResponse("report,data\nrow1,value1", {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=reports.csv",
      },
    });
  }),

  // GET /reports/status/:referenceCode
  http.get(`${BASE_URL}/reports/status/:referenceCode`, ({ params }) => {
    return HttpResponse.json(
      {
        referenceCode: params.referenceCode,
        title: "Test Report",
        category: "bullying",
        status: "new",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            event: "submitted",
            timestamp: new Date().toISOString(),
            description: "Report submitted",
          },
        ],
      },
      { status: 200 },
    );
  }),

  // GET /reports/:id  — must come AFTER more specific /reports/* routes
  http.get(`${BASE_URL}/reports/:id`, ({ params }) => {
    return HttpResponse.json(
      {
        id: params.id,
        referenceCode: "ABCD-1234",
        title: "Test Report",
        category: "bullying",
        status: "new",
        urgency: "medium",
        description: "Test description",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: null,
        isAnonymous: true,
        hasAttachments: false,
        attachments: [],
        statusHistory: [],
        internalNotes: [],
        publicTimeline: [],
      },
      { status: 200 },
    );
  }),

  // POST /reports
  http.post(`${BASE_URL}/reports`, () => {
    return HttpResponse.json(
      {
        id: "report-1",
        referenceCode: "ABCD-1234",
        message: "Report submitted successfully",
      },
      { status: 201 },
    );
  }),

  // PUT /reports/:id/status
  http.put(`${BASE_URL}/reports/:id/status`, ({ params }) => {
    return HttpResponse.json(
      { id: params.id, status: "open", updatedAt: new Date().toISOString() },
      { status: 200 },
    );
  }),

  // PUT /reports/:id/urgency
  http.put(`${BASE_URL}/reports/:id/urgency`, ({ params }) => {
    return HttpResponse.json(
      { id: params.id, urgency: "high", updatedAt: new Date().toISOString() },
      { status: 200 },
    );
  }),

  // PUT /reports/:id/assign
  http.put(`${BASE_URL}/reports/:id/assign`, ({ params }) => {
    return HttpResponse.json(
      { id: params.id, assignedTo: "admin-2", updatedAt: new Date().toISOString() },
      { status: 200 },
    );
  }),

  // POST /reports/:id/notes
  http.post(`${BASE_URL}/reports/:id/notes`, ({ params }) => {
    return HttpResponse.json(
      {
        id: "note-1",
        reportId: params.id,
        text: "Internal note text",
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // DELETE /reports/:id
  http.delete(`${BASE_URL}/reports/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // -------------------------------------------------------------------------
  // Schools endpoints
  // -------------------------------------------------------------------------

  // GET /schools/:id
  http.get(`${BASE_URL}/schools/:id`, ({ params }) => {
    return HttpResponse.json(
      {
        id: params.id,
        name: "Test School",
        domain: "testschool.edu",
        address: null,
        phone: null,
        email: "school@testschool.edu",
        website: null,
        logo: null,
        isActive: true,
        settings: { allowAnonymous: true, allowAttachments: true, retentionDays: 365 },
        stats: { totalReports: 10, activeAdmins: 2, resolvedCases: 5, pendingCases: 5 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // PUT /schools/:id
  http.put(`${BASE_URL}/schools/:id`, ({ params }) => {
    return HttpResponse.json(
      {
        id: params.id,
        name: "Updated School Name",
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // GET /schools/:id/staff
  http.get(`${BASE_URL}/schools/:id/staff`, () => {
    return HttpResponse.json(
      {
        staff: [
          {
            id: "staff-1",
            name: "Staff Member",
            email: "staff@testschool.edu",
            role: "school-staff",
            isActive: true,
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      },
      { status: 200 },
    );
  }),

  // POST /schools/:id/staff
  http.post(`${BASE_URL}/schools/:id/staff`, ({ params }) => {
    return HttpResponse.json(
      {
        id: "staff-2",
        schoolId: params.id,
        name: "New Staff Member",
        email: "newstaff@testschool.edu",
        role: "school-staff",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // DELETE /schools/:id/staff/:staffId
  http.delete(`${BASE_URL}/schools/:id/staff/:staffId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // -------------------------------------------------------------------------
  // Admin-users endpoints
  // -------------------------------------------------------------------------

  // GET /admin-users
  http.get(`${BASE_URL}/admin-users`, () => {
    return HttpResponse.json(
      {
        adminUsers: [
          {
            id: "admin-1",
            email: "admin@example.com",
            name: "Test Admin",
            role: "system-admin",
            isActive: true,
            lastLoginAt: null,
            permissions: {
              canAssign: true,
              canResolve: true,
              canViewAll: true,
              canManageStaff: true,
              canDelete: true,
              canManageSchool: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      },
      { status: 200 },
    );
  }),

  // POST /admin-users
  http.post(`${BASE_URL}/admin-users`, () => {
    return HttpResponse.json(
      {
        id: "admin-2",
        email: "newadmin@example.com",
        name: "New Admin",
        role: "system-admin",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // PUT /admin-users/:id
  http.put(`${BASE_URL}/admin-users/:id`, ({ params }) => {
    return HttpResponse.json(
      {
        id: params.id,
        name: "Updated Admin",
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // DELETE /admin-users/:id
  http.delete(`${BASE_URL}/admin-users/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /admin-users/:id/reset-password
  http.post(`${BASE_URL}/admin-users/:id/reset-password`, () => {
    return HttpResponse.json(
      { temporaryPassword: "TempPass123!" },
      { status: 200 },
    );
  }),
];
