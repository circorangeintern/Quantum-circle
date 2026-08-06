import { Role } from "../../core/models/admin.model";

export interface UpdateUserInput {
  name?: string;
  department?: string;
  role?: Role;
  isActive?: boolean;
  permissions?: Partial<UserPermissions>;
  preferences?: UserPreferences;
}

export interface UserPermissions {
  canAssign: boolean;
  canResolve: boolean;
  canViewAll: boolean;
  canDelete: boolean;
  canManageStaff: boolean;
}

export interface UserPreferences {
  notifications: {
    newReports: boolean;
    urgentCases: boolean;
    weeklySummary: boolean;
    assignments: boolean;
  };
  emailDigest: boolean;
  dashboardView: "list" | "grid";
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  isActive: boolean;
  lastLoginAt?: Date;
  permissions: UserPermissions;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUsersQuery {
  role?: Role;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "name";
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    active: number;
    inactive: number;
    roles: {
      "system-admin": number;
      "school-admin": number;
      "school-staff": number;
    };
  };
}

export interface UpdatePermissionsInput {
  canAssign?: boolean;
  canResolve?: boolean;
  canViewAll?: boolean;
  canDelete?: boolean;
  canManageUsers?: boolean;
}

export interface UpdatePreferencesInput {
  notifications?: {
    newReports?: boolean;
    urgentCases?: boolean;
    weeklySummary?: boolean;
    assignments?: boolean;
  };
  emailDigest?: boolean;
  dashboardView?: "list" | "grid";
}
