"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { registerSchool } from "@/app/lib/auth";
import { saveAuth } from "@/app/lib/authStorage";
import { useAuth } from "@/app/providers/AuthProvider";
;

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

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

    setLoading(true);

    try {
      const response = await registerSchool(formData);

      const { admin, school, tokens } = response.data;

      saveAuth({
        admin,
        school,
        tokens,
      });

      setUser(admin);

      toast.success("School registered successfully!");

      router.replace("/admin");
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
              Register your school and create the first Super Admin account for
              your organization.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name</Label>

            <Input
              id="schoolName"
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
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="pr-10"
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
            {error && (
              <p
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full p-6 text-white bg-[#142353] hover:bg-[#0d1a42] flex items-center justify-center"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Registering..." : "Register School"}
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
              Registering your school creates your organization's first
              <strong> Super Admin </strong>
              account. After successful registration, you'll be signed in
              automatically and taken to the Admin Panel.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
