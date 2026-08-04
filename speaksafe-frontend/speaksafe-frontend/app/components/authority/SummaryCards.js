/**
 * SummaryCards displays live counts from the `summary` field of the
 * GET /reports/dashboard response.
 *
 * @param {{ summary: import('./types').ReportSummary }} props
 *   summary.total         – total report count
 *   summary.open          – count of open reports
 *   summary.investigating – count of reports under investigation
 *   summary.resolved      – count of resolved reports
 *   summary.active        – count of active (non-resolved/closed) reports
 */
export function SummaryCards({ summary = {} }) {
  const cards = [
    { label: "Total Reports",      val: summary.total         ?? 0, bg: "bg-peri-light",   c: "text-blue",      icon: "📄" },
    { label: "Open Cases",         val: summary.open          ?? 0, bg: "bg-[#E9ECF7]",   c: "text-text-muted", icon: "○" },
    { label: "Under Investigation",val: summary.investigating ?? 0, bg: "bg-peri-light",   c: "text-blue-dark", icon: "🔍" },
    { label: "Resolved Cases",     val: summary.resolved      ?? 0, bg: "bg-green-light",  c: "text-green",     icon: "✔" },
    { label: "Active Cases",       val: summary.active        ?? 0, bg: "bg-red-light",    c: "text-red",       icon: "⚠" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-border rounded-2xl p-4">
          <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-2.5 ${c.bg} ${c.c}`}>{c.icon}</div>
          <div className="font-display text-[26px] font-bold text-navy">{c.val}</div>
          <div className="text-xs text-text-faint font-semibold mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
}