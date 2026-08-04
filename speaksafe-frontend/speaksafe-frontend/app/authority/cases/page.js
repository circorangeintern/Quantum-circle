"use client";
import { useAuthority } from "@/lib/authorities/AuthorityContext";

import { FilterBar } from "@/app/components/authority/FilterBar";
import { ReportsTable } from "@/app/components/authority/ReportsTable";

export default function CasesPage() {
  const { reports, loading, error, fetchReports } = useAuthority();

  // "active" cases are all non-resolved/non-closed reports.
  // Filtering is handled server-side via query params, so we render whatever
  // the context returns from the backend. The FilterBar lets users narrow by status.
  if (loading) {
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

  if (error) {
    return (
      <div>
        <FilterBar />
        <div className="bg-white border border-border rounded-2xl py-16 text-center">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchReports()}
            className="text-blue font-bold text-[13px] underline"
          >
            Retry
          </button>
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
