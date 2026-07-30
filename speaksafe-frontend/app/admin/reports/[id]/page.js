"use client";
import { AuthorityProvider } from "@/lib/authorities/AuthorityContext";
import CaseDetailPage from "@/app/authority/reports/[id]/page";

// School-admin report detail — reuses the same detail page wrapped in AuthorityProvider
export default function AdminReportDetailPage() {
  return (
    <AuthorityProvider>
      <CaseDetailPage />
    </AuthorityProvider>
  );
}
