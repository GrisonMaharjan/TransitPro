import apiClient from './apiClient';

export const getRoutes = async () => {
  try {
    const response = await apiClient.get('/routes');
    return response.data || [];
  } catch (error) {
    console.error('[RouteService] Get Routes Error:', error.message);
    throw error;
  }
};

export default {
  getRoutes,
};
