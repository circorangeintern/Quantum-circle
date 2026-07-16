import { z } from "zod";

const roleEnum = z.enum(["admin", "viewer"]);
const permissionSchema = z.object({
  canAssign: z.boolean().optional(),
  canResolve: z.boolean().optional(),
  canViewAll: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canManageUsers: z.boolean().optional(),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long"),
    role: roleEnum.default("admin"),
    department: z.string().max(100, "Department name too long").optional(),
    permissions: permissionSchema.optional(),
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
    department: z.string().max(100, "Department name too long").optional(),
    role: roleEnum.optional(),
    isActive: z.boolean().optional(),
    permissions: permissionSchema.optional(),
    preferences: z
      .object({
        notifications: z
          .object({
            newReports: z.boolean().optional(),
            urgentCases: z.boolean().optional(),
            weeklySummary: z.boolean().optional(),
            assignments: z.boolean().optional(),
          })
          .optional(),
        emailDigest: z.boolean().optional(),
        dashboardView: z.enum(["list", "grid"]).optional(),
      })
      .optional(),
  }),
});

export const updatePermissionsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: permissionSchema,
});

export const updatePreferencesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: z.object({
    notifications: z
      .object({
        newReports: z.boolean().optional(),
        urgentCases: z.boolean().optional(),
        weeklySummary: z.boolean().optional(),
        assignments: z.boolean().optional(),
      })
      .optional(),
    emailDigest: z.boolean().optional(),
    dashboardView: z.enum(["list", "grid"]).optional(),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    role: z.enum(["admin", "viewer", "super-admin"]).optional(),
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

export const getAvailableAdminsSchema = z.object({
  query: z.object({
    exclude: z.string().optional(),
  }),
});
