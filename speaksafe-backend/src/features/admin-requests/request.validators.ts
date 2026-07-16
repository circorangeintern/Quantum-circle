import { z } from "zod";

export const createRequestSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long"),
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    school: z
      .string()
      .min(2, "School name is required")
      .max(200, "School name too long"),
    role: z.string().min(2, "Role is required").max(100, "Role too long"),
  }),
});

export const reviewRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid request ID"),
  }),
  body: z.object({
    status: z.enum(["approved", "rejected"], {
      error: () => ({ message: "Status must be approved or rejected" }),
    }),
    reviewNotes: z.string().max(500, "Review notes too long").optional(),
  }),
});

export const getRequestsQuerySchema = z.object({
  query: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["newest", "oldest"]).default("newest"),
    stats: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  }),
});

export const deleteRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid request ID"),
  }),
});
