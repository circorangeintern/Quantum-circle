import axios from "axios";
import {
  getToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  logout,
} from "./authStorage";

import { refreshToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await refreshToken(getRefreshToken());

        const tokens = response.data.tokens;

        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

        return api(originalRequest);
      } catch {
        logout();

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
export default api;
