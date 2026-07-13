import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/api/apiClient';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
};

export default function ProfileScreen({ navigation }) {
  const { t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = theme.colors;

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWalletData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);
        if (storedUser && mounted) {
          setUser(JSON.parse(storedUser));
        }

        const response = await apiClient.get('/wallet/balance');
        const payload = response.data || {};

        if (!mounted) return;

        setBalance(payload.balance ?? 0);
        setCardNumber(payload.cardNumber || '');
        if (payload.user) {
          setUser(payload.user);
        }
      } catch (error) {
        console.error('Load wallet error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadWalletData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('profile.logout_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
          navigation.replace('Login');
        },
      },
    ]);
  };

  const menuItems = [
    { id: 'edit', title: t('profile.edit_profile'), icon: 'account-edit', color: colors.primary, onPress: () => Alert.alert('Coming Soon', 'Edit profile is available in the main app flow.') },
    { id: 'password', title: t('profile.change_password'), icon: 'lock-reset', color: colors.accent, onPress: () => Alert.alert('Coming Soon', 'Change password is available in the main app flow.') },
    { id: 'cards', title: t('profile.manage_cards'), icon: 'credit-card-multiple', color: colors.success, onPress: () => Alert.alert('Coming Soon', 'Manage cards feature coming soon') },
    { id: 'notifications', title: t('profile.notifications'), icon: 'bell', color: colors.warning, onPress: () => Alert.alert('Coming Soon', 'Notifications coming soon') },
    { id: 'help', title: t('profile.help_support'), icon: 'help-circle', color: colors.textSecondary, onPress: () => Alert.alert(t('profile.help_support'), 'Contact: support@buspay.com.np') },
    { id: 'about', title: t('profile.about_us'), icon: 'information', color: colors.textSecondary, onPress: () => Alert.alert(t('profile.about_us'), t('profile.about_description')) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.id === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.profileAvatarText}>{user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || user?.name || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
            <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>{user?.mobileNumber || '98XXXXXXXX'}</Text>

            <View style={styles.idContainer}>
              <View style={[styles.idBadge, { backgroundColor: colors.surfaceGray }]}>
                <Text style={[styles.idLabel, { color: colors.textSecondary }]}>USER ID: </Text>
                <Text style={[styles.idValue, { color: colors.primary }]}>{user?.userId || 'N/A'}</Text>
              </View>
              <View style={[styles.idBadge, { backgroundColor: colors.surfaceGray }]}>
                <Text style={[styles.idLabel, { color: colors.textSecondary }]}>NFC ID: </Text>
                <Text style={[styles.idValue, { color: colors.primary }]}>{user?.nfcUid || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.walletInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.walletInfoItem}>
              <Icon name="wallet" size={24} color={colors.primary} />
              <View>
                <Text style={[styles.walletInfoLabel, { color: colors.textSecondary }]}>{t('profile.wallet_balance')}</Text>
                <Text style={[styles.walletInfoValue, { color: colors.text }]}>NPR {Number(balance || 0).toLocaleString()}</Text>
              </View>
            </View>
            <View style={[styles.walletDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.walletInfoItem}>
              <Icon name="star-circle" size={24} color="#F4A261" />
              <View>
                <Text style={[styles.walletInfoLabel, { color: colors.textSecondary }]}>Reward Points</Text>
                <Text style={[styles.walletInfoValue, { color: colors.text }]}>{user?.rewardPoints || 0} pts</Text>
              </View>
            </View>
          </View>

          <View style={[styles.themeSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.themeHeader}>
              <Icon name="theme-light-dark" size={22} color={colors.primary} />
              <Text style={[styles.themeTitle, { color: colors.text }]}>Theme</Text>
            </View>

            <View style={styles.themeToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  !isDark && styles.themeOptionActive,
                  { backgroundColor: !isDark ? colors.primary : colors.surfaceGray },
                ]}
                onPress={() => !isDark ? null : toggleTheme()}
              >
                <Icon name="weather-sunny" size={24} color={!isDark ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.themeOptionText, { color: !isDark ? '#FFFFFF' : colors.text }]}>Light</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  isDark && styles.themeOptionActive,
                  { backgroundColor: isDark ? colors.primary : colors.surfaceGray },
                ]}
                onPress={() => isDark ? null : toggleTheme()}
              >
                <Icon name="weather-night" size={24} color={isDark ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.themeOptionText, { color: isDark ? '#FFFFFF' : colors.text }]}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.menuSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} onPress={item.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleLogout}>
            <Icon name="logout" size={22} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>{t('common.logout')}</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.textMuted }]}>{t('profile.version')} 1.0.0</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileEmail: {
    marginTop: 4,
    fontSize: 14,
  },
  profilePhone: {
    marginTop: 2,
    fontSize: 14,
  },
  idContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  idBadge: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  idValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  walletInfoCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  walletInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletDivider: {
    height: 1,
    marginVertical: 14,
  },
  walletInfoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  walletInfoValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  themeSection: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  themeOptionActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    paddingBottom: 24,
  },
});
