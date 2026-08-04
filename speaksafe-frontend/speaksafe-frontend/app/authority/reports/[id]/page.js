"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { AnonBadge, StatusBadge, UrgencyBadge } from "@/app/components/authority/Badge";
import { useAuthority } from "@/lib/authorities/AuthorityContext";
import { useAuth } from "@/app/providers/AuthProvider";
import { getStaff } from "@/app/lib/schools";

const STATUSES = ["open", "investigating", "resolved", "closed"];
const URGENCIES = ["low", "medium", "high", "urgent"];

export default function CaseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { school, user } = useAuth();
  const backPath = user?.role === "school-admin" ? "/admin/reports" : "/authority/reports";
  const { fetchReport, updateStatus, updateUrgency, assignReport, addNote, deleteReport, loading } =
    useAuthority();
  const [report, setReport] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [loadingReport, setLoadingReport] = useState(true);
  const [reportError, setReportError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Load staff for the assign dropdown
  useEffect(() => {
    if (!school?.id) return;
    getStaff(school.id)
      .then((data) => setStaffList(data?.data?.staff ?? data?.staff ?? data?.data ?? []))
      .catch(() => {});
  }, [school?.id]);

  useEffect(() => {
    const load = async () => {
      setLoadingReport(true);
      setReportError(null);
      try {
        const data = await fetchReport(id);
        setReport(data);
      } catch {
        setReportError("Failed to load report. Please try again.");
      } finally {
        setLoadingReport(false);
      }
    };
    if (id) load();
  }, [id, fetchReport]);

  if (loadingReport) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-32" />
        <div className="h-6 bg-gray-100 rounded w-2/3" />
        <div className="bg-white border border-border rounded-2xl p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (reportError || !report) {
    return (
      <div className="text-text-faint text-[13.5px]">
        {reportError ?? "Report not found."}
      </div>
    );
  }

  const r = report;

  const handleStatusChange = async (newStatus) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await updateStatus(r.id, newStatus);
      setReport((prev) => ({ ...prev, status: newStatus }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUrgencyChange = async (newUrgency) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await updateUrgency(r.id, newUrgency);
      setReport((prev) => ({ ...prev, urgency: newUrgency }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignChange = async (adminId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await assignReport(r.id, adminId);
      setReport((prev) => ({ ...prev, assignedTo: adminId }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await updateStatus(r.id, "resolved");
      setReport((prev) => ({ ...prev, status: "resolved" }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      await addNote(r.id, noteText);
      setNoteText("");
      // Reload the report to get the updated notes
      const updated = await fetchReport(r.id);
      setReport(updated);
    } finally {
      setActionLoading(false);
    }
  };

  // Normalise field names from API shape → display
  const description = r.description ?? r.desc ?? "";
  const incidentDate = r.incidentDate ?? r.date ?? null;
  const location = r.location ?? null;
  const peopleInvolved = r.peopleInvolved ?? r.people ?? null;
  const attachments = r.attachments ?? r.files ?? [];
  const timeline = r.publicTimeline ?? r.statusHistory ?? r.timeline ?? [];
  const internalNotes = r.internalNotes ?? r.notes ?? [];
  const activityLog = r.log ?? [];
  const isAnonymous = r.isAnonymous ?? r.anon ?? false;

  return (
    <div>
      <button
        onClick={() => router.push(backPath)}
        className="text-blue font-bold text-[13px] mb-3.5"
      >
        ← Back to Reports
      </button>

      <div className="flex flex-wrap items-start justify-between gap-5 mb-5">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-display text-navy mb-2">
            {r.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={r.status} />
            <UrgencyBadge urgency={r.urgency} />
            <AnonBadge anon={isAnonymous} />
            <span className="text-text-faint font-mono text-[12px] ml-1">
              {r.referenceCode ?? r.id}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="bg-white border-[1.5px] border-border-strong text-navy text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
          >
            Export as PDF
          </button>
          <button
            onClick={handleMarkResolved}
            disabled={actionLoading || r.status === "resolved"}
            className="bg-blue hover:bg-blue-dark text-white text-[13px] font-bold px-3.5 py-2 rounded-[10px] disabled:opacity-50"
          >
            Mark Resolved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div>
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
            <h3 className="text-sm font-display text-navy mb-3.5">
              Incident Description
            </h3>
            <p className="text-sm leading-relaxed text-text m-0">{description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4.5 text-[13px]">
              <div>
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-wide mb-1">
                  Category
                </div>
                <span>{r.category}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-wide mb-1">
                  Date &amp; time
                </div>
                <span>{incidentDate || "Not provided"}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-wide mb-1">
                  Location
                </div>
                <span>{location || "Not provided"}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-wide mb-1">
                  People involved
                </div>
                <span>{peopleInvolved || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
            <h3 className="text-sm font-display text-navy mb-3.5">
              Attached Evidence
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {attachments.length ? (
                attachments.map((f, idx) => {
                  const name = typeof f === "string" ? f : (f.filename ?? f.url ?? "File");
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-peri-light rounded-[10px] px-3.5 py-2.5 text-xs font-semibold text-navy"
                    >
                      📎 {name}
                    </div>
                  );
                })
              ) : (
                <span className="text-text-faint">No evidence attached</span>
              )}
            </div>
          </div>

          {timeline.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
              <h3 className="text-sm font-display text-navy mb-3.5">Timeline</h3>
              <ul className="list-none p-0 m-0">
                {timeline.map((t, i) => {
                  const date = t.date ?? t.d ?? "";
                  const text = t.event ?? t.description ?? t.t ?? "";
                  return (
                    <li
                      key={i}
                      className="relative pl-6 pb-5 border-l-2 border-border ml-1 last:border-transparent last:pb-0"
                    >
                      <span className="absolute -left-[6px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue" />
                      <div className="text-[11px] text-text-faint font-semibold mb-0.5">{date}</div>
                      <div className="text-[13px] text-text">{text}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
            <h3 className="text-sm font-display text-navy mb-3.5">
              Internal Notes
            </h3>
            <div className="flex flex-col gap-3 mb-3.5">
              {internalNotes.length ? (
                internalNotes.map((n, i) => {
                  const author = n.author ?? n.a ?? "Unknown";
                  const date = n.createdAt ?? n.d ?? "";
                  const text = n.content ?? n.t ?? n.note ?? "";
                  return (
                    <div key={i} className="bg-paper rounded-[10px] px-3.5 py-3">
                      <div className="flex justify-between text-[11.5px] font-bold text-navy mb-1">
                        {author}
                        <span className="font-medium text-text-faint">{date}</span>
                      </div>
                      <p className="m-0 text-[12.5px] text-text leading-relaxed">{text}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-text-faint text-[12.5px] m-0">
                  No internal notes yet.
                </p>
              )}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add an internal note, visible only to authorities..."
              className="w-full min-h-[60px] px-3.5 py-2.5 rounded-[10px] border border-border-strong text-sm"
            />
            <button
              onClick={handleAddNote}
              disabled={actionLoading || !noteText.trim()}
              className="mt-2.5 bg-white border-[1.5px] border-border-strong text-navy text-[13px] font-bold px-3.5 py-2 rounded-[10px] disabled:opacity-50"
            >
              Add Note
            </button>
          </div>

          {activityLog.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
              <h3 className="text-sm font-display text-navy mb-3.5">
                Activity Log
              </h3>
              <ul className="list-none p-0 m-0">
                {activityLog.map((l, i) => {
                  const date = l.date ?? l.d ?? "";
                  const text = l.action ?? l.t ?? "";
                  return (
                    <li
                      key={i}
                      className="relative pl-6 pb-5 border-l-2 border-border ml-1 last:border-transparent last:pb-0"
                    >
                      <span className="absolute -left-[6px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue" />
                      <div className="text-[11px] text-text-faint font-semibold mb-0.5">{date}</div>
                      <div className="text-[13px] text-text">{text}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
          <label className="block mb-4">
            <span className="block text-[11.5px] font-bold text-text-faint uppercase tracking-wide mb-1.5">
              Assigned Authority
            </span>
            <select
              value={r.assignedTo?.adminId ?? r.assignedTo ?? ""}
              onChange={(e) => handleAssignChange(e.target.value)}
              disabled={actionLoading}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border-strong text-sm disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {staffList.map((s) => (
                <option key={s.id ?? s._id} value={s.id ?? s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-4">
            <span className="block text-[11.5px] font-bold text-text-faint uppercase tracking-wide mb-1.5">
              Urgency Level
            </span>
            <select
              value={r.urgency ?? ""}
              onChange={(e) => handleUrgencyChange(e.target.value)}
              disabled={actionLoading}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border-strong text-sm disabled:opacity-50"
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11.5px] font-bold text-text-faint uppercase tracking-wide mb-1.5">
              Case Status
            </span>
            <select
              value={r.status ?? ""}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={actionLoading}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border-strong text-sm disabled:opacity-50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
