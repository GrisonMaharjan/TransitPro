import { createSlice } from '@reduxjs/toolkit';

const cardSlice = createSlice({
  name: 'card',
  initialState: {
    cards: [],
    selectedCard: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCards: (state, action) => {
      state.cards = action.payload;
    },
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload;
    },
  },
});

export const { setCards, setSelectedCard } = cardSlice.actions;

export default cardSlice.reducer;
