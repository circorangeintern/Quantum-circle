"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminProvider } from "@/lib/admin/AdminContext";
import { SuperAdminSidebar } from "../components/admin/SuperAdminSidebar";
import { SuperAdminTopbar } from "../components/admin/SuperAdminTopbar";
import { useAuth } from "@/app/providers/AuthProvider";

function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "system-admin") {
      // school-admin → /admin, school-staff → /authority
      if (user.role === "school-admin") {
        router.replace("/admin/overview");
      } else {
        router.replace("/authority/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "system-admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <div className="flex flex-col min-w-0 flex-1">
        <SuperAdminTopbar pathname={pathname} />
        <div className="p-4 sm:p-6 lg:p-7 pb-16 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function SuperAdminLayout({ children }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
