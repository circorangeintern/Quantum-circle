"use client";
import { createContext, useContext, useState } from "react";
import { initialSignupRequests } from "./data";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [signupRequests, setSignupRequests] = useState(initialSignupRequests);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const approveRequest = (id) =>
    setSignupRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)),
    );

  const rejectRequest = (id) =>
    setSignupRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)),
    );

  return (
    <AdminContext.Provider
      value={{
        signupRequests,
        approveRequest,
        rejectRequest,
        sidebarOpen,
        setSidebarOpen,
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
