import { Coordinates, CalculationMethod, PrayerTimes, Madhab, CalculationParameters } from 'adhan';

export type MethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey';

export interface PrayerTimesSettings {
  method: MethodKey;
  madhab: 'Shafi' | 'Hanafi';
}

export interface DailyPrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

function getCalculationParams(method: MethodKey): CalculationParameters {
  const methods: Record<MethodKey, () => CalculationParameters> = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
    Egyptian: CalculationMethod.Egyptian,
    Karachi: CalculationMethod.Karachi,
    UmmAlQura: CalculationMethod.UmmAlQura,
    Dubai: CalculationMethod.Dubai,
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
    NorthAmerica: CalculationMethod.NorthAmerica,
    Kuwait: CalculationMethod.Kuwait,
    Qatar: CalculationMethod.Qatar,
    Singapore: CalculationMethod.Singapore,
    Tehran: CalculationMethod.Tehran,
    Turkey: CalculationMethod.Turkey,
  };
  return methods[method]();
}

/**
 * Computes today's prayer times for a given location + settings.
 */
export function computePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  settings: PrayerTimesSettings
): DailyPrayerTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationParams(settings.method);
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const pt = new PrayerTimes(coordinates, date, params);

  return {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };
}

/**
 * Returns the next upcoming prayer (name + Date) relative to "now",
 * rolling over to tomorrow's Fajr if all of today's prayers have passed.
 */
export function getNextPrayer(
  today: DailyPrayerTimes,
  tomorrowFajr: Date,
  now: Date = new Date()
): { name: string; time: Date } {
  const ordered: Array<{ name: string; time: Date }> = [
    { name: 'Fajr', time: today.fajr },
    { name: 'Sunrise', time: today.sunrise },
    { name: 'Dhuhr', time: today.dhuhr },
    { name: 'Asr', time: today.asr },
    { name: 'Maghrib', time: today.maghrib },
    { name: 'Isha', time: today.isha },
  ];

  for (const p of ordered) {
    if (p.time.getTime() > now.getTime()) {
      return p;
    }
  }
  return { name: 'Fajr', time: tomorrowFajr };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
