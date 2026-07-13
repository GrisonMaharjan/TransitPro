import apiClient from './apiClient';

export const getTransactions = async () => {
  try {
    const response = await apiClient.get('/user/transactions');
    return response.data || [];
  } catch (error) {
    console.error('[TransactionService] Get Transactions Error:', error.message);
    throw error;
  }
};

export const getTransactionHistory = async () => {
  try {
    const response = await apiClient.get('/transactions');
    return response.data?.transactions || response.data || [];
  } catch (error) {
    console.error('[TransactionService] Get Transaction History Error:', error.message);
    throw error;
  }
};

export const getRecentTransactions = async (limit = 10) => {
  try {
    const history = await getTransactionHistory();
    return Array.isArray(history) ? history.slice(0, limit) : [];
  } catch (error) {
    console.error('[TransactionService] Get Recent Transactions Error:', error.message);
    throw error;
  }
};
