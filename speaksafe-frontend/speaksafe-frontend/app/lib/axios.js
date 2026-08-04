import axios from "axios";
import {
  getToken,
  getRefreshToken,
  logout as clearAuth,
} from "./authStorage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Authorization: Bearer <accessToken> to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401, attempt token refresh and retry original request.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = getRefreshToken();

        // No refresh token stored — nothing to refresh, just clear and bail
        if (!refreshTokenValue) {
          clearAuth();
          return Promise.reject(error);
        }
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken: refreshTokenValue },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );

        // Remove stale Authorization header so backend reads the fresh cookie.
        delete originalRequest.headers.Authorization;

        return api(originalRequest);
      } catch (refreshError) {
        // Double-401: clear all auth data and redirect to /login
        if (refreshError.response?.status === 401) {
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
