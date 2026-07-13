import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DailyPrayerTimes } from './prayerTimes';

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


