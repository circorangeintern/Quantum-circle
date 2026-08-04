const statusStyles = {
  Open: "bg-[#E9ECF7] text-text-muted",
  "Under Investigation": "bg-peri-light text-blue-dark",
  Resolved: "bg-green-light text-green",
};
const urgencyStyles = {
  Low: "bg-green-light text-green",
  Medium: "bg-amber-light text-amber",
  High: "bg-orange-light text-orange",
  Urgent: "bg-red-light text-red",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${statusStyles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${urgencyStyles[urgency]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {urgency}
    </span>
  );
}

export function AnonBadge({ anon }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${anon ? "bg-[#EEF0F6] text-text-muted" : "bg-peri-light text-blue-dark"}`}
    >
      {anon ? "Anonymous" : "Identified"}
    </span>
  );
}
