import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageProvider, useLanguage } from './src/hooks/useLanguage';
import { ThemeProvider as GlobalThemeProvider } from './src/hooks/useTheme';
import LanguageSelector from './src/components/LanguageSelector';
import { API_CONFIG } from './src/constants/config';
import BlockNFCScreen from './src/screens/passenger/BlockNFCScreen';
import RouteDetailScreen from './src/screens/passenger/RouteDetailScreen';

const Stack = createStackNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ STORAGE KEYS ============
const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  darkMode: 'darkMode',
};

// ============ API CONFIGURATION ============
const API_BASE_URL = API_CONFIG.BASE_URL;

// ============ API CLIENT ============
const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  // Safely read body text first — response may be empty or non-JSON
  const text = await response.text();
  let json = null;
  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch (_) {
      // Body was not valid JSON — treat as plain text
      if (!response.ok) {
        throw new Error(text || `Server error (${response.status})`);
      }
      return { message: text };
    }
  }
  if (!response.ok) {
    const message = json?.message || json?.error || `Server error (${response.status})`;
    throw new Error(message);
  }
  return json || {};
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const api = {
  async post(endpoint, data, token = null) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      throw new Error(
        `Unable to reach the backend at ${API_BASE_URL}. ` +
        'Check that the backend server is running and that the mobile device can reach the host.'
      );
    }
  },

  async get(endpoint, token = null) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: buildHeaders(token),
      });
      return handleResponse(response);
    } catch (error) {
      throw new Error(
        `Unable to reach the backend at ${API_BASE_URL}. ` +
        'Check that the backend server is running and that the mobile device can reach the host.'
      );
    }
  },

  async put(endpoint, data, token = null) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: buildHeaders(token),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      throw new Error(
        `Unable to reach the backend at ${API_BASE_URL}. ` +
        'Check that the backend server is running and that the mobile device can reach the host.'
      );
    }
  },
};

// ============ THEME CONTEXT ============
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.darkMode).then((val) => {
      if (val !== null) setIsDarkMode(val === 'true');
    });
  }, []);

  const toggleDarkMode = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem(STORAGE_KEYS.darkMode, String(next));
  };

  const colors = isDarkMode
    ? {
        background: '#111827',
        surface: '#1F2937',
        card: '#1F2937',
        border: '#374151',
        text: '#F9FAFB',
        subtext: '#9CA3AF',
        input: '#374151',
        inputText: '#F9FAFB',
        placeholder: '#6B7280',
        navBg: '#1F2937',
        headerBg: '#1F2937',
        sectionTitle: '#F9FAFB',
        statCard: '#1F2937',
        tripCard: '#1F2937',
        historyCard: '#1F2937',
        routeCard: '#1F2937',
        menuSection: '#1F2937',
        menuTitle: '#F9FAFB',
        logoutBg: '#1F2937',
        filterBg: '#374151',
        filterText: '#9CA3AF',
        summaryCard: '#1F2937',
        summaryLabel: '#9CA3AF',
        summaryValue: '#F9FAFB',
        methodBg: '#1F2937',
        methodName: '#F9FAFB',
        methodDesc: '#9CA3AF',
        walletInfoCard: '#1F2937',
        walletInfoLabel: '#9CA3AF',
        walletInfoValue: '#F9FAFB',
      }
    : {
        background: '#F9FAFB',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        border: '#E5E7EB',
        text: '#1F2937',
        subtext: '#6B7280',
        input: '#FFFFFF',
        inputText: '#1F2937',
        placeholder: '#9CA3AF',
        navBg: '#FFFFFF',
        headerBg: '#FFFFFF',
        sectionTitle: '#1F2937',
        statCard: '#FFFFFF',
        tripCard: '#FFFFFF',
        historyCard: '#FFFFFF',
        routeCard: '#FFFFFF',
        menuSection: '#FFFFFF',
        menuTitle: '#1F2937',
        logoutBg: '#FFFFFF',
        filterBg: '#F3F4F6',
        filterText: '#6B7280',
        summaryCard: '#FFFFFF',
        summaryLabel: '#6B7280',
        summaryValue: '#1F2937',
        methodBg: '#FFFFFF',
        methodName: '#1F2937',
        methodDesc: '#6B7280',
        walletInfoCard: '#FFFFFF',
        walletInfoLabel: '#6B7280',
        walletInfoValue: '#1F2937',
      };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// ============ AUTH CONTEXT ============
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.token);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('checkLoginStatus error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    await AsyncStorage.setItem(STORAGE_KEYS.token, authToken);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(authUser));
  };

  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, email: identifier, password });
      const authToken = res.token || res.data?.token;
      const authUser  = res.user  || res.data?.user;
      if (!authToken || !authUser) throw new Error('Login succeeded but server did not return token/user.');
      await saveSession(authToken, authUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: userData.fullName,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        password: userData.password,
      });
      // Support { token, user } at root OR nested under { data: { token, user } }
      const authToken = res.token || res.data?.token;
      const authUser  = res.user  || res.data?.user;
      if (!authToken || !authUser) {
        throw new Error(
          'Registration succeeded but server did not return token/user. ' +
          'Ensure your /auth/register endpoint returns { token, user } in the response body.'
        );
      }
      await saveSession(authToken, authUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      // Optionally call backend logout to invalidate token
      if (token) {
        await api.post('/auth/logout', {}, token).catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============ SHARED COMPONENTS ============
const LoadingSpinner = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#0F4C81" />
      <Text style={[styles.loadingText, { color: colors.subtext }]}>{t('common.loading')}</Text>
    </View>
  );
};

// ============ LOGIN SCREEN ============
const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert(t('common.error'), t('errors.fill_all_fields'));
      return;
    }
    const result = await login(identifier.trim(), password);
    if (!result.success) {
      Alert.alert(t('common.error'), result.error || t('errors.invalid_credentials'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginHeader}>
        <Icon name="bus" size={60} color="#FFFFFF" />
        <Text style={styles.appName}>BusPay Nepal</Text>
        <Text style={styles.appTagline}>Tap. Ride. Pay.</Text>
        <LanguageSelector style={styles.languageSelectorHeader} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{t('auth.welcome_back')}</Text>
        <Text style={styles.subtitle}>{t('auth.login_to_continue')}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.mobile_or_email')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="account" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="98XXXXXXXX or you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
              <Icon name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>{t('auth.no_account')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>{t('auth.sign_up')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ============ REGISTER SCREEN ============
const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleRegister = async () => {
    if (!form.fullName || !form.mobileNumber || !form.email || !form.password || !form.confirmPassword) {
      Alert.alert(t('common.error'), t('errors.fill_all_fields'));
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      Alert.alert(t('common.error'), t('errors.invalid_email'));
      return;
    }
    if (!MOBILE_REGEX.test(form.mobileNumber.trim())) {
      Alert.alert(t('common.error'), t('errors.invalid_mobile'));
      return;
    }
    if (!STRONG_PASSWORD_REGEX.test(form.password)) {
      Alert.alert(t('common.error'), t('errors.password_strength'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert(t('common.error'), t('errors.password_mismatch'));
      return;
    }

    const result = await register(form);
    if (!result.success) {
      Alert.alert(t('common.error'), result.error || t('errors.registration_failed'));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.registerHeader}>
        <Icon name="bus" size={60} color="#FFFFFF" />
        <Text style={styles.appName}>BusPay Nepal</Text>
        <Text style={styles.appTagline}>{t('auth.create_account')}</Text>
        <LanguageSelector style={styles.languageSelectorHeader} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{t('auth.create_account')}</Text>
        <Text style={styles.subtitle}>{t('auth.join_us')}</Text>

        {[
          { label: t('auth.full_name'), field: 'fullName', icon: 'account', placeholder: t('auth.full_name'), keyboard: 'default' },
          { label: t('auth.mobile_number'), field: 'mobileNumber', icon: 'phone', placeholder: '98XXXXXXXX', keyboard: 'phone-pad' },
          { label: t('auth.email'), field: 'email', icon: 'email', placeholder: 'you@example.com', keyboard: 'email-address' },
        ].map(({ label, field, icon, placeholder, keyboard }) => (
          <View style={styles.inputContainer} key={field}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
              <Icon name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                keyboardType={keyboard}
                autoCapitalize="none"
                value={form[field]}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        ))}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.confirm_password')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock-check" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirm_password')}
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.registerButtonText}>{t('auth.sign_up')}</Text>
              <Icon name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t('auth.already_have_account')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{t('auth.sign_in')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// ============ NFC SCAN SCREEN ============
const NFCScanScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  const contentOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });
  const topGlow = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.42],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.scanBackButton, { backgroundColor: colors.surface }]}>
          <Icon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[styles.scanHeaderTitle, { color: colors.text }]}>Scan Your NFC Card</Text>
          <Text style={[styles.scanHeaderSubtitle, { color: colors.subtext }]}>Manage your travel card with a single tap.</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scanScrollContent}
      >
        <Animated.View style={[styles.heroCard, { backgroundColor: colors.surface, opacity: contentOpacity }]}>
          <Animated.View style={[styles.heroGlow, { opacity: topGlow }]} />
          <View style={styles.heroIllustrationWrap}>
            <Animated.View
              style={[
                styles.heroPulseOuter,
                { transform: [{ scale: pulse3 }], opacity: pulse3.interpolate({ inputRange: [1, 1.38], outputRange: [0.32, 0] }) },
              ]}
            />
            <Animated.View
              style={[
                styles.heroPulseMiddle,
                { transform: [{ scale: pulse2 }], opacity: pulse2.interpolate({ inputRange: [1, 1.38], outputRange: [0.45, 0] }) },
              ]}
            />
            <Animated.View
              style={[
                styles.heroPulseInner,
                { transform: [{ scale: pulse1 }], opacity: pulse1.interpolate({ inputRange: [1, 1.38], outputRange: [0.62, 0] }) },
              ]}
            />
            <View style={styles.heroDevice}>
              <View style={styles.heroDeviceSpeaker} />
              <View style={styles.heroNfcBadge}>
                <Icon name="nfc" size={36} color="#0F4C81" />
              </View>
              <View style={styles.heroWaveSet}>
                <View style={styles.heroWaveLine} />
                <View style={[styles.heroWaveLine, styles.heroWaveLineShort]} />
                <View style={[styles.heroWaveLine, styles.heroWaveLineShorter]} />
              </View>
            </View>
            <View style={styles.heroCardToken}>
              <Icon name="credit-card-chip" size={26} color="#0F4C81" />
            </View>
          </View>
          <Text style={[styles.heroHeading, { color: colors.text }]}>Scan Your NFC Card</Text>
          <Text style={[styles.heroDescription, { color: colors.subtext }]}>
            Hold your NFC travel card against the back of your phone to securely connect it with the app. Once your card is detected, you'll be able to view your card details, check your balance, top up your wallet, and manage your travel information.
          </Text>
        </Animated.View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitleLarge, { color: colors.text }]}>What You Can Do</Text>
          <Text style={[styles.sectionHint, { color: colors.subtext }]}>
            Everything you need to manage your card in one place.
          </Text>
          <View style={styles.featureGrid}>
            {[
              { icon: 'credit-card-outline', title: 'View Card Details', desc: 'See your card information, including its unique card ID and current status.' },
              { icon: 'cash-multiple', title: 'Check Your Balance', desc: 'Instantly view the available balance on your travel card before you travel.' },
              { icon: 'plus-circle-outline', title: 'Top Up Your Card', desc: 'Add funds to your NFC card quickly and securely through the app.' },
              { icon: 'bus-marker', title: 'Travel with Tap In & Tap Out', desc: 'Use your NFC card to board and exit buses. The correct fare will be deducted automatically based on your journey.' },
              { icon: 'history', title: 'View Transaction History', desc: 'Review your recent top-ups, fare deductions, and travel history anytime.' },
              { icon: 'shield-check-outline', title: 'Manage Your Card', desc: 'Monitor your card status and securely manage your travel account.' },
            ].map((feature) => (
              <View key={feature.title} style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.featureIconWrap}>
                  <Icon name={feature.icon} size={22} color="#0F4C81" />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.subtext }]}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitleLarge, { color: colors.text }]}>How to Scan</Text>
          <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              'Enable NFC on your phone.',
              'Tap Start Scanning.',
              'Hold your NFC card against the back of your phone.',
              'Keep the card still until the scan is complete.',
              "Your card information will appear automatically.",
            ].map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepNumberWrap}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitleLarge, { color: colors.text }]}>Helpful Tips</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              'Keep the card flat against the NFC area of your phone.',
              "Remove thick phone cases if the card isn't detected.",
              'Ensure NFC is enabled on your device.',
              'Hold the card steady for a few seconds during scanning.',
            ].map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Icon name="information-outline" size={18} color="#2A9D8F" />
                <Text style={[styles.tipText, { color: colors.subtext }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.noteCard, { backgroundColor: '#EAF2FF', borderColor: '#B8D4FF' }]}>
          <Icon name="lock-check-outline" size={22} color="#0F4C81" />
          <Text style={styles.noteText}>
            Scanning your NFC card does not deduct any money. It simply allows the app to read your card so you can check your balance, top up your card, view transaction history, and manage your travel information securely.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.scanFooter, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.startScanButton}
          onPress={() => Alert.alert(
            'NFC Guide',
            'This page explains how NFC scanning works. Use your dedicated scan flow when you are ready to read a card.'
          )}
          activeOpacity={0.9}
        >
          <Icon name="nfc" size={22} color="#FFFFFF" />
          <Text style={styles.startScanButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============ DASHBOARD SCREEN ============
const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { token } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [balance, setBalance] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [lastRechargeDate, setLastRechargeDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ totalTrips: 0, totalSpent: 0, mostUsedRoute: '-' });
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = navigation.addListener('focus', loadDashboardData);
    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet/balance', token),
        api.get('/transactions', token),
      ]);
      // Backend wallet: { balance, cardNumber, lastRechargeDate }
      setBalance(walletRes.balance);
      setCardNumber(walletRes.cardNumber || '');

      // Format the ISO date to a human-readable string
      if (walletRes.lastRechargeDate) {
        const date = new Date(walletRes.lastRechargeDate);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        setLastRechargeDate(date.toLocaleDateString('en-IN', options));
      } else {
        setLastRechargeDate('—');
      }
      // Backend transactions: { transactions, monthlyTotal, monthlySpent, mostUsedRoute }
      setTransactions(transactionsRes.transactions || []);
      setMonthlyStats({
        totalTrips: transactionsRes.monthlyTotal || 0,
        totalSpent: transactionsRes.monthlySpent || 0,
        mostUsedRoute: transactionsRes.mostUsedRoute || '-',
      });
    } catch (error) {
      Alert.alert(t('common.error'), error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { id: 'scan', title: 'Block NFC', icon: 'nfc-variant-off', color: '#E63946', onPress: () => navigation.navigate('BlockNFC') },
    { id: 'recharge', title: t('dashboard.recharge'), icon: 'cash-plus', color: '#2A9D8F', onPress: () => navigation.navigate('Recharge') },
    { id: 'history', title: t('dashboard.history'), icon: 'history', color: '#F4A261', onPress: () => navigation.navigate('History') },
    { id: 'routes', title: t('dashboard.routes'), icon: 'map-marker-path', color: '#4A90E2', onPress: () => navigation.navigate('Routes') },
  ];

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const getTransactionIcon = (type) => (type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle');
  const getTransactionColor = (type) => (type === 'credit' ? '#2A9D8F' : '#E63946');

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.dashboardContainer, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor="#0F4C81" barStyle="light-content" />

      <View style={[styles.dashboardHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.subtext }]}>{t('dashboard.hello')},</Text>
          <Text style={[styles.userName, { color: '#0F4C81' }]}>{user?.fullName || 'Passenger'}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <View style={{ backgroundColor: '#F0F4F8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#D1D9E6' }}>
               <Text style={{ fontSize: 9, fontWeight: '700', color: '#5C6E82' }}>ID: {user?.userId || 'N/A'}</Text>
            </View>
            <View style={{ backgroundColor: '#F0F4F8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#D1D9E6' }}>
               <Text style={{ fontSize: 9, fontWeight: '700', color: '#5C6E82' }}>NFC: {user?.nfcUid || 'N/A'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <LanguageSelector />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.balanceLabel}>{t('dashboard.wallet_balance')}</Text>
            <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Icon name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#FFFFFFCC" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {isBalanceVisible ? `NPR ${balance !== null ? balance.toLocaleString() : '—'}` : 'NPR ••••••'}
          </Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>{t('dashboard.card_number')}</Text>
              <Text style={styles.cardFooterValue}>{isBalanceVisible ? (cardNumber || '—') : '••••••••••••'}</Text>
            </View>
            <View>
              <Text style={styles.cardFooterLabel}>{t('dashboard.last_recharge')}</Text>
              <Text style={styles.cardFooterValue}>{lastRechargeDate || '—'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.rechargeHint} onPress={() => navigation.navigate('Recharge')}>
            <Text style={styles.rechargeHintText}>{t('dashboard.tap_to_recharge')}</Text>
            <Icon name="arrow-right" size={14} color="#F4A261" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('dashboard.quick_actions')}</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionButton} onPress={action.onPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Icon name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('dashboard.monthly_summary')}</Text>
        <View style={styles.statsRow}>
          {[
            { value: monthlyStats.totalTrips, label: t('dashboard.total_trips') },
            { value: `NPR ${monthlyStats.totalSpent}`, label: t('dashboard.total_spent') },
            { value: user?.rewardPoints || 0, label: 'Reward Points' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.statCard }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {user?.balance < 0 && (
          <View style={[styles.warningCard, { backgroundColor: '#E6394620', borderColor: '#E63946' }]}>
            <Icon name="credit-card-minus" size={24} color="#E63946" />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: '#E63946' }]}>Outstanding Credit</Text>
              <Text style={styles.warningText}>You have an unpaid credit of NPR {Math.abs(user.balance)}. Please recharge to continue using transit services.</Text>
            </View>
            <TouchableOpacity style={[styles.warningButton, { backgroundColor: '#E63946' }]} onPress={() => navigation.navigate('Recharge')}>
              <Text style={styles.warningButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('dashboard.recent_activity')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>{t('dashboard.see_all')}</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 5).map((tx) => (
          <View key={tx.id} style={[styles.tripCard, { backgroundColor: colors.tripCard }]}>
            <View style={[styles.tripIcon, { backgroundColor: getTransactionColor(tx.type) + '20' }]}>
              <Icon name={getTransactionIcon(tx.type)} size={24} color={getTransactionColor(tx.type)} />
            </View>
            <View style={styles.tripInfo}>
              <Text style={[styles.tripRoute, { color: colors.text }]}>
                {tx.routeName || (tx.type === 'credit' ? t('history.wallet_recharge') : t('history.bus_fare'))}
              </Text>
              {tx.boardingStop ? (
                <Text style={[styles.tripStops, { color: colors.subtext }]}>{tx.boardingStop} → {tx.destinationStop}</Text>
              ) : null}
              <Text style={[styles.tripDate, { color: colors.subtext }]}>{formatDate(tx.createdAt)}</Text>
            </View>
            <Text style={[styles.tripFare, { color: getTransactionColor(tx.type) }]}>
              {tx.type === 'credit' ? '+' : '-'} NPR {tx.fare}
            </Text>
          </View>
        ))}

        {balance !== null && balance < 100 && (
          <View style={styles.warningCard}>
            <Icon name="alert-circle" size={24} color="#E9C46A" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>{t('dashboard.low_balance_alert')}</Text>
              <Text style={styles.warningText}>{t('dashboard.low_balance_message')}</Text>
            </View>
            <TouchableOpacity style={styles.warningButton} onPress={() => navigation.navigate('Recharge')}>
              <Text style={styles.warningButtonText}>{t('dashboard.recharge')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
        {[
          { id: 'home', icon: 'home', label: 'Home', screen: 'Dashboard' },
          { id: 'nfc', icon: 'nfc', label: 'NFC', screen: 'Scan' },
          { id: 'wallet', icon: 'wallet', label: t('dashboard.recharge'), screen: 'Recharge' },
          { id: 'history', icon: 'history', label: t('dashboard.history'), screen: 'History' },
          { id: 'profile', icon: 'account', label: 'Profile', screen: 'Profile' },
        ].map((item) => (
          <TouchableOpacity key={item.id} style={styles.navItem} onPress={() => navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={24} color={item.id === 'home' ? '#0F4C81' : colors.subtext} />
            <Text style={[styles.navLabel, { color: item.id === 'home' ? '#0F4C81' : colors.subtext }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ============ RECHARGE SCREEN ============
const RechargeScreen = ({ navigation }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.get('/wallet/balance', token)
      .then((data) => setBalance(data.balance))
      .catch(() => {});
  }, []);

  const rechargeAmounts = [100, 200, 500, 1000, 2000, 5000];
  const paymentMethods = [
    { id: 'khalti', name: t('recharge.khalti'), icon: 'wallet', color: '#0F4C81' },
  ];

  const getTotalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount) || 0;
    return 0;
  };

  const handleRecharge = async () => {
    const amount = getTotalAmount();
    if (amount <= 0) { Alert.alert(t('common.error'), t('errors.select_amount')); return; }
    if (!selectedMethod) { Alert.alert(t('common.error'), t('errors.select_payment_method')); return; }

    setIsLoading(true);
    try {
      const data = await api.post('/wallet/recharge', { amount, method: selectedMethod }, token);
      setBalance(data.wallet?.balance ?? data.currentBalance ?? balance);
      Alert.alert(t('common.success'), t('recharge.success_message').replace('{amount}', amount));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), error.message || t('errors.recharge_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('recharge.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCardSmall}>
          <Text style={styles.balanceCardLabel}>{t('recharge.current_balance')}</Text>
          <Text style={styles.balanceCardAmount}>NPR {balance !== null ? balance.toLocaleString() : '—'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('recharge.select_amount')}</Text>
          <View style={styles.amountGrid}>
            {rechargeAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.amountButton, selectedAmount === amount && styles.amountButtonSelected, { borderColor: colors.border }]}
                onPress={() => { setSelectedAmount(amount); setCustomAmount(''); }}
              >
                <Text style={[styles.amountText, { color: colors.text }, selectedAmount === amount && styles.amountTextSelected]}>
                  NPR {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customAmountContainer}>
            <Text style={[styles.customAmountLabel, { color: colors.subtext }]}>{t('recharge.custom_amount')}</Text>
            <View style={[styles.customAmountInput, { borderColor: colors.border, backgroundColor: colors.input }]}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>NPR</Text>
              <TextInput
                style={[styles.customInput, { color: colors.inputText }]}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(text) => { setCustomAmount(text); setSelectedAmount(null); }}
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('recharge.payment_method')}</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodButton, { backgroundColor: colors.methodBg, borderColor: colors.border }, selectedMethod === method.id && styles.methodButtonSelected]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                <Icon name={method.icon} size={24} color={method.color} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodName, { color: colors.methodName }]}>{method.name}</Text>
                <Text style={[styles.methodDesc, { color: colors.methodDesc }]}>{t('recharge.secure_payment')}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.summaryCard }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{t('recharge.payment_summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.summaryLabel }]}>{t('recharge.recharge_amount')}</Text>
            <Text style={[styles.summaryValue, { color: colors.summaryValue }]}>NPR {getTotalAmount()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.summaryLabel }]}>{t('recharge.processing_fee')}</Text>
            <Text style={[styles.summaryValue, { color: colors.summaryValue }]}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('recharge.total_to_pay')}</Text>
            <Text style={styles.totalValue}>NPR {getTotalAmount()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, (isLoading || getTotalAmount() === 0 || !selectedMethod) && { opacity: 0.5 }]}
          onPress={handleRecharge}
          disabled={isLoading || getTotalAmount() === 0 || !selectedMethod}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              <Text style={styles.payButtonText}>{t('recharge.proceed_to_pay')}</Text>
              <Icon name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ HISTORY SCREEN ============
const HistoryScreen = ({ navigation }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/transactions', token);
      // Backend should return: { transactions: [...] }
      setTransactions(data.transactions || []);
    } catch (error) {
      Alert.alert(t('common.error'), error.message || 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getTransactionIcon = (type) => (type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle');
  const getTransactionColor = (type) => (type === 'credit' ? '#2A9D8F' : '#E63946');

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('history.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterBar}>
        {['all', 'debit', 'credit'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, { backgroundColor: colors.filterBg }, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: colors.filterText }, filter === f && styles.filterTextActive]}>
              {f === 'all' ? t('history.all') : f === 'debit' ? t('history.payments') : t('history.recharges')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="history" size={64} color="#D1D5DB" />
            <Text style={[styles.emptyStateTitle, { color: colors.subtext }]}>{t('history.no_transactions')}</Text>
            <Text style={[styles.emptyStateText, { color: colors.subtext }]}>{t('history.empty_message')}</Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => (
            <View key={tx.id} style={[styles.historyCard, { backgroundColor: colors.historyCard }]}>
              <View style={[styles.historyIcon, { backgroundColor: getTransactionColor(tx.type) + '20' }]}>
                <Icon name={getTransactionIcon(tx.type)} size={24} color={getTransactionColor(tx.type)} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>
                  {tx.routeName || (tx.type === 'credit' ? t('history.wallet_recharge') : t('history.bus_fare'))}
                </Text>
                {tx.boardingStop ? (
                  <Text style={[styles.historySubtitle, { color: colors.subtext }]}>{tx.boardingStop} → {tx.destinationStop}</Text>
                ) : null}
                <Text style={[styles.historyDate, { color: colors.subtext }]}>{formatDate(tx.createdAt)}</Text>
              </View>
              <Text style={[styles.historyAmount, { color: getTransactionColor(tx.type) }]}>
                {tx.type === 'credit' ? '+' : '-'} NPR {tx.fare}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ ROUTES SCREEN ============
const RoutesScreen = ({ navigation }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      // Fetching real routes from backend
      const data = await api.get('/routes', token);
      // Backend returns array of routes
      setRoutes(Array.isArray(data) ? data : (data.routes || []));
    } catch (error) {
      console.error('Fetch routes error:', error);
      Alert.alert(t('common.error'), 'Unable to fetch routes from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('routes.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.inputText }]}
          placeholder={t('routes.search_placeholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredRoutes.length === 0 ? (
           <View style={styles.emptyState}>
             <Icon name="map-marker-path" size={64} color="#D1D5DB" />
             <Text style={[styles.emptyStateTitle, { color: colors.subtext }]}>No Routes Found</Text>
           </View>
        ) : (
          filteredRoutes.map((route) => (
            <TouchableOpacity
              key={route._id}
              style={[styles.routeCard, { backgroundColor: colors.routeCard }]}
              onPress={() => navigation.navigate('RouteDetail', { routeId: route._id, routeName: route.name })}
            >
              <View style={styles.routeHeader}>
                <View style={styles.routeBadge}>
                   <Icon name="bus-side" size={14} color="#0F4C81" />
                </View>
                <Text style={[styles.routeName, { color: colors.text, flex: 1, marginLeft: 10 }]}>{route.name}</Text>
                <Icon name="chevron-right" size={24} color="#9CA3AF" />
              </View>

              <View style={styles.routeFooter}>
                <Icon name="bus-stop-covered" size={14} color="#2A9D8F" />
                <Text style={[styles.routeDistance, { color: colors.subtext, marginLeft: 4 }]}>
                  {route.stops?.length || 0} Stops on this route
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ EDIT PROFILE SCREEN ============
const EditProfileScreen = ({ navigation }) => {
  const { user, token, updateUser } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.mobileNumber.trim()) {
      Alert.alert(t('common.error'), t('errors.fill_all_fields'));
      return;
    }

    if (!EMAIL_REGEX.test(form.email.trim())) {
      Alert.alert(t('common.error'), t('errors.invalid_email'));
      return;
    }

    if (!MOBILE_REGEX.test(form.mobileNumber.trim())) {
      Alert.alert(t('common.error'), t('errors.invalid_mobile'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.put('/user/profile', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobileNumber: form.mobileNumber.trim(),
      }, token);
      // Backend should return: { user: { ...updatedFields } }
      updateUser(data.user || { ...user, ...form });
      Alert.alert(t('common.success'), 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.edit_profile')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ padding: 20 }}>
        {[
          { label: t('auth.full_name'), field: 'fullName', icon: 'account', keyboard: 'default' },
          { label: t('auth.email'), field: 'email', icon: 'email', keyboard: 'email-address' },
          { label: t('auth.mobile_number'), field: 'mobileNumber', icon: 'phone', keyboard: 'phone-pad' },
        ].map(({ label, field, icon, keyboard }) => (
          <View style={styles.inputContainer} key={field}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Icon name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                value={form[field]}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
                keyboardType={keyboard}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.registerButton, { marginTop: 10 }, isLoading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              <Text style={styles.registerButtonText}>Save Changes</Text>
              <Icon name="check" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ PROFILE SCREEN ============
const ProfileScreen = ({ navigation }) => {
  const { user, logout, token } = useAuth();
  const { t } = useLanguage();
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [balance, setBalance] = useState(null);
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    api.get('/wallet/balance', token)
      .then((data) => { setBalance(data.balance); setCardNumber(data.cardNumber || ''); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('profile.logout_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    {
      id: 'edit',
      title: t('profile.edit_profile'),
      icon: 'account-edit',
      color: '#0F4C81',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'password',
      title: t('profile.change_password'),
      icon: 'lock-reset',
      color: '#F4A261',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 'notifications',
      title: t('profile.notifications'),
      icon: 'bell',
      color: '#E9C46A',
      onPress: () => Alert.alert('Coming Soon', 'Notifications coming soon'),
    },
    {
      id: 'help',
      title: t('profile.help_support'),
      icon: 'help-circle',
      color: '#6B7280',
      onPress: () => Alert.alert(t('profile.help_support'), 'Contact: support@buspay.com.np'),
    },
    {
      id: 'about',
      title: t('profile.about_us'),
      icon: 'information',
      color: '#6B7280',
      onPress: () => Alert.alert(t('profile.about_us'), t('profile.about_description')),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || 'User'}</Text>
          <Text style={[styles.profileEmail, { color: colors.subtext }]}>{user?.email || ''}</Text>
          <Text style={[styles.profilePhone, { color: colors.subtext }]}>{user?.mobileNumber || ''}</Text>

          <View style={styles.idContainer}>
            <View style={styles.idBadge}>
              <Text style={styles.idLabel}>USER ID: </Text>
              <Text style={styles.idValue}>{user?.userId || 'N/A'}</Text>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idLabel}>NFC ID: </Text>
              <Text style={styles.idValue}>{user?.nfcUid || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.walletInfoCard, { backgroundColor: colors.walletInfoCard }]}>
          <View style={styles.walletInfoItem}>
            <Icon name="wallet" size={24} color="#0F4C81" />
            <View>
              <Text style={[styles.walletInfoLabel, { color: colors.walletInfoLabel }]}>{t('profile.wallet_balance')}</Text>
              <Text style={[styles.walletInfoValue, { color: colors.walletInfoValue }]}>
                NPR {balance !== null ? balance.toLocaleString() : '—'}
              </Text>
            </View>
          </View>
          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />
          <View style={styles.walletInfoItem}>
            <Icon name="credit-card" size={24} color="#0F4C81" />
            <View>
              <Text style={[styles.walletInfoLabel, { color: colors.walletInfoLabel }]}>{t('dashboard.card_number')}</Text>
              <Text style={[styles.walletInfoValue, { color: colors.walletInfoValue }]}>{cardNumber || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.menuSection, { backgroundColor: colors.menuSection }]}>
          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: '#6B728020' }]}>
              <Icon name={isDarkMode ? 'weather-night' : 'white-balance-sunny'} size={22} color="#6B7280" />
            </View>
            <Text style={[styles.menuTitle, { color: colors.menuTitle }]}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#0F4C8180' }}
              thumbColor={isDarkMode ? '#0F4C81' : '#FFFFFF'}
            />
          </View>

          {/* Language Selector Row */}
          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: '#2A9D8F20' }]}>
              <Icon name="translate" size={22} color="#2A9D8F" />
            </View>
            <Text style={[styles.menuTitle, { color: colors.menuTitle }]}>Language / भाषा</Text>
            <LanguageSelector />
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.menuSection, marginTop: 12 }]}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.menuTitle }]}>{item.title}</Text>
              <Icon name="chevron-right" size={20} color={colors.subtext} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.logoutBg }]} onPress={handleLogout}>
          <Icon name="logout" size={22} color="#E63946" />
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.subtext }]}>{t('profile.version')} 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ CHANGE PASSWORD SCREEN ============
const ChangePasswordScreen = ({ navigation }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      Alert.alert(t('common.error'), t('errors.fill_all_fields'));
      return;
    }
    if (!STRONG_PASSWORD_REGEX.test(form.newPassword)) {
      Alert.alert(t('common.error'), t('errors.password_strength'));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert(t('common.error'), t('errors.password_mismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, token);
      Alert.alert(t('common.success'), 'Password changed successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: 'Current Password', field: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
    { label: 'New Password', field: 'newPassword', show: showNew, toggle: () => setShowNew(!showNew) },
    { label: 'Confirm New Password', field: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.change_password')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ padding: 20 }}>
        {fields.map(({ label, field, show, toggle }) => (
          <View style={styles.inputContainer} key={field}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Icon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                secureTextEntry={!show}
                value={form[field]}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity onPress={toggle}>
                <Icon name={show ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.registerButton, { marginTop: 10 }, isLoading && { opacity: 0.6 }]}
          onPress={handleChange}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              <Text style={styles.registerButtonText}>Change Password</Text>
              <Icon name="check" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ APP NAVIGATOR ============
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { isLoading: langLoading } = useLanguage();

  if (isLoading || langLoading) return <LoadingSpinner />;

  return (
    <Stack.Navigator
      key={user ? 'authenticated' : 'unauthenticated'}
      initialRouteName={user ? 'Dashboard' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Recharge" component={RechargeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Routes" component={RoutesScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Scan" component={NFCScanScreen} />
          <Stack.Screen name="BlockNFC" component={BlockNFCScreen} />
          <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// ============ MAIN APP ============
export default function App() {
  return (
    <NavigationContainer>
      <LanguageProvider>
        <GlobalThemeProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </GlobalThemeProvider>
      </LanguageProvider>
    </NavigationContainer>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  loginHeader: { backgroundColor: '#0F4C81', paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  registerHeader: { backgroundColor: '#0F4C81', paddingTop: 40, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  appTagline: { fontSize: 14, color: '#FFFFFFCC', marginTop: 4 },
  languageSelectorHeader: { marginTop: 16 },
  card: { backgroundColor: '#FFFFFF', margin: 20, padding: 24, borderRadius: 24, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F4C81', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  loginButton: { backgroundColor: '#E63946', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registerButton: { backgroundColor: '#0F4C81', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 14, color: '#6B7280' },
  registerLink: { fontSize: 14, color: '#0F4C81', fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#0F4C81', fontWeight: 'bold' },
  dashboardContainer: { flex: 1 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  greeting: { fontSize: 14 },
  userName: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: {},
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0F4C8120', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#0F4C81' },
  balanceCard: { backgroundColor: '#0F4C81', margin: 16, padding: 20, borderRadius: 20, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  balanceLabel: { fontSize: 12, color: '#FFFFFFCC', marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#FFFFFF20' },
  cardFooterLabel: { fontSize: 10, color: '#FFFFFF99', marginBottom: 4 },
  cardFooterValue: { fontSize: 12, fontWeight: '500', color: '#FFFFFF' },
  rechargeHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 12 },
  rechargeHintText: { fontSize: 12, color: '#F4A261' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 8 },
  quickActionButton: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionTitle: { fontSize: 12 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  seeAllText: { fontSize: 14, color: '#0F4C81', fontWeight: '600' },
  tripCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12 },
  tripIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tripInfo: { flex: 1 },
  tripRoute: { fontSize: 16, fontWeight: 'bold' },
  tripStops: { fontSize: 12, marginTop: 2 },
  tripDate: { fontSize: 10, marginTop: 2 },
  tripFare: { fontSize: 16, fontWeight: 'bold' },
  warningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9C46A20', margin: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E9C46A' },
  warningContent: { flex: 1, marginLeft: 12 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#E9C46A' },
  warningText: { fontSize: 12 },
  warningButton: { backgroundColor: '#E9C46A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  warningButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1 },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { fontSize: 10, marginTop: 4 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  balanceCardSmall: { backgroundColor: '#0F4C81', margin: 16, padding: 20, borderRadius: 16, alignItems: 'center' },
  balanceCardLabel: { fontSize: 14, color: '#FFFFFFCC', marginBottom: 8 },
  balanceCardAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  section: { marginHorizontal: 16, marginBottom: 24 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  amountButton: { width: '30%', margin: '1.5%', paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  amountButtonSelected: { backgroundColor: '#0F4C81', borderColor: '#0F4C81' },
  amountText: { fontSize: 14, fontWeight: '500' },
  amountTextSelected: { color: '#FFFFFF' },
  customAmountContainer: { marginTop: 16 },
  customAmountLabel: { fontSize: 14, marginBottom: 8 },
  customAmountInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  currencySymbol: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  customInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
  methodButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  methodButtonSelected: { borderColor: '#0F4C81', backgroundColor: '#0F4C8110' },
  methodIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: 'bold' },
  methodDesc: { fontSize: 12 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0F4C81' },
  summaryCard: { margin: 16, padding: 20, borderRadius: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#0F4C81' },
  payButton: { flexDirection: 'row', backgroundColor: '#E63946', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterChipActive: { backgroundColor: '#0F4C81' },
  filterText: { fontSize: 14 },
  filterTextActive: { color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyStateText: { fontSize: 14 },
  historyCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12 },
  historyIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: 'bold' },
  historySubtitle: { fontSize: 12, marginTop: 2 },
  historyDate: { fontSize: 10, marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  routeCard: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routeBadge: { backgroundColor: '#0F4C8110', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  routeNumber: { fontSize: 12, fontWeight: 'bold', color: '#0F4C81' },
  routeFare: { fontSize: 18, fontWeight: 'bold', color: '#0F4C81' },
  routeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  routeStops: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  routeStopText: { fontSize: 12 },
  routeFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  routeDistance: { fontSize: 12 },
  routeDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 12, fontWeight: '500' },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F4C81', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileAvatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  profileName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 2 },
  profilePhone: { fontSize: 14 },
  idContainer: { flexDirection: 'column', alignItems: 'center', marginTop: 10, gap: 8 },
  idBadge: { flexDirection: 'row', backgroundColor: '#F0F4F8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#D1D9E6' },
  idLabel: { fontSize: 11, fontWeight: 'bold', color: '#5C6E82' },
  idValue: { fontSize: 11, fontWeight: 'bold', color: '#0F4C81' },
  walletInfoCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 16, justifyContent: 'space-around' },
  walletInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletDivider: { width: 1 },
  walletInfoLabel: { fontSize: 12 },
  walletInfoValue: { fontSize: 16, fontWeight: 'bold' },
  scanScrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 140 },
  scanBackButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  scanHeaderTitle: { fontSize: 18, fontWeight: '800' },
  scanHeaderSubtitle: { fontSize: 12, marginTop: 2, textAlign: 'center' },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D7E8FF',
  },
  heroIllustrationWrap: { alignItems: 'center', justifyContent: 'center', height: 240, marginBottom: 8 },
  heroPulseOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#9CC2FF',
  },
  heroPulseMiddle: {
    position: 'absolute',
    width: 166,
    height: 166,
    borderRadius: 83,
    borderWidth: 2,
    borderColor: '#C6DDFF',
  },
  heroPulseInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#DDEBFF',
  },
  heroDevice: {
    width: 128,
    height: 190,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heroDeviceSpeaker: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#D7E3F4', marginBottom: 12 },
  heroNfcBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWaveSet: { marginTop: 16, alignItems: 'center', gap: 8 },
  heroWaveLine: { width: 56, height: 3, borderRadius: 99, backgroundColor: '#0F4C81', opacity: 0.85 },
  heroWaveLineShort: { width: 42, opacity: 0.55 },
  heroWaveLineShorter: { width: 28, opacity: 0.32 },
  heroCardToken: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCE9FF',
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  heroHeading: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  heroDescription: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  sectionBlock: { marginBottom: 20 },
  sectionTitleLarge: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  sectionHint: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  featureDesc: { fontSize: 12, lineHeight: 18 },
  stepCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F4C81',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  tipCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20 },
  noteCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 21, color: '#0F4C81' },
  scanFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#E6ECF5',
  },
  startScanButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#0F4C81',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  startScanButtonDisabled: { opacity: 0.6 },
  startScanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  scanStatusCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  scanStatusText: { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },
  scanStatusSubText: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  nfcScanContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  nfcScanIcon: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#0F4C81', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  nfcScanIconSuccess: { backgroundColor: '#2A9D8F' },
  nfcScanIconError: { backgroundColor: '#E63946' },
  nfcScanTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  nfcScanText: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  menuSection: { margin: 16, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuTitle: { flex: 1, fontSize: 14 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 16, borderRadius: 16, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#E63946' },
  versionText: { textAlign: 'center', fontSize: 12, marginVertical: 20 },
});
