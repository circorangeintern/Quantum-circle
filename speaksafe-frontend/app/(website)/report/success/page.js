"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

function SuccessContent() {
  const searchParams = useSearchParams();
  const trackingId = searchParams.get("ref");

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(trackingId ?? "");

      toast.success("Tracking ID copied!");
    } catch {
      toast.error("Unable to copy Tracking ID.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 size={70} className="mb-5 text-green-600" />

          <h1 className="text-3xl font-bold text-gray-900">Report Submitted</h1>

          <p className="mt-4 text-gray-600">Your report has been submitted.</p>

          <p className="mt-2 text-gray-600">
            A school authority will review it shortly. Save the tracking ID
            below. You'll need it if you want to check the status of your report
            later.
          </p>
        </div>

        <div className="mt-8 rounded-xl border bg-gray-50 p-6">
          <p className="text-sm font-medium text-gray-500">Tracking ID</p>

          <h2 className="mt-2 break-all text-3xl font-bold tracking-wider text-blue-700">
            {trackingId}
          </h2>

          <p className="mt-4 text-sm text-red-500">
            Keep this ID safe. It can only be generated once.
          </p>
        </div>

        <button
          onClick={copyTrackingId}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-medium transition hover:bg-gray-100"
        >
          <Copy size={18} />
          Copy Tracking ID
        </button>

        <Link
          href="/"
          className="mt-4 block w-full rounded-lg bg-blue-700 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
