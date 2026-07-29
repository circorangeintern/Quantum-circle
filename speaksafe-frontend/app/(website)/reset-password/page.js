"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { resetPassword } from "@/app/lib/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err.response.data?.message ||
            "Failed to reset password. The link may have expired."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Missing token in URL
  if (!token) {
    return (
      <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#142353]">Invalid Link</h2>
          <p className="text-slate-600">
            This password reset link is missing a token. Please request a new
            reset link.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block font-semibold text-[#142353] hover:underline text-sm"
          >
            Request a new reset link
          </Link>
        </div>
      </section>
    );
  }

  // Success state
  if (success) {
    return (
      <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-[#142353]">
            Password Reset Successfully
          </h2>

          <p className="text-slate-600">
            Your password has been updated. You can now sign in with your new
            password.
          </p>

          <Link
            href="/login"
            className="inline-block mt-4 font-semibold text-[#142353] hover:underline text-sm"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

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
            <h2 className="text-xl font-semibold">Reset Password</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter a new password for your account.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                className="w-full pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#142353]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#142353] mx-auto" />
          </div>
        </section>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
