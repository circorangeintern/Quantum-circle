import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold text-[#142353]">403</h1>

      <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>

      <p className="mt-3 text-slate-600">
        You don't have permission to access this page.
      </p>

      <Link
        href="/login"
        className="mt-6 rounded-lg bg-[#142353] px-6 py-3 text-white"
      >
        Back to Login
      </Link>
    </div>
  );
}
