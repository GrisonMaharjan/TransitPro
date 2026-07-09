import apiClient from './apiClient';

export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', {
    name: userData.fullName,
    mobileNumber: userData.mobileNumber,
    email: userData.email,
    password: userData.password,
  });

  return response.data;
};