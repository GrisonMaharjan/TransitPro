import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const trips = [
  { id: 1, route: 'Lagankhel → Ratnapark', date: 'Today, 08:14 AM', fare: 20, status: 'completed' },
  { id: 2, route: 'Ratnapark → Lagankhel', date: 'Today, 05:50 PM', fare: 20, status: 'completed' },
  { id: 3, route: 'Thankot → Ratnapark', date: 'Yesterday, 09:00 AM', fare: 25, status: 'completed' },
  { id: 4, route: 'Bungamati → Jamal', date: 'May 28, 08:30 AM', fare: 30, status: 'completed' },
  { id: 5, route: 'Godawari → Lagankhel', date: 'May 27, 07:45 AM', fare: 35, status: 'completed' },
  { id: 6, route: 'Lamatar → NAC', date: 'May 26, 06:00 PM', fare: 30, status: 'completed' },
];

export default function TripHistoryScreen({ navigation }) {
  const [filter, setFilter] = useState('all');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A84FF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{trips.length}</Text>
            <Text style={styles.summaryLabel}>Total Trips</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>Rs. {trips.reduce((a, t) => a + t.fare, 0)}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>May</Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {trips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripLeft}>
                <View style={styles.busIconBox}>
                  <Text style={styles.busIcon}>🚌</Text>
                </View>
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.tripRoute}>{trip.route}</Text>
                <Text style={styles.tripDate}>{trip.date}</Text>
              </View>
              <View style={styles.tripRight}>
                <Text style={styles.tripFare}>-Rs. {trip.fare}</Text>
                <View style={styles.tripStatus}>
                  <Text style={styles.tripStatusText}>✓</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A84FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingBottom: 16, paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  body: { flex: 1, backgroundColor: '#f5f7fb', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  summaryValue: { fontSize: 16, fontWeight: '800', color: '#0A84FF' },
  summaryLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  tripCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  tripLeft: { marginRight: 12 },
  busIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  busIcon: { fontSize: 20 },
  tripInfo: { flex: 1 },
  tripRoute: { fontSize: 14, fontWeight: '600', color: '#111' },
  tripDate: { fontSize: 12, color: '#999', marginTop: 2 },
  tripRight: { alignItems: 'flex-end', gap: 4 },
  tripFare: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  tripStatus: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  tripStatusText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});