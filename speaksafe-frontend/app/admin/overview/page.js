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
  const [copied, setCopied] = useState(false);

  const reportLink = school?.id
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "")}/report?school=${school.id}`
    : null;

  function copyLink() {
    if (!reportLink) return;
    navigator.clipboard.writeText(reportLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

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

      {/* Report link card */}
      {reportLink && (
        <div className="mb-6 bg-peri-light border border-blue/20 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-navy">Student Report Link</p>
            <p className="text-[12px] text-text-faint mt-0.5 truncate">{reportLink}</p>
            <p className="text-[11.5px] text-text-faint mt-0.5">Share this link with students so their reports reach your school.</p>
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 bg-blue hover:bg-blue-dark text-white text-[12.5px] font-bold px-4 py-2 rounded-[10px]"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}

      {/* Summary cards — school-wide */}
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
