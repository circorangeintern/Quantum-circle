"use client";

import { ReportsTable } from "@/app/components/authority/ReportsTable";
import { SummaryCards } from "@/app/components/authority/SummaryCards";
import { useAuthority } from "@/lib/authorities/AuthorityContext";

export default function DashboardPage() {
  const { reports, summary, loading, error, fetchReports } = useAuthority();

  if (loading) {
    return (
      <div className="animate-pulse space-y-5">
        {/* Skeleton for summary cards */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-4 h-24" />
          ))}
        </div>
        {/* Skeleton for table */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-border rounded-2xl py-16 text-center">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <button
          onClick={() => fetchReports()}
          className="text-blue font-bold text-[13px] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Sort by submittedAt or updatedAt descending for "recent" reports
  const recent = [...reports]
    .sort((a, b) => {
      const dateA = a.submittedAt ?? a.updatedAt ?? a.date ?? "";
      const dateB = b.submittedAt ?? b.updatedAt ?? b.date ?? "";
      return dateA < dateB ? 1 : -1;
    })
    .slice(0, 6);

  return (
    <div>
      <SummaryCards summary={summary} />
      <h3 className="text-[15px] font-display text-navy my-5">Recent Reports</h3>
      <ReportsTable list={recent} />
    </div>
  );
}