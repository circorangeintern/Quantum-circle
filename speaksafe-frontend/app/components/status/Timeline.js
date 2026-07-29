function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Timeline({ timeline }) {
  if (!Array.isArray(timeline) || timeline.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Timeline</h3>

      <ol aria-label="Report timeline" className="space-y-0">
        {timeline.map((item, index) => (
          <li key={index} className="flex gap-3">
            <div className="flex flex-col items-center" aria-hidden="true">
              <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0 mt-1" />
              {index !== timeline.length - 1 && (
                <div className="w-[2px] flex-1 bg-gray-300 mt-1" />
              )}
            </div>

            <div className="pb-6">
              <p className="text-xs text-gray-500">
                {formatDate(item.date)}
              </p>
              {item.event && (
                <p className="font-medium capitalize">
                  {item.event.replace(/-/g, " ")}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-gray-700">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
