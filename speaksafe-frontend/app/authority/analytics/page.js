"use client";
import { useAuthority } from "@/lib/authorities/AuthorityContext";

function BarRow({ label, value, max, color = "bg-navy" }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-[150px] shrink-0 text-[12.5px] text-text-muted truncate">{label}</div>
      <div className="flex-1 h-2.5 rounded-full bg-[#EEF1F8] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <div className="w-6 text-right text-[12.5px] font-bold text-navy">{value}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { reports } = useAuthority();

  const cats = {};
  reports.forEach((r) => (cats[r.category] = (cats[r.category] || 0) + 1));
  const maxCat = Math.max(...Object.values(cats));

  const statuses = { Open: 0, "Under Investigation": 0, Resolved: 0 };
  reports.forEach((r) => statuses[r.status]++);
  const maxStat = Math.max(...Object.values(statuses));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="text-sm font-display text-navy mb-3.5">Reports by Category</h3>
        {Object.entries(cats).map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxCat} />)}
      </div>
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="text-sm font-display text-navy mb-3.5">Reports by Status</h3>
        {Object.entries(statuses).map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxStat} color="bg-peri" />)}
      </div>
    </div>
  );
}