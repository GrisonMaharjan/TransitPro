import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((item) => !item.read).length;
    },
    markAllNotificationsRead: (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, markAllNotificationsRead } = notificationSlice.actions;

export default notificationSlice.reducer;
