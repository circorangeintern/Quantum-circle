"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "sonner";

import { changePassword } from "@/app/lib/auth";

export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      toast.success("Password changed successfully.");
      setFormData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err.response.data?.message ||
            "Failed to change password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl p-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#142353]">
            <Image
              src="/speaksafe.png"
              alt="SpeakSafe Logo"
              width={35}
              height={40}
            />
          </div>

          <h1 className="text-3xl font-bold text-[#142353]">SpeakSafe</h1>

          <div>
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your current password and choose a new one.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                className="w-full pr-10"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                disabled={loading}
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#142353]"
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                className="w-full pr-10"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                disabled={loading}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#142353]"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="text-sm text-red-600 rounded-md bg-red-50 border border-red-200 px-3 py-2"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full p-6 text-white bg-[#142353] hover:bg-[#0d1a42] flex items-center justify-center"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Change Password"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            <Link
              href="/login"
              className="font-semibold text-[#142353] hover:underline"
            >
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
