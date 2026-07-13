import apiClient from './apiClient';

const cardService = {
  getCardDetails: async () => {
    try {
      const response = await apiClient.get('/cards');
      return response.data;
    } catch (error) {
      console.error('[CardService] Get Card Details Error:', error.message);
      throw error;
    }
  },

  getCards: async () => {
    try {
      const response = await apiClient.get('/cards/all');
      return response.data;
    } catch (error) {
      console.error('[CardService] Get Cards Error:', error.message);
      throw error;
    }
  },

  addCard: async (cardData) => {
    try {
      if (!cardData) {
        throw new Error('Card data is required');
      }
      const response = await apiClient.post('/cards', cardData);
      return response.data;
    } catch (error) {
      console.error('[CardService] Add Card Error:', error.message);
      throw error;
    }
  },

  blockCard: async (cardId) => {
    try {
      if (!cardId) {
        throw new Error('Card ID is required');
      }
      const response = await apiClient.patch(`/cards/${cardId}/block`);
      return response.data;
    } catch (error) {
      console.error('[CardService] Block Card Error:', error.message);
      throw error;
    }
  },

  unblockCard: async (cardId) => {
    try {
      if (!cardId) {
        throw new Error('Card ID is required');
      }
      const response = await apiClient.patch(`/cards/${cardId}/unblock`);
      return response.data;
    } catch (error) {
      console.error('[CardService] Unblock Card Error:', error.message);
      throw error;
    }
  },

  setDefaultCard: async (cardId) => {
    try {
      if (!cardId) {
        throw new Error('Card ID is required');
      }
      const response = await apiClient.patch(`/cards/${cardId}/default`);
      return response.data;
    } catch (error) {
      console.error('[CardService] Set Default Card Error:', error.message);
      throw error;
    }
  },
};

export default cardService;