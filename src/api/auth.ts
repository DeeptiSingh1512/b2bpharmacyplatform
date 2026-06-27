import { apiClient } from './config';

interface LoginResponse {
  token: string;
  user?: Record<string, unknown>;
}

export const login = async (email: string, password: string) => {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  const { token } = response.data;
  localStorage.setItem('token', token);
  return response.data;
};

export const register = async (
  fullName: string,
  email: string,
  password: string,
  phone: string,
) => {
  const response = await apiClient.post('/auth/register', {
    fullName,
    email,
    password,
    phone,
  });
  return response.data;
};

export const getRetailers = async () => {
  const response = await apiClient.get('/auth/users');
  return response.data;
};

export const approveRetailer = async (id: number | string) => {
  const response = await apiClient.put(`/auth/users/${id}/approve`);
  return response.data;
};

export const rejectRetailer = async (id: number | string) => {
  const response = await apiClient.put(`/auth/users/${id}/reject`);
  return response.data;
};
