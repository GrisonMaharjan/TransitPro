import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setProfile, clearProfile } = userSlice.actions;

export default userSlice.reducer;
