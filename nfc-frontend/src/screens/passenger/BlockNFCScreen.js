import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/api/apiClient';
import { useLanguage } from '../../hooks/useLanguage';

const BlockNFCScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchNfcStats();
  }, []);

  const fetchNfcStats = async () => {
    try {
      const response = await apiClient.get('/user/nfc-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching NFC stats:', error);
      Alert.alert('Error', 'Unable to fetch card statistics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password to continue');
      return;
    }

    setProcessing(true);
    try {
      const response = await apiClient.post('/user/toggle-nfc-block', { password });

      if (response.data) {
        Alert.alert('Success', response.data.message);
        setPassword('');
        fetchNfcStats();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Action failed';
      Alert.alert('Error', errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0F4C81" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage NFC Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusCard, stats?.isNfcBlocked && styles.statusCardBlocked]}>
          <Icon
            name={stats?.isNfcBlocked ? "nfc-variant-off" : "nfc"}
            size={60}
            color={stats?.isNfcBlocked ? "#E63946" : "#2A9D8F"}
          />
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={[styles.statusValue, { color: stats?.isNfcBlocked ? "#E63946" : "#2A9D8F" }]}>
            {stats?.isNfcBlocked ? "BLOCKED" : "ACTIVE"}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>NFC UID:</Text>
            <Text style={styles.detailValue}>{stats?.nfcUid || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weekly Taps:</Text>
            <Text style={styles.detailValue}>{stats?.weeklyTaps || 0}</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>
            {stats?.isNfcBlocked ? "Unblock NFC Card" : "Block NFC Card"}
          </Text>
          <Text style={styles.actionDesc}>
            {stats?.isNfcBlocked
              ? "Verify your password to re-enable your transit card."
              : "Lost your card? Block it immediately to prevent unauthorized use."}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: stats?.isNfcBlocked ? "#2A9D8F" : "#E63946" }]}
            onPress={handleToggleBlock}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name={stats?.isNfcBlocked ? "lock-open" : "lock"} size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  {stats?.isNfcBlocked ? "Authorize Unblock" : "Confirm Block"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  scrollContent: { padding: 20 },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
  },
  statusCardBlocked: { borderColor: '#E6394620', backgroundColor: '#FFF5F5' },
  statusLabel: { fontSize: 14, color: '#6B7280', marginTop: 10 },
  statusValue: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: '#6B7280' },
  detailValue: { fontWeight: '600', color: '#1F2937' },
  actionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  actionDesc: { fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    color: '#1F2937',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default BlockNFCScreen;
