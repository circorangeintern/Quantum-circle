import { z } from "zod";

export const REPORT_CATEGORIES = [
  "bullying",
  "harassment",
  "violence",
  "discrimination",
  "mental-health",
  "safety-hazard",
  "other",
] as const;

export const dashboardQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(["new", "open", "investigating", "resolved", "closed"])
      .optional(),
    category: z.enum(REPORT_CATEGORIES).optional(),
    urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    dateFrom: z.iso.datetime().optional(),
    dateTo: z.iso.datetime().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["newest", "oldest", "urgent", "status"]).default("newest"),
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    category: z.enum(REPORT_CATEGORIES),

    title: z
      .string()
      .trim()
      .min(5, "Title too short")
      .max(200, "Title too long"),

    description: z
      .string()
      .trim()
      .min(10, "Description too short")
      .max(2000, "Description too long"),

    incidentDate: z.iso.datetime({ offset: true }).optional(),
    location: z.string().trim().max(200).optional(),
    peopleInvolved: z.string().trim().max(200).optional(),
    isAnonymous: z.coerce.boolean().default(true),
    contactEmail: z.email().optional(),
    schoolId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid school ID")
      .optional(),
  }),
});

export const statusCheckSchema = z.object({
  params: z.object({
    referenceCode: z
      .string()
      .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Invalid reference code format"),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid report ID"),
  }),
  body: z.object({
    status: z.enum(["open", "investigating", "resolved", "closed"]),
    note: z.string().max(500).optional(),
  }),
});

export const photoValidation = {
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed"),
        false,
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

export const updateUrgencySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid report ID"),
  }),
  body: z.object({
    urgency: z.enum(["low", "medium", "high", "urgent"]),
  }),
});

export const assignReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid report ID"),
  }),
  body: z.object({
    adminId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid admin ID"),
  }),
});

export const addNoteSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid report ID"),
  }),
  body: z.object({
    note: z.string().min(1, "Note is required").max(1000, "Note too long"),
  }),
});

export const updateReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid report ID"),
  }),
  body: z.object({
    title: z.string().max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    category: z.enum(REPORT_CATEGORIES).optional(),
    incidentDate: z.string().datetime().optional(),
    location: z.string().max(200).optional(),
    peopleInvolved: z.string().max(200).optional(),
  }),
});
