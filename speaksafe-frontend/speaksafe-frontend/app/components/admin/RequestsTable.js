"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { useAdmin } from "@/lib/admin/AdminContext";

export function RequestsTable({ list }) {
  const { approveRequest, rejectRequest } = useAdmin();
  const [pendingId, setPendingId] = useState(null);

  const handleApprove = async (id) => {
    setPendingId(id);
    try { await approveRequest(id); } finally { setPendingId(null); }
  };

  const handleReject = async (id) => {
    setPendingId(id);
    try { await rejectRequest(id); } finally { setPendingId(null); }
  };

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
      {/* Desktop table — hidden on small screens */}
      <div className="hidden md:block overflow-x-auto -webkit-overflow-scrolling-touch">
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
                        onClick={() => handleApprove(r.id)}
                        disabled={pendingId === r.id}
                        className="bg-blue hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold px-3.5 py-2 rounded-[10px] flex items-center gap-1.5"
                      >
                        {pendingId === r.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        disabled={pendingId === r.id}
                        className="bg-white border-[1.5px] border-red-light disabled:opacity-60 disabled:cursor-not-allowed text-red text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
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

      {/* Mobile cards — visible only on small screens */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        {list.map((r) => (
          <div
            key={r.id}
            className="border border-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="font-mono font-bold text-navy text-[13px]">{r.id}</span>
              <StatusPill status={r.status} />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[12px] mb-3">
              <span className="text-text-faint font-medium">Name</span>
              <span className="text-gray-700">{r.name}</span>

              <span className="text-text-faint font-medium">Email</span>
              <span className="text-gray-700 truncate">{r.email}</span>

              <span className="text-text-faint font-medium">School</span>
              <span className="text-gray-700">{r.school}</span>

              <span className="text-text-faint font-medium">Role</span>
              <span className="text-gray-700">{r.role}</span>

              <span className="text-text-faint font-medium">Submitted</span>
              <span className="text-gray-700">{r.date}</span>
            </div>
            {r.status === "Pending" && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={pendingId === r.id}
                  className="flex-1 bg-blue hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold px-3.5 py-2 rounded-[10px] flex items-center justify-center gap-1.5"
                >
                  {pendingId === r.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(r.id)}
                  disabled={pendingId === r.id}
                  className="flex-1 bg-white border-[1.5px] border-red-light disabled:opacity-60 disabled:cursor-not-allowed text-red text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
