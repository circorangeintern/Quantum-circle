"use client";
import { useRouter } from "next/navigation";
import { StatusBadge, UrgencyBadge, AnonBadge } from "./Badge";

export function ReportsTable({ list }) {
  const router = useRouter();

  if (list.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl">
        <div className="py-16 text-center text-text-faint text-[13.5px]">No reports match these filters.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {/* Desktop table — hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-[#FAFBFE]">
              {["Report ID", "Incident Title", "Category", "Submitted", "Status", "Assigned", "Reporter", "Urgency"].map((h) => (
                <th key={h} className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} onClick={() => router.push(`/authority/reports/${r.id}`)} className="cursor-pointer hover:bg-[#FAFBFE]">
                <td className="px-4 py-3.5 font-mono font-bold text-navy border-b border-border">{r.id}</td>
                <td className="px-4 py-3.5 max-w-[220px] truncate border-b border-border">{r.title}</td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">{r.category}</td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">{r.date}</td>
                <td className="px-4 py-3.5 border-b border-border"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">{r.assigned}</td>
                <td className="px-4 py-3.5 border-b border-border"><AnonBadge anon={r.anon} /></td>
                <td className="px-4 py-3.5 border-b border-border"><UrgencyBadge urgency={r.urgency} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — visible only on small screens */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        {list.map((r) => (
          <div
            key={r.id}
            onClick={() => router.push(`/authority/reports/${r.id}`)}
            className="cursor-pointer border border-border rounded-xl p-4 hover:bg-[#FAFBFE]"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="font-mono font-bold text-navy text-[13px]">{r.id}</span>
              <UrgencyBadge urgency={r.urgency} />
            </div>
            <p className="text-[13px] font-semibold text-gray-800 mb-3 leading-snug">{r.title}</p>
            <div className="grid grid-cols-2 gap-1 text-[12px]">
              <span className="text-text-faint font-medium">Status</span>
              <span><StatusBadge status={r.status} /></span>

              <span className="text-text-faint font-medium">Category</span>
              <span className="text-gray-700">{r.category}</span>

              <span className="text-text-faint font-medium">Submitted</span>
              <span className="text-gray-700">{r.date}</span>

              <span className="text-text-faint font-medium">Assigned</span>
              <span className="text-gray-700">{r.assigned || "—"}</span>

              <span className="text-text-faint font-medium">Reporter</span>
              <span><AnonBadge anon={r.anon} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
