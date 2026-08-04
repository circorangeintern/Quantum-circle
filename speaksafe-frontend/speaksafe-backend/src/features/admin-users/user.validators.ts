import { z } from "zod";

// Only system-admin role allowed
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long"),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["newest", "oldest", "name"]).default("newest"),
    stats: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});
