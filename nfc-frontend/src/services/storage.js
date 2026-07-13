import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@yatrapay_token',
  USER: '@yatrapay_user',
  OFFLINE_TAPS: '@yatrapay_offline_taps',
};

// ─── Token ────────────────────────────────────────────────────────
export const setToken = async (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  } catch (error) {
    console.error('[Storage] setToken Error:', error.message);
    throw error;
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(KEYS.TOKEN);
    return token;
  } catch (error) {
    console.error('[Storage] getToken Error:', error.message);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  } catch (error) {
    console.error('[Storage] removeToken Error:', error.message);
    throw error;
  }
};

// ─── User ─────────────────────────────────────────────────────────
export const setUser = async (user) => {
  try {
    if (!user) {
      throw new Error('User data is required');
    }
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('[Storage] setUser Error:', error.message);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('[Storage] getUser Error:', error.message);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
  } catch (error) {
    console.error('[Storage] removeUser Error:', error.message);
    throw error;
  }
};

// ─── Offline tap queue (for when internet is unavailable) ─────────
export const queueOfflineTap = async (tapData) => {
  try {
    if (!tapData) {
      throw new Error('Tap data is required');
    }
    const existing = await getOfflineTaps();
    existing.push({ ...tapData, queuedAt: Date.now() });
    await AsyncStorage.setItem(KEYS.OFFLINE_TAPS, JSON.stringify(existing));
  } catch (error) {
    console.error('[Storage] queueOfflineTap Error:', error.message);
    throw error;
  }
};

export const getOfflineTaps = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_TAPS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('[Storage] getOfflineTaps Error:', error.message);
    return [];
  }
};

export const clearOfflineTaps = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.OFFLINE_TAPS);
  } catch (error) {
    console.error('[Storage] clearOfflineTaps Error:', error.message);
    throw error;
  }
};

// ─── Logout helper ────────────────────────────────────────────────
export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER, KEYS.OFFLINE_TAPS]);
  } catch (error) {
    console.error('[Storage] clearAll Error:', error.message);
    throw error;
  }
};