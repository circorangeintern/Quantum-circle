const styles = {
  Pending: "bg-amber-light text-amber",
  Approved: "bg-green-light text-green",
  Rejected: "bg-red-light text-red",
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${styles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}