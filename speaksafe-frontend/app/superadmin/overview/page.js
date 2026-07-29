"use client";
import { RequestsTable } from "@/app/components/admin/RequestsTable";
import { SummaryCard } from "@/app/components/admin/SummaryCard";
import { ErrorMessage } from "@/app/components/common/ErrorMessage";
import { useAdmin } from "@/lib/admin/AdminContext";

function OverviewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-8 bg-gray-100 rounded mb-3 w-40" />
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminOverviewPage() {
  const { signupRequests, stats, loading, error, fetchRegistrations, fetchStats } = useAdmin();

  if (loading) return <OverviewSkeleton />;

  if (error) {
    const onRetry =
      error.type === "forbidden"
        ? undefined
        : () => { fetchRegistrations(); fetchStats(); };

    return (
      <div className="bg-white border border-border rounded-2xl py-16 text-center">
        <ErrorMessage message={error.message} onRetry={onRetry} />
      </div>
    );
  }

  const total = stats?.total ?? signupRequests.length;
  const pending = stats?.pending ?? signupRequests.filter((r) => r.status === "Pending").length;
  const approved = stats?.approved ?? signupRequests.filter((r) => r.status === "Approved").length;
  const rejected = stats?.rejected ?? signupRequests.filter((r) => r.status === "Rejected").length;
  const recent = signupRequests.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <SummaryCard label="Total Requests" value={total} iconBg="bg-peri-light" iconColor="text-blue" icon="👥" />
        <SummaryCard label="Pending Approval" value={pending} iconBg="bg-amber-light" iconColor="text-amber" icon="⏳" />
        <SummaryCard label="Approved" value={approved} iconBg="bg-green-light" iconColor="text-green" icon="✔" />
        <SummaryCard label="Rejected" value={rejected} iconBg="bg-red-light" iconColor="text-red" icon="✕" />
      </div>
      <h3 className="text-[15px] font-display text-navy mb-3">Recent Requests</h3>
      <RequestsTable list={recent} />
    </div>
  );
}
