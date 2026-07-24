"use client";
import { useAuthority } from "@/lib/authorities/AuthorityContext";


import { FilterBar } from "@/app/components/authority/FilterBar";
import { ReportsTable } from "@/app/components/authority/ReportsTable";

export default function CasesPage() {
  const { reports, applyFilters } = useAuthority();
  const active = reports.filter((r) => r.status !== "Resolved");
  return (
    <div>
      <FilterBar />
      <ReportsTable list={applyFilters(active)} />
    </div>
  );
}
