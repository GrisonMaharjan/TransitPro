// Updated ProfileScreen component - Add this to your App.js
const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const colors = theme.colors;
  
  const [balance, setBalance] = useState(1250);
  const [cardNumber, setCardNumber] = useState('**** **** **** 5678');

  useEffect(() => { loadWalletData(); }, []);

  const loadWalletData = async () => {
    try {
      const response = await api.post('/wallet/balance', {});
      if (response.success) { 
        setBalance(response.data.balance); 
        setCardNumber(response.data.cardNumber); 
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
            <Text style={styles.profileAvatarText}>{user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || user?.name || 'User'}</Text>
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
            <Icon name="credit-card" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.walletInfoLabel, { color: colors.textSecondary }]}>{t('dashboard.card_number')}</Text>
              <Text style={[styles.walletInfoValue, { color: colors.text }]}>{cardNumber}</Text>
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
          
          <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
            {isDark ? 'Dark mode is active. Light on eyes at night.' : 'Light mode is active. Bright and clear.'}
          </Text>
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