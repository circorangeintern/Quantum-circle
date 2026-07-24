"use client";

import { ReportsTable } from "@/app/components/authority/ReportsTable";
import { SummaryCards } from "@/app/components/authority/SummaryCards";
import { useAuthority } from "@/lib/authorities/AuthorityContext";


export default function DashboardPage() {
  const { reports } = useAuthority();
  const recent = [...reports].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  return (
    <div>
      <SummaryCards reports={reports} />
      <h3 className="text-[15px] font-display text-navy my-5">Recent Reports</h3>
      <ReportsTable list={recent} />
    </div>
  );
}