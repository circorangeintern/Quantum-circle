export interface CreateUserInput {
  email: string;
  name: string;
  role: "system-admin"; // Only system-admin can be created here
  isActive?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  isActive?: boolean;
  // Cannot change role - system-admin only
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: "system-admin";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUsersQuery {
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
  };
}
