"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  getDashboardReports,
  getReport,
  updateStatus as apiUpdateStatus,
  updateUrgency as apiUpdateUrgency,
  assignReport as apiAssignReport,
  addNote as apiAddNote,
  deleteReport as apiDeleteReport,
} from "@/app/lib/reports";

const AuthorityContext = createContext(null);

export function AuthorityProvider({ children }) {
  const { user: currentUser } = useAuth();

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [summary, setSummary] = useState({
    total: 0,
    new: 0,
    open: 0,
    investigating: 0,
    resolved: 0,
    active: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    urgency: "all",
    assignedTo: "all",
    search: "",
    sortBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  /**
   * Build query params object from filters, omitting "all" and empty values
   * so the backend only receives meaningful filter parameters.
   */
  const buildQueryParams = useCallback((overrideFilters) => {
    const f = overrideFilters ?? filters;
    const params = {};
    if (f.status && f.status !== "all") params.status = f.status;
    if (f.category && f.category !== "all") params.category = f.category;
    if (f.urgency && f.urgency !== "all") params.urgency = f.urgency;
    if (f.assignedTo && f.assignedTo !== "all") params.assignedTo = f.assignedTo;
    if (f.search && f.search !== "") params.search = f.search;
    if (f.sortBy && f.sortBy !== "") params.sortBy = f.sortBy;
    return params;
  }, [filters]);

  /**
   * Fetch paginated reports from the backend dashboard endpoint.
   * Accepts an optional filters override (used internally after mutations).
   */
  /**
   * Derive a typed error object from an axios error.
   * - 403 → forbidden (do NOT mutate list state)
   * - 404 → not_found
   * - 5xx / network → server_error
   */
  const parseError = (err, resourceLabel = "resource") => {
    const status = err?.response?.status;
    if (status === 403) {
      return {
        type: "forbidden",
        message: "You do not have permission to perform this action.",
      };
    }
    if (status === 404) {
      return {
        type: "not_found",
        message: `The requested ${resourceLabel} was not found.`,
      };
    }
    // 5xx or network failure
    return {
      type: "server_error",
      message: err?.response?.data?.message ?? "Something went wrong. Please try again.",
    };
  };

  const clearError = useCallback(() => setError(null), []);

  const fetchReports = useCallback(async (overrideFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildQueryParams(overrideFilters);
      const data = await getDashboardReports(params);
      // Response shape: { success, data: { reports, pagination, summary } }
      const payload = data?.data ?? data;
      setReports(payload?.reports ?? []);
      setPagination(
        payload?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 }
      );
      setSummary(
        payload?.summary ?? {
          total: 0,
          new: 0,
          open: 0,
          investigating: 0,
          resolved: 0,
          active: 0,
        }
      );
    } catch (err) {
      const status = err?.response?.status;
      const errorObj = parseError(err, "reports");
      setError(errorObj);
      // For 403, do NOT mutate list state — already guarded by not reaching setReports above
      // Show toast only for non-403 errors (403 renders inline)
      if (status !== 403) {
        toast.error(errorObj.message);
      }
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Re-fetch whenever any filter value changes
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.status,
    filters.category,
    filters.urgency,
    filters.assignedTo,
    filters.search,
    filters.sortBy,
  ]);

  /**
   * Fetch a single report by ID.
   * Returns the report object so the caller can use it.
   */
  const fetchReport = useCallback(async (id) => {
    try {
      const data = await getReport(id);
      return data?.data ?? data;
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to load report";
      toast.error(message);
      throw err;
    }
  }, []);

  /**
   * Update a report's status and optional note.
   */
  const updateStatus = useCallback(async (id, status, note) => {
    try {
      await apiUpdateStatus(id, status, note);
      toast.success("Report status updated");
      await fetchReports();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to update status";
      toast.error(message);
      throw err;
    }
  }, [fetchReports]);

  /**
   * Update a report's urgency level.
   */
  const updateUrgency = useCallback(async (id, urgency) => {
    try {
      await apiUpdateUrgency(id, urgency);
      toast.success("Report urgency updated");
      await fetchReports();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to update urgency";
      toast.error(message);
      throw err;
    }
  }, [fetchReports]);

  /**
   * Assign a report to a specific admin user.
   */
  const assignReport = useCallback(async (id, adminId) => {
    try {
      await apiAssignReport(id, adminId);
      toast.success("Report assigned successfully");
      await fetchReports();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to assign report";
      toast.error(message);
      throw err;
    }
  }, [fetchReports]);

  /**
   * Add an internal note to a report.
   */
  const addNote = useCallback(async (id, text) => {
    if (!text || !text.trim()) return;
    try {
      await apiAddNote(id, text);
      toast.success("Note added successfully");
      await fetchReports();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to add note";
      toast.error(message);
      throw err;
    }
  }, [fetchReports]);

  /**
   * Delete a report by ID.
   */
  const deleteReport = useCallback(async (id) => {
    try {
      await apiDeleteReport(id);
      toast.success("Report deleted successfully");
      await fetchReports();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to delete report";
      toast.error(message);
      throw err;
    }
  }, [fetchReports]);

  return (
    <AuthorityContext.Provider
      value={{
        reports,
        pagination,
        summary,
        currentUser,
        sidebarOpen,
        setSidebarOpen,
        filters,
        setFilter,
        loading,
        error,
        clearError,
        fetchReports,
        fetchReport,
        updateStatus,
        updateUrgency,
        assignReport,
        addNote,
        deleteReport,
      }}
    >
      {children}
    </AuthorityContext.Provider>
  );
}

export function useAuthority() {
  const ctx = useContext(AuthorityContext);
  if (!ctx)
    throw new Error("useAuthority must be used inside AuthorityProvider");
  return ctx;
}
