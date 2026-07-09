// src/utils/formatters.js
import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date string into a readable format
 * Example: "Apr 18, 2026 • 08:30 AM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'MMM dd, yyyy • h:mm a');
};

/**
 * Format a date relative to now
 * Example: "2 hours ago", "in 3 days"
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Format a number as currency (Nepalese Rupees)
 * Example: formatCurrency(1250) → "रु 1,250"
 */
export const formatCurrency = (amount, currency = 'रु') => {
  return `${currency} ${amount.toLocaleString()}`;
};

/**
 * Format a phone number to a readable format
 * Example: "9801234567" → "980-123-4567"
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
 const cleaned = phone.replaceAll(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Capitalize the first letter of a string
 * Example: "hello" → "Hello"
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
