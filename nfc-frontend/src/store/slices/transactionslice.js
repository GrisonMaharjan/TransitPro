import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTransactionHistory, getRecentTransactions } from '../../services/api/transactionService';

const initialState = {
  transactions: [],
  recentTransactions: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await getTransactionHistory(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchRecentTransactions = createAsyncThunk(
  'transaction/fetchRecent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRecentTransactions(10);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent transactions');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
      });
  },
});

export default transactionSlice.reducer;