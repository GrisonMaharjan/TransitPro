export const colors = {
  // Primary blues
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#1E3A5F',

  // Backgrounds (dark theme)
  bgDeep: '#0F172A',
  bgCard: '#1E293B',
  bgAccent: '#1E3A5F',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textHint: '#475569',

  // Semantic
  success: '#34D399',
  danger: '#EF4444',
  warning: '#FBBF24',
  info: '#60A5FA',

  // Borders
  border: '#334155',
  borderFocus: '#2563EB',

  // White / Black
  white: '#FFFFFF',
  black: '#000000',
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

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Add these to your styles object
themeSection: {
  marginHorizontal: 16,
  marginBottom: 16,
  padding: 16,
  borderRadius: 16,
  borderWidth: 1,
},
themeHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 16,
},
themeTitle: {
  fontSize: 16,
  fontWeight: 'bold',
},
themeToggleContainer: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 12,
},
themeOption: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 12,
  borderRadius: 12,
  position: 'relative',
},
themeOptionActive: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
themeOptionText: {
  fontSize: 14,
  fontWeight: '500',
},
themeCheck: {
  position: 'absolute',
  top: 4,
  right: 8,
},
themeDescription: {
  fontSize: 12,
  textAlign: 'center',
  marginTop: 8,
},