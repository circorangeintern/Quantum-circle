"use client";

/**
 * Reusable skeleton placeholder using `animate-pulse`.
 * Pass a `className` to control the size and layout of the placeholder.
 *
 * @param {string} [className] - Tailwind classes for sizing / layout (e.g. "h-10 w-full rounded-xl")
 */
export function Skeleton({ className = "h-10 w-full rounded-xl" }) {
  return <div className={`animate-pulse bg-gray-100 ${className}`} />;
}

/**
 * A list of skeleton rows, useful for table / list placeholders.
 *
 * @param {number} [rows]        - Number of skeleton rows to render (default: 6)
 * @param {string} [rowClassName] - className forwarded to each Skeleton row
 */
export function SkeletonList({ rows = 6, rowClassName = "h-12 w-full rounded-xl" }) {
  return (
    <div className="animate-pulse flex flex-col gap-2">
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
  );
}
