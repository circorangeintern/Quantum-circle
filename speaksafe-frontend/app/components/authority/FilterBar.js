"use client";

import { useAuthority } from "@/lib/authorities/AuthorityContext";

// OpenAPI-defined enum values for backend query parameters
const CATEGORIES = [
  "bullying",
  "harassment",
  "violence",
  "discrimination",
  "mental-health",
  "safety-hazard",
  "other",
];

const URGENCIES = ["low", "medium", "high", "urgent"];

const STATUSES = ["new", "open", "investigating", "resolved", "closed"];

export function FilterBar() {
  const { filters, setFilter } = useAuthority();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2.5 flex-wrap mb-4">
      <span className="text-xs font-bold text-text-faint">Filter:</span>
      <select
        value={filters.status}
        onChange={(e) => setFilter("status", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={filters.category}
        onChange={(e) => setFilter("category", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " ")}
          </option>
        ))}
      </select>
      <select
        value={filters.urgency}
        onChange={(e) => setFilter("urgency", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All urgency</option>
        {URGENCIES.map((u) => (
          <option key={u} value={u}>
            {u.charAt(0).toUpperCase() + u.slice(1)}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
        placeholder="Search reports..."
        className="px-3 py-2 text-[12.5px] rounded-[10px] text-text-muted border border-border-strong min-w-[150px]"
      />
    </div>
  );
}
