// ==================== Categories ====================
export type ReportCategory =
  | "bullying"
  | "harassment"
  | "violence"
  | "discrimination"
  | "mental-health"
  | "safety-hazard"
  | "other";

export const REPORT_CATEGORIES: Record<
  ReportCategory,
  { label: string; description: string; icon?: string }
> = {
  bullying: {
    label: "Bullying",
    description: "Physical, verbal, or social bullying incidents",
    icon: "👊",
  },
  harassment: {
    label: "Harassment",
    description: "Repeated unwanted behavior or intimidation",
    icon: "📢",
  },
  violence: {
    label: "Violence",
    description: "Physical altercations or threats of violence",
    icon: "⚡",
  },
  discrimination: {
    label: "Discrimination",
    description:
      "Unfair treatment based on race, gender, religion, or background",
    icon: "⚖️",
  },
  "mental-health": {
    label: "Mental Health Concern",
    description: "Concerns about emotional or psychological well-being",
    icon: "🧠",
  },
  "safety-hazard": {
    label: "Safety Hazard",
    description: "Physical safety concerns or dangerous situations",
    icon: "⚠️",
  },
  other: {
    label: "Other",
    description: "Other concerns not covered by the categories above",
    icon: "📌",
  },
} as const;

// ==================== Statuses ====================
export type ReportStatus =
  "new" | "open" | "investigating" | "resolved" | "closed";

export const REPORT_STATUSES: Record<
  ReportStatus,
  { label: string; color: string; description: string }
> = {
  new: {
    label: "New",
    color: "#FF6B6B",
    description: "Report has been submitted and is awaiting review",
  },
  open: {
    label: "Open",
    color: "#FFD93D",
    description: "Report has been reviewed and is being worked on",
  },
  investigating: {
    label: "Investigating",
    color: "#4D68AF",
    description: "Active investigation is in progress",
  },
  resolved: {
    label: "Resolved",
    color: "#6BCB77",
    description: "Issue has been resolved",
  },
  closed: {
    label: "Closed",
    color: "#93A0BD",
    description: "Case has been closed",
  },
} as const;

export const REPORT_STATUS_ORDER = [
  "new",
  "open",
  "investigating",
  "resolved",
  "closed",
] as const;

// ==================== Urgency ====================
export type ReportUrgency = "low" | "medium" | "high" | "urgent";

export const REPORT_URGENCIES: Record<
  ReportUrgency,
  { label: string; color: string; priority: number; description: string }
> = {
  low: {
    label: "Low",
    color: "#93A0BD",
    priority: 0,
    description: "Non-urgent issue that can be addressed when time permits",
  },
  medium: {
    label: "Medium",
    color: "#FFD93D",
    priority: 1,
    description: "Needs attention but not immediately critical",
  },
  high: {
    label: "High",
    color: "#DD7A2E",
    priority: 2,
    description: "Requires prompt attention",
  },
  urgent: {
    label: "Urgent",
    color: "#DD4B4B",
    priority: 3,
    description: "Immediate attention required - urgent safety concern",
  },
} as const;

export const REPORT_URGENCY_ORDER = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

// ==================== Helper Functions ====================
export function getCategoryLabel(category: ReportCategory): string {
  return REPORT_CATEGORIES[category]?.label || category;
}

export function getStatusLabel(status: ReportStatus): string {
  return REPORT_STATUSES[status]?.label || status;
}

export function getUrgencyLabel(urgency: ReportUrgency): string {
  return REPORT_URGENCIES[urgency]?.label || urgency;
}

export function getStatusColor(status: ReportStatus): string {
  return REPORT_STATUSES[status]?.color || "#93A0BD";
}

export function getUrgencyColor(urgency: ReportUrgency): string {
  return REPORT_URGENCIES[urgency]?.color || "#93A0BD";
}

export function isUrgent(urgency: ReportUrgency): boolean {
  return urgency === "high" || urgency === "urgent";
}

export function isActive(status: ReportStatus): boolean {
  return status !== "resolved" && status !== "closed";
}
