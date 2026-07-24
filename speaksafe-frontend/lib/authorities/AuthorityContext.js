"use client";
import { createContext, useContext, useState } from "react";
import {
  initialReports,
  initialNotifications,
  initialCurrentUser,
} from "./data";

const AuthorityContext = createContext(null);

export function AuthorityProvider({ children }) {
  const [reports, setReports] = useState(initialReports);
  const [notifications] = useState(initialNotifications);
  const [currentUser] = useState(initialCurrentUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    assigned: "all",
    urgency: "all",
  });

  const setFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const applyFilters = (list) =>
    list.filter(
      (r) =>
        (filters.status === "all" || r.status === filters.status) &&
        (filters.category === "all" || r.category === filters.category) &&
        (filters.assigned === "all" || r.assigned === filters.assigned) &&
        (filters.urgency === "all" || r.urgency === filters.urgency),
    );

  const updateField = (id, field, value) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const label =
          field === "assigned"
            ? `Reassigned to ${value}`
            : field === "urgency"
              ? `Urgency changed to ${value}`
              : `Status changed to ${value}`;
        return {
          ...r,
          [field]: value,
          log: [
            ...r.log,
            { d: new Date().toISOString().slice(0, 10), t: label },
          ],
        };
      }),
    );
  };

  const markResolved = (id) => {
    const today = new Date().toISOString().slice(0, 10);
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Resolved",
              log: [...r.log, { d: today, t: "Marked as Resolved" }],
              timeline: [
                ...r.timeline,
                { d: today, t: "Case marked as Resolved" },
              ],
            }
          : r,
      ),
    );
  };

  const addNote = (id, text) => {
    if (!text.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              notes: [...r.notes, { a: currentUser.name, d: today, t: text }],
              log: [...r.log, { d: today, t: "Internal note added" }],
            }
          : r,
      ),
    );
  };

  return (
    <AuthorityContext.Provider
      value={{
        reports,
        notifications,
        currentUser,
        sidebarOpen,
        setSidebarOpen,
        filters,
        setFilter,
        applyFilters,
        updateField,
        markResolved,
        addNote,
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
