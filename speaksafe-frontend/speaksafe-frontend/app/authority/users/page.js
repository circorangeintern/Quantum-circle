"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { getStaff, inviteStaff, removeStaff } from "@/app/lib/schools";

// ── Helpers ──────────────────────────────────────────────────────────────────
function initialsOf(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Skeletons ────────────────────────────────────────────────────────────────
function StaffRowSkeleton() {
  return (
    <tr>
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-4 py-3.5 border-b border-border">
          <div className="animate-pulse h-4 bg-gray-200 rounded w-24" />
        </td>
      ))}
      <td className="px-4 py-3.5 border-b border-border">
        <div className="animate-pulse h-7 w-16 bg-gray-200 rounded-lg" />
      </td>
    </tr>
  );
}

function StaffCardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="h-3.5 w-24 bg-gray-200 rounded" />
      <div className="h-3.5 w-36 bg-gray-200 rounded" />
    </div>
  );
}

// ── Confirm removal dialog ────────────────────────────────────────────────────
function ConfirmDialog({ member, onConfirm, onCancel, removing }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[min(360px,calc(100vw-2rem))] p-6">
        <h2
          id="confirm-title"
          className="text-[15px] font-display text-navy font-bold mb-2"
        >
          Remove Staff Member
        </h2>
        <p className="text-sm text-text-faint mb-6">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-text">{member?.name}</span> from
          the school? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={removing}
            className="px-4 py-2 text-sm font-semibold text-text border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={removing}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg flex items-center gap-2"
          >
            {removing && (
              <svg
                className="animate-spin w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {removing ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose, onInvited, schoolId }) {
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError(null);
    try {
      await inviteStaff(schoolId, {
        email: data.email,
        name: data.name,
        role: data.role || undefined,
      });
      toast.success("Staff member invited successfully");
      onInvited();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to invite staff member";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[min(420px,calc(100vw-2rem))] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2
            id="invite-title"
            className="text-[15px] font-display text-navy font-bold"
          >
            Invite Staff Member
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-faint hover:text-text rounded-lg"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="invite-name"
              className="block text-[13px] font-semibold text-navy mb-1.5"
            >
              Full Name
            </label>
            <input
              id="invite-name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
              placeholder="Jane Doe"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="invite-email"
              className="block text-[13px] font-semibold text-navy mb-1.5"
            >
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
              placeholder="jane@school.edu"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="block text-[13px] font-semibold text-navy mb-1.5"
            >
              Role <span className="text-text-faint font-normal">(optional)</span>
            </label>
            <select
              id="invite-role"
              {...register("role")}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 bg-white"
            >
              <option value="">Select a role…</option>
              <option value="school-admin">School Admin</option>
              <option value="school-staff">School Staff</option>
            </select>
          </div>

          <div className="pt-1 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-text border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-blue hover:bg-blue-dark disabled:opacity-60 rounded-lg flex items-center gap-2 transition-colors"
            >
              {submitting && (
                <svg
                  className="animate-spin w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {submitting ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { school: authSchool } = useAuth();
  const schoolId = authSchool?.id;

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmMember, setConfirmMember] = useState(null); // member to remove
  const [removing, setRemoving] = useState(false);

  // Fetch staff from API
  const fetchStaff = useCallback(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setApiError(null);
    getStaff(schoolId)
      .then((response) => {
        // Response shape: { success, data: StaffMember[] }
        const members = response?.data ?? response ?? [];
        setStaff(Array.isArray(members) ? members : []);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ?? "Failed to load staff members";
        setApiError(message);
      })
      .finally(() => setLoading(false));
  }, [schoolId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Remove staff after confirmation
  const handleRemoveConfirm = async () => {
    if (!confirmMember || !schoolId) return;
    setRemoving(true);
    try {
      await removeStaff(schoolId, confirmMember.id);
      toast.success("Staff member removed");
      setConfirmMember(null);
      fetchStaff();
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ??
        (status === 400
          ? "This operation is not allowed."
          : "Failed to remove staff member");
      toast.error(message);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      {/* Invite modal */}
      {inviteOpen && (
        <InviteModal
          schoolId={schoolId}
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            setInviteOpen(false);
            fetchStaff();
          }}
        />
      )}

      {/* Remove confirmation dialog */}
      {confirmMember && (
        <ConfirmDialog
          member={confirmMember}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setConfirmMember(null)}
          removing={removing}
        />
      )}

      <div>
        {/* Header row */}
        <div className="flex justify-end mb-3.5">
          <button
            onClick={() => setInviteOpen(true)}
            disabled={!schoolId}
            className="bg-blue hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold px-3.5 py-2 rounded-[10px]"
          >
            + Invite User
          </button>
        </div>

        {/* Error state */}
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between gap-3">
            <span>{apiError}</span>
            <button
              onClick={fetchStaff}
              className="text-sm font-semibold text-red-700 underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Desktop table (md and above) ────────────────────────── */}
        <div className="hidden md:block bg-white border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="bg-[#FAFBFE]">
                  {["Name", "Role", "Department", "Email"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <StaffRowSkeleton key={i} />
                    ))}
                  </>
                ) : staff.length === 0 && !apiError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-text-faint"
                    >
                      No staff members yet. Use &quot;Invite User&quot; to add some.
                    </td>
                  </tr>
                ) : (
                  staff.map((u) => (
                    <tr key={u.id ?? u.email} className="hover:bg-[#FAFBFE]">
                      <td className="px-4 py-3.5 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[30px] h-[30px] rounded-full bg-peri text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {initialsOf(u.name)}
                          </div>
                          <span className="text-sm text-text font-medium">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                        {u.role}
                      </td>
                      <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                        {u.department ?? u.dept ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                        {u.email}
                      </td>
                      <td className="px-4 py-3.5 border-b border-border">
                        <button
                          onClick={() => setConfirmMember(u)}
                          className="text-[12px] font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${u.name}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Mobile cards (below md) ──────────────────────────────── */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <StaffCardSkeleton key={i} />
              ))}
            </>
          ) : staff.length === 0 && !apiError ? (
            <div className="bg-white border border-border rounded-xl px-4 py-8 text-center text-sm text-text-faint">
              No staff members yet. Use &quot;Invite User&quot; to add some.
            </div>
          ) : (
            staff.map((u) => (
              <div
                key={u.id ?? u.email}
                className="bg-white border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-peri text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {initialsOf(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-navy truncate">
                        {u.name}
                      </p>
                      <p className="text-[11.5px] text-text-faint truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmMember(u)}
                    className="shrink-0 text-[12px] font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove ${u.name}`}
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1 text-[12px]">
                  <span className="text-text-faint font-medium">Role</span>
                  <span className="text-text">{u.role ?? "—"}</span>

                  <span className="text-text-faint font-medium">Department</span>
                  <span className="text-text">
                    {u.department ?? u.dept ?? "—"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
