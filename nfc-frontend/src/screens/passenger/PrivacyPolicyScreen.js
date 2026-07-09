export function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {[
          { heading: 'Data Collection', body: 'YatraPay collects your name, phone number, email, and transaction data solely for the purpose of providing cashless bus fare services. We do not sell your personal data to third parties.' },
          { heading: 'NFC Usage', body: 'NFC is used only when you actively initiate a tap-to-pay session. No background NFC scanning is performed. Token data is encrypted and never stored in plain text.' },
          { heading: 'Payment Data', body: 'Payment processing is handled by certified payment gateways (Khalti, eSewa). YatraPay does not store your wallet credentials or banking information.' },
          { heading: 'Data Retention', body: 'Transaction records are kept for 24 months for audit and dispute resolution. You may request deletion of your account and associated data at any time.' },
          { heading: 'Security', body: 'All API communications are encrypted with TLS 1.3. User authentication uses JWT tokens with short expiry. Sensitive operations require re-authentication.' },
        ].map((section) => (
          <Card key={section.heading} style={styles.policyCard}>
            <Text style={styles.policyHeading}>{section.heading}</Text>
            <Text style={styles.policyBody}>{section.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDeep },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  back: { color: colors.primaryLight, fontSize: fontSize.base, marginBottom: spacing.sm },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  fareCard: { marginBottom: spacing.sm },
  fareRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  routeText: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  viaText: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  fareBox: { backgroundColor: colors.bgDeep, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  fareAmount: { color: colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  note: { color: colors.textHint, fontSize: 10, textAlign: 'center', marginTop: spacing.md, lineHeight: 15 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  dangerRow: { borderColor: colors.danger, borderWidth: 1 },
  settingLabel: { flex: 1, color: colors.textPrimary, fontSize: fontSize.base },
  settingValue: { color: colors.textMuted, fontSize: fontSize.sm, marginRight: spacing.xs },
  policyCard: { marginBottom: spacing.md },
  policyHeading: { color: colors.primaryLight, fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  policyBody: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
});