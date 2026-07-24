"use client";
import { loginUser } from "@/app/lib/auth";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveAuth } from "@/app/lib/authStorage";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  // const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setError("");
  //   setLoading(true);

  //   try {
  //     const response = await loginUser(formData.email, formData.password);

  //     const { admin, school, tokens } = response.data;

  //     // Store authentication
  //     saveAuth({ admin, school, tokens });
  //     setUser(admin);

  //     toast.success("Login successful!");
  //     // Redirect based on role
  //     if (admin.role === "super-admin") {
  //       router.replace("/admin");
  //     } else {
  //       router.replace("/dashboard");
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Invalid email or password.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
  e.preventDefault();

  const admin = {
    id: 1,
    name: "Development Admin",
    email: "admin@test.com",
    role: "admin", // Change to "admin" to test dashboard
  };

  const school = {
    id: 1,
    name: "Test School",
  };

  const tokens = {
    access: "fake-access-token",
    refresh: "fake-refresh-token",
  };

  saveAuth({ admin, school, tokens });
  // setUser(admin);

  toast.success("Development login");

  if (admin.role === "super-admin") {
    router.replace("/admin");
  } else {
    router.replace("/authority/dashboard");
  }
};

  return (
    <section className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--navy)">
            <Image
              src="/speaksafe.png"
              alt="SpeakSafe Logo"
              width={35}
              height={40}
            />
          </div>

          <h1 className="text-3xl font-bold text-[#142353]">SpeakSafe</h1>

          <div>
            <h2 className="text-xl font-semibold">Sign In</h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to your SpeakSafe account to access your dashboard.
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
              placeholder="you@school.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>

              <Link
                href="/forgot-password"
                className="text-sm text-[#142353] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#142353]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full p-6 text-white bg-[#142353] hover:bg-[#0d1a42]"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/register-school"
              className="font-semibold text-[#142353] hover:underline"
            >
              Register Your School
            </Link>
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Only authorized SpeakSafe users can sign in. If your school has
              not yet registered, register your school first. If you've been
              invited as an administrator or viewer, check your email for your
              login credentials.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
