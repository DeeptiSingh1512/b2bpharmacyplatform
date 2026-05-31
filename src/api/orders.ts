import { apiClient } from './config';

export interface OrderItemRequest {
  product_id: number;
  quantity: number;
}

export const createOrder = async (items: OrderItemRequest[], payment_method: string) => {
  const response = await apiClient.post('/orders', { items, payment_method });
  return response.data;
};

export const getOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const getOrderById = async (id: number | string) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: number | string, status: string) => {
  const response = await apiClient.put(`/orders/${id}/status`, { status });
  return response.data;
};
