import api from "./axios";

export const submitRegistration = async (data) => {
  const response = await api.post("/registrations", data);
  return response.data;
};

export const getRegistrations = async (params) => {
  const response = await api.get("/registrations", { params });
  return response.data;
};

export const getRegistrationStats = async () => {
  const response = await api.get("/registrations/stats");
  return response.data;
};

export const reviewRegistration = async (id, status, reviewNotes) => {
  const response = await api.put(`/registrations/${id}/review`, {
    status,
    ...(reviewNotes ? { reviewNotes } : {}),
  });
  return response.data;
};
