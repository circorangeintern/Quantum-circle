"use client";

import { useAuthority } from "@/lib/authorities/AuthorityContext";
import { AUTHORITIES, CATEGORIES, URGENCIES } from "@/lib/authorities/data";

export function FilterBar() {
  const { filters, setFilter } = useAuthority();

  return (
    <div className="flex items-center gap-2.5 flex-wrap mb-4">
      <span className="text-xs font-bold text-text-faint">Filter:</span>
      <select
        value={filters.status}
        onChange={(e) => setFilter("status", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All statuses</option>
        {["Open", "Under Investigation", "Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={filters.category}
        onChange={(e) => setFilter("category", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        value={filters.assigned}
        onChange={(e) => setFilter("assigned", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All authorities</option>
        {AUTHORITIES.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select
        value={filters.urgency}
        onChange={(e) => setFilter("urgency", e.target.value)}
        className="w-auto px-3 py-2 text-[12.5px] font-semibold rounded-[10px] text-text-muted border border-border-strong"
      >
        <option value="all">All urgency</option>
        {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
    </div>
  );
}