"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { getSchool, updateSchool } from "@/app/lib/schools";

// ── Skeleton placeholders ────────────────────────────────────────────────────
function FieldSkeleton() {
  return (
    <div className="animate-pulse space-y-1.5">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mb-8" />
      <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
        {[...Array(6)].map((_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { school: authSchool } = useAuth();
  const [loadingSchool, setLoadingSchool] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Derive schoolId from auth context
  const schoolId = authSchool?.id;

  // Fetch school data on mount
  useEffect(() => {
    if (!schoolId) return;

    setLoadingSchool(true);
    setApiError(null);

    getSchool(schoolId)
      .then((response) => {
        // Response shape: { success, data: School }
        const school = response?.data ?? response;
        reset({
          name: school.name ?? "",
          domain: school.domain ?? "",
          address: school.address ?? "",
          phone: school.phone ?? "",
          email: school.email ?? "",
          website: school.website ?? "",
        });
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ?? "Failed to load school settings";
        setApiError(message);
      })
      .finally(() => {
        setLoadingSchool(false);
      });
  }, [schoolId, reset]);

  // Submit handler — calls PUT /schools/{id}
  const onSubmit = async (data) => {
    if (!schoolId) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await updateSchool(schoolId, data);
      toast.success("School settings saved successfully");
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to save school settings";
      setApiError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!schoolId) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center text-text-faint text-sm">
        School information is not available for your account.
      </div>
    );
  }

  if (loadingSchool) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[18px] sm:text-[20px] font-display text-navy mb-6">
        School Settings
      </h1>

      {apiError && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-border rounded-2xl p-5 sm:p-6 space-y-5"
      >
        {/* School name */}
        <div>
          <label
            htmlFor="school-name"
            className="block text-[13px] font-semibold text-navy mb-1.5"
          >
            School Name
          </label>
          <input
            id="school-name"
            type="text"
            {...register("name", { required: "School name is required" })}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="e.g. Greenfield Academy"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Domain */}
        <div>
          <label
            htmlFor="school-domain"
            className="block text-[13px] font-semibold text-navy mb-1.5"
          >
            Domain
          </label>
          <input
            id="school-domain"
            type="text"
            {...register("domain")}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="e.g. greenfield.edu"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="school-email"
            className="block text-[13px] font-semibold text-navy mb-1.5"
          >
            Contact Email
          </label>
          <input
            id="school-email"
            type="email"
            {...register("email")}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="contact@school.edu"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="school-phone"
            className="block text-[13px] font-semibold text-navy mb-1.5"
          >
            Phone Number
          </label>
          <input
            id="school-phone"
            type="tel"
            {...register("phone")}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="+1 555 000 0000"
          />
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="school-address"
            className="block text-[13px] font-semibold text-navy mb-1.5"
          >
            Address
          </label>
          <input
            id="school-address"
            type="text"
            {...register("address")}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="123 School Lane, City, Country"
          />
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="school-website"
            className="block text-[13px] font-semibold text-navy mb-1.5"
          >
            Website
          </label>
          <input
            id="school-website"
            type="url"
            {...register("website")}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="https://school.edu"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-blue hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold px-6 py-2.5 rounded-[10px] flex items-center justify-center gap-2 transition-colors"
          >
            {submitting && (
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
