import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: '@yatrapay_token',
  USER: '@yatrapay_user',
  OFFLINE_TAPS: '@yatrapay_offline_taps',
};

// ─── Token ────────────────────────────────────────────────────────
export const saveToken = async (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('[StorageService] Save Token Error:', error.message);
    throw error;
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    return token;
  } catch (error) {
    console.error('[StorageService] Get Token Error:', error.message);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('[StorageService] Remove Token Error:', error.message);
    throw error;
  }
};

// ─── User ─────────────────────────────────────────────────────────
export const saveUser = async (user) => {
  try {
    if (!user) {
      throw new Error('User data is required');
    }
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('[StorageService] Save User Error:', error.message);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('[StorageService] Get User Error:', error.message);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('[StorageService] Remove User Error:', error.message);
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
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_TAPS, JSON.stringify(existing));
  } catch (error) {
    console.error('[StorageService] Queue Offline Tap Error:', error.message);
    throw error;
  }
};

export const getOfflineTaps = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_TAPS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('[StorageService] Get Offline Taps Error:', error.message);
    return [];
  }
};

export const clearOfflineTaps = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_TAPS);
  } catch (error) {
    console.error('[StorageService] Clear Offline Taps Error:', error.message);
    throw error;
  }
};

// ─── Logout helper ────────────────────────────────────────────────
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.OFFLINE_TAPS,
    ]);
  } catch (error) {
    console.error('[StorageService] Clear All Storage Error:', error.message);
    throw error;
  }
};