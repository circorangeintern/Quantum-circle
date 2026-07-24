import StatusBadge from "./StatusBadge";
import Timeline from "./Timeline";

export default function StatusCard({ report }) {
  return (
    <div className="mt-8 border rounded-xl p-6 space-y-4">
      <div>
        <p className="text-gray-500">Tracking ID</p>
        <h3>{report.trackingId}</h3>
      </div>

      <div>
        <p className="text-gray-500">Status</p>
        <StatusBadge status={report.status} />
      </div>

      <div>
        <p className="text-gray-500">Category</p>
        <h3>{report.category}</h3>
      </div>

      <div>
        <p className="text-gray-500">Submitted</p>
        <h3>{report.submitted}</h3>
      </div>

      <Timeline updates={report.updates} />
    </div>
  );
}
