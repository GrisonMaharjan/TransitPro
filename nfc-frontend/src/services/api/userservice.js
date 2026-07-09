import apiClient from './apiClient';

export const getProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};