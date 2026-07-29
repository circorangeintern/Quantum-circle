"use client";
import { useAdmin } from "@/lib/admin/AdminContext";
import { useAuth } from "@/app/providers/AuthProvider";

const titles = {
  "/admin/overview": "Overview",
  "/admin/reports": "Reports",
  "/admin/authorities": "Authorities",
  "/admin/settings": "School Settings",
};

function initialsOf(name) {
  if (!name) return "SA";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ pathname }) {
  const { setSidebarOpen } = useAdmin();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b border-border bg-white sticky top-0 z-20 overflow-hidden">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-navy p-1 -ml-1 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 className="text-[16px] sm:text-[19px] font-display text-navy flex items-center gap-2 flex-wrap min-w-0">
          <span className="truncate">{titles[pathname] ?? "Overview"}</span>
          <span className="hidden sm:inline-flex items-center bg-blue/10 text-blue text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0">
            School Admin
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        <span className="hidden md:block text-right overflow-hidden">
          <span className="block text-[13px] font-bold text-navy truncate max-w-[120px]">
            {user?.name ?? "System Admin"}
          </span>
          <span className="block text-[11px] text-text-faint">
            {user?.role ?? "Platform Administration"}
          </span>
        </span>
        <span className="w-[34px] h-[34px] rounded-full bg-blue text-white flex items-center justify-center text-xs font-bold shrink-0">
          {initialsOf(user?.name)}
        </span>
      </div>
    </div>
  );
}
