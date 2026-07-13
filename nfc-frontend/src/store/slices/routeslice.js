import { createSlice } from '@reduxjs/toolkit';

const routeSlice = createSlice({
  name: 'route',
  initialState: {
    routes: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setRoutes: (state, action) => {
      state.routes = action.payload;
    },
  },
});

export const { setRoutes } = routeSlice.actions;

export default routeSlice.reducer;
