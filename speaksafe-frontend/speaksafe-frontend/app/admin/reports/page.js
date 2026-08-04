"use client";
import { FilterBar } from "@/app/components/authority/FilterBar";
import { ReportsTable } from "@/app/components/authority/ReportsTable";
import { ErrorMessage } from "@/app/components/common/ErrorMessage";
import { AuthorityProvider, useAuthority } from "@/lib/authorities/AuthorityContext";

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

function ReportsContent() {
  const { reports, loading, error, fetchReports } = useAuthority();

  if (loading) return <ReportsSkeleton />;

  if (error) {
    return (
      <div>
        <FilterBar />
        <div className="bg-white border border-border rounded-2xl py-16 text-center">
          <ErrorMessage
            message={error.message}
            onRetry={error.type !== "forbidden" ? () => fetchReports() : undefined}
          />
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

export default function AdminReportsPage() {
  return (
    <AuthorityProvider>
      <ReportsContent />
    </AuthorityProvider>
  );
}
