// src/components/common/ErrorMessage.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../constants/theme';

const ErrorMessage = ({ message, onRetry, visible = true }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={48} color={colors.error} />
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.message}>{message || 'An error occurred. Please try again.'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray50,
  },
  title: {
    ...typography.h4,
    color: colors.gray800,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  retryText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

export default ErrorMessage;