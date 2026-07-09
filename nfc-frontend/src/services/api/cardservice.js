import apiClient from './apiClient';

const cardService = {
  getCardDetails: async () => {
    const response = await apiClient.get('/cards');
    return response.data;
  },

  getCards: async () => {
    const response = await apiClient.get('/cards/all');
    return response.data;
  },

  addCard: async (cardData) => {
    const response = await apiClient.post('/cards', cardData);
    return response.data;
  },

  blockCard: async (cardId) => {
    const response = await apiClient.patch(`/cards/${cardId}/block`);
    return response.data;
  },

  unblockCard: async (cardId) => {
    const response = await apiClient.patch(`/cards/${cardId}/unblock`);
    return response.data;
  },

  setDefaultCard: async (cardId) => {
    const response = await apiClient.patch(`/cards/${cardId}/default`);
    return response.data;
  },
};

export default cardService;