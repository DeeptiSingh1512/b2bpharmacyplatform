import { apiClient } from './config';

export const getCredit = async (retailerId: number | string) => {
  const response = await apiClient.get(`/credit/${retailerId}`);
  return response.data;
};

export const setCredit = async (retailer_id: number | string, credit_limit: number) => {
  const response = await apiClient.post('/credit', { retailer_id, credit_limit });
  return response.data;
};

export const requestCredit = async (amount: number, note?: string) => {
  const response = await apiClient.post('/credit/request', { amount, note });
  return response.data;
};
