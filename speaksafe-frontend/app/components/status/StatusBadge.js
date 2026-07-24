export default function StatusBadge({ status }) {
  const styles = {
    Open: "bg-yellow-100 text-yellow-700",
    Reviewing: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
