export default function StatusBadge({ status }) {
  const styles = {
    // API status values
    new: "bg-blue-100 text-blue-700",
    open: "bg-yellow-100 text-yellow-700",
    investigating: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
    // Legacy display values (kept for backwards compatibility)
    Open: "bg-yellow-100 text-yellow-700",
    Reviewing: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
}
