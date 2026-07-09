import apiClient from './apiClient';

export const processRecharge = async (rechargeData) => {
  const response = await apiClient.post('/recharge', rechargeData);
  return response.data;
};

export const getRechargeHistory = async () => {
  const response = await apiClient.get('/recharge/history');
  return response.data;
};

export const initiateKhaltiPayment = async (amount) => {
  const response = await apiClient.post('/payment/khalti/initiate', { amount });
  return response.data;
};

export const verifyKhaltiPayment = async (paymentData) => {
  const response = await apiClient.post('/payment/khalti/verify', paymentData);
  return response.data;
};

export const initiateEsewaPayment = async (amount) => {
  const response = await apiClient.post('/payment/esewa/initiate', { amount });
  return response.data;
};

export const verifyEsewaPayment = async (paymentData) => {
  const response = await apiClient.post('/payment/esewa/verify', paymentData);
  return response.data;
};