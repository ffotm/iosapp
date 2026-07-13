import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getAllSurahs, getSurah, SurahSummary } from '../utils/quran';
import { useAppTheme } from '../context/ThemeContext';

export default function QuranScreen() {
  const { colors } = useAppTheme();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const styles = makeStyles(colors);

  if (selectedId !== null) {
    const surah = getSurah(selectedId);
    if (!surah) return null;
    return (
      <View style={styles.container}>
        <View style={styles.readerHeader}>
          <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Surahs</Text>
          </TouchableOpacity>
          <Text style={styles.readerTitle}>{surah.englishName}</Text>
          <Text style={styles.readerSubtitle}>{surah.name} · {surah.revelationType} · {surah.numberOfAyahs} ayat</Text>
        </View>
        <FlatList
          data={surah.ayat}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={styles.ayahList}
          renderItem={({ item }) => (
            <View style={styles.ayahRow}>
              <View style={styles.ayahBadge}>
                <Text style={styles.ayahBadgeText}>{item.id}</Text>
              </View>
              <Text style={styles.ayahText}>{item.text}</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={getAllSurahs()}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: SurahSummary }) => (
          <TouchableOpacity style={styles.surahRow} onPress={() => setSelectedId(item.id)}>
            <View style={styles.surahNumber}>
              <Text style={styles.surahNumberText}>{item.id}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.surahEnglish}>{item.englishName}</Text>
              <Text style={styles.surahMeta}>{item.revelationType} · {item.numberOfAyahs} ayat</Text>
            </View>
            <Text style={styles.surahArabic}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: 16 },
    surahRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    surahNumber: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.cardAlt,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12,
    },
    surahNumberText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
    surahEnglish: { color: colors.text, fontSize: 15, fontWeight: '600' },
    surahMeta: { color: colors.subtext, fontSize: 12, marginTop: 2 },
    surahArabic: { color: colors.accent, fontSize: 17, marginLeft: 10 },
    readerHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: { marginBottom: 8 },
    backBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    readerTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
    readerSubtitle: { color: colors.subtext, fontSize: 13, marginTop: 2 },
    ayahList: { padding: 16 },
    ayahRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ayahBadge: {
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: colors.cardAlt,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 10, marginTop: 2,
    },
    ayahBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
    ayahText: {
      flex: 1,
      color: colors.text,
      fontSize: 20,
      lineHeight: 34,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
  });
}