"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReportForm from "@/app/components/Report/ReportForm";

function ReportPageContent() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("school");
  return <ReportForm schoolId={schoolId} />;
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportPageContent />
    </Suspense>
  );
}
