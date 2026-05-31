import { apiClient } from './config';

export interface PaymentFilters {
  orderId?: number | string;
  retailerId?: number | string;
}

export const createPayment = async (order_id: number | string, amount: number, method: string) => {
  const response = await apiClient.post('/payments', { order_id, amount, method });
  return response.data;
};

export const getPayments = async (filters?: PaymentFilters) => {
  const params = filters ? { ...filters } : undefined;
  const response = await apiClient.get('/payments', { params });
  return response.data;
};
