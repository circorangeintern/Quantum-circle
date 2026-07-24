"use client";

import { useAuthority } from "@/lib/authorities/AuthorityContext";


export default function NotificationsPage() {
  const { notifications } = useAuthority();
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {notifications.map((n, i) => (
        <div key={i} className="flex gap-3 px-4 sm:px-5 py-4 border-b border-border last:border-none">
          <div className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[9px] bg-peri-light text-blue shrink-0 flex items-center justify-center">🔔</div>
          <div>
            <p className="m-0 text-[13.5px] text-text leading-snug">{n.text}</p>
            <span className="text-[11px] text-text-faint">{n.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}