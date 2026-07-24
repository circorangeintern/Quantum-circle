"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthority } from "@/lib/authorities/AuthorityContext";

const titles = {
  "/authority/dashboard": "Dashboard",
  "/authority/reports": "Reports",
  "/authority/cases": "Cases",
  "/authority/notifications": "Notifications",
  "/authority/users": "Users",
  "/authority/analytics": "Analytics",
  "/authority/settings": "Settings",
};

function initialsOf(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ pathname }) {
  const { currentUser, notifications, setSidebarOpen } = useAuthority();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const title =
    pathname.startsWith("/authority/reports/") &&
    pathname !== "/authority/reports"
      ? "Case Details"
      : (titles[pathname] ?? "Dashboard");

  return (
    <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b border-border bg-white sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-navy p-1 -ml-1 shrink-0"
          aria-label="Open menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 className="text-[16px] sm:text-[19px] font-display text-navy truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className="w-[38px] h-[38px] rounded-[10px] border border-border bg-white flex items-center justify-center relative text-text-muted hover:border-blue hover:text-blue"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red border border-white" />
          </button>
          {notifOpen && (
            <div className="absolute top-12 right-0 bg-white border border-border rounded-2xl shadow-2xl w-[85vw] max-w-[300px] z-50">
              <div className="px-4 py-3.5 border-b border-border text-[13px] font-bold text-navy">
                Notifications
              </div>
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 px-4 py-3 border-b border-border last:border-none"
                >
                  <div className="w-8 h-8 rounded-[9px] bg-peri-light text-blue shrink-0 flex items-center justify-center">
                    🔔
                  </div>
                  <div>
                    <p className="m-0 text-[12.5px] text-text leading-snug">
                      {n.text}
                    </p>
                    <span className="text-[11px] text-text-faint">
                      {n.time}
                    </span>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <Link
                  href="/authority/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-[12.5px] font-bold text-blue"
                >
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5"
          >
            <span className="w-[34px] h-[34px] rounded-full bg-blue text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initialsOf(currentUser.name)}
            </span>
            <span className="hidden md:block text-left">
              <span className="block text-[13px] font-bold text-navy">
                {currentUser.name}
              </span>
              <span className="block text-[11px] text-text-faint">
                {currentUser.role}
              </span>
            </span>
          </button>
          {profileOpen && (
            <div className="absolute top-12 right-0 bg-white border border-border rounded-2xl shadow-2xl w-[190px] p-2 z-50">
              <Link
                href="/authority/settings"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[13px] font-semibold text-text hover:bg-peri-light hover:text-blue"
              >
                View Profile
              </Link>
              <Link
                href="/authority/settings"
                onClick={() => setProfileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[13px] font-semibold text-text hover:bg-peri-light hover:text-blue"
              >
                Account Settings
              </Link>
              <Link
                href="/"
                className="block px-3 py-2.5 rounded-lg text-[13px] font-semibold text-text hover:bg-peri-light hover:text-blue"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
