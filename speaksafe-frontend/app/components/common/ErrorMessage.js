"use client";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Shared inline error component.
 * @param {string} message - Error text to display
 * @param {function} [onRetry] - If provided, shows a Retry button
 * @param {"403"|"404"|"server_error"|string} [type] - Controls the message prefix
 */
export function ErrorMessage({ message, onRetry, type }) {
  const display =
    type === "forbidden"
      ? "Permission denied."
      : type === "not_found"
      ? message || "Not found."
      : message || "Something went wrong.";

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{display}</span>
      {onRetry && type !== "forbidden" && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 font-medium underline hover:no-underline"
          aria-label="Retry"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}
