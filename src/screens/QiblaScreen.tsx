import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { getQiblaBearing, getDistanceToKaabaKm } from '../utils/qibla';
import { useAppTheme } from '../context/ThemeContext';

const ALIGNMENT_THRESHOLD_DEG = 5;

export default function QiblaScreen() {
  const { colors } = useAppTheme();
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aligned, setAligned] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const wasAligned = useRef(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to determine the Qibla direction.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const bearing = getQiblaBearing(pos.coords.latitude, pos.coords.longitude);
      setQiblaBearing(bearing);
      setDistanceKm(getDistanceToKaabaKm(pos.coords.latitude, pos.coords.longitude));

      const headingAvailable = await Location.hasServicesEnabledAsync();
      if (!headingAvailable) {
        setError('Enable location services to use the live compass.');
        return;
      }

      subscription = await Location.watchHeadingAsync((h) => {
        const value = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
        setHeading(value);
      });
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (heading === null || qiblaBearing === null) return;
    const target = qiblaBearing - heading;
    Animated.timing(rotation, {
      toValue: target,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    // Angular difference, normalized to 0-180 regardless of direction of wraparound.
    let diff = Math.abs(qiblaBearing - heading) % 360;
    if (diff > 180) diff = 360 - diff;
    const isAligned = diff <= ALIGNMENT_THRESHOLD_DEG;
    setAligned(isAligned);

    if (isAligned && !wasAligned.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    wasAligned.current = isAligned;
  }, [heading, qiblaBearing]);

  const styles = makeStyles(colors);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (heading === null || qiblaBearing === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Calibrating compass…</Text>
      </View>
    );
  }

  const spin = rotation.interpolate({
    inputRange: [-720, 720],
    outputRange: ['-720deg', '720deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qibla Direction</Text>
      <View style={styles.compassWrap}>
        <View style={[styles.compassRing, aligned && styles.compassRingAligned]}>
          <Animated.View style={[styles.needle, { transform: [{ rotate: spin }] }]}>
            <View style={[styles.needleTip, aligned && styles.needleTipAligned]} />
            <View style={styles.needleBase} />
          </Animated.View>
          <Text style={styles.northLabel}>N</Text>
        </View>
      </View>
      {aligned && <Text style={styles.alignedLabel}>✓ Facing the Qibla</Text>}
      <Text style={styles.info}>Qibla bearing: {qiblaBearing.toFixed(1)}° from true north</Text>
      {distanceKm !== null && (
        <Text style={styles.info}>~{Math.round(distanceKm).toLocaleString()} km to the Kaaba</Text>
      )}
      <Text style={styles.hint}>Hold your phone flat and rotate until the needle points up.</Text>
    </View>
  );
}

const RING_SIZE = 260;

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 },
    error: { color: colors.danger, textAlign: 'center' },
    loadingText: { color: colors.subtext, marginTop: 12 },
    title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 24 },
    compassWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    compassRing: {
      width: RING_SIZE,
      height: RING_SIZE,
      borderRadius: RING_SIZE / 2,
      borderWidth: 3,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compassRingAligned: {
      borderColor: colors.primary,
      borderWidth: 4,
    },
    needle: {
      position: 'absolute',
      width: 10,
      height: RING_SIZE - 40,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    needleTip: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.accent },
    needleTipAligned: { borderBottomColor: colors.primary },
    needleBase: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.subtext },
    northLabel: { position: 'absolute', top: 8, color: colors.subtext, fontWeight: '700' },
    alignedLabel: { color: colors.primary, fontSize: 15, fontWeight: '700', marginBottom: 6 },
    info: { color: colors.text, fontSize: 16, marginTop: 6 },
    hint: { color: colors.subtext, fontSize: 13, marginTop: 20, textAlign: 'center' },
  });
}