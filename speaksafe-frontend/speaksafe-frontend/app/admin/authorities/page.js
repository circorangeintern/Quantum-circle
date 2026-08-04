"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { getStaff, inviteStaff, removeStaff } from "@/app/lib/schools";

function Skeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2">
      <div className="h-10 bg-gray-100 rounded-xl w-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
      ))}
    </div>
  );
}

function Initials({ name }) {
  const letters = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-[30px] h-[30px] rounded-full bg-peri text-white flex items-center justify-center text-[11px] font-bold shrink-0">
      {letters}
    </div>
  );
}

function ActiveBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${isActive ? "bg-green-light text-green" : "bg-gray-100 text-text-faint"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[min(480px,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-display text-navy text-[16px] font-bold">{title}</h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-faint hover:text-navy text-[20px] leading-none rounded-lg" aria-label="Close">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12.5px] font-bold text-navy">
        {label}{required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-text-faint">{hint}</p>}
    </div>
  );
}

const inputCls = "border border-border rounded-[10px] px-3 py-2 text-[13.5px] w-full focus:outline-none focus:ring-2 focus:ring-blue/30";

function AuthorityForm({ onSubmit, loading }) {
  const [values, setValues] = useState({ name: "", email: "", department: "" });
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: values.name, email: values.email };
    if (values.department) payload.department = values.department;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Full Name" required>
        <input className={inputCls} value={values.name} onChange={set("name")} required placeholder="e.g. Amara Okafor" />
      </Field>
      <Field label="Email Address" required hint="A temporary password will be sent to this email automatically">
        <input type="email" className={inputCls} value={values.email} onChange={set("email")} required placeholder="authority@school.edu" />
      </Field>
      <Field label="Department" hint="Optional — e.g. Welfare, Discipline, Counselling">
        <input className={inputCls} value={values.department} onChange={set("department")} placeholder="Optional" />
      </Field>
      <div className="flex justify-end mt-1">
        <button type="submit" disabled={loading} className="bg-blue hover:bg-blue-dark disabled:opacity-60 text-white text-[13px] font-bold px-4 py-2 rounded-[10px]">
          {loading ? "Adding…" : "Add Authority"}
        </button>
      </div>
    </form>
  );
}

function RemoveConfirmDialog({ user, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState(null);

  async function handleRemove() {
    setLoading(true);
    setInlineError(null);
    try {
      await onConfirm();
    } catch (err) {
      setInlineError(err?.response?.data?.message || err?.message || "Failed to remove authority.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Remove Authority" onClose={onCancel}>
      <p className="text-[13.5px] text-text-faint mb-4">
        Are you sure you want to remove <span className="font-bold text-navy">{user.name}</span>? They will no longer have access to the dashboard.
      </p>
      {inlineError && <div className="mb-4 rounded-[10px] bg-red-light border border-red/20 px-4 py-3 text-[13px] text-red font-medium">{inlineError}</div>}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} disabled={loading} className="bg-white border border-border text-navy text-[13px] font-bold px-4 py-2 rounded-[10px] hover:bg-gray-50">Cancel</button>
        <button onClick={handleRemove} disabled={loading} className="bg-red hover:bg-red/90 disabled:opacity-60 text-white text-[13px] font-bold px-4 py-2 rounded-[10px]">
          {loading ? "Removing…" : "Remove"}
        </button>
      </div>
    </Modal>
  );
}

export default function AuthoritiesPage() {
  const { school } = useAuth();
  const schoolId = school?.id ?? school?._id;

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [removeUser, setRemoveUser] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStaff(schoolId);
      setStaff(data?.data?.staff ?? data?.staff ?? data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load authorities.");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  async function handleCreate(data) {
    setCreateLoading(true);
    try {
      await inviteStaff(schoolId, data);
      toast.success("Authority added successfully");
      setCreateOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add authority.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRemove(staffId) {
    await removeStaff(schoolId, staffId);
    toast.success("Authority removed");
    setRemoveUser(null);
    fetchStaff();
  }

  if (loading) return <Skeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-navy text-[18px] font-bold">Authorities</h2>
          <p className="text-[12.5px] text-text-faint mt-0.5">Staff members who can view and act on reports</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="bg-blue hover:bg-blue-dark text-white text-[13px] font-bold px-4 py-2 rounded-[10px]">
          + Add Authority
        </button>
      </div>

      {error && (
        <div className="bg-red-light border border-red/20 rounded-xl px-4 py-3 text-[13px] text-red mb-4">
          {error} <button onClick={fetchStaff} className="ml-3 underline font-bold">Retry</button>
        </div>
      )}

      {staff.length === 0 && !error ? (
        <div className="bg-white border border-border rounded-2xl">
          <div className="py-16 text-center text-text-faint text-[13.5px]">No authorities added yet. Click "Add Authority" to get started.</div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="bg-[#FAFBFE]">
                  {["Name", "Email", "Department", "Status", "Last Login", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] uppercase tracking-wider text-text-faint font-bold px-4 py-3 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id ?? u._id} className="hover:bg-[#FAFBFE]">
                    <td className="px-4 py-3.5 border-b border-border">
                      <div className="flex items-center gap-2.5">
                        <Initials name={u.name} />
                        <span className="font-medium text-navy text-[13.5px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">{u.email}</td>
                    <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">{u.department || "—"}</td>
                    <td className="px-4 py-3.5 border-b border-border"><ActiveBadge isActive={u.isActive ?? true} /></td>
                    <td className="px-4 py-3.5 text-text-faint text-[12.5px] border-b border-border">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3.5 border-b border-border">
                      <button onClick={() => setRemoveUser(u)} className="bg-white border border-red/30 text-red text-[12px] font-bold px-3 py-1.5 rounded-[8px] hover:bg-red-light">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {createOpen && (
        <Modal title="Add Authority" onClose={() => setCreateOpen(false)}>
          <AuthorityForm onSubmit={handleCreate} loading={createLoading} />
        </Modal>
      )}

      {removeUser && (
        <RemoveConfirmDialog
          user={removeUser}
          onConfirm={() => handleRemove(removeUser.id ?? removeUser._id)}
          onCancel={() => setRemoveUser(null)}
        />
      )}
    </div>
  );
}
