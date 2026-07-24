"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";


import { AnonBadge, StatusBadge, UrgencyBadge } from "@/app/components/authority/Badge";
import { useAuthority } from "@/lib/authorities/AuthorityContext";
import { AUTHORITIES, STATUSES, URGENCIES } from "@/lib/authorities/data";

export default function CaseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { reports, updateField, markResolved, addNote } = useAuthority();
  const [noteText, setNoteText] = useState("");

  const r = reports.find((x) => x.id === id);
  if (!r) {
    return (
      <div className="text-text-faint text-[13.5px]">Report not found.</div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/authority/reports")}
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
            <AnonBadge anon={r.anon} />
            <span className="text-text-faint font-mono text-[12px] ml-1">
              {r.id}
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
            onClick={() => markResolved(r.id)}
            className="bg-blue hover:bg-blue-dark text-white text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
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
            <p className="text-sm leading-relaxed text-text m-0">{r.desc}</p>
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
                <span>{r.date || "Not provided"}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-wide mb-1">
                  Location
                </div>
                <span>{r.location || "Not provided"}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-text-faint uppercase tracking-wide mb-1">
                  People involved
                </div>
                <span>{r.people || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
            <h3 className="text-sm font-display text-navy mb-3.5">
              Attached Evidence
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {r.files.length ? (
                r.files.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 bg-peri-light rounded-[10px] px-3.5 py-2.5 text-xs font-semibold text-navy"
                  >
                    📎 {f}
                  </div>
                ))
              ) : (
                <span className="text-text-faint">No evidence attached</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
            <h3 className="text-sm font-display text-navy mb-3.5">Timeline</h3>
            <ul className="list-none p-0 m-0">
              {r.timeline.map((t, i) => (
                <li
                  key={i}
                  className="relative pl-6 pb-5 border-l-2 border-border ml-1 last:border-transparent last:pb-0"
                >
                  <span className="absolute -left-[6px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue" />
                  <div className="text-[11px] text-text-faint font-semibold mb-0.5">
                    {t.d}
                  </div>
                  <div className="text-[13px] text-text">{t.t}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-4.5">
            <h3 className="text-sm font-display text-navy mb-3.5">
              Internal Notes
            </h3>
            <div className="flex flex-col gap-3 mb-3.5">
              {r.notes.length ? (
                r.notes.map((n, i) => (
                  <div key={i} className="bg-paper rounded-[10px] px-3.5 py-3">
                    <div className="flex justify-between text-[11.5px] font-bold text-navy mb-1">
                      {n.a}
                      <span className="font-medium text-text-faint">{n.d}</span>
                    </div>
                    <p className="m-0 text-[12.5px] text-text leading-relaxed">
                      {n.t}
                    </p>
                  </div>
                ))
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
              onClick={() => {
                addNote(r.id, noteText);
                setNoteText("");
              }}
              className="mt-2.5 bg-white border-[1.5px] border-border-strong text-navy text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
            >
              Add Note
            </button>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
            <h3 className="text-sm font-display text-navy mb-3.5">
              Activity Log
            </h3>
            <ul className="list-none p-0 m-0">
              {r.log.map((l, i) => (
                <li
                  key={i}
                  className="relative pl-6 pb-5 border-l-2 border-border ml-1 last:border-transparent last:pb-0"
                >
                  <span className="absolute -left-[6px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue" />
                  <div className="text-[11px] text-text-faint font-semibold mb-0.5">
                    {l.d}
                  </div>
                  <div className="text-[13px] text-text">{l.t}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
          <label className="block mb-4">
            <span className="block text-[11.5px] font-bold text-text-faint uppercase tracking-wide mb-1.5">
              Assigned Authority
            </span>
            <select
              value={r.assigned}
              onChange={(e) => updateField(r.id, "assigned", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border-strong text-sm"
            >
              {AUTHORITIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-4">
            <span className="block text-[11.5px] font-bold text-text-faint uppercase tracking-wide mb-1.5">
              Urgency Level
            </span>
            <select
              value={r.urgency}
              onChange={(e) => updateField(r.id, "urgency", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border-strong text-sm"
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11.5px] font-bold text-text-faint uppercase tracking-wide mb-1.5">
              Case Status
            </span>
            <select
              value={r.status}
              onChange={(e) => updateField(r.id, "status", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border-strong text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
