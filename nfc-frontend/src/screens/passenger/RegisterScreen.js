
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { register } from '../../store/slices/authslice';
import InputField from '../../components/forms/InputField';
import PasswordInput from '../../components/forms/PasswordInput';
import PhoneInput from '../../components/forms/PhoneInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { colors, typography, spacing } from '../../constants/theme';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await dispatch(register(data));
    if (register.fulfilled.match(result)) {
      showMessage({
        message: 'Registration Successful',
        description: 'Please login to continue',
        type: 'success',
      });
      navigation.navigate('Login');
    } else if (register.rejected.match(result)) {
      showMessage({
        message: 'Registration Failed',
        description: result.payload,
        type: 'danger',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us for a seamless travel experience
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            rules={{ required: 'Full name is required' }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                error={errors.fullName?.message}
                leftIcon="account"
              />
            )}
          />

          <Controller
            control={control}
            name="mobileNumber"
            rules={{
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Enter a valid 10-digit mobile number',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                label="Mobile Number"
                placeholder="98XXXXXXXX"
                value={value}
                onChangeText={onChange}
                error={errors.mobileNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                leftIcon="email"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              validate: (value) =>
                STRONG_PASSWORD_REGEX.test(value) ||
                'Password must include uppercase, lowercase, number, and special character',
            }}
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                label="Password"
                placeholder="Create a password"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <PrimaryButton
            title={isLoading ? 'Creating Account...' : 'Sign Up'}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            icon="account-plus"
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  form: {
    flex: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.body,
    color: colors.gray600,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
