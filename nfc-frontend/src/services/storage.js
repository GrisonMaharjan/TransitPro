import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@yatrapay_token',
  USER: '@yatrapay_user',
  OFFLINE_TAPS: '@yatrapay_offline_taps',
};

// ─── Token ────────────────────────────────────────────────────────
export const setToken = (token) => AsyncStorage.setItem(KEYS.TOKEN, token);
export const getToken = () => AsyncStorage.getItem(KEYS.TOKEN);
export const removeToken = () => AsyncStorage.removeItem(KEYS.TOKEN);

// ─── User ─────────────────────────────────────────────────────────
export const setUser = (user) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
export const getUser = async () => {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
};
export const removeUser = () => AsyncStorage.removeItem(KEYS.USER);

// ─── Offline tap queue (for when internet is unavailable) ─────────
export const queueOfflineTap = async (tapData) => {
  const existing = await getOfflineTaps();
  existing.push({ ...tapData, queuedAt: Date.now() });
  await AsyncStorage.setItem(KEYS.OFFLINE_TAPS, JSON.stringify(existing));
};

export const getOfflineTaps = async () => {
  const raw = await AsyncStorage.getItem(KEYS.OFFLINE_TAPS);
  return raw ? JSON.parse(raw) : [];
};

export const clearOfflineTaps = () => AsyncStorage.removeItem(KEYS.OFFLINE_TAPS);

// ─── Logout helper ────────────────────────────────────────────────
export const clearAll = async () => {
  await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
};