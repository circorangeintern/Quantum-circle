/**
 * Generic page-level skeleton used while data is loading.
 * Renders a simple animate-pulse placeholder layout.
 */
export default function PageSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading">
      {/* Header bar */}
      <div className="h-8 w-48 rounded bg-slate-200" />
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded bg-slate-100" />
      ))}
    </div>
  );
}
