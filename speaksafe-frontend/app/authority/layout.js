"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Sidebar } from "../components/authority/Sidebar";
import { Topbar } from "../components/authority/Topbar";
import { AuthorityProvider } from "@/lib/authorities/AuthorityContext";
import { useAuth } from "@/app/providers/AuthProvider";


function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role === "school-admin") {
      // school-admin belongs in /admin, not here
      router.replace("/admin/overview");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === "school-admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue" aria-label="Loading" />
      </div>
    );
  }

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
