"use client";

import { FilterBar } from "@/app/components/authority/FilterBar";
import { ReportsTable } from "@/app/components/authority/ReportsTable";
import { ErrorMessage } from "@/app/components/common/ErrorMessage";
import { useAuthority } from "@/lib/authorities/AuthorityContext";

function ReportsSkeleton() {
  return (
    <div>
      <FilterBar />
      <div className="bg-white border border-border rounded-2xl p-6 animate-pulse space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { reports, loading, error, fetchReports } = useAuthority();

  if (loading) {
    return <ReportsSkeleton />;
  }

  if (error) {
    // 403 — permission denied, no retry
    if (error.type === "forbidden") {
      return (
        <div>
          <FilterBar />
          <div className="bg-white border border-border rounded-2xl py-16 text-center">
            <ErrorMessage message={error.message} />
          </div>
        </div>
      );
    }

    // 404 — not found (resource-specific message)
    if (error.type === "not_found") {
      return (
        <div>
          <FilterBar />
          <div className="bg-white border border-border rounded-2xl py-16 text-center">
            <ErrorMessage message="No reports found." onRetry={() => fetchReports()} />
          </div>
        </div>
      );
    }

    // 5xx / network — something went wrong + retry
    return (
      <div>
        <FilterBar />
        <div className="bg-white border border-border rounded-2xl py-16 text-center">
          <ErrorMessage message={error.message} onRetry={() => fetchReports()} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <FilterBar />
      <ReportsTable list={reports} />
    </div>
  );
}
