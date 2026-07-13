import apiClient from './apiClient';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (!response.data.token) {
      throw new Error('No token received from server');
    }

    return response.data;
  } catch (error) {
    console.error('[AuthService] Login Error:', error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    if (!userData || !userData.email || !userData.password || !userData.mobileNumber) {
      throw new Error('Missing required registration fields');
    }

    if (!EMAIL_REGEX.test(userData.email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    if (!MOBILE_REGEX.test(String(userData.mobileNumber).trim())) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }

    if (!STRONG_PASSWORD_REGEX.test(userData.password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
    }

    const response = await apiClient.post('/auth/register', {
      name: userData.fullName || userData.name,
      mobileNumber: userData.mobileNumber,
      email: userData.email,
      password: userData.password,
    });

    if (!response.data.token) {
      throw new Error('No token received from server');
    }

    return response.data;
  } catch (error) {
    console.error('[AuthService] Register Error:', error.message);
    throw error;
  }
};
