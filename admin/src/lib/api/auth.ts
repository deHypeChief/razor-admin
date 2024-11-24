import api from "./apiConfig/axios";

export const login = async (payload: {
  adminEmail: string;
  pin: string;
}) => {
  const response = await api.post('/admin/signAdmin', payload);
  return response;
};

export const register = async (payload: {
  adminEmail: string;
  pin: string;
  adminName: string;
}) => {
  const response = await api.post('/admin/createAdmin', payload);
  return response.data;
};


export const verify = async (payload: {
  token: string;
}) => {
  const response = await api.post('/admin/verify', payload);
  return response.data;
}
