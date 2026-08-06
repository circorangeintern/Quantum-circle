import api from "./axios";
import axios from "axios";

// Public — no auth required
export const getPublicSchools = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/schools/public`
  );
  return response.data;
};

export const getSchool = async (id) => {
  const response = await api.get(`/schools/${id}`);
  return response.data;
};

export const updateSchool = async (id, data) => {
  const response = await api.put(`/schools/${id}`, data);
  return response.data;
};

export const getStaff = async (schoolId) => {
  const response = await api.get(`/schools/${schoolId}/staffs`);
  return response.data;
};

export const inviteStaff = async (schoolId, data) => {
  const response = await api.post(`/schools/${schoolId}/invite`, data);
  return response.data;
};

export const removeStaff = async (schoolId, staffId) => {
  const response = await api.delete(`/schools/${schoolId}/staffs/${staffId}`);
  return response.data;
};
