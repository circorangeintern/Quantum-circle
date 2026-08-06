import api from "./axios";

export const getAdminUsers = async () => {
  const response = await api.get("/system");
  return response.data;
};

export const createAdminUser = async (data) => {
  const response = await api.post("/system", data);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await api.get("/system/stats");
  return response.data;
};

export const getAdminUser = async (id) => {
  const response = await api.get(`/system/${id}`);
  return response.data;
};

export const resetAdminPassword = async (id) => {
  const response = await api.post(`/system/${id}/reset-password`);
  return response.data;
};
