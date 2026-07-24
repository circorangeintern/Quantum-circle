"use client";
import { StatusPill } from "./StatusPill";
import { useAdmin } from "@/lib/admin/AdminContext";

export function RequestsTable({ list }) {
  const { approveRequest, rejectRequest } = useAdmin();

  if (list.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl">
        <div className="py-16 text-center text-text-faint text-[13.5px]">
          No requests to show.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-[#FAFBFE]">
              {[
                "Request ID",
                "Name",
                "Email",
                "Role",
                "School",
                "Submitted",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-[#FAFBFE]">
                <td className="px-4 py-3.5 font-mono font-bold text-navy border-b border-border">
                  {r.id}
                </td>
                <td className="px-4 py-3.5 border-b border-border">{r.name}</td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                  {r.email}
                </td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                  {r.role}
                </td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                  {r.school}
                </td>
                <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                  {r.date}
                </td>
                <td className="px-4 py-3.5 border-b border-border">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-3.5 border-b border-border">
                  {r.status === "Pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest(r.id)}
                        className="bg-blue hover:bg-blue-dark text-white text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(r.id)}
                        className="bg-white border-[1.5px] border-red-light text-red text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
