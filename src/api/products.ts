import { apiClient } from './config';

export interface ProductFilters {
  category?: string;
  search?: string;
}

export const getAllProducts = async (filters?: ProductFilters) => {
  const params = filters ? { ...filters } : undefined;
  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const createProduct = async (data: Record<string, unknown>) => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: number | string, data: Record<string, unknown>) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number | string) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};
