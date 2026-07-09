import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MainLayout from '../components/MainLayout';
import { useTranslation } from '../context/LanguageContext';

const AboutScreen = ({ isDarkMode, toggleTheme, setCurrentScreen, userRole, allUsers }) => {
  const { t } = useTranslation();

  return (
    <MainLayout
      title={t('about.title')}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      setCurrentScreen={setCurrentScreen}
      userRole={userRole}
      allUsers={allUsers}
      showBackButton={true}
    >
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🚌</Text>
          <Text style={styles.appName}>{t('app_name')}</Text>
          <Text style={styles.version}>{t('about.version')} 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.about_app')}</Text>
          <Text style={styles.description}>
            {t('about.description')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.features')}</Text>
          <View style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{t('home.tap_to_pay')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{t('home.wallet_balance')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{t('home.recent_trips')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{t('drawer.dark_mode')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.technology')}</Text>
          <View style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>React Native / Expo</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>NFC Technology</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2024 NFC Bus Pay. {t('about.copyright')}</Text>
        </View>
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logo: { fontSize: 60, marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  version: { fontSize: 14, color: '#666', marginTop: 5 },
  section: { marginBottom: 25, backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12 },
  description: { fontSize: 14, color: '#444', lineHeight: 22 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bullet: { fontSize: 16, color: '#2E7D32', marginRight: 10, fontWeight: 'bold' },
  featureText: { fontSize: 14, color: '#444', flex: 1 },
  footer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  copyright: { fontSize: 12, color: '#999' },
});

export default AboutScreen;