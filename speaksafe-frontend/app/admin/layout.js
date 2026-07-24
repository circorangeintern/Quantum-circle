"use client";
import { usePathname } from "next/navigation";
import { AdminProvider } from "@/lib/admin/AdminContext";
import { Sidebar } from "../components/admin/Sidebar";
import { Topbar } from "../components/admin/Topbar";


export default function AdminLayout({ children }) {
  const pathname = usePathname();
  return (
    <AdminProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-col min-w-0 flex-1">
          <Topbar pathname={pathname} />
          <div className="p-4 sm:p-6 lg:p-7 pb-16 flex-1">{children}</div>
        </div>
      </div>
    </AdminProvider>
  );
}