export function SummaryCards({ reports }) {
  const total = reports.length;
  const open = reports.filter((r) => r.status === "Open").length;
  const investigating = reports.filter((r) => r.status === "Under Investigation").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const highPriority = reports.filter((r) => r.urgency === "High" || r.urgency === "Urgent").length;

  const cards = [
    { label: "Total Reports", val: total, bg: "bg-peri-light", c: "text-blue", icon: "📄" },
    { label: "Open Cases", val: open, bg: "bg-[#E9ECF7]", c: "text-text-muted", icon: "○" },
    { label: "Under Investigation", val: investigating, bg: "bg-peri-light", c: "text-blue-dark", icon: "🔍" },
    { label: "Resolved Cases", val: resolved, bg: "bg-green-light", c: "text-green", icon: "✔" },
    { label: "High Priority", val: highPriority, bg: "bg-red-light", c: "text-red", icon: "⚠" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
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