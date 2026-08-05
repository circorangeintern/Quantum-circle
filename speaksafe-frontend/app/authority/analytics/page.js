"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { getAnalytics, exportReports } from "@/app/lib/reports";
import axiosInstance from "@/app/lib/axios";

const CHARTS_BASE_URL = process.env.NEXT_PUBLIC_ATLAS_CHARTS_BASE_URL;
const CHARTS_EMBEDDING_ID = process.env.NEXT_PUBLIC_ATLAS_CHARTS_EMBEDDING_ID;

// ---------------------------------------------------------------------------
// MongoChart — single authenticated MongoDB Charts iframe embed
// ---------------------------------------------------------------------------
function MongoChart({ chartId, title, token, height = 300 }) {
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);

  const src = CHARTS_BASE_URL && chartId
    ? `${CHARTS_BASE_URL}/embed/charts?id=${chartId}&autoRefresh=true&attribution=false`
    : null;

  // Send the JWT to the iframe once it loads
  const handleLoad = useCallback(() => {
    if (!token || !iframeRef.current) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { token, chartId },
        CHARTS_BASE_URL
      );
    } catch {
      // cross-origin post — charts SDK handles token via URL params as fallback
    }
    setReady(true);
  }, [token, chartId]);

  if (!src) return null;

  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3">
      {title && (
        <h3 className="text-sm font-display text-navy">{title}</h3>
      )}
      <div className="relative" style={{ height }}>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin text-peri" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={token ? `${src}&jwt=${encodeURIComponent(token)}` : src}
          onLoad={handleLoad}
          title={title || "Chart"}
          className="w-full h-full rounded-xl border-0"
          style={{ height }}
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BarRow — single horizontal bar for summary charts
// ---------------------------------------------------------------------------
function BarRow({ label, value, max, color = "bg-navy" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-[140px] shrink-0 text-[12.5px] text-text-muted truncate capitalize">
        {label}
      </div>
      <div className="flex-1 h-2.5 rounded-full bg-[#EEF1F8] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-6 text-right text-[12.5px] font-bold text-navy">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-[11.5px] text-text-muted uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold text-navy">{value ?? 0}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LoadingSkeleton
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-8 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-2xl p-5 h-[320px]">
          <div className="h-5 bg-gray-100 rounded w-1/3 mb-4" />
          <div className="h-full bg-gray-50 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExportButton
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
      {exporting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
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
  const [chartsToken, setChartsToken] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, tokenRes] = await Promise.allSettled([
        getAnalytics(),
        axiosInstance.get("/auth/charts-token"),
      ]);

      if (analyticsData.status === "fulfilled") setAnalytics(analyticsData.value);
      if (tokenRes.status === "fulfilled") setChartsToken(tokenRes.value?.data?.data?.token ?? tokenRes.value?.data?.token ?? null);
      if (analyticsData.status === "rejected") setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const overview = analytics?.data?.overview ?? analytics?.overview ?? {};
  const breakdown = analytics?.data?.breakdown ?? analytics?.breakdown ?? {};
  const trends = analytics?.data?.trends ?? analytics?.trends ?? {};

  const totalReports = overview?.totalReports ?? 0;
  const resolvedReports = overview?.resolvedReports ?? 0;
  const openReports = overview?.activeReports ?? 0;
  const pendingReports = Math.max(0, totalReports - resolvedReports - openReports);

  const categoryBreakdown = Object.fromEntries((breakdown?.categories ?? []).map((c) => [c._id, c.count]));
  const urgencyBreakdown = Object.fromEntries((breakdown?.urgencies ?? []).map((u) => [u._id, u.count]));
  const monthlyTrend = (trends?.monthly ?? []).map((m) => ({
    label: `${m._id?.year ?? ""}-${String(m._id?.month ?? "").padStart(2, "0")}`,
    count: m.count ?? 0,
  }));

  const maxCat = Object.values(categoryBreakdown).length ? Math.max(...Object.values(categoryBreakdown)) : 1;
  const maxUrg = Object.values(urgencyBreakdown).length ? Math.max(...Object.values(urgencyBreakdown)) : 1;
  const maxTrend = monthlyTrend.length ? Math.max(...monthlyTrend.map((m) => m.count ?? 0)) : 1;

  const hasCharts = !!CHARTS_BASE_URL && !!CHARTS_EMBEDDING_ID;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base font-display text-navy">Analytics Overview</h2>
        <div className="flex flex-wrap gap-2">
          <ExportButton format="csv" label="Export CSV" />
          <ExportButton format="pdf" label="Export PDF" />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button onClick={fetchData} className="ml-4 font-semibold underline hover:no-underline shrink-0">Retry</button>
        </div>
      )}

      {loading ? <LoadingSkeleton /> : (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={totalReports} />
            <StatCard label="Resolved" value={resolvedReports} />
            <StatCard label="Open" value={openReports} />
            <StatCard label="Pending" value={pendingReports} />
          </div>

          {/* MongoDB Charts embeds */}
          {hasCharts && (
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-text-faint">Live Charts</p>
              <MongoChart
                chartId={CHARTS_EMBEDDING_ID}
                title="Reports Dashboard"
                token={chartsToken}
                height={400}
              />
            </div>
          )}

          {/* Fallback bar charts from API */}
          <div className="flex flex-col gap-4">
            {hasCharts && <p className="text-[11px] font-bold uppercase tracking-widest text-text-faint">Summary Breakdown</p>}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-display text-navy mb-3.5">Reports by Category</h3>
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <p className="text-text-faint text-[12.5px]">No data yet.</p>
                ) : (
                  Object.entries(categoryBreakdown).map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxCat} />)
                )}
              </div>

              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-display text-navy mb-3.5">Reports by Urgency</h3>
                {Object.keys(urgencyBreakdown).length === 0 ? (
                  <p className="text-text-faint text-[12.5px]">No data yet.</p>
                ) : (
                  Object.entries(urgencyBreakdown).map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxUrg} color="bg-peri" />)
                )}
              </div>

              <div className="bg-white border border-border rounded-2xl p-5 lg:col-span-2">
                <h3 className="text-sm font-display text-navy mb-3.5">Monthly Trend</h3>
                {monthlyTrend.length === 0 ? (
                  <p className="text-text-faint text-[12.5px]">No data yet.</p>
                ) : (
                  monthlyTrend.map((m, i) => <BarRow key={i} label={m.label} value={m.count ?? 0} max={maxTrend} color="bg-blue" />)
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
