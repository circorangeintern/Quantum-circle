import api from "./api";

export const getReports = () => api.get("/reports");

export const getReport = (id) => api.get(`/reports/${id}`);

export const createReport = (data) => api.post("/reports", data);
