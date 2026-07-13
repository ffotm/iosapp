import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { gregorianToHijri, formatHijri, formatGregorian, HijriDate } from '../utils/hijri';
import { useAppTheme } from '../context/ThemeContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface DayCell {
  date: Date;
  inMonth: boolean;
  hijri: HijriDate;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const gridStart = new Date(year, month, 1 - startOffset);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month, hijri: gregorianToHijri(d) });
  }
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date>(today);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const selectedHijri = gregorianToHijri(selected);
  const styles = makeStyles(colors);

  function goMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.selectedCard}>
        <Text style={styles.selectedGregorian}>{formatGregorian(selected)}</Text>
        <Text style={styles.selectedHijri}>{formatHijri(selectedHijri)}</Text>
      </View>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => goMonth(-1)} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={() => goMonth(1)} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekdayLabel}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, selected);
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.cell,
                isSelected && styles.cellSelected,
                isToday && !isSelected && styles.cellToday,
              ]}
              onPress={() => setSelected(cell.date)}
            >
              <Text style={[styles.cellGregorian, !cell.inMonth && styles.cellDim, isSelected && styles.cellTextSelected]}>
                {cell.date.getDate()}
              </Text>
              <Text style={[styles.cellHijri, !cell.inMonth && styles.cellDim, isSelected && styles.cellTextSelected]}>
                {cell.hijri.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.note}>
        Bottom number in each cell is the Hijri day. Hijri dates are calculated (not moon-sighted) and may differ by a day from official announcements.
      </Text>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    selectedCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedGregorian: { color: colors.text, fontSize: 18, fontWeight: '700' },
    selectedHijri: { color: colors.accent, fontSize: 15, marginTop: 4 },
    monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    navBtn: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    navBtnText: { color: colors.primary, fontSize: 20, fontWeight: '700' },
    monthTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
    weekdayRow: { flexDirection: 'row', marginBottom: 6 },
    weekdayLabel: { flex: 1, textAlign: 'center', color: colors.subtext, fontSize: 12, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginBottom: 4,
    },
    cellSelected: { backgroundColor: colors.primary },
    cellToday: { borderWidth: 1.5, borderColor: colors.accent },
    cellGregorian: { color: colors.text, fontSize: 15, fontWeight: '600' },
    cellHijri: { color: colors.subtext, fontSize: 10, marginTop: 1 },
    cellDim: { opacity: 0.35 },
    cellTextSelected: { color: colors.card },
    note: { color: colors.subtext, fontSize: 12, marginTop: 16, marginBottom: 40, textAlign: 'center' },
  });
}