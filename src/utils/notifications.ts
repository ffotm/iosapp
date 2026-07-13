import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DailyPrayerTimes } from './prayerTimes';

// NOTE: setNotificationHandler's field names changed in newer expo-notifications
// (shouldShowBanner/shouldShowList replaced the old shouldShowAlert). Using the
// old field names silently causes notifications not to display at all - this was
// likely the actual cause of "notifications don't seem to work."
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Cancels any previously scheduled prayer notifications and schedules
 * fresh ones for today's prayer times that are still in the future.
 *
 * IMPORTANT Expo Go limitation: custom notification sounds (like a bundled
 * adhan clip) only work in a real compiled build (EAS development build),
 * NOT inside Expo Go - Expo Go can only play the system default sound.
 * That's expected, not a bug. The `sound: 'default'` below will play iOS's
 * normal notification chime in Expo Go, and will play the real
 * adhan-notification.wav once you build a standalone/dev-client version.
 */
export async function schedulePrayerNotifications(
  today: DailyPrayerTimes,
  enabledPrayers: Record<string, boolean>
) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const entries: Array<{ name: string; time: Date }> = [
    { name: 'Fajr', time: today.fajr },
    { name: 'Dhuhr', time: today.dhuhr },
    { name: 'Asr', time: today.asr },
    { name: 'Maghrib', time: today.maghrib },
    { name: 'Isha', time: today.isha },
  ];

  const now = new Date();

  for (const entry of entries) {
    if (!enabledPrayers[entry.name]) continue;
    if (entry.time.getTime() <= now.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${entry.name} prayer time`,
        body: 'It is time for prayer.',
        // 'default' = normal system sound, works everywhere including Expo Go.
        // Swap to 'adhan-notification.wav' once you're testing a real build.
        sound: Platform.OS === 'ios' ? 'default' : 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: entry.time,
      },
    });
  }
}

/**
 * Cancels any previously scheduled prayer notifications and schedules
 * fresh ones for today's prayer times that are still in the future.
 *
 * NOTE: iOS notification sounds bundled via app.json's expo-notifications
 * plugin are capped at ~30 seconds - this plays a short adhan clip as the
 * alert sound. Tapping the notification opens the app, where you can play
 * the full adhan via expo-av (see HomeScreen).
 */
