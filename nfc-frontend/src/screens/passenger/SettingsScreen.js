export function SettingsScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {[
          { label: 'Change Password', icon: '🔑' },
          { label: 'Notification Preferences', icon: '🔔' },
          { label: 'Language', icon: '🌐', value: 'English' },
          { label: 'Linked Wallets', icon: '💳' },
          { label: 'NFC Settings', icon: '📡' },
          { label: 'Delete Account', icon: '🗑️', danger: true },
        ].map((item) => (
          <Card key={item.label} style={[styles.settingRow, item.danger && styles.dangerRow]}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text style={[styles.settingLabel, item.danger && { color: colors.danger }]}>{item.label}</Text>
            {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
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