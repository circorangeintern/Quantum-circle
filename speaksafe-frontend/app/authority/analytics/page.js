"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { getAnalytics, exportReports } from "@/app/lib/reports";

// ---------------------------------------------------------------------------
// BarRow — single horizontal bar for category / status / urgency charts
// ---------------------------------------------------------------------------
function BarRow({ label, value, max, color = "bg-navy" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-[140px] shrink-0 text-[12.5px] text-text-muted truncate capitalize">
        {label}
      </div>
      <div className="flex-1 h-2.5 rounded-full bg-[#EEF1F8] overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-6 text-right text-[12.5px] font-bold text-navy">
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard — single summary stat tile
// ---------------------------------------------------------------------------
function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-[11.5px] text-text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-3xl font-bold text-navy">{value ?? 0}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LoadingSkeleton — shown while analytics fetch is in-flight
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      {/* stat tiles skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-8 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
      {/* chart skeletons */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-2xl p-5 space-y-3">
          <div className="h-5 bg-gray-100 rounded w-1/3" />
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExportButton — CSV or PDF, triggers blob download
// ---------------------------------------------------------------------------
function ExportButton({ format, label }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportReports(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reports.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${label} exported successfully`);
    } catch {
      toast.error(`Failed to export ${label}. Please try again.`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      aria-label={`Export ${label}`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border
                 bg-white text-navy text-[13px] font-medium hover:bg-gray-50
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                 min-w-[44px] min-h-[44px]"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="w-4 h-4" aria-hidden="true" />
      )}
      {exporting ? "Exporting…" : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AnalyticsPage
// ---------------------------------------------------------------------------
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch {
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Derived data (safe defaults so KPIs render even if API isn't ready) ────
  const totalReports = analytics?.totalReports ?? 0;
  const resolvedReports = analytics?.resolvedReports ?? 0;
  const openReports = analytics?.openReports ?? 0;
  const pendingReports = Math.max(0, totalReports - resolvedReports - openReports);

  const categoryBreakdown = analytics?.categoryBreakdown ?? {};
  const urgencyBreakdown = analytics?.urgencyBreakdown ?? {};
  const monthlyTrend = analytics?.monthlyTrend ?? [];

  const maxCat = Object.values(categoryBreakdown).length
    ? Math.max(...Object.values(categoryBreakdown))
    : 1;
  const maxUrg = Object.values(urgencyBreakdown).length
    ? Math.max(...Object.values(urgencyBreakdown))
    : 1;
  const maxTrend = monthlyTrend.length
    ? Math.max(...monthlyTrend.map((m) => m.count ?? 0))
    : 1;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* ── Page header: title + export buttons (always visible) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base font-display text-navy">Analytics Overview</h2>
        <div className="flex flex-wrap gap-2">
          <ExportButton format="csv" label="Export CSV" />
          <ExportButton format="pdf" label="Export PDF" />
        </div>
      </div>

      {/* ── Error banner (non-blocking — KPIs still render below) ── */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            onClick={fetchAnalytics}
            className="ml-4 font-semibold underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Summary stat tiles ── */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={totalReports} />
            <StatCard label="Resolved" value={resolvedReports} />
            <StatCard label="Open" value={openReports} />
            <StatCard label="Pending" value={pendingReports} />
          </div>

          {/* ── Charts — flex-col at all sizes, lg:grid-cols-2 for wider screens ── */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">

            {/* Category breakdown */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="text-sm font-display text-navy mb-3.5">
                Reports by Category
              </h3>
              {Object.keys(categoryBreakdown).length === 0 ? (
                <p className="text-text-faint text-[12.5px]">No data yet.</p>
              ) : (
                Object.entries(categoryBreakdown).map(([k, v]) => (
                  <BarRow key={k} label={k} value={v} max={maxCat} />
                ))
              )}
            </div>

            {/* Urgency breakdown */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="text-sm font-display text-navy mb-3.5">
                Reports by Urgency
              </h3>
              {Object.keys(urgencyBreakdown).length === 0 ? (
                <p className="text-text-faint text-[12.5px]">No data yet.</p>
              ) : (
                Object.entries(urgencyBreakdown).map(([k, v]) => (
                  <BarRow key={k} label={k} value={v} max={maxUrg} color="bg-peri" />
                ))
              )}
            </div>

            {/* Monthly trend */}
            <div className="bg-white border border-border rounded-2xl p-5 lg:col-span-2">
              <h3 className="text-sm font-display text-navy mb-3.5">
                Monthly Trend
              </h3>
              {monthlyTrend.length === 0 ? (
                <p className="text-text-faint text-[12.5px]">No data yet.</p>
              ) : (
                monthlyTrend.map((m, i) => (
                  <BarRow
                    key={i}
                    label={m.month ?? m.label ?? `Month ${i + 1}`}
                    value={m.count ?? 0}
                    max={maxTrend}
                    color="bg-blue"
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
