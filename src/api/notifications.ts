import { apiClient } from './config';

export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

export const markAsRead = async (id: number | string) => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return response.data;
};
