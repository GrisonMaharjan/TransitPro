import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageProvider, useLanguage } from './src/hooks/useLanguage';
import LanguageSelector from './src/components/LanguageSelector';
import nfcManager from './src/services/nfc/nfcmanager';

const Stack = createStackNavigator();

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  accounts: 'registered_accounts',
};

const createPublicUser = (account) => ({
  id: account.id,
  fullName: account.fullName,
  email: account.email,
  mobileNumber: account.mobileNumber,
});

const normalizeIdentifier = (value = '') => value.trim().toLowerCase();

const getStoredAccounts = async () => {
  const storedAccounts = await AsyncStorage.getItem(STORAGE_KEYS.accounts);
  return storedAccounts ? JSON.parse(storedAccounts) : [];
};

const saveStoredAccounts = (accounts) =>
  AsyncStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));

// ============ API CONFIGURATION ============
const API_BASE_URL = 'http://192.168.1.100:3000/api/v1'; // Change this!

// Mock API - Replace with actual API calls
const api = {
  async post(endpoint, data) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint === '/auth/login') {
      const identifier = normalizeIdentifier(data.identifier || data.mobileNumber || data.email);
      const demoAccount = {
        id: 1,
        fullName: 'Test User',
        email: 'test@example.com',
        mobileNumber: '9800000000',
        password: 'password123',
      };
      const accounts = [demoAccount, ...(await getStoredAccounts())];
      const account = accounts.find((item) => {
        const email = normalizeIdentifier(item.email);
        const mobileNumber = normalizeIdentifier(item.mobileNumber);
        return (email === identifier || mobileNumber === identifier) && item.password === data.password;
      });

      if (account) {
        return {
          success: true,
          data: {
            token: 'mock-token-' + account.id + '-' + Date.now(),
            user: createPublicUser(account),
          },
        };
      }
      throw new Error('Invalid credentials');
    }
    
    if (endpoint === '/auth/register') {
      const accounts = await getStoredAccounts();
      const email = normalizeIdentifier(data.email);
      const mobileNumber = normalizeIdentifier(data.mobileNumber);
      const existingIndex = accounts.findIndex((item) =>
        normalizeIdentifier(item.email) === email ||
        normalizeIdentifier(item.mobileNumber) === mobileNumber
      );
      const account = {
        id: existingIndex >= 0 ? accounts[existingIndex].id : Date.now(),
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        mobileNumber: data.mobileNumber.trim(),
        password: data.password,
      };
      const nextAccounts = existingIndex >= 0
        ? accounts.map((item, index) => (index === existingIndex ? account : item))
        : [...accounts, account];
      await saveStoredAccounts(nextAccounts);

      return {
        success: true,
        data: {
          token: 'mock-token-' + account.id + '-' + Date.now(),
          user: createPublicUser(account),
          message: 'Registration successful',
        },
      };
    }
    
    if (endpoint === '/user/profile') {
      return { success: true, data: { id: 1, fullName: 'Test User', email: 'test@example.com', mobileNumber: '9800000000', address: 'Kathmandu, Nepal' } };
    }
    
    if (endpoint === '/wallet/balance') {
      return { success: true, data: { balance: 1250, cardNumber: '1234********5678', lastRechargeDate: '2024-06-01' } };
    }
    
    if (endpoint === '/transactions') {
      return { success: true, data: { 
        transactions: [
          { id: 1, routeName: 'Route A', boardingStop: 'Bouddha', destinationStop: 'Gaushala', fare: 45, createdAt: new Date().toISOString(), type: 'debit' },
          { id: 2, routeName: 'Route B', boardingStop: 'Chabahil', destinationStop: 'Thamel', fare: 35, createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'debit' },
          { id: 3, routeName: 'Recharge', boardingStop: '', destinationStop: '', fare: 500, createdAt: new Date(Date.now() - 172800000).toISOString(), type: 'credit' }
        ],
        monthlyTotal: 12,
        monthlySpent: 450,
        mostUsedRoute: 'Route A'
      } };
    }
    
    if (endpoint === '/recharge') {
      return { success: true, data: { transactionId: 'TXN' + Date.now(), newBalance: 1750 } };
    }
    
    throw new Error('API endpoint not implemented');
  }
};

// ============ AUTH CONTEXT ============
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

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
      console.error('Check login error:', error);
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
      const response = await api.post('/auth/login', { identifier, password });
      if (response.success) {
        await saveSession(response.data.token, response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      if (response.success) {
        await saveSession(response.data.token, response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.token);
    await AsyncStorage.removeItem(STORAGE_KEYS.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const LoadingSpinner = () => {
  const { t } = useLanguage();
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color="#0F4C81" />
      <Text style={styles.loadingText}>{t('common.loading')}</Text>
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
    if (!identifier || !password) {
      Alert.alert(t('common.error'), t('errors.fill_all_fields'));
      return;
    }

    const result = await login(identifier, password);
    if (result.success) {
      return;
    } else {
      Alert.alert(t('common.error'), t('errors.invalid_credentials'));
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
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
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
    
    if (form.mobileNumber.length !== 10) {
      Alert.alert(t('common.error'), t('errors.invalid_mobile'));
      return;
    }
    
    if (form.password.length < 6) {
      Alert.alert(t('common.error'), t('errors.password_min_length'));
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      Alert.alert(t('common.error'), t('errors.password_mismatch'));
      return;
    }

    const result = await register(form);
    if (result.success) {
      Alert.alert(t('common.success'), t('errors.registration_success'));
    } else {
      Alert.alert(t('common.error'), t('errors.registration_failed'));
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.full_name')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="account" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.full_name')}
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.mobile_number')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="98XXXXXXXX"
              keyboardType="phone-pad"
              value={form.mobileNumber}
              onChangeText={(text) => setForm({ ...form, mobileNumber: text })}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
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
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
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
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          disabled={isLoading}
        >
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
  const [scanState, setScanState] = useState('starting');
  const [tagInfo, setTagInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const beginScan = async () => {
      setScanState('starting');
      setErrorMessage('');

      try {
        const supported = await nfcManager.init();
        if (!isActive) return;

        if (!supported) {
          const message = Platform.OS === 'ios'
            ? 'NFC is not available on this iPhone or in this build.'
            : 'NFC is not supported on this device.';
          setScanState('error');
          setErrorMessage(message);
          Alert.alert(t('common.error'), message);
          return;
        }

        if (!nfcManager.isEnabled) {
          const message = 'NFC is turned off or unavailable. Please enable NFC and try again.';
          setScanState('error');
          setErrorMessage(message);
          Alert.alert(t('common.error'), message);
          return;
        }

        setScanState('scanning');
        const tag = await nfcManager.startScanning();
        if (!isActive) return;

        setTagInfo(tag);
        setScanState('success');
        Alert.alert(t('common.success'), t('nfc.scan_success'));
      } catch (error) {
        if (!isActive) return;
        const message = error?.message || t('nfc.scan_failed');
        setScanState('error');
        setErrorMessage(message);
        Alert.alert(t('common.error'), message);
      } finally {
        await nfcManager.stopScanning();
      }
    };

    beginScan();

    return () => {
      isActive = false;
      nfcManager.cleanup();
    };
  }, [t]);

  const retryScan = () => {
    setTagInfo(null);
    setErrorMessage('');
    setScanState('starting');
    setTimeout(async () => {
      try {
        setScanState('scanning');
        const tag = await nfcManager.startScanning();
        setTagInfo(tag);
        setScanState('success');
        Alert.alert(t('common.success'), t('nfc.scan_success'));
      } catch (error) {
        const message = error?.message || t('nfc.scan_failed');
        setScanState('error');
        setErrorMessage(message);
        Alert.alert(t('common.error'), message);
      } finally {
        await nfcManager.stopScanning();
      }
    }, 0);
  };

  const tagId = tagInfo?.id || tagInfo?.tagID || 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nfc.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.nfcScanContainer}>
        <View style={[
          styles.nfcScanIcon,
          scanState === 'success' && styles.nfcScanIconSuccess,
          scanState === 'error' && styles.nfcScanIconError,
        ]}>
          <Icon
            name={scanState === 'success' ? 'check' : scanState === 'error' ? 'alert-circle' : 'nfc'}
            size={52}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.nfcScanTitle}>
          {scanState === 'success'
            ? t('nfc.scan_success')
            : scanState === 'error'
              ? t('nfc.scan_failed')
              : t('nfc.ready_to_scan')}
        </Text>
        <Text style={styles.nfcScanText}>
          {scanState === 'success'
            ? `Tag ID: ${tagId}`
            : scanState === 'error'
              ? errorMessage
              : t('nfc.hold_nfc')}
        </Text>

        {(scanState === 'error' || scanState === 'success') && (
          <TouchableOpacity style={styles.registerButton} onPress={retryScan}>
            <Text style={styles.registerButtonText}>{t('nfc.start_scanning')}</Text>
            <Icon name="nfc" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {scanState === 'scanning' && (
          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.goBack()}>
            <Icon name="close" size={22} color="#E63946" />
            <Text style={styles.logoutText}>{t('nfc.cancel_scan')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// ============ DASHBOARD SCREEN ============
const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [balance, setBalance] = useState(1250);
  const [cardNumber, setCardNumber] = useState('**** **** **** 5678');
  const [lastRechargeDate, setLastRechargeDate] = useState('Jun 1, 2024');
  const [transactions, setTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ totalTrips: 0, totalSpent: 0, mostUsedRoute: 'N/A' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.post('/wallet/balance', {}),
        api.post('/transactions', {})
      ]);
      
      if (walletRes.success) {
        setBalance(walletRes.data.balance);
        setCardNumber(walletRes.data.cardNumber);
        setLastRechargeDate(walletRes.data.lastRechargeDate);
      }
      
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions);
        setMonthlyStats({
          totalTrips: transactionsRes.data.monthlyTotal,
          totalSpent: transactionsRes.data.monthlySpent,
          mostUsedRoute: transactionsRes.data.mostUsedRoute
        });
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { id: 'scan', title: t('dashboard.scan_nfc'), icon: 'nfc', color: '#0F4C81', onPress: () => navigation.navigate('Scan') },
    { id: 'recharge', title: t('dashboard.recharge'), icon: 'cash-plus', color: '#2A9D8F', onPress: () => navigation.navigate('Recharge') },
    { id: 'history', title: t('dashboard.history'), icon: 'history', color: '#F4A261', onPress: () => navigation.navigate('History') },
    { id: 'routes', title: t('dashboard.routes'), icon: 'map-marker-path', color: '#4A90E2', onPress: () => navigation.navigate('Routes') },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type) => type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  const getTransactionColor = (type) => type === 'credit' ? '#2A9D8F' : '#E63946';

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <StatusBar backgroundColor="#0F4C81" barStyle="light-content" />
      
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.greeting}>{t('dashboard.hello')},</Text>
          <Text style={styles.userName}>{user?.fullName || 'Passenger'}</Text>
        </View>
        <View style={styles.headerRight}>
          <LanguageSelector />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('dashboard.wallet_balance')}</Text>
          <Text style={styles.balanceAmount}>NPR {balance.toLocaleString()}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>{t('dashboard.card_number')}</Text>
              <Text style={styles.cardFooterValue}>{cardNumber}</Text>
            </View>
            <View>
              <Text style={styles.cardFooterLabel}>{t('dashboard.last_recharge')}</Text>
              <Text style={styles.cardFooterValue}>{lastRechargeDate}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.rechargeHint}
            onPress={() => navigation.navigate('Recharge')}
          >
            <Text style={styles.rechargeHintText}>{t('dashboard.tap_to_recharge')}</Text>
            <Icon name="arrow-right" size={14} color="#F4A261" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionButton} onPress={action.onPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Icon name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('dashboard.monthly_summary')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthlyStats.totalTrips}</Text>
            <Text style={styles.statLabel}>{t('dashboard.total_trips')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>NPR {monthlyStats.totalSpent}</Text>
            <Text style={styles.statLabel}>{t('dashboard.total_spent')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthlyStats.mostUsedRoute}</Text>
            <Text style={styles.statLabel}>{t('dashboard.most_used')}</Text>
          </View>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.recent_activity')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>{t('dashboard.see_all')}</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.tripCard}>
            <View style={[styles.tripIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
              <Icon name={getTransactionIcon(transaction.type)} size={24} color={getTransactionColor(transaction.type)} />
            </View>
            <View style={styles.tripInfo}>
              <Text style={styles.tripRoute}>{transaction.routeName || (transaction.type === 'credit' ? t('history.wallet_recharge') : t('history.bus_fare'))}</Text>
              {transaction.boardingStop && (
                <Text style={styles.tripStops}>{transaction.boardingStop} → {transaction.destinationStop}</Text>
              )}
              <Text style={styles.tripDate}>{formatDate(transaction.createdAt)}</Text>
            </View>
            <Text style={[styles.tripFare, { color: getTransactionColor(transaction.type) }]}>
              {transaction.type === 'credit' ? '+' : '-'} NPR {transaction.fare}
            </Text>
          </View>
        ))}

        {balance < 100 && (
          <View style={styles.warningCard}>
            <Icon name="alert-circle" size={24} color="#E9C46A" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>{t('dashboard.low_balance_alert')}</Text>
              <Text style={styles.warningText}>{t('dashboard.low_balance_message')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.warningButton}
              onPress={() => navigation.navigate('Recharge')}
            >
              <Text style={styles.warningButtonText}>{t('dashboard.recharge')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { id: 'home', icon: 'home', label: t('dashboard.scan_nfc')?.split(' ')[0] || 'Home', screen: 'Dashboard' },
          { id: 'nfc', icon: 'nfc', label: 'NFC', screen: 'Scan' },
          { id: 'wallet', icon: 'wallet', label: t('dashboard.recharge'), screen: 'Recharge' },
          { id: 'history', icon: 'history', label: t('dashboard.history'), screen: 'History' },
          { id: 'profile', icon: 'account', label: 'Profile', screen: 'Profile' },
        ].map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.navItem}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <Icon name={item.icon} size={24} color={item.id === 'home' ? '#0F4C81' : '#9CA3AF'} />
            <Text style={[styles.navLabel, item.id === 'home' && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ============ RECREATED SCREENS WITH LANGUAGE SUPPORT ============

const RechargeScreen = ({ navigation }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(1250);
  const { t } = useLanguage();

  const rechargeAmounts = [100, 200, 500, 1000, 2000, 5000];

  const paymentMethods = [
    { id: 'khalti', name: t('recharge.khalti'), icon: 'wallet', color: '#0F4C81' },
    { id: 'esewa', name: t('recharge.esewa'), icon: 'credit-card', color: '#2A9D8F' },
    { id: 'connectips', name: t('recharge.connectips'), icon: 'bank', color: '#F4A261' },
  ];

  const getTotalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handleRecharge = async () => {
    const amount = getTotalAmount();
    
    if (amount <= 0) {
      Alert.alert(t('common.error'), t('errors.select_amount'));
      return;
    }

    if (!selectedMethod) {
      Alert.alert(t('common.error'), t('errors.select_payment_method'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/recharge', { amount, method: selectedMethod });
      if (response.success) {
        Alert.alert(t('common.success'), t('recharge.success_message').replace('{amount}', amount));
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.recharge_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('recharge.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCardSmall}>
          <Text style={styles.balanceCardLabel}>{t('recharge.current_balance')}</Text>
          <Text style={styles.balanceCardAmount}>NPR {balance.toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recharge.select_amount')}</Text>
          <View style={styles.amountGrid}>
            {rechargeAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.amountButton, selectedAmount === amount && styles.amountButtonSelected]}
                onPress={() => { setSelectedAmount(amount); setCustomAmount(''); }}
              >
                <Text style={[styles.amountText, selectedAmount === amount && styles.amountTextSelected]}>NPR {amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>{t('recharge.custom_amount')}</Text>
            <View style={styles.customAmountInput}>
              <Text style={styles.currencySymbol}>NPR</Text>
              <TextInput
                style={styles.customInput}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(text) => { setCustomAmount(text); setSelectedAmount(null); }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recharge.payment_method')}</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodButton, selectedMethod === method.id && styles.methodButtonSelected]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                <Icon name={method.icon} size={24} color={method.color} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDesc}>{t('recharge.secure_payment')}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('recharge.payment_summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('recharge.recharge_amount')}</Text>
            <Text style={styles.summaryValue}>NPR {getTotalAmount()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('recharge.processing_fee')}</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('recharge.total_to_pay')}</Text>
            <Text style={styles.totalValue}>NPR {getTotalAmount()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handleRecharge}
          disabled={isLoading || getTotalAmount() === 0 || !selectedMethod}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
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

const HistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { t } = useLanguage();

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/transactions', {});
      if (response.success) setTransactions(response.data.transactions);
    } catch (error) { console.error('Load history error:', error);
    } finally { setIsLoading(false); }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'debit') return t.type === 'debit';
    if (filter === 'credit') return t.type === 'credit';
    return true;
  });

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const getTransactionIcon = (type) => type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  const getTransactionColor = (type) => type === 'credit' ? '#2A9D8F' : '#E63946';

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('history.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterBar}>
        {['all', 'debit', 'credit'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? t('history.all') : f === 'debit' ? t('history.payments') : t('history.recharges')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="history" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>{t('history.no_transactions')}</Text>
            <Text style={styles.emptyStateText}>{t('history.empty_message')}</Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.historyCard}>
              <View style={[styles.historyIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                <Icon name={getTransactionIcon(transaction.type)} size={24} color={getTransactionColor(transaction.type)} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{transaction.routeName || (transaction.type === 'credit' ? t('history.wallet_recharge') : t('history.bus_fare'))}</Text>
                {transaction.boardingStop && <Text style={styles.historySubtitle}>{transaction.boardingStop} → {transaction.destinationStop}</Text>}
                <Text style={styles.historyDate}>{formatDate(transaction.createdAt)}</Text>
              </View>
              <Text style={[styles.historyAmount, { color: getTransactionColor(transaction.type) }]}>
                {transaction.type === 'credit' ? '+' : '-'} NPR {transaction.fare}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const RoutesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const { t } = useLanguage();

  const routes = [
    { id: 1, routeNumber: '01', routeName: 'Ratnapark - Bouddha', fromStop: 'Ratnapark', toStop: 'Bouddha', distance: 8.5, fare: 45 },
    { id: 2, routeNumber: '02', routeName: 'Lagankhel - Budanilkantha', fromStop: 'Lagankhel', toStop: 'Budanilkantha', distance: 12.0, fare: 65 },
    { id: 3, routeNumber: '03', routeName: 'Thankot - Airport', fromStop: 'Thankot', toStop: 'Airport', distance: 15.5, fare: 85 },
    { id: 4, routeNumber: '04', routeName: 'Swayambhu - Chabahil', fromStop: 'Swayambhu', toStop: 'Chabahil', distance: 6.5, fare: 35 },
    { id: 5, routeNumber: '05', routeName: 'Bungamati - Ratnapark', fromStop: 'Bungamati', toStop: 'Ratnapark', distance: 10.0, fare: 55 },
  ];

  const filteredRoutes = routes.filter(route => route.routeName.toLowerCase().includes(searchQuery.toLowerCase()) || route.routeNumber.includes(searchQuery));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('routes.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder={t('routes.search_placeholder')} value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#9CA3AF" />
      </View>

      <ScrollView>
        {filteredRoutes.map((route) => (
          <TouchableOpacity key={route.id} style={styles.routeCard} onPress={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}>
            <View style={styles.routeHeader}>
              <View style={styles.routeBadge}><Text style={styles.routeNumber}>{route.routeNumber}</Text></View>
              <Text style={styles.routeFare}>NPR {route.fare}</Text>
            </View>
            <Text style={styles.routeName}>{route.routeName}</Text>
            <View style={styles.routeStops}>
              <Icon name="bus-stop" size={16} color="#2A9D8F" />
              <Text style={styles.routeStopText}>{route.fromStop}</Text>
              <Icon name="arrow-right" size={16} color="#9CA3AF" />
              <Icon name="flag-checkered" size={16} color="#E63946" />
              <Text style={styles.routeStopText}>{route.toStop}</Text>
            </View>
            <View style={styles.routeFooter}>
              <Icon name="map-marker-distance" size={14} color="#9CA3AF" />
              <Text style={styles.routeDistance}>{route.distance} {t('routes.km')}</Text>
            </View>
            {selectedRoute === route.id && (
              <View style={styles.routeDetails}>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>{t('routes.base_fare')}:</Text><Text style={styles.detailValue}>NPR 15</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>{t('routes.distance_charge')}:</Text><Text style={styles.detailValue}>NPR {route.fare - 15}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>{t('routes.estimated_time')}:</Text><Text style={styles.detailValue}>{Math.ceil(route.distance * 2)} {t('routes.minutes')}</Text></View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [balance, setBalance] = useState(1250);
  const [cardNumber, setCardNumber] = useState('**** **** **** 5678');

  useEffect(() => { loadWalletData(); }, []);

  const loadWalletData = async () => {
    try {
      const response = await api.post('/wallet/balance', {});
      if (response.success) { setBalance(response.data.balance); setCardNumber(response.data.cardNumber); }
    } catch (error) { console.error('Load wallet error:', error); }
  };

  const menuItems = [
    { id: 'edit', title: t('profile.edit_profile'), icon: 'account-edit', color: '#0F4C81', onPress: () => Alert.alert(t('common.coming_soon') || 'Coming Soon', 'Edit profile feature coming soon') },
    { id: 'password', title: t('profile.change_password'), icon: 'lock-reset', color: '#F4A261', onPress: () => Alert.alert(t('common.coming_soon') || 'Coming Soon', 'Change password feature coming soon') },
    { id: 'cards', title: t('profile.manage_cards'), icon: 'credit-card-multiple', color: '#2A9D8F', onPress: () => Alert.alert(t('common.coming_soon') || 'Coming Soon', 'Manage cards feature coming soon') },
    { id: 'notifications', title: t('profile.notifications'), icon: 'bell', color: '#E9C46A', onPress: () => Alert.alert(t('common.coming_soon') || 'Coming Soon', 'Notifications coming soon') },
    { id: 'help', title: t('profile.help_support'), icon: 'help-circle', color: '#6B7280', onPress: () => Alert.alert(t('profile.help_support'), 'Contact: support@buspay.com.np') },
    { id: 'about', title: t('profile.about_us'), icon: 'information', color: '#6B7280', onPress: () => Alert.alert(t('profile.about_us'), t('profile.about_description')) },
  ];

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('profile.logout_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{user?.fullName?.charAt(0) || 'U'}</Text></View>
          <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          <Text style={styles.profilePhone}>{user?.mobileNumber || '98XXXXXXXX'}</Text>
        </View>

        <View style={styles.walletInfoCard}>
          <View style={styles.walletInfoItem}>
            <Icon name="wallet" size={24} color="#0F4C81" />
            <View><Text style={styles.walletInfoLabel}>{t('profile.wallet_balance')}</Text><Text style={styles.walletInfoValue}>NPR {balance.toLocaleString()}</Text></View>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletInfoItem}>
            <Icon name="credit-card" size={24} color="#0F4C81" />
            <View><Text style={styles.walletInfoLabel}>{t('dashboard.card_number')}</Text><Text style={styles.walletInfoValue}>{cardNumber}</Text></View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}><Icon name={item.icon} size={22} color={item.color} /></View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Icon name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={22} color="#E63946" />
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('profile.version')} 1.0.0</Text>
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
          <Stack.Screen name="Scan" component={NFCScanScreen} />
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
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LanguageProvider>
    </NavigationContainer>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
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
  dashboardContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  greeting: { fontSize: 14, color: '#6B7280' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#0F4C81', marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { padding: 0 },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 8 },
  quickActionButton: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionTitle: { fontSize: 12, color: '#374151' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  seeAllText: { fontSize: 14, color: '#0F4C81', fontWeight: '600' },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12 },
  tripIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tripInfo: { flex: 1 },
  tripRoute: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  tripStops: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  tripDate: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  tripFare: { fontSize: 16, fontWeight: 'bold' },
  warningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9C46A20', margin: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E9C46A' },
  warningContent: { flex: 1, marginLeft: 12 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#E9C46A' },
  warningText: { fontSize: 12, color: '#374151' },
  warningButton: { backgroundColor: '#E9C46A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  warningButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  navLabelActive: { color: '#0F4C81' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  balanceCardSmall: { backgroundColor: '#0F4C81', margin: 16, padding: 20, borderRadius: 16, alignItems: 'center' },
  balanceCardLabel: { fontSize: 14, color: '#FFFFFFCC', marginBottom: 8 },
  balanceCardAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  section: { marginHorizontal: 16, marginBottom: 24 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  amountButton: { width: '30%', margin: '1.5%', paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  amountButtonSelected: { backgroundColor: '#0F4C81', borderColor: '#0F4C81' },
  amountText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  amountTextSelected: { color: '#FFFFFF' },
  customAmountContainer: { marginTop: 16 },
  customAmountLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  customAmountInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  currencySymbol: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginRight: 8 },
  customInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  methodButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  methodButtonSelected: { borderColor: '#0F4C81', backgroundColor: '#0F4C8110' },
  methodIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  methodDesc: { fontSize: 12, color: '#6B7280' },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0F4C81' },
  summaryCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  totalRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#0F4C81' },
  payButton: { flexDirection: 'row', backgroundColor: '#E63946', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: '#0F4C81' },
  filterText: { fontSize: 14, color: '#6B7280' },
  filterTextActive: { color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#6B7280' },
  emptyStateText: { fontSize: 14, color: '#9CA3AF' },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12 },
  historyIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  historySubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  historyDate: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1F2937' },
  routeCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routeBadge: { backgroundColor: '#0F4C8110', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  routeNumber: { fontSize: 12, fontWeight: 'bold', color: '#0F4C81' },
  routeFare: { fontSize: 18, fontWeight: 'bold', color: '#0F4C81' },
  routeName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  routeStops: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  routeStopText: { fontSize: 12, color: '#6B7280' },
  routeFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  routeDistance: { fontSize: 12, color: '#9CA3AF' },
  routeDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 12, color: '#6B7280' },
  detailValue: { fontSize: 12, fontWeight: '500', color: '#1F2937' },
  profileHeader: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#FFFFFF' },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F4C81', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileAvatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  profilePhone: { fontSize: 14, color: '#6B7280' },
  walletInfoCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 16, justifyContent: 'space-around' },
  walletInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletDivider: { width: 1, backgroundColor: '#E5E7EB' },
  walletInfoLabel: { fontSize: 12, color: '#6B7280' },
  walletInfoValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  nfcScanContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  nfcScanIcon: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#0F4C81', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  nfcScanIconSuccess: { backgroundColor: '#2A9D8F' },
  nfcScanIconError: { backgroundColor: '#E63946' },
  nfcScanTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 12 },
  nfcScanText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  menuSection: { backgroundColor: '#FFFFFF', margin: 16, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuTitle: { flex: 1, fontSize: 14, color: '#1F2937' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 16, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#E63946' },
  versionText: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginVertical: 20 },
});
