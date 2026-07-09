import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';

const FARES = [
  { from: 'Lagankhel', to: 'Ratnapark', fare: 20, km: '7 km' },
  { from: 'Thankot', to: 'Ratnapark', fare: 25, km: '12 km' },
  { from: 'Bungamati', to: 'Ratnapark', fare: 30, km: '14 km' },
  { from: 'Godawari', to: 'Lagankhel', fare: 35, km: '18 km' },
  { from: 'Lamatar', to: 'NAC', fare: 30, km: '16 km' },
  { from: 'Lele', to: 'Ratnapark', fare: 40, km: '20 km' },
  { from: 'Lagankhel', to: 'Budanilkantha', fare: 45, km: '22 km' },
  { from: 'Lagankhel', to: 'Naya Buspark', fare: 30, km: '13 km' },
];

export default function FareListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const filtered = FARES.filter(
    (f) =>
      f.from.toLowerCase().includes(search.toLowerCase()) ||
      f.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A84FF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fare List</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search route..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#aaa"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(_, i) => String(i)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.fareRow}>
              <View style={styles.routeInfo}>
                <Text style={styles.from}>{item.from}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.to}>{item.to}</Text>
              </View>
              <View style={styles.fareRight}>
                <Text style={styles.km}>{item.km}</Text>
                <Text style={styles.fare}>Rs. {item.fare}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No routes found</Text>}
        />
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#eee',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  routeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  from: { fontSize: 14, fontWeight: '700', color: '#111' },
  arrow: { color: '#0A84FF', fontSize: 16, fontWeight: '700' },
  to: { fontSize: 14, fontWeight: '700', color: '#111' },
  fareRight: { alignItems: 'flex-end' },
  km: { fontSize: 11, color: '#aaa', marginBottom: 2 },
  fare: { fontSize: 16, fontWeight: '800', color: '#0A84FF' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});