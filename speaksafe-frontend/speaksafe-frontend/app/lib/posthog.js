// Safe posthog wrapper — only captures events in the browser.
// Import this instead of posthog-js directly to avoid SSR issues.

export function capture(event, properties) {
  if (typeof window === "undefined") return;
  import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) {
      posthog.capture(event, properties);
    }
  });
}
