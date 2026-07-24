"use client";

import { FilterBar } from "@/app/components/authority/FilterBar";
import { ReportsTable } from "@/app/components/authority/ReportsTable";
import { useAuthority } from "@/lib/authorities/AuthorityContext";

export default function ReportsPage() {
  const { reports, applyFilters } = useAuthority();
  return (
    <div>
      <FilterBar />
      <ReportsTable list={applyFilters(reports)} />
    </div>
  );
}
