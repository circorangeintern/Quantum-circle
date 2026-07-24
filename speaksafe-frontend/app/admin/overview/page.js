"use client";
import { RequestsTable } from "@/app/components/admin/RequestsTable";
import { SummaryCard } from "@/app/components/admin/SummaryCard";
import { useAdmin } from "@/lib/admin/AdminContext";



export default function OverviewPage() {
  const { signupRequests } = useAdmin();
  const total = signupRequests.length;
  const pending = signupRequests.filter((r) => r.status === "Pending").length;
  const approved = signupRequests.filter((r) => r.status === "Approved").length;
  const rejected = signupRequests.filter((r) => r.status === "Rejected").length;
  const recent = signupRequests.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <SummaryCard
          label="Total Requests"
          value={total}
          iconBg="bg-peri-light"
          iconColor="text-blue"
          icon="👥"
        />
        <SummaryCard
          label="Pending Approval"
          value={pending}
          iconBg="bg-amber-light"
          iconColor="text-amber"
          icon="⏳"
        />
        <SummaryCard
          label="Approved"
          value={approved}
          iconBg="bg-green-light"
          iconColor="text-green"
          icon="✔"
        />
        <SummaryCard
          label="Rejected"
          value={rejected}
          iconBg="bg-red-light"
          iconColor="text-red"
          icon="✕"
        />
      </div>
      <h3 className="text-[15px] font-display text-navy mb-3">
        Recent Requests
      </h3>
      <RequestsTable list={recent} />
    </div>
  );
}
