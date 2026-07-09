import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../../services/api/authservice';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const data = await authService.login(email, password);

      await AsyncStorage.setItem(
        'token',
        data.token
      );

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(data)
      );

      return data;

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        'Login failed'
      );

    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {

    try {

      const data =
        await authService.register(userData);

      return data;

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        'Registration failed'
      );

    }
  }
);

const authSlice = createSlice({

  name: 'auth',

  initialState: {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },

  reducers: {

    logout: (state) => {

      state.user = null;
      state.isAuthenticated = false;

      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },

  },

  extraReducers: (builder) => {

    builder

      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  },

});

export const { logout } = authSlice.actions;

export default authSlice.reducer;