// src/screens/auth/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../../store/slices/authslice';
import storageService from '../../services/storage/storageService';
import { colors, typography, spacing } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check authentication status
    const checkAuth = async () => {
      const token = await storageService.getItem('token');
      const user = await storageService.getItem('user');

      setTimeout(() => {
        if (token && user) {
          dispatch(setAuthenticated(true));
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }, 2500);
    };

    checkAuth();
  }, [dispatch, navigation, fadeAnim, scaleAnim, logoAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Animated.Text
            style={[
              styles.logoText,
              {
                opacity: logoAnim,
              },
            ]}
          >
            🚌
          </Animated.Text>
        </View>
        <Animated.Text style={[styles.appName, { opacity: logoAnim }]}>
          BusPay Nepal
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: logoAnim }]}>
          Tap. Ride. Pay.
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.white + 'CC',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.7,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.white + '33',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  loadingText: {
    ...typography.caption,
    color: colors.white + 'CC',
  },
});

export default SplashScreen;
