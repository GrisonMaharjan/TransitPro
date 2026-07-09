import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api/apiClient';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = theme.colors;
  
  const [balance, setBalance] = useState(0);
  const [cardNumber, setCardNumber] = useState('N/A');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const response = await api.post('/wallet/balance', {});
      if (response.data.success) {
        setBalance(response.data.balance); 
        setCardNumber(response.data.cardNumber || 'N/A');
      }
    } catch (error) { 
      console.error('Load wallet error:', error); 
    }
  };

  const menuItems = [
    { id: 'edit', title: t('profile.edit_profile'), icon: 'account-edit', color: colors.primary, onPress: () => Alert.alert('Coming Soon', 'Edit profile feature coming soon') },
    { id: 'password', title: t('profile.change_password'), icon: 'lock-reset', color: colors.accent, onPress: () => Alert.alert('Coming Soon', 'Change password feature coming soon') },
    { id: 'cards', title: t('profile.manage_cards'), icon: 'credit-card-multiple', color: colors.success, onPress: () => Alert.alert('Coming Soon', 'Manage cards feature coming soon') },
    { id: 'notifications', title: t('profile.notifications'), icon: 'bell', color: colors.warning, onPress: () => Alert.alert('Coming Soon', 'Notifications coming soon') },
    { id: 'help', title: t('profile.help_support'), icon: 'help-circle', color: colors.textSecondary, onPress: () => Alert.alert(t('profile.help_support'), 'Contact: support@buspay.com.np') },
    { id: 'about', title: t('profile.about_us'), icon: 'information', color: colors.textSecondary, onPress: () => Alert.alert(t('profile.about_us'), t('profile.about_description')) },
  ];

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'), 
      t('profile.logout_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.logout'), style: 'destructive', onPress: async () => { 
          await logout(); 
          navigation.replace('Login'); 
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileAvatarText}>{user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || user?.fullName || 'User'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
          <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>{user?.mobileNumber || '98XXXXXXXX'}</Text>

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

        <View style={[styles.walletInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.walletInfoItem}>
            <Icon name="wallet" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.walletInfoLabel, { color: colors.textSecondary }]}>{t('profile.wallet_balance')}</Text>
              <Text style={[styles.walletInfoValue, { color: colors.text }]}>NPR {balance.toLocaleString()}</Text>
            </View>
          </View>
          <View style={[styles.walletDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.walletInfoItem}>
            <Icon name="nfc" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.walletInfoLabel, { color: colors.textSecondary }]}>NFC ID</Text>
              <Text style={[styles.walletInfoValue, { color: colors.text }]}>{user?.nfcUid || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Theme Toggle Section */}
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
                { backgroundColor: !isDark ? colors.primary : colors.surfaceGray }
              ]}
              onPress={() => !isDark ? null : toggleTheme()}
            >
              <Icon name="weather-sunny" size={24} color={!isDark ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: !isDark ? '#FFFFFF' : colors.text }]}>Light</Text>
              {!isDark && <Icon name="check-circle" size={18} color="#FFFFFF" style={styles.themeCheck} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                isDark && styles.themeOptionActive,
                { backgroundColor: isDark ? colors.primary : colors.surfaceGray }
              ]}
              onPress={() => isDark ? null : toggleTheme()}
            >
              <Icon name="weather-night" size={24} color={isDark ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: isDark ? '#FFFFFF' : colors.text }]}>Dark</Text>
              {isDark && <Icon name="check-circle" size={18} color="#FFFFFF" style={styles.themeCheck} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    marginBottom: 16,
  },
  idContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  idBadge: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D9E6',
  },
  idLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5C6E82',
  },
  idValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F4C81',
  },
  walletInfoCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  walletInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletInfoLabel: {
    fontSize: 12,
  },
  walletInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletDivider: {
    height: 1,
    marginVertical: 12,
  },
  themeSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
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
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    position: 'relative',
  },
  themeOptionText: {
    fontWeight: 'bold',
  },
  themeCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  menuSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 30,
  },
});

export default ProfileScreen;
