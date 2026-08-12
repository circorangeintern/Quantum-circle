"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import api from "@/app/lib/axios";

const inputCls =
  "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30";

export default function AuthoritySettingsPage() {
  const { user, school } = useAuth();
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const onChangePassword = async (data) => {
    setPwSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setPwSubmitting(false);
    }
  };

  const newPassword = watch("newPassword");

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-[18px] sm:text-[20px] font-display text-navy">
        Account Settings
      </h1>

      {/* Profile info — read only */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-[14px] font-bold text-navy">Your Profile</h2>
        <div>
          <label className="block text-[12.5px] font-semibold text-navy mb-1.5">Name</label>
          <input
            type="text"
            value={user?.name ?? ""}
            readOnly
            className={`${inputCls} bg-paper text-text-faint cursor-not-allowed`}
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-navy mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email ?? ""}
            readOnly
            className={`${inputCls} bg-paper text-text-faint cursor-not-allowed`}
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-navy mb-1.5">Role</label>
          <input
            type="text"
            value={user?.role ?? ""}
            readOnly
            className={`${inputCls} bg-paper text-text-faint cursor-not-allowed capitalize`}
          />
        </div>
        {school?.name && (
          <div>
            <label className="block text-[12.5px] font-semibold text-navy mb-1.5">School</label>
            <input
              type="text"
              value={school.name}
              readOnly
              className={`${inputCls} bg-paper text-text-faint cursor-not-allowed`}
            />
          </div>
        )}
      </div>

      {/* Change password */}
      <form
        onSubmit={handleSubmit(onChangePassword)}
        className="bg-white border border-border rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <h2 className="text-[14px] font-bold text-navy">Change Password</h2>

        <div>
          <label className="block text-[12.5px] font-semibold text-navy mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            {...register("currentPassword", { required: "Current password is required" })}
            className={inputCls}
            placeholder="••••••••"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-navy mb-1.5">
            New Password
          </label>
          <input
            type="password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "At least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Must include uppercase, lowercase, and a number",
              },
            })}
            className={inputCls}
            placeholder="••••••••"
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-navy mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your new password",
              validate: (v) => v === newPassword || "Passwords do not match",
            })}
            className={inputCls}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={pwSubmitting}
            className="bg-blue hover:bg-blue-dark disabled:opacity-60 text-white text-[13px] font-bold px-6 py-2.5 rounded-[10px] transition-colors"
          >
            {pwSubmitting ? "Changing…" : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
