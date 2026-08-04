import { z } from "zod";

export const submitRegistrationSchema = z.object({
  body: z.object({
    schoolName: z
      .string()
      .min(2, "School name must be at least 2 characters")
      .max(100, "School name too long"),
    domain: z
      .string()
      .min(2, "Domain must be at least 2 characters")
      .max(100, "Domain too long")
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid domain format",
      ),
    adminName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long"),
    adminEmail: z.email("Invalid email format"),
    adminPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase, one lowercase, and one number",
      ),
    address: z.string().max(200, "Address too long").optional(),
    phone: z.string().max(20, "Phone number too long").optional(),
    email: z.email("Invalid email format").optional(),
    website: z.string().url("Invalid website URL").optional(),
  }),
});

export const reviewRegistrationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid registration ID"),
  }),
  body: z.object({
    status: z.enum(["approved", "rejected"], {
      error: () => ({ message: "Status must be approved or rejected" }),
    }),
    reviewNotes: z.string().max(500, "Review notes too long").optional(),
  }),
});

export const getRegistrationsQuerySchema = z.object({
  query: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    search: z.string().optional(),

    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(20),
  }),
});
