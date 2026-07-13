import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useAppTheme } from '../context/ThemeContext';
import { MethodKey } from '../utils/prayerTimes';

const METHODS: { key: MethodKey; label: string }[] = [
  { key: 'MuslimWorldLeague', label: 'Muslim World League' },
  { key: 'Egyptian', label: 'Egyptian General Authority' },
  { key: 'UmmAlQura', label: 'Umm al-Qura (Makkah)' },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { key: 'Dubai', label: 'Dubai' },
  { key: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
  { key: 'NorthAmerica', label: 'ISNA (North America)' },
  { key: 'Kuwait', label: 'Kuwait' },
  { key: 'Qatar', label: 'Qatar' },
  { key: 'Singapore', label: 'Singapore' },
  { key: 'Tehran', label: 'Tehran' },
  { key: 'Turkey', label: 'Turkey (Diyanet)' },
];

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { colors, mode, setMode } = useAppTheme();
  const styles = makeStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        {(['system', 'light', 'dark'] as const).map((m) => (
          <TouchableOpacity key={m} style={styles.optionRow} onPress={() => setMode(m)}>
            <Text style={styles.optionLabel}>{m === 'system' ? 'Match system' : m === 'light' ? 'Light' : 'Dark'}</Text>
            {mode === m && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Calculation Method</Text>
      <View style={styles.card}>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={styles.optionRow}
            onPress={() => updateSettings({ method: m.key })}
          >
            <Text style={styles.optionLabel}>{m.label}</Text>
            {settings.method === m.key && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Asr Calculation (Madhab)</Text>
      <View style={styles.card}>
        {(['Shafi', 'Hanafi'] as const).map((m) => (
          <TouchableOpacity key={m} style={styles.optionRow} onPress={() => updateSettings({ madhab: m })}>
            <Text style={styles.optionLabel}>{m}</Text>
            {settings.madhab === m && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.card}>
        {Object.keys(settings.enabledPrayers).map((prayer) => (
          <View key={prayer} style={styles.optionRow}>
            <Text style={styles.optionLabel}>{prayer}</Text>
            <Switch
              value={settings.enabledPrayers[prayer]}
              onValueChange={(val) =>
                updateSettings({ enabledPrayers: { ...settings.enabledPrayers, [prayer]: val } })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        Changes apply the next time prayer times refresh (pull to refresh on the Home tab).
      </Text>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    sectionTitle: { color: colors.subtext, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginTop: 16, fontWeight: '600' },
    card: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionLabel: { color: colors.text, fontSize: 15 },
    check: { color: colors.primary, fontSize: 16, fontWeight: '800' },
    note: { color: colors.subtext, fontSize: 12, marginTop: 20, marginBottom: 40, textAlign: 'center' },
  });
}