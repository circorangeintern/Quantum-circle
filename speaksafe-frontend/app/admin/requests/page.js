"use client";
import { RequestsTable } from "@/app/components/admin/RequestsTable";
import { ErrorMessage } from "@/app/components/common/ErrorMessage";
import { useAdmin } from "@/lib/admin/AdminContext";

function RequestsSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2">
      <div className="h-10 bg-gray-100 rounded-xl w-full" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
      ))}
    </div>
  );
}

export default function RequestsPage() {
  const { signupRequests, loading, error, fetchRegistrations } = useAdmin();

  if (loading) {
    return <RequestsSkeleton />;
  }

  if (error) {
    const onRetry =
      error.type === "forbidden"
        ? undefined
        : () => fetchRegistrations();

    return (
      <div className="bg-white border border-border rounded-2xl py-16 text-center">
        <ErrorMessage message={error.message} onRetry={onRetry} />
      </div>
    );
  }

  return <RequestsTable list={signupRequests} />;
}
