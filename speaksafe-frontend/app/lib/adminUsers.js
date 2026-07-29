import api from "./axios";

export const getAdminUsers = async () => {
  const response = await api.get("/admin-users");
  return response.data;
};

export const createAdminUser = async (data) => {
  const response = await api.post("/admin-users", data);
  return response.data;
};

export const updateAdminUser = async (id, data) => {
  const response = await api.put(`/admin-users/${id}`, data);
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin-users/${id}`);
  return response.data;
};

export const resetAdminPassword = async (id) => {
  const response = await api.post(`/admin-users/${id}/reset-password`);
  return response.data;
};
