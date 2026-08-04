"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentAdmin, logoutUser } from "../lib/auth";
import { saveAuth, logout as clearAuth } from "../lib/authStorage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rehydrate = async () => {
      try {
        // Call GET /auth/me to rehydrate from the server
        const response = await getCurrentAdmin();
        // getCurrentAdmin() returns response.data from axios
        // response shape: { success, data: AdminResponse }
        const adminData = response.data;
        setUser(adminData);
        setSchool(adminData.school ?? null);
      } catch (error) {
        // On 401 (or any auth failure), clear localStorage and set user to null
        // No redirect on mount — let routes handle protection
        if (error.response?.status === 401) {
          clearAuth();
        }
        setUser(null);
        setSchool(null);
      } finally {
        setLoading(false);
      }
    };

    rehydrate();
  }, []);

  /**
   * Called by the login page after POST /auth/login succeeds.
   * Persists tokens, admin, and school to localStorage, then updates state.
   *
   * @param {object} admin  - AdminUser object from the login response
   * @param {object} schoolData - School object (may be null for system-admin)
   * @param {object} tokens - { accessToken, refreshToken }
   */
  const login = (admin, schoolData, tokens) => {
    saveAuth({ tokens, admin, school: schoolData });
    setUser(admin);
    setSchool(schoolData ?? null);
  };

  /**
   * Called to log out the current user.
   * Calls POST /auth/logout, then clears localStorage and resets state.
   */
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore errors from the logout API call — we always clear local state
    } finally {
      clearAuth();
      setUser(null);
      setSchool(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
