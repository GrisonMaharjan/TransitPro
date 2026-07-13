// src/store/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authslice';
import userReducer from './slices/userslice';
import cardReducer from './slices/cardslice';
import transactionReducer from './slices/transactionslice';
import routeReducer from './slices/routeslice';
import notificationReducer from './slices/notificationslice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'card'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  card: cardReducer,
  transaction: transactionReducer,
  route: routeReducer,
  notification: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
