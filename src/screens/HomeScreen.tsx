import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { useAudioPlayer } from 'expo-audio';
import {
  computePrayerTimes,
  getNextPrayer,
  formatTime,
  DailyPrayerTimes,
} from '../utils/prayerTimes';
import { requestNotificationPermissions, schedulePrayerNotifications } from '../utils/notifications';
import { gregorianToHijri, formatHijri, formatGregorian } from '../utils/hijri';
import { useSettings } from '../context/SettingsContext';
import { useAppTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const { settings, loaded } = useSettings();
  const { colors } = useAppTheme();
  const [today, setToday] = useState<DailyPrayerTimes | null>(null);
  const [tomorrowFajr, setTomorrowFajr] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Loads assets/adhan-full.mp3 once; make sure that file actually exists at that path.
  const player = useAudioPlayer(require('../../assets/adhan-full.mp3'));

  const loadLocationAndTimes = useCallback(async () => {
    setError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Location permission is required to calculate prayer times and Qibla direction.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const now = new Date();
    const tPrayers = computePrayerTimes(lat, lon, now, settings);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tPrayersTomorrow = computePrayerTimes(lat, lon, tomorrow, settings);

    setToday(tPrayers);
    setTomorrowFajr(tPrayersTomorrow.fajr);

    const granted = await requestNotificationPermissions();
    if (granted) {
      await schedulePrayerNotifications(tPrayers, settings.enabledPrayers);
    }
  }, [settings]);

  useEffect(() => {
    if (loaded) loadLocationAndTimes();
  }, [loaded, loadLocationAndTimes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocationAndTimes();
    setRefreshing(false);
  };

  function playAdhan() {
    try {
      player.seekTo(0);
      player.play();
    } catch (e) {
      console.warn('Could not play adhan audio. Make sure assets/adhan-full.mp3 exists.', e);
    }
  }

  const styles = makeStyles(colors);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadLocationAndTimes}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!today || !tomorrowFajr) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching location & prayer times…</Text>
      </View>
    );
  }

  const now = new Date();
  const hijri = gregorianToHijri(now);
  const next = getNextPrayer(today, tomorrowFajr);
  const rows: Array<[string, Date]> = [
    ['Fajr', today.fajr],
    ['Sunrise', today.sunrise],
    ['Dhuhr', today.dhuhr],
    ['Asr', today.asr],
    ['Maghrib', today.maghrib],
    ['Isha', today.isha],
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.dateRow}>
        <Text style={styles.dateGregorian}>{formatGregorian(now)}</Text>
        <Text style={styles.dateHijri}>{formatHijri(hijri)}</Text>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextLabel}>Next prayer</Text>
        <Text style={styles.nextName}>{next.name}</Text>
        <Text style={styles.nextTime}>{formatTime(next.time)}</Text>
        <TouchableOpacity style={styles.playBtn} onPress={playAdhan}>
          <Text style={styles.playBtnText}>▶ Play Adhan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {rows.map(([name, time]) => (
          <View key={name} style={[styles.row, name === next.name && styles.rowActive]}>
            <Text style={styles.rowName}>{name}</Text>
            <Text style={styles.rowTime}>{formatTime(time)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 },
    loadingText: { color: colors.subtext, marginTop: 12 },
    error: { color: colors.danger, textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    retryText: { color: colors.card, fontWeight: '700' },
    dateRow: { alignItems: 'center', marginBottom: 16 },
    dateGregorian: { color: colors.text, fontSize: 15, fontWeight: '600' },
    dateHijri: { color: colors.accent, fontSize: 13, marginTop: 2 },
    nextCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextLabel: { color: colors.subtext, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
    nextName: { color: colors.text, fontSize: 34, fontWeight: '800', marginTop: 8 },
    nextTime: { color: colors.primary, fontSize: 22, fontWeight: '600', marginTop: 4 },
    playBtn: {
      marginTop: 18,
      backgroundColor: colors.primary,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 24,
    },
    playBtnText: { color: colors.card, fontWeight: '700' },
    list: { backgroundColor: colors.card, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowActive: { backgroundColor: colors.cardAlt },
    rowName: { color: colors.text, fontSize: 16, fontWeight: '500' },
    rowTime: { color: colors.text, fontSize: 16, fontWeight: '700' },
  });
}