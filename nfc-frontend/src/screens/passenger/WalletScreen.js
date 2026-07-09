import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, StatusBar, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function WalletScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('khalti');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A84FF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>Rs. 480</Text>
          <Text style={styles.balanceSub}>Last topped up: Yesterday, Rs. 500</Text>
        </View>

        {/* Top-up section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Up Wallet</Text>

          {/* Quick amounts */}
          <Text style={styles.fieldLabel}>Quick Select</Text>
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.quickChip, amount === String(a) && styles.quickChipActive]}
                onPress={() => setAmount(String(a))}
              >
                <Text style={[styles.quickChipText, amount === String(a) && styles.quickChipTextActive]}>
                  Rs. {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom amount */}
          <Text style={styles.fieldLabel}>Or enter amount</Text>
          <View style={styles.amountInput}>
            <Text style={styles.rupeeSymbol}>Rs.</Text>
            <TextInput
              style={styles.amountField}
              placeholder="0"
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Payment method */}
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            {[
              { id: 'khalti', label: 'Khalti', icon: '💜' },
              { id: 'esewa', label: 'eSewa', icon: '💚' },
              { id: 'bank', label: 'Bank', icon: '🏦' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodCard, method === m.id && styles.methodCardActive]}
                onPress={() => setMethod(m.id)}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>
                  {m.label}
                </Text>
                {method === m.id && <View style={styles.methodCheck}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text></View>}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.topUpBtn, !amount && styles.topUpBtnDisabled]}
            disabled={!amount}
            activeOpacity={0.85}
          >
            <Text style={styles.topUpBtnText}>
              Top Up {amount ? `Rs. ${amount}` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction history mini */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Activity</Text>
          {[
            { label: 'Top-up via Khalti', amount: '+Rs. 500', date: 'Yesterday', color: '#22c55e' },
            { label: 'Fare – Lagankhel → Ratnapark', amount: '-Rs. 20', date: 'Today 8:14 AM', color: '#ef4444' },
            { label: 'Top-up via eSewa', amount: '+Rs. 200', date: '3 days ago', color: '#22c55e' },
          ].map((tx, i) => (
            <View key={i} style={styles.activityRow}>
              <View style={styles.activityDot} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>{tx.label}</Text>
                <Text style={styles.activityDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.activityAmount, { color: tx.color }]}>{tx.amount}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A84FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  balanceAmount: { color: '#fff', fontSize: 38, fontWeight: '800', marginVertical: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  body: { flex: 1 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 10, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  quickChipActive: { borderColor: '#0A84FF', backgroundColor: '#EBF4FF' },
  quickChipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  quickChipTextActive: { color: '#0A84FF' },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  rupeeSymbol: { fontSize: 18, color: '#555', marginRight: 8, fontWeight: '700' },
  amountField: { flex: 1, fontSize: 22, color: '#111', fontWeight: '700' },
  methodRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  methodCard: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#eee',
    position: 'relative',
  },
  methodCardActive: { borderColor: '#0A84FF', backgroundColor: '#EBF4FF' },
  methodIcon: { fontSize: 22, marginBottom: 4 },
  methodLabel: { fontSize: 12, color: '#555', fontWeight: '600' },
  methodLabelActive: { color: '#0A84FF' },
  methodCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  topUpBtnDisabled: { backgroundColor: '#7EC4FF', shadowOpacity: 0, elevation: 0 },
  topUpBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0A84FF', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
  activityDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  activityAmount: { fontSize: 15, fontWeight: '700' },
});