import { Platform } from "react-native";

export const API_CONFIG = {
  BASE_URL: Platform.select({
    android: 'http://192.168.1.70:3000/api',
    ios: 'http://192.168.1.70:3000/api',
    default: 'http://192.168.1.70:3000/api',
  }),
  TIMEOUT: 10000,
};