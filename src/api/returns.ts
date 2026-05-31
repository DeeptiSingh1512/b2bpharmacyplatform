import { apiClient } from './config';

export const createReturn = async (
  order_id: number | string,
  reason: string,
  refund_method: string,
) => {
  const response = await apiClient.post('/returns', { order_id, reason, refund_method });
  return response.data;
};

export const getReturns = async () => {
  const response = await apiClient.get('/returns');
  return response.data;
};

export const updateReturnStatus = async (id: number | string, status: string) => {
  const response = await apiClient.put(`/returns/${id}/status`, { status });
  return response.data;
};
