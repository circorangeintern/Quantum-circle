"use client";

/**
 * A simple retry button that calls `onRetry` when clicked.
 *
 * @param {function} onRetry        - Called when the button is clicked
 * @param {string}   [label]        - Button label (defaults to "Try again")
 */
export function RetryButton({ onRetry, label = "Try again" }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="text-blue font-bold text-[13px] underline hover:opacity-80 transition-opacity"
      aria-label={label}
    >
      {label}
    </button>
  );
}
