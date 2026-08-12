import api from "./axios";
import axios from "axios";

export const getDashboardReports = async (filters) => {
  const response = await api.get("/reports/dashboard", { params: filters });
  return response.data;
};

export const getReport = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const createReport = async (formData) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/reports`,
    formData
  );
  return response.data;
};

export const updateStatus = async (id, status, note) => {
  const response = await api.put(`/reports/${id}/status`, {
    status,
    ...(note ? { note } : {}),
  });
  return response.data;
};

export const updateUrgency = async (id, urgency) => {
  const response = await api.put(`/reports/${id}/urgency`, { urgency });
  return response.data;
};

export const assignReport = async (id, adminId) => {
  const response = await api.put(`/reports/${id}/assign`, { adminId });
  return response.data;
};

export const addNote = async (id, note) => {
  const response = await api.post(`/reports/${id}/notes`, { note });
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get("/reports/analytics/summary");
  return response.data;
};

export const exportReports = async (format) => {
  const response = await api.get("/reports/export", {
    params: { format },
    responseType: "blob",
  });
  return response.data;
};

export const checkStatus = async (referenceCode) => {
  const response = await api.get(`/reports/status/${referenceCode}`);
  return response.data.data;
};
