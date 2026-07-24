export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: {
    id: string;
    email: string;
    name: string;
    role: "system-admin" | "school-admin" | "school-staff";
    isActive: boolean;
    permissions: {
      canAssign: boolean;
      canResolve: boolean;
      canViewAll: boolean;
      canManageStaff: boolean;
      canDelete: boolean;
      canManageSchool: boolean;
    };
    preferences: any;
  };
  school?: {
    id: string;
    name: string;
    domain: string;
    settings: any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  permissions: UserPermissions;
  school?: {
    id: string;
    name: string;
    domain: string;
  };
}

export interface UserPermissions {
  canAssign: boolean;
  canResolve: boolean;
  canViewAll: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
