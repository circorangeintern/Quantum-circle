"use client";

import { useState } from "react";
import StatusCard from "./StatusCard";
import { checkStatus } from "../../lib/reports";

// Pattern: four alphanumeric chars, hyphen, four alphanumeric chars (case-insensitive)
const REFERENCE_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export default function CheckStatusForm() {
  const [referenceCode, setReferenceCode] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [notFoundError, setNotFoundError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors/results
    setValidationError("");
    setNotFoundError("");
    setReport(null);

    // Client-side validation before firing API call
    if (!REFERENCE_CODE_REGEX.test(referenceCode.trim())) {
      setValidationError(
        "Please enter a valid reference code in the format XXXX-XXXX (letters and numbers only).",
      );
      return;
    }

    setLoading(true);
    try {
      const data = await checkStatus(referenceCode.trim().toUpperCase());
      setReport(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setNotFoundError("No report found for that reference code.");
      } else {
        setNotFoundError(
          err?.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-3xl font-bold">Check Report Status</h1>

        <p className="text-gray-600">
          Enter the reference code you received after submitting your report.
        </p>

        <div className="space-y-1">
          <input
            id="referenceCode"
            aria-label="Reference code"
            value={referenceCode}
            onChange={(e) => {
              setReferenceCode(e.target.value);
              setValidationError("");
              setNotFoundError("");
            }}
            placeholder="e.g. ABCD-1234"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            spellCheck={false}
          />
          {validationError && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-sm text-red-600"
            >
              {validationError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg p-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-busy={loading}
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {notFoundError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
        >
          {notFoundError}
        </div>
      )}

      {report && <StatusCard report={report} referenceCode={referenceCode.trim().toUpperCase()} />}
    </>
  );
}
