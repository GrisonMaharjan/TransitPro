import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const featureItems = [
  { icon: 'credit-card-outline', title: 'View Card Details', desc: 'See your card information, including its unique card ID and current status.' },
  { icon: 'cash-multiple', title: 'Check Your Balance', desc: 'Instantly view the available balance on your travel card before you travel.' },
  { icon: 'plus-circle-outline', title: 'Top Up Your Card', desc: 'Add funds to your NFC card quickly and securely through the app.' },
  { icon: 'bus-marker', title: 'Travel with Tap In & Tap Out', desc: 'Use your NFC card to board and exit buses. The correct fare will be deducted automatically based on your journey.' },
  { icon: 'history', title: 'View Transaction History', desc: 'Review your recent top-ups, fare deductions, and travel history anytime.' },
  { icon: 'shield-check-outline', title: 'Manage Your Card', desc: 'Monitor your card status and securely manage your travel account.' },
];

const scanSteps = [
  'Enable NFC on your phone.',
  'Tap Start Scanning.',
  'Hold your NFC card against the back of your phone.',
  'Keep the card still until the scan is complete.',
  'Your card information will appear automatically.',
];

const helpfulTips = [
  'Keep the card flat against the NFC area of your phone.',
  "Remove thick phone cases if the card isn't detected.",
  'Ensure NFC is enabled on your device.',
  'Hold the card steady for a few seconds during scanning.',
];

export default function NFCTapScreen({ navigation }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const topGlow = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.42],
  });

  const handleStartScanning = () => {
    Alert.alert(
      'NFC Ready',
      'Your card scan flow is ready. Enable NFC and hold your travel card against the back of your phone.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color="#0F4C81" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>Scan Your NFC Card</Text>
          <Text style={styles.subtitle}>Manage your travel card with a single tap.</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Animated.View style={[styles.heroGlow, { opacity: topGlow }]} />
          <View style={styles.heroIllustrationWrap}>
            <View style={styles.heroPulseOuter} />
            <View style={styles.heroPulseMiddle} />
            <View style={styles.heroPulseInner} />
            <View style={styles.heroDevice}>
              <View style={styles.heroSpeaker} />
              <View style={styles.heroNfcBadge}>
                <Icon name="nfc" size={36} color="#0F4C81" />
              </View>
              <View style={styles.heroWaves}>
                <View style={styles.heroWave} />
                <View style={[styles.heroWave, styles.heroWaveMid]} />
                <View style={[styles.heroWave, styles.heroWaveShort]} />
              </View>
            </View>
            <View style={styles.heroToken}>
              <Icon name="credit-card-chip" size={26} color="#0F4C81" />
            </View>
          </View>

          <Text style={styles.heroHeading}>Scan Your NFC Card</Text>
          <Text style={styles.heroDescription}>
            Hold your NFC travel card against the back of your phone to securely connect it with the app. Once your card is detected, you'll be able to view your card details, check your balance, top up your wallet, and manage your travel information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Can Do</Text>
          <View style={styles.featureGrid}>
            {featureItems.map((item) => (
              <View key={item.title} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Icon name={item.icon} size={22} color="#0F4C81" />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Scan</Text>
          <View style={styles.infoCard}>
            {scanSteps.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Helpful Tips</Text>
          <View style={styles.infoCard}>
            {helpfulTips.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Icon name="information-outline" size={18} color="#2A9D8F" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Icon name="lock-check-outline" size={22} color="#0F4C81" />
          <Text style={styles.noteText}>
            Scanning your NFC card does not deduct any money. It simply allows the app to read your card so you can check your balance, top up your card, view transaction history, and manage your travel information securely.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartScanning} activeOpacity={0.9}>
          <Icon name="nfc" size={22} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4C81',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0F4C81', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 128 },
  heroCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 22,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#0F4C81',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroGlow: {
    position: 'absolute',
    top: -48,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D7E8FF',
  },
  heroIllustrationWrap: { alignItems: 'center', justifyContent: 'center', height: 240, marginBottom: 8 },
  heroPulseOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#9CC2FF',
  },
  heroPulseMiddle: {
    position: 'absolute',
    width: 166,
    height: 166,
    borderRadius: 83,
    borderWidth: 2,
    borderColor: '#C6DDFF',
  },
  heroPulseInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#DDEBFF',
  },
  heroDevice: {
    width: 128,
    height: 190,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    shadowColor: '#0F4C81',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroSpeaker: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#D7E3F4', marginBottom: 12 },
  heroNfcBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWaves: { marginTop: 16, alignItems: 'center' },
  heroWave: { width: 56, height: 3, borderRadius: 99, backgroundColor: '#0F4C81', marginBottom: 8 },
  heroWaveMid: { width: 42, opacity: 0.55 },
  heroWaveShort: { width: 28, opacity: 0.32 },
  heroToken: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCE9FF',
    shadowColor: '#0F4C81',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroHeading: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: '#0F4C81', marginBottom: 10 },
  heroDescription: { fontSize: 14, lineHeight: 22, textAlign: 'center', color: '#6B7280' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F4C81', marginBottom: 14 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: {
    width: SCREEN_WIDTH > 400 ? '48%' : '49%',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', lineHeight: 20, marginBottom: 6 },
  featureDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  infoCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F4C81',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, color: '#1F2937', lineHeight: 21 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  tipText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 20 },
  noteCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#B8D4FF',
    backgroundColor: '#EAF2FF',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 21, color: '#0F4C81' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F7FAFF',
    borderTopWidth: 1,
    borderTopColor: '#E6ECF5',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#0F4C81',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#0F4C81',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
