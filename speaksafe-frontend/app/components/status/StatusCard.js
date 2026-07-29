import StatusBadge from "./StatusBadge";
import Timeline from "./Timeline";

function formatDate(iso) {
  if (!iso) return "—";
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

export default function StatusCard({ report, referenceCode }) {
  return (
    <div className="mt-8 border rounded-xl p-6 space-y-4">
      {referenceCode && (
        <div>
          <p className="text-sm text-gray-500">Reference Code</p>
          <p className="font-semibold font-mono">{referenceCode}</p>
        </div>
      )}

      <div>
        <p className="text-sm text-gray-500">Title</p>
        <p className="font-semibold">{report.title}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Status</p>
        <StatusBadge status={report.status} />
      </div>

      <div>
        <p className="text-sm text-gray-500">Category</p>
        <p className="capitalize">{report.category}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Submitted</p>
        <p>{formatDate(report.submittedAt)}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Last Updated</p>
        <p>{formatDate(report.updatedAt)}</p>
      </div>

      {Array.isArray(report.timeline) && report.timeline.length > 0 && (
        <Timeline timeline={report.timeline} />
      )}
    </div>
  );
}
