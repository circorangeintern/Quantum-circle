export function SummaryCard({ label, value, bg, color, icon }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: bg, color }}>
          {icon}
        </div>
      </div>
      <div className="font-display text-[26px] font-bold text-navy">{value}</div>
      <div className="text-xs text-text-faint font-semibold mt-0.5">{label}</div>
    </div>
  );
}