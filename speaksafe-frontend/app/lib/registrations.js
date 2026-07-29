import api from "./axios";

export const submitRegistration = async (data) => {
  const response = await api.post("/api/registrations", data);
  return response.data;
};

export const getRegistrations = async (params) => {
  const response = await api.get("/api/registrations", { params });
  return response.data;
};

export const getRegistrationStats = async () => {
  const response = await api.get("/api/registrations/stats");
  return response.data;
};

export const reviewRegistration = async (id, status, reviewNotes) => {
  const response = await api.put(`/api/registrations/${id}/review`, {
    status,
    ...(reviewNotes ? { reviewNotes } : {}),
  });
  return response.data;
};
