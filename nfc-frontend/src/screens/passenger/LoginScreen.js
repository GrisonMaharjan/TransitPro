import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(formOpacity, { toValue: 1, duration: 700, delay: 300, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 0, duration: 700, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Dashboard');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top blue wave */}
        <View style={styles.topWave}>
          <View style={styles.waveCircle} />
        </View>

        {/* Logo area */}
        <Animated.View
          style={[
            styles.logoArea,
            {
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
              opacity: logoAnim,
            },
          ]}
        >
          <View style={styles.logoIcon}>
            <View style={styles.nfcOuter} />
            <View style={styles.nfcInner} />
            <Text style={styles.nfcMark}>NFC</Text>
          </View>
          <Text style={styles.appTitle}>TapFare</Text>
          <Text style={styles.appSub}>Bus Fare Management</Text>
        </Animated.View>

        {/* Form card — Instagram-style */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: formOpacity,
              transform: [{ translateY: formAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Log in</Text>

          {/* Phone input */}
          <View style={[styles.inputWrap, focused === 'phone' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number or email"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused('')}
              autoCapitalize="none"
            />
          </View>

          {/* Password input */}
          <View style={[styles.inputWrap, focused === 'pass' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused('')}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, (!phone || !password) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading || !phone || !password}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone login alt */}
          <TouchableOpacity style={styles.altLogin}>
            <Text style={styles.altLoginIcon}>📞</Text>
            <Text style={styles.altLoginText}>Continue with phone number</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Register link — Instagram style bottom bar */}
        <View style={styles.registerBar}>
          <Text style={styles.registerBarText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBarLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 30,
  },
  topWave: {
    width: '100%',
    height: 140,
    backgroundColor: '#0A84FF',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    marginBottom: -30,
    overflow: 'hidden',
  },
  waveCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -width * 0.7,
    left: -width * 0.25,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
    zIndex: 1,
  },
  logoIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  nfcOuter: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0A84FF',
    opacity: 0.2,
  },
  nfcInner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0A84FF',
    opacity: 0.4,
  },
  nfcMark: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  card: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  inputFocused: {
    borderColor: '#0A84FF',
    backgroundColor: '#f0f6ff',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  showBtn: {
    color: '#0A84FF',
    fontWeight: '600',
    fontSize: 13,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotText: {
    color: '#0A84FF',
    fontSize: 13,
    fontWeight: '500',
  },
  loginBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnDisabled: {
    backgroundColor: '#7EC4FF',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  altLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  altLoginIcon: { fontSize: 18 },
  altLoginText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '600',
  },
  registerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    width: width - 40,
    justifyContent: 'center',
  },
  registerBarText: {
    color: '#555',
    fontSize: 14,
  },
  registerBarLink: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '700',
  },
});