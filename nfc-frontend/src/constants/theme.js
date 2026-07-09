// src/constants/theme.js
import { DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const colors = {
  primary: '#0F4C81',
  primaryLight: '#3B6EA5',
  primaryDark: '#0A3A62',
  secondary: '#E63946',
  secondaryLight: '#FF6B7C',
  secondaryDark: '#C1121F',
  accent: '#F4A261',
  accentLight: '#F7C08A',
  success: '#2A9D8F',
  warning: '#E9C46A',
  error: '#E76F51',
  info: '#4A90E2',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: 'bold', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: 'bold', lineHeight: 28 },
  title: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight + '20',
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight + '20',
    accent: colors.accent,
    background: colors.gray50,
    surface: colors.white,
    error: colors.error,
    text: colors.gray900,
    textSecondary: colors.gray600,
    border: colors.gray200,
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primary + '20',
    secondary: colors.secondaryLight,
    secondaryContainer: colors.secondary + '20',
    accent: colors.accent,
    background: colors.gray900,
    surface: colors.gray800,
    error: colors.error,
    text: colors.gray100,
    textSecondary: colors.gray400,
    border: colors.gray700,
  },
  roundness: 12,
};