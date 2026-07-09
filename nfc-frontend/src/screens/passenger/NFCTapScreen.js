import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';

// State: idle | scanning | success | error
export default function NFCTapScreen({ navigation }) {
  const [tapState, setTapState] = useState('idle'); // idle | scanning | success | error
  const [fareInfo, setFareInfo] = useState(null);

  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const startPulse = () => {
    const anim = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1.5, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      );
    Animated.parallel([anim(pulse1, 0), anim(pulse2, 300), anim(pulse3, 600)]).start();
  };

  const stopPulse = () => {
    pulse1.stopAnimation();
    pulse2.stopAnimation();
    pulse3.stopAnimation();
    pulse1.setValue(1);
    pulse2.setValue(1);
    pulse3.setValue(1);
  };

  const handleTap = () => {
    setTapState('scanning');
    startPulse();

    // Simulate NFC scan
    setTimeout(() => {
      stopPulse();
      setTapState('success');
      setFareInfo({ route: 'Lagankhel → Ratnapark', fare: 20, balance: 460, stop: 'Ratnapark' });
      Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }, 2800);
  };

  const handleReset = () => {
    setTapState('idle');
    setFareInfo(null);
    successScale.setValue(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A84FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NFC Tap</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {tapState === 'success' ? (
          // Success State
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Fare Deducted!</Text>
            <Text style={styles.successRoute}>{fareInfo?.route}</Text>

            <View style={styles.fareRow}>
              <View style={styles.fareItem}>
                <Text style={styles.fareItemLabel}>Fare</Text>
                <Text style={styles.fareItemValue}>Rs. {fareInfo?.fare}</Text>
              </View>
              <View style={styles.fareDivider} />
              <View style={styles.fareItem}>
                <Text style={styles.fareItemLabel}>Balance</Text>
                <Text style={styles.fareItemValue}>Rs. {fareInfo?.balance}</Text>
              </View>
            </View>

            <Text style={styles.tapOutHint}>Tap again at destination to record trip</Text>

            <TouchableOpacity style={styles.doneBtn} onPress={handleReset}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            {/* NFC Animation */}
            <View style={styles.nfcArea}>
              <Animated.View style={[styles.ring, { transform: [{ scale: pulse3 }], opacity: pulse3.interpolate({ inputRange: [1, 1.5], outputRange: [0.3, 0] }) }]} />
              <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulse2 }], opacity: pulse2.interpolate({ inputRange: [1, 1.5], outputRange: [0.45, 0] }) }]} />
              <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: pulse1 }], opacity: pulse1.interpolate({ inputRange: [1, 1.5], outputRange: [0.6, 0] }) }]} />

              <TouchableOpacity
                style={[styles.nfcCore, tapState === 'scanning' && styles.nfcCoreScanning]}
                onPress={tapState === 'idle' ? handleTap : null}
                activeOpacity={0.85}
              >
                <Text style={styles.nfcCoreIcon}>📶</Text>
                <Text style={styles.nfcCoreLabel}>
                  {tapState === 'scanning' ? 'SCANNING...' : 'TAP TO PAY'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructions}>
              {tapState === 'scanning'
                ? 'Hold your phone near the bus NFC reader...'
                : 'Tap the button, then hold your phone near the NFC reader on the bus'}
            </Text>

            {/* Info cards */}
            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardIcon}>💳</Text>
                <Text style={styles.infoCardLabel}>Balance</Text>
                <Text style={styles.infoCardValue}>Rs. 480</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardIcon}>🚌</Text>
                <Text style={styles.infoCardLabel}>Last Route</Text>
                <Text style={styles.infoCardValue}>Lagankhel</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardIcon}>🕐</Text>
                <Text style={styles.infoCardLabel}>Last Tap</Text>
                <Text style={styles.infoCardValue}>08:14 AM</Text>
              </View>
            </View>

            {tapState === 'scanning' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleReset}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  body: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  nfcArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: '#0A84FF',
  },
  ring2: { width: 160, height: 160, borderRadius: 80 },
  ring3: { width: 110, height: 110, borderRadius: 55 },
  nfcCore: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  nfcCoreScanning: { backgroundColor: '#0070DD' },
  nfcCoreIcon: { fontSize: 30 },
  nfcCoreLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },
  instructions: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  infoCardIcon: { fontSize: 22, marginBottom: 4 },
  infoCardLabel: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  infoCardValue: { fontSize: 13, color: '#111', fontWeight: '700', marginTop: 2 },
  cancelBtn: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
  // Success styles
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EDFFF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successEmoji: { fontSize: 36 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 6 },
  successRoute: { fontSize: 15, color: '#666', marginBottom: 22 },
  fareRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f7fb',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    marginBottom: 16,
  },
  fareItem: { flex: 1, alignItems: 'center' },
  fareDivider: { width: 1, backgroundColor: '#ddd', marginHorizontal: 12 },
  fareItemLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 4 },
  fareItemValue: { fontSize: 22, fontWeight: '800', color: '#0A84FF' },
  tapOutHint: { color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 22 },
  doneBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});