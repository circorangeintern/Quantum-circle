"use client";

import { useState } from "react";
import StatusCard from "./StatusCard";
import { toast } from "sonner";

export default function CheckStatusForm() {
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    const reports = JSON.parse(localStorage.getItem("reports")) || [];

    const foundReport = reports.find(
      (item) =>
        item.trackingId.trim().toUpperCase() ===
        trackingId.trim().toUpperCase(),
    );

    setTimeout(() => {
      if (foundReport) {
        setReport(foundReport);
      } else {
        setReport(null);
        toast.error("Tracking ID not found.");
      }

      setLoading(false);
    }, 500);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-3xl font-bold">Check a Report</h1>

        <p>Enter the tracking ID you were given after submitting a report.</p>

        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="SS-2026-PNYFX6"
          className="w-full border rounded-lg p-3"
        />

        <button
          className="w-full bg-blue-600 text-white rounded-lg p-3"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {report && <StatusCard report={report} />}
    </>
  );
}
