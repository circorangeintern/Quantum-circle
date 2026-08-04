"use client";

import { useEffect } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function PostHogProvider({ children }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    // Dynamically import so posthog-js only ever loads client-side
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) return;
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        defaults: "2026-05-30",
        // Anonymous events — no persistent person profiles created
        person_profiles: "identified_only",
      });
    });
  }, []);

  return children;
}
