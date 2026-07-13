
const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

export interface HijriDate {
  day: number;
  month: number; 
  monthName: string;
  year: number;
}

export function gregorianToHijri(date: Date): HijriDate {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let m = month;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const im = Math.floor((24 * l) / 709);
  const id = l - Math.floor((709 * im) / 24);
  const iy = 30 * n + j - 30;

  return {
    day: id,
    month: im,
    monthName: HIJRI_MONTHS[im - 1] ?? '',
    year: iy,
  };
}

export function formatHijri(h: HijriDate): string {
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

export function formatGregorian(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}