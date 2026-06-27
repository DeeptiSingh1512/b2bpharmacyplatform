import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = "/login";
    }
    const normalizedError = {
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred. Please try again.",
      data: error?.response?.data,
    };
    return Promise.reject(normalizedError);
  },
);
