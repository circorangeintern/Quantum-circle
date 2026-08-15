"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import { getAnalytics, exportReports } from "@/app/lib/reports";
import api from "@/app/lib/axios";

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
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-8 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-border rounded-2xl p-5 h-[820px]">
        <div className="h-5 bg-gray-100 rounded w-1/4 mb-4" />
        <div className="h-full bg-gray-50 rounded-xl" />
      </div>
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
// AtlasChartsDashboard — SDK authenticated embed
// ---------------------------------------------------------------------------
function AtlasChartsDashboard() {
  const containerRef = useRef(null);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const sdk = new ChartsEmbedSDK({
      baseUrl: process.env.NEXT_PUBLIC_ATLAS_CHARTS_BASE_URL,
    });

    const dashboard = sdk.createDashboard({
      dashboardId: process.env.NEXT_PUBLIC_ATLAS_CHARTS_EMBEDDING_ID,
      height: "800px",
      widthMode: "scale",
      showAttribution: false,
      getUserToken: async () => {
        const res = await api.get("/auth/charts-token");
        return res.data.data.token;
      },
    });

    dashboard.render(containerRef.current).catch((err) => {
      console.error("MongoDB Dashboard render error:", err);
      setRenderError(true);
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  if (renderError) {
    return (
      <div className="flex items-center justify-center h-[800px] text-sm text-red-500">
        Failed to load dashboard. Please try again later.
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}

// ---------------------------------------------------------------------------
// AnalyticsPage
// ---------------------------------------------------------------------------
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch {
      setError("Failed to load analytics summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const overview = analytics?.data?.overview ?? analytics?.overview ?? {};
  const totalReports = overview?.totalReports ?? 0;
  const resolvedReports = overview?.resolvedReports ?? 0;
  const openReports = overview?.activeReports ?? 0;
  const pendingReports = Math.max(0, totalReports - resolvedReports - openReports);

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
          {/* KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={totalReports} />
            <StatCard label="Resolved" value={resolvedReports} />
            <StatCard label="Open" value={openReports} />
            <StatCard label="Pending" value={pendingReports} />
          </div>

          {/* MongoDB Charts SDK authenticated embed */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-faint px-5 pt-5 pb-3">
              Live Dashboard
            </p>
            <AtlasChartsDashboard />
          </div>

          {/* PostHog — link out */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-faint mb-3">
              Platform Insights
            </p>
            <p className="text-[13px] text-text-muted mb-4">
              View real-time platform usage analytics powered by PostHog.
            </p>
            <a
              href="https://us.posthog.com/shared/g8KfpiCHaHfmclIXrX5Oxs03OVgXzA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue hover:bg-blue-dark text-white text-[13px] font-bold px-4 py-2.5 rounded-[10px] transition-colors"
            >
              Open PostHog Dashboard ↗
            </a>
          </div>
        </>
      )}
    </div>
  );
}
