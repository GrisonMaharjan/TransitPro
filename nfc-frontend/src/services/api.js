// services/api.js
// Replace BASE_URL with your actual backend URL
import axios from 'axios';

const BASE_URL = 'http://your-backend-url:5000/api'; // TODO: update this

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await import('./storage').then(m => m.getToken());
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Wallet
export const getBalance = () => api.get('/wallet/balance');
export const topUp = (amount, gateway) => api.post('/wallet/topup', { amount, gateway });

// Trips
export const getTripHistory = () => api.get('/trips');

// NFC
export const validateTap = (tagId) => api.post('/nfc/validate', { tagId });
export const processFare = (tapData) => api.post('/nfc/fare', tapData);

// Fare Routes
export const getFareList = () => api.get('/fares');

export default api;