"use client";
import { useAdmin } from "@/lib/admin/AdminContext";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";


const links = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/authorities", label: "Authorities" },
  { href: "/admin/settings", label: "School Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdmin();
  const { logout } = useAuth();

  return (
    <>
      {/* backdrop, mobile/tablet only, shown when drawer open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          bg-navy text-white/75 p-5 flex flex-col w-[250px] shrink-0
          fixed inset-y-0 left-0 z-40 transition-transform duration-200
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between pb-5 px-2.5">
          <span className="text-white font-display font-semibold">SpeakSafe</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13.5px] font-semibold mb-1 transition-colors ${
              pathname === l.href
                ? "bg-blue text-white"
                : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <div className="flex-1" />
        <button
          onClick={logout}
          className="px-3.5 py-2.5 text-white/45 text-[13.5px] font-semibold text-left hover:text-white/70"
        >
          Logout
        </button>
      </aside>
    </>
  );
}