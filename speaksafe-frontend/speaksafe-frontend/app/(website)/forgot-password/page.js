"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

import { forgotPassword } from "@/app/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err.response.data?.message ||
            "Failed to send reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state — show "check your email" message
  if (submitted) {
    return (
      <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <MailCheck className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-[#142353]">Check Your Email</h2>

          <p className="text-slate-600">
            We&apos;ve sent a password reset link to{" "}
            <strong className="text-[#142353]">{email}</strong>. Please check
            your inbox and follow the instructions to reset your password.
          </p>

          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="font-semibold text-[#142353] hover:underline"
            >
              try again
            </button>
            .
          </p>

          <Link
            href="/login"
            className="inline-block mt-4 font-semibold text-[#142353] hover:underline text-sm"
          >
            Back to Sign In
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
            <h2 className="text-xl font-semibold">Forgot Password</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              required
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
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
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#142353] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
