export interface CreateRequestInput {
  name: string;
  email: string;
  school: string;
  role: string;
}

export interface ReviewRequestInput {
  status: "approved" | "rejected";
  reviewNotes?: string;
}

export interface RequestResponse {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface GetRequestsQuery {
  status?: "pending" | "approved" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest";
}

export interface PaginatedRequestsResponse {
  requests: RequestResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: RequestStats;
}
