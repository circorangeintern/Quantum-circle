import { z } from "zod";

export const updateSchoolSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid school ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "School name must be at least 2 characters")
      .max(100, "School name too long")
      .optional(),
    address: z.string().max(200, "Address too long").optional(),
    phone: z.string().max(20, "Phone number too long").optional(),
    email: z.email("Invalid email format").optional(),
    website: z.string().url("Invalid website URL").optional(),
    logo: z.string().url("Invalid logo URL").optional(),
    settings: z
      .object({
        allowAnonymous: z.boolean().optional(),
        requireApproval: z.boolean().optional(),
        maxAdmins: z.number().positive().optional(),
        retentionDays: z.number().positive().optional(),
        allowAttachments: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const inviteStaffSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid school ID"),
  }),
  body: z.object({
    email: z.email("Invalid email format"),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long"),
    role: z.enum(["admin", "viewer"]).default("admin"),
    permissions: z
      .object({
        canAssign: z.boolean().optional(),
        canResolve: z.boolean().optional(),
        canViewAll: z.boolean().optional(),
        canDelete: z.boolean().optional(),
        canManageUsers: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const schoolIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid school ID"),
  }),
});

export const removeStaffSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid school ID"),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid staff ID"),
  }),
});
