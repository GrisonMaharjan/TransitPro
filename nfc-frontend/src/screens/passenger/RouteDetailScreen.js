import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/api/apiClient';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const RouteDetailScreen = ({ route, navigation }) => {
  const { routeId, routeName } = route.params;
  const { t } = useLanguage();
  const { theme } = useTheme();
  const colors = theme.colors;

  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState([]);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [calculatedFare, setCalculatedFare] = useState(null);
  const [searchingFare, setSearchingFare] = useState(false);

  useEffect(() => {
    fetchRouteDetails();
  }, []);

  const fetchRouteDetails = async () => {
    try {
      const response = await apiClient.get(`/routes/${routeId}`);
      const data = response.data;

      setStops(data.stops || []);
      if (data.stops?.length > 0) {
        setPickup(data.stops[0].name);
        setDrop(data.stops[data.stops.length - 1].name);
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
      Alert.alert('Error', 'Unable to fetch route details from server.');
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = async () => {
    if (pickup === drop) {
      Alert.alert('Selection Error', 'Pickup and Drop stops cannot be the same.');
      return;
    }

    setSearchingFare(true);
    setCalculatedFare(null);

    try {
      const url = `/routes/${routeId}/fare?from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(drop)}`;
      const response = await apiClient.get(url);
      const data = response.data;

      if (data.fare) {
        setCalculatedFare(data.fare);
      } else {
        setCalculatedFare(data.defaultFare || 18);
        Alert.alert('Fare Notice', data.message || 'Using standard minimum fare.');
      }
    } catch (error) {
      const fallback = error.response?.data?.defaultFare || 18;
      setCalculatedFare(fallback);
      Alert.alert('Fare Notice', error.response?.data?.message || 'Using standard minimum fare.');
    } finally {
      setSearchingFare(false);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{routeName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Fare Search Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fare Calculator</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Pickup Stop</Text>
            <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceGray }]}>
              <Picker
                selectedValue={pickup}
                onValueChange={(itemValue) => setPickup(itemValue)}
                style={{ color: colors.text }}
                dropdownIconColor={colors.primary}
              >
                {stops.map((stop) => (
                  <Picker.Item key={stop._id} label={stop.name} value={stop.name} color={colors.text} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Drop Stop</Text>
            <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceGray }]}>
              <Picker
                selectedValue={drop}
                onValueChange={(itemValue) => setDrop(itemValue)}
                style={{ color: colors.text }}
                dropdownIconColor={colors.primary}
              >
                {stops.map((stop) => (
                  <Picker.Item key={stop._id} label={stop.name} value={stop.name} color={colors.text} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.calculateButton, { backgroundColor: colors.primary }]}
            onPress={calculateFare}
            disabled={searchingFare}
          >
            {searchingFare ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.calculateButtonText}>Calculate Fare</Text>
            )}
          </TouchableOpacity>

          {calculatedFare !== null && (
            <View style={[styles.fareResult, { borderTopColor: colors.divider }]}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Estimated Fare</Text>
              <Text style={[styles.fareAmount, { color: colors.primary }]}>Rs. {calculatedFare}</Text>
            </View>
          )}
        </View>

        {/* Route Stops Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Route Stops</Text>
          {stops.map((stop, index) => (
            <View key={stop._id} style={styles.stopItem}>
              <View style={styles.stopIconWrap}>
                <View style={[
                  styles.dot,
                  index === 0 && { backgroundColor: colors.success, width: 16, height: 16, borderRadius: 8 },
                  index === stops.length - 1 && { backgroundColor: colors.secondary, width: 16, height: 16, borderRadius: 8 }
                ]} />
                {index < stops.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
              </View>
              <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, marginBottom: 8, fontWeight: '600' },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  calculateButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  fareResult: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  fareLabel: { fontSize: 14 },
  fareAmount: { fontSize: 32, fontWeight: '800', marginTop: 4 },
  stopItem: { flexDirection: 'row', alignItems: 'flex-start', height: 60 },
  stopIconWrap: { width: 30, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#D1D5DB', zIndex: 2 },
  line: { width: 2, height: '100%', position: 'absolute', top: 12 },
  stopName: { fontSize: 16, marginLeft: 10, fontWeight: '500' },
});

export default RouteDetailScreen;
