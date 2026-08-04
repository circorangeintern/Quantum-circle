"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

import { submitRegistration } from "@/app/lib/registrations";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successSchoolName, setSuccessSchoolName] = useState("");

  const [formData, setFormData] = useState({
    schoolName: "",
    domain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
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
    setSuccessSchoolName("");

    // Basic validation
    if (
      !formData.schoolName.trim() ||
      !formData.domain.trim() ||
      !formData.adminName.trim() ||
      !formData.adminEmail.trim() ||
      !formData.adminPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Domain must be like "stmarys.edu" — no @ symbol, no http
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(formData.domain.trim())) {
      setError("Domain must be a valid format like \"stmarys.edu\" (no @ or http).");
      return;
    }

    // Password must have uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.adminPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    setLoading(true);

    try {
      await submitRegistration(formData);
      // On 201 success: show pending review message with school name
      setSuccessSchoolName(formData.schoolName);
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else if (err.response.status === 409) {
        setError(
          err.response.data?.message ||
            "This domain or email is already registered."
        );
      } else if (err.response.status === 422 || err.response.status === 400) {
        // Zod validation errors — show first field error if available
        const errors = err.response.data?.errors;
        if (errors?.length) {
          setError(errors.map((e) => e.message).join(" "));
        } else {
          setError(err.response.data?.message || "Please check your input and try again.");
        }
      } else {
        setError(
          err.response.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state — show pending review message
  if (successSchoolName) {
    return (
      <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 md:p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-[#142353]">
            Registration Submitted
          </h2>

          <p className="text-slate-600">
            Your registration for{" "}
            <strong className="text-[#142353]">{successSchoolName}</strong> has
            been submitted and is{" "}
            <strong>pending review</strong> by our team.
          </p>

          <p className="text-sm text-slate-500">
            You will receive an email once your registration has been reviewed.
            This usually takes 1–2 business days.
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 md:p-8">
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
            <h2 className="text-xl font-semibold">Register Your School</h2>

            <p className="mt-2 text-sm text-slate-500">
              Register your school to get started with SpeakSafe. Your
              registration will be reviewed before activation.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name</Label>

            <Input
              id="schoolName"
              className="w-full"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="e.g. St. Mary's Secondary School"
              required
              disabled={loading}
              autoFocus
              autoComplete="organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">School Email Domain</Label>

            <Input
              id="domain"
              className="w-full"
              value={formData.domain}
              onChange={handleChange}
              placeholder="stmarys.edu"
              required
              disabled={loading}
              autoComplete="off"
            />

            <p className="text-xs text-slate-500">
              Used to verify staff email addresses (e.g. teacher@stmarys.edu).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminName">Administrator Name</Label>

            <Input
              id="adminName"
              className="w-full"
              value={formData.adminName}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Administrator Email</Label>

            <Input
              id="adminEmail"
              type="email"
              className="w-full"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Password</Label>

            <div className="relative">
              <Input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                className="w-full pr-10"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                disabled={loading}
                autoComplete="new-password"
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

          {/* Inline error message */}
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
            {loading ? "Submitting..." : "Register School"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#142353] hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Your registration request will be reviewed by the SpeakSafe team.
              You will receive an email notification once your school is
              approved.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
