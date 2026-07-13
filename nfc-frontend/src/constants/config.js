import { NativeModules, Platform } from 'react-native';

const normalizeBaseUrl = (value) => value.replace(/\/$/, '');

const ensureApiSuffix = (value) => {
  const normalized = normalizeBaseUrl(value);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const resolveHostFromMetro = () => {
  const scriptUrl = NativeModules?.SourceCode?.scriptURL;
  if (!scriptUrl) {
    return null;
  }

  const match = scriptUrl.match(/^(?:https?:\/\/|exp:\/\/)([^:/]+)(?::\d+)?/);
  return match?.[1] || null;
};

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL;
  if (envUrl) {
    return ensureApiSuffix(envUrl);
  }

  const metroHost = resolveHostFromMetro();
  if (metroHost) {
    return `http://${metroHost}:3000/api`;
  }

  return Platform.select({
    android: 'http://192.168.1.70:3000/api',
    ios: 'http://192.168.1.70:3000/api',
    default: 'http://192.168.1.70:3000/api',
  });
};

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  TIMEOUT: 10000,
};
