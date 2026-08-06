"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getAdmin } from "@/app/lib/authStorage";
import {
  getRegistrations,
  getRegistrationStats,
  reviewRegistration,
} from "@/app/lib/registrations";
import {
  getAdminUsers,
  createAdminUser as createAdminUserService,
  resetAdminPassword as resetAdminPasswordService,
} from "@/app/lib/adminUsers";

const AdminContext = createContext(null);

/** Normalize a registration record from the API shape to the shape consuming components expect. */
function normalizeRegistration(reg) {
  const rawStatus = reg.status || "pending";
  const capitalizedStatus =
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  return {
    ...reg,
    // Ensure id is always a plain string
    id: reg.id?.toString() ?? reg._id?.toString() ?? reg.id,
    // Fields expected by existing components
    name: reg.adminName || reg.schoolName || "",
    email: reg.adminEmail || "",
    school: reg.schoolName || "",
    role: reg.role || "School Admin",
    date: reg.submittedAt ? reg.submittedAt.slice(0, 10) : "",
    status: capitalizedStatus,
  };
}

export function AdminProvider({ children }) {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Error helpers ───────────────────────────────────────────────────────────

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
    return {
      type: "server_error",
      message: err?.response?.data?.message ?? "Something went wrong. Please try again.",
    };
  };

  const clearError = useCallback(() => setError(null), []);

  // ── Fetch helpers ───────────────────────────────────────────────────────────

  const fetchRegistrations = useCallback(async (filters) => {
    try {
      const data = await getRegistrations(filters);
      const list = (data?.data?.registrations ?? data?.registrations ?? data?.data ?? []).map(normalizeRegistration);
      setRegistrations(list);
    } catch (err) {
      setError(parseError(err, "registrations"));
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getRegistrationStats();
      setStats(data?.data ?? data?.stats ?? data ?? { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      setError(parseError(err, "stats"));
    }
  }, []);

  const fetchAdminUsers = useCallback(async () => {
    try {
      const data = await getAdminUsers();
      setAdminUsers(data?.adminUsers ?? data?.data ?? data ?? []);
    } catch (err) {
      setError(parseError(err, "admin users"));
    }
  }, []);

  // ── Mount effect ────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const role = getAdmin()?.role;

    async function loadAll() {
      setLoading(true);
      if (role === "system-admin") {
        // System-admin: fetch registrations, stats, and admin users
        await Promise.allSettled([
          fetchRegistrations(),
          fetchStats(),
          fetchAdminUsers(),
        ]);
      }
      // School-admin: no system-admin-only fetches needed on mount
      if (!cancelled) setLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Registration actions ────────────────────────────────────────────────────

  const approveRegistration = useCallback(async (id) => {
    try {
      await reviewRegistration(id, "approved");
      toast.success("Registration approved");
      await Promise.all([fetchRegistrations(), fetchStats()]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    }
  }, [fetchRegistrations, fetchStats]);

  const rejectRegistration = useCallback(async (id, note) => {
    try {
      await reviewRegistration(id, "rejected", note);
      toast.success("Registration rejected");
      await Promise.all([fetchRegistrations(), fetchStats()]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    }
  }, [fetchRegistrations, fetchStats]);

  // Backward-compatible aliases
  const approveRequest = useCallback((id) => approveRegistration(id), [approveRegistration]);
  const rejectRequest = useCallback((id) => rejectRegistration(id), [rejectRegistration]);

  // ── Admin-user actions ──────────────────────────────────────────────────────

  const createAdminUser = useCallback(async (data) => {
    try {
      await createAdminUserService(data);
      toast.success("Admin user created");
      await fetchAdminUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    }
  }, [fetchAdminUsers]);

  const updateAdminUser = useCallback(async (_id, _data) => {
    toast.error("Update admin user is not supported in this version.");
  }, []);

  const deleteAdminUser = useCallback(async (_id) => {
    toast.error("Delete admin user is not supported in this version.");
  }, []);

  const resetAdminPassword = useCallback(async (id) => {
    try {
      const result = await resetAdminPasswordService(id);
      toast.success("Password reset");
      await fetchAdminUsers();
      return result;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    }
  }, [fetchAdminUsers]);

  // ── Context value ───────────────────────────────────────────────────────────

  return (
    <AdminContext.Provider
      value={{
        // Registration state — both names point to the same array
        registrations,
        signupRequests: registrations,
        stats,
        // Admin users
        adminUsers,
        // Loading / error
        loading,
        error,
        clearError,
        // Sidebar
        sidebarOpen,
        setSidebarOpen,
        // Fetch methods
        fetchRegistrations,
        fetchStats,
        fetchAdminUsers,
        // Registration actions
        approveRegistration,
        rejectRegistration,
        // Backward-compatible aliases (used by RequestsTable)
        approveRequest,
        rejectRequest,
        // Admin-user actions
        createAdminUser,
        updateAdminUser,
        deleteAdminUser,
        resetAdminPassword,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
