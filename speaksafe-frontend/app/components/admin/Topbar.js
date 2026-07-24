"use client";
import { useAdmin } from "@/lib/admin/AdminContext";

const titles = {
  "/admin/overview": "Overview",
  "/admin/requests": "Authority Requests",
  "/admin/authorities": "All Authorities",
};

export function Topbar({ pathname }) {
  const { setSidebarOpen } = useAdmin();

  return (
    <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b border-border bg-white sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-navy p-1 -ml-1"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 className="text-[16px] sm:text-[19px] font-display text-navy flex items-center gap-2 flex-wrap">
          {titles[pathname] ?? "Overview"}
          <span className="hidden sm:inline-flex items-center bg-red-light text-red text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Super Admin
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-3.5">
        <span className="hidden md:block text-right">
          <span className="block text-[13px] font-bold text-navy">System Admin</span>
          <span className="block text-[11px] text-text-faint">Platform Administration</span>
        </span>
        <span className="w-[34px] h-[34px] rounded-full bg-blue text-white flex items-center justify-center text-xs font-bold shrink-0">
          SA
        </span>
      </div>
    </div>
  );
}