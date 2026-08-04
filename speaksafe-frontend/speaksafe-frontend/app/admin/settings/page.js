"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { getSchool, updateSchool } from "@/app/lib/schools";

function Skeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4 max-w-2xl">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}

const inputCls = "border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] w-full focus:outline-none focus:ring-2 focus:ring-blue/30";

export default function SchoolSettingsPage() {
  const { school } = useAuth();
  const schoolId = school?.id;

  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schoolId) return;
    async function load() {
      try {
        const data = await getSchool(schoolId);
        const s = data?.data ?? data;
        setForm({
          name: s.name ?? "",
          address: s.address ?? "",
          phone: s.phone ?? "",
          email: s.email ?? "",
          website: s.website ?? "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load school settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [schoolId]);

  const set = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSchool(schoolId, form);
      toast.success("School settings saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton />;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-[18px] font-display font-bold text-navy">School Settings</h2>
        <p className="text-[12.5px] text-text-faint mt-0.5">Update your school's profile information</p>
      </div>

      {error && (
        <div className="bg-red-light border border-red/20 rounded-xl px-4 py-3 text-[13px] text-red mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-[12.5px] font-bold text-navy">School Name <span className="text-red">*</span></label>
          <input className={inputCls} value={form.name} onChange={set("name")} required placeholder="e.g. King's Boarding Academy" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12.5px] font-bold text-navy">Address</label>
          <input className={inputCls} value={form.address} onChange={set("address")} placeholder="School address" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-bold text-navy">Phone</label>
            <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+234..." />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-bold text-navy">Contact Email</label>
            <input type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="info@school.edu" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12.5px] font-bold text-navy">Website</label>
          <input className={inputCls} value={form.website} onChange={set("website")} placeholder="https://school.edu" />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue hover:bg-blue-dark disabled:opacity-60 text-white text-[13px] font-bold px-5 py-2.5 rounded-[10px]"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
