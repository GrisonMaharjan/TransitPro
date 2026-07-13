import apiClient from './apiClient';

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    if (!response.data) {
      throw new Error('No profile data received');
    }
    return response.data;
  } catch (error) {
    console.error('[UserService] Get Profile Error:', error.message);
    throw error;
  }
};