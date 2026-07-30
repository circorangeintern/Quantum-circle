"use client";

import { useAuthority } from "@/lib/authorities/AuthorityContext";

/**
 * Derive notification-like events from live report data.
 * Per Requirement 9.3: where no dedicated notifications endpoint is available,
 * the app displays locally-computed events based on fetched report data.
 */
function deriveNotifications(reports) {
  if (!reports?.length) return [];

  const events = [];

  reports.forEach((report) => {
    const id = report.id;
    const code = report.referenceCode ?? id;

    if (report.status === "new") {
      events.push({
        id: `new-${id}`,
        text: `New report submitted: "${report.title ?? code}"`,
        time: report.submittedAt
          ? new Date(report.submittedAt).toLocaleDateString()
          : "Recently",
      });
    }

    if (report.urgency === "urgent" || report.urgency === "high") {
      events.push({
        id: `urgent-${id}`,
        text: `${report.urgency === "urgent" ? "Urgent" : "High-urgency"} report requires attention: "${report.title ?? code}"`,
        time: report.updatedAt
          ? new Date(report.updatedAt).toLocaleDateString()
          : "Recently",
      });
    }
  });

  return events;
}

export default function NotificationsPage() {
  const { reports, loading } = useAuthority();

  const notifications = deriveNotifications(reports);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-6 animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="bg-white border border-border rounded-2xl py-16 text-center">
        <p className="text-text-faint text-sm">No notifications at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex gap-3 px-4 sm:px-5 py-4 border-b border-border last:border-none"
        >
          <div className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[9px] bg-peri-light text-blue shrink-0 flex items-center justify-center">
            🔔
          </div>
          <div>
            <p className="m-0 text-[13.5px] text-text leading-snug">{n.text}</p>
            <span className="text-[11px] text-text-faint">{n.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
