import quranData from '@muslims-community/quran/data';

export interface Ayah {
  id: number;
  text: string;
  sajdah: boolean;
  juz: number;
  hizb: number;
}

export interface SurahSummary {
  id: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Surah extends SurahSummary {
  ayat: Ayah[];
}

const data = quranData as unknown as { surahs: Surah[] };

/
export function getAllSurahs(): SurahSummary[] {
  return data.surahs.map(({ ayat, ...summary }) => summary);
}

export function getSurah(id: number): Surah | undefined {
  return data.surahs.find((s) => s.id === id);
}