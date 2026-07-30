"use client";
import { useEffect, useState } from "react";
import { SummaryCard } from "@/app/components/admin/SummaryCard";
import { ErrorMessage } from "@/app/components/common/ErrorMessage";
import { useAuth } from "@/app/providers/AuthProvider";
import { getDashboardReports } from "@/app/lib/reports";
import Link from "next/link";

function OverviewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
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

export default function SchoolAdminOverviewPage() {
  const { user, school } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getDashboardReports({ limit: 5 });
        const result = data?.data ?? data;
        setSummary(result?.summary ?? null);
        setRecentReports(result?.reports ?? []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load overview.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <OverviewSkeleton />;

  if (error) {
    return (
      <div className="bg-white border border-border rounded-2xl py-16 text-center">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-[20px] font-display font-bold text-navy">
          Welcome back, {user?.name?.split(" ")[0] ?? "Admin"}
        </h2>
        {school && (
          <p className="text-[13px] text-text-faint mt-0.5">{school.name}</p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <SummaryCard label="Total Reports" value={summary?.total ?? 0} iconBg="bg-peri-light" iconColor="text-blue" icon="📋" />
        <SummaryCard label="New" value={summary?.new ?? 0} iconBg="bg-amber-light" iconColor="text-amber" icon="🔔" />
        <SummaryCard label="Investigating" value={summary?.investigating ?? 0} iconBg="bg-blue/10" iconColor="text-blue" icon="🔍" />
        <SummaryCard label="Resolved" value={summary?.resolved ?? 0} iconBg="bg-green-light" iconColor="text-green" icon="✔" />
      </div>

      {/* Recent reports */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-display text-navy font-semibold">Recent Reports</h3>
        <Link href="/admin/reports" className="text-[12.5px] text-blue font-semibold hover:underline">
          View all →
        </Link>
      </div>

      {recentReports.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-12 text-center text-text-faint text-[13.5px]">
          No reports yet.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="bg-[#FAFBFE]">
                  {["Ref Code", "Title", "Category", "Status", "Submitted"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAFBFE]">
                    <td className="px-4 py-3 font-mono text-[12px] text-navy border-b border-border">{r.referenceCode}</td>
                    <td className="px-4 py-3 text-[13px] text-navy border-b border-border truncate max-w-[180px]">{r.title}</td>
                    <td className="px-4 py-3 text-[12px] text-text-faint capitalize border-b border-border">{r.category}</td>
                    <td className="px-4 py-3 border-b border-border">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        r.status === "new" ? "bg-amber-light text-amber" :
                        r.status === "resolved" ? "bg-green-light text-green" :
                        r.status === "investigating" ? "bg-peri-light text-blue" :
                        "bg-gray-100 text-text-faint"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-faint border-b border-border">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
