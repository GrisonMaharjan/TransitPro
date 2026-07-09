import apiClient from './apiClient';

export const getTransactions = async () => {
  const response = await apiClient.get('/user/transactions');
  return response.data;
};