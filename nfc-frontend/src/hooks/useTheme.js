import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Light Theme Colors
export const lightTheme = {
  id: 'light',
  colors: {
    primary: '#0F4C81',
    primaryLight: '#3B6EA5',
    primaryDark: '#0A3A62',
    secondary: '#E63946',
    secondaryLight: '#FF6B7C',
    secondaryDark: '#C1121F',
    accent: '#F4A261',
    success: '#2A9D8F',
    warning: '#E9C46A',
    error: '#E76F51',
    info: '#4A90E2',
    
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceGray: '#F3F4F6',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
    
    icon: '#6B7280',
    iconActive: '#0F4C81',
    placeholder: '#9CA3AF',
    
    statusBar: 'dark-content',
    navigationBar: '#FFFFFF',
  },
};

// Dark Theme Colors
export const darkTheme = {
  id: 'dark',
  colors: {
    primary: '#3B6EA5',
    primaryLight: '#5B8EC5',
    primaryDark: '#1A4A7A',
    secondary: '#FF6B7C',
    secondaryLight: '#FF8B9C',
    secondaryDark: '#C1121F',
    accent: '#F4A261',
    success: '#2A9D8F',
    warning: '#E9C46A',
    error: '#E76F51',
    info: '#4A90E2',
    
    background: '#111827',
    surface: '#1F2937',
    surfaceGray: '#374151',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#374151',
    borderLight: '#4B5563',
    divider: '#374151',
    
    icon: '#9CA3AF',
    iconActive: '#3B6EA5',
    placeholder: '#6B7280',
    
    statusBar: 'light-content',
    navigationBar: '#1F2937',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'dark') {
        setTheme(darkTheme);
      } else {
        setTheme(lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.id === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme.id);
  };

  const setLightTheme = async () => {
    setTheme(lightTheme);
    await AsyncStorage.setItem('app_theme', 'light');
  };

  const setDarkTheme = async () => {
    setTheme(darkTheme);
    await AsyncStorage.setItem('app_theme', 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark: theme.id === 'dark',
      isLight: theme.id === 'light',
      toggleTheme,
      setLightTheme,
      setDarkTheme,
      isLoading,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};