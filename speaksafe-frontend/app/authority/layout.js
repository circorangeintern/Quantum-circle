"use client";
import { usePathname } from "next/navigation";

import { Sidebar } from "../components/authority/Sidebar";
import { Topbar } from "../components/authority/Topbar";
import { AuthorityProvider } from "@/lib/authorities/AuthorityContext";


function Shell({ children }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col min-w-0 flex-1">
        <Topbar pathname={pathname} />
        <div className="p-4 sm:p-6 lg:p-7 pb-16 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function AuthorityLayout({ children }) {
  return (
    <AuthorityProvider>
      <Shell>{children}</Shell>
    </AuthorityProvider>
  );
}