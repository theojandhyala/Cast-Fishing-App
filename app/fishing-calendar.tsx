import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useTripStore } from '../store/tripStore';
import { colors, spacing, radius } from '../constants/theme';

const MOON_PHASES = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// UK Closed seasons (simplified)
const CLOSED_SEASONS: Record<string, { start: number; end: number; startDay: number; endDay: number }> = {
  'Coarse (Rivers)': { start: 2, end: 5, startDay: 15, endDay: 15 },
  'Salmon': { start: 9, end: 0, startDay: 1, endDay: 31 },
};

const SOLUNAR_TIMES = [
  { label: 'Major Feed', time: '06:42', duration: '2h', quality: 'Excellent' },
  { label: 'Minor Feed', time: '12:14', duration: '1h', quality: 'Good' },
  { label: 'Major Feed', time: '19:08', duration: '2h', quality: 'Excellent' },
  { label: 'Minor Feed', time: '00:32', duration: '1h', quality: 'Fair' },
];

function getMoonEmoji(dayOfMonth: number): string {
  const phase = Math.floor(dayOfMonth / 3.75) % 8;
  return MOON_PHASES[phase];
}

function getFishingScore(dayOfMonth: number, month: number): number {
  // Simulate varying scores
  const base = 50 + Math.sin(dayOfMonth * 0.8) * 20 + Math.cos(month * 0.5) * 15;
  return Math.max(20, Math.min(98, Math.round(base)));
}

function scoreColor(score: number) {
  if (score >= 70) return colors.success;
  if (score >= 45) return colors.warning;
  return colors.danger;
}

function getTideIndicator(day: number): string {
  const tides = ['↑', '↓', '→', '↑↑', '↓↓'];
  return tides[day % 5];
}

export default function FishingCalendarScreen() {
  const router = useRouter();
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { catches } = useCatchStore();
  const { trips } = useTripStore();

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // Mon=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Get dates with catches
  const catchDays = new Set(
    catches
      .filter(c => {
        const d = new Date(c.date);
        return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
      })
      .map(c => new Date(c.date).getDate())
  );

  // Get trip dates
  const tripDays = new Set(
    trips
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
      })
      .map(t => new Date(t.date).getDate())
  );

  // Find best days (top 5)
  const scores = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    score: getFishingScore(i + 1, viewMonth),
  }));
  const bestDays = new Set(
    [...scores].sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.day)
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const dayData = selectedDay ? {
    moon: getMoonEmoji(selectedDay),
    score: getFishingScore(selectedDay, viewMonth),
    tide: getTideIndicator(selectedDay),
    hasCatch: catchDays.has(selectedDay),
    hasTrip: tripDays.has(selectedDay),
  } : null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fishing Calendar</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.success }]} /><Text style={styles.legendText}>Great Day</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary, borderRadius: 2 }]} /><Text style={styles.legendText}>Your Catch</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.secondary, borderRadius: 2 }]} /><Text style={styles.legendText}>Trip</Text></View>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map(d => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {/* Empty cells */}
          {Array.from({ length: adjustedFirst }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.calCell} />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const score = getFishingScore(day, viewMonth);
            const sc = scoreColor(score);
            const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
            const isBest = bestDays.has(day);
            const hasCatch = catchDays.has(day);
            const hasTrip = tripDays.has(day);
            const isSelected = selectedDay === day;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.calCell,
                  isSelected && styles.calCellSelected,
                  isToday && styles.calCellToday,
                  isBest && styles.calCellBest,
                ]}
                onPress={() => setSelectedDay(day === selectedDay ? null : day)}
              >
                <Text style={[styles.calMoon, { fontSize: 10 }]}>{getMoonEmoji(day)}</Text>
                <Text style={[styles.calDay, isToday && { color: colors.primary }]}>{day}</Text>
                <View style={[styles.calScoreDot, { backgroundColor: sc }]} />
                <Text style={styles.calTide}>{getTideIndicator(day)}</Text>
                <View style={styles.calIndicators}>
                  {hasCatch && <View style={[styles.calIndicator, { backgroundColor: colors.primary }]} />}
                  {hasTrip && <View style={[styles.calIndicator, { backgroundColor: colors.secondary }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected day details */}
        {selectedDay && dayData && (
          <View style={styles.dayDetail}>
            <Text style={styles.dayDetailTitle}>{selectedDay} {MONTHS[viewMonth]}</Text>
            <View style={styles.dayDetailRow}>
              <DayStatCard label="Moon" value={dayData.moon} />
              <DayStatCard label="Score" value={`${dayData.score}`} valueColor={scoreColor(dayData.score)} />
              <DayStatCard label="Tide" value={dayData.tide} />
            </View>
            {dayData.hasCatch && (
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>🎣 You caught fish on this day!</Text>
              </View>
            )}
            {dayData.hasTrip && (
              <View style={[styles.dayBadge, { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' }]}>
                <Text style={[styles.dayBadgeText, { color: colors.secondary }]}>📅 Trip planned for this day</Text>
              </View>
            )}
            <Text style={styles.solunarTitle}>Solunar Feeding Times</Text>
            {SOLUNAR_TIMES.map((st, i) => (
              <View key={i} style={styles.solunarRow}>
                <View style={[styles.solunarDot, { backgroundColor: st.quality === 'Excellent' ? colors.success : st.quality === 'Good' ? colors.warning : colors.textSecondary }]} />
                <Text style={styles.solunarLabel}>{st.label}</Text>
                <Text style={styles.solunarTime}>{st.time}</Text>
                <Text style={styles.solunarDuration}>{st.duration}</Text>
                <Text style={[styles.solunarQuality, { color: st.quality === 'Excellent' ? colors.success : st.quality === 'Good' ? colors.warning : colors.textSecondary }]}>{st.quality}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Closed seasons */}
        <View style={styles.closedSection}>
          <Text style={styles.closedTitle}>🚫 UK Closed Seasons (Current)</Text>
          <View style={styles.closedCard}>
            <Text style={styles.closedItem}>🐟 Coarse Fish (Rivers): 15 Mar – 15 Jun</Text>
            <Text style={styles.closedItem}>🐠 Salmon & Sea Trout: Oct – Mar (varies by river)</Text>
            <Text style={styles.closedItem}>🦞 Crayfish: No close season (invasive species)</Text>
            <Text style={styles.closedNote}>Always check local bylaws before fishing.</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DayStatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.dayStatCard}>
      <Text style={styles.dayStatLabel}>{label}</Text>
      <Text style={[styles.dayStatValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  navBtn: { padding: spacing.xs },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  legend: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textSecondary },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: spacing.md },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: colors.textSecondary, paddingVertical: 4 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md },
  calCell: { width: `${100/7}%`, aspectRatio: 0.7, padding: 2, alignItems: 'center', borderRadius: 6 },
  calCellSelected: { backgroundColor: 'rgba(0,212,170,0.15)', borderWidth: 1, borderColor: colors.primary },
  calCellToday: { backgroundColor: 'rgba(0,212,170,0.05)' },
  calCellBest: { borderWidth: 1, borderColor: colors.success + '44' },
  calMoon: { fontSize: 9 },
  calDay: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  calScoreDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 1 },
  calTide: { fontSize: 8, color: colors.textSecondary },
  calIndicators: { flexDirection: 'row', gap: 1, marginTop: 1 },
  calIndicator: { width: 4, height: 4, borderRadius: 2 },
  dayDetail: { marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  dayDetailTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  dayDetailRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  dayStatCard: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  dayStatLabel: { fontSize: 11, color: colors.textSecondary },
  dayStatValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  dayBadge: { backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  dayBadgeText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  solunarTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm },
  solunarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  solunarDot: { width: 8, height: 8, borderRadius: 4 },
  solunarLabel: { flex: 1, fontSize: 13, color: colors.textPrimary },
  solunarTime: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, width: 45 },
  solunarDuration: { fontSize: 12, color: colors.textSecondary, width: 30 },
  solunarQuality: { fontSize: 12, fontWeight: '600', width: 60, textAlign: 'right' },
  closedSection: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  closedTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  closedCard: { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  closedItem: { fontSize: 13, color: colors.textPrimary, marginBottom: spacing.xs },
  closedNote: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs, fontStyle: 'italic' },
});
