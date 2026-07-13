// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import InputField from '../../components/forms/InputField';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import authService from '../../services/api/authservice';
import { colors, typography, spacing } from '../../constants/theme';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const ForgotPasswordScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobileNumber: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSendOTP = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.mobileNumber);
      setOtpSent(true);
      showMessage({
        message: 'OTP Sent',
        description: 'Verification code sent to your mobile number',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Failed',
        description: error.response?.data?.message || 'Mobile number not found',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showMessage({
        message: 'Password Mismatch',
        description: 'New password and confirmation do not match',
        type: 'danger',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(data.otp, data.newPassword);
      showMessage({
        message: 'Password Reset Successful',
        description: 'You can now login with your new password',
        type: 'success',
      });
      navigation.navigate('Login');
    } catch (error) {
      showMessage({
        message: 'Reset Failed',
        description: error.response?.data?.message || 'Invalid OTP',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {!otpSent
              ? 'Enter your registered mobile number to receive OTP'
              : 'Enter the OTP sent to your mobile and set new password'}
          </Text>
        </View>

        {!otpSent ? (
          <View style={styles.form}>
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Enter valid 10-digit mobile number',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Mobile Number"
                  placeholder="98XXXXXXXX"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  error={errors.mobileNumber?.message}
                  leftIcon="phone"
                />
              )}
            />
            <PrimaryButton
              title={isLoading ? 'Sending OTP...' : 'Send OTP'}
              onPress={handleSubmit(handleSendOTP)}
              disabled={isLoading}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Controller
              control={control}
              name="otp"
              rules={{
                required: 'OTP is required',
                minLength: { value: 6, message: 'Enter 6-digit OTP' },
              }}
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="OTP Code"
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                  error={errors.otp?.message}
                  leftIcon="lock"
                />
              )}
            />
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                validate: (value) =>
                  STRONG_PASSWORD_REGEX.test(value) ||
                  'Password must include uppercase, lowercase, number, and special character',
              }}
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="New Password"
                  placeholder="Enter new password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.newPassword?.message}
                  leftIcon="lock"
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              rules={{ required: 'Please confirm your password' }}
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  leftIcon="lock-check"
                />
              )}
            />
            <PrimaryButton
              title={isLoading ? 'Resetting...' : 'Reset Password'}
              onPress={handleSubmit(handleResetPassword)}
              disabled={isLoading}
            />
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  backButton: { marginBottom: spacing.lg },
  backText: { ...typography.body, color: colors.primary },
  header: { marginBottom: spacing.xxxl },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.gray600 },
  form: { flex: 1, gap: spacing.md },
  loginLink: { ...typography.body, color: colors.primary, textAlign: 'center', marginTop: spacing.xl, fontWeight: '600' },
});

export default ForgotPasswordScreen;
