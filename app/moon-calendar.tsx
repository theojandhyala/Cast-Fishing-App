import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../constants/theme';

// Moon phase calculation (simplified)
function getMoonPhase(date: Date): { phase: number; name: string; emoji: string; illumination: number } {
  const knownNewMoon = new Date('2024-01-11');
  const lunarCycle = 29.53059;
  const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = Math.round(Math.abs(Math.cos((phase / lunarCycle) * 2 * Math.PI - Math.PI)) * 100);

  let name: string;
  let emoji: string;
  if (phase < 1.85) { name = 'New Moon'; emoji = '🌑'; }
  else if (phase < 7.38) { name = 'Waxing Crescent'; emoji = '🌒'; }
  else if (phase < 9.22) { name = 'First Quarter'; emoji = '🌓'; }
  else if (phase < 14.77) { name = 'Waxing Gibbous'; emoji = '🌔'; }
  else if (phase < 16.61) { name = 'Full Moon'; emoji = '🌕'; }
  else if (phase < 22.15) { name = 'Waning Gibbous'; emoji = '🌖'; }
  else if (phase < 23.99) { name = 'Last Quarter'; emoji = '🌗'; }
  else { name = 'Waning Crescent'; emoji = '🌘'; }

  return { phase, name, emoji, illumination };
}

function getSolnarScore(phase: number): number {
  // Best fishing near full/new moon
  const distFromFull = Math.abs(phase - 14.77);
  const distFromNew = Math.min(phase, 29.53059 - phase);
  const minDist = Math.min(distFromFull, distFromNew);
  // Score 1-10
  return Math.round(10 - minDist * 0.8);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const SPECIES_BY_PHASE: Record<string, { species: string[]; emoji: string }> = {
  'New Moon': { species: ['Carp', 'Tench', 'Bream'], emoji: '🌑' },
  'Waxing Crescent': { species: ['Perch', 'Roach', 'Rudd'], emoji: '🌒' },
  'First Quarter': { species: ['Pike', 'Perch', 'Zander'], emoji: '🌓' },
  'Waxing Gibbous': { species: ['Bass', 'Salmon', 'Trout'], emoji: '🌔' },
  'Full Moon': { species: ['Carp', 'Eel', 'Sea Bass', 'Bream'], emoji: '🌕' },
  'Waning Gibbous': { species: ['Carp', 'Tench', 'Catfish'], emoji: '🌖' },
  'Last Quarter': { species: ['Pike', 'Perch', 'Chub'], emoji: '🌗' },
  'Waning Crescent': { species: ['Barbel', 'Chub', 'Dace'], emoji: '🌘' },
};

const PHASE_LEGEND = [
  { emoji: '🌑', name: 'New Moon', tip: 'Great feeding window, 2 days either side.' },
  { emoji: '🌒', name: 'Waxing Crescent', tip: 'Building to first quarter — decent daytime fishing.' },
  { emoji: '🌓', name: 'First Quarter', tip: 'Moderate activity, dawn and dusk best.' },
  { emoji: '🌔', name: 'Waxing Gibbous', tip: 'Improving towards full moon — evenings productive.' },
  { emoji: '🌕', name: 'Full Moon', tip: 'Peak feeding — fish are active, especially at night.' },
  { emoji: '🌖', name: 'Waning Gibbous', tip: 'Still good — early mornings particularly productive.' },
  { emoji: '🌗', name: 'Last Quarter', tip: 'Moderate — predator fishing can be excellent.' },
  { emoji: '🌘', name: 'Waning Crescent', tip: 'Quieter period — still worth fishing first light.' },
];

function isBestDay(phase: number, lunarCycle = 29.53059): boolean {
  const distFromFull = Math.abs(phase - 14.77);
  const distFromNew = Math.min(phase, lunarCycle - phase);
  return distFromFull <= 2 || distFromNew <= 2;
}

export default function MoonCalendarScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  // Adjust to Monday-first
  const startOffset = (firstDay + 6) % 7;

  const selectedMoon = selectedDay
    ? getMoonPhase(new Date(year, month, selectedDay))
    : null;
  const selectedSolunar = selectedMoon ? getSolnarScore(selectedMoon.phase) : null;

  // Best days this month
  const bestDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => {
    const m = getMoonPhase(new Date(year, month, d));
    return isBestDay(m.phase);
  });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(167,139,250,0.15)', 'transparent']} style={styles.hero}>
          <Text style={styles.moonHero}>🌕</Text>
          <Text style={styles.heroTitle}>Moon Calendar</Text>
          <Text style={styles.heroSub}>Plan your sessions around lunar cycles</Text>
        </LinearGradient>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          {/* Day headers */}
          <View style={styles.weekRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>
          {/* Grid */}
          <View style={styles.grid}>
            {Array.from({ length: startOffset }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const d = new Date(year, month, day);
              const moon = getMoonPhase(d);
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
              const isSelected = selectedDay === day;
              const isBest = isBestDay(moon.phase);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                    isBest && !isSelected && styles.bestCell,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={styles.moonEmoji}>{moon.emoji}</Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected, isToday && styles.dayNumToday]}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day detail */}
        {selectedDay && selectedMoon && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedDay} {MONTH_NAMES[month]} {year}
            </Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailEmoji}>{selectedMoon.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.phaseName}>{selectedMoon.name}</Text>
                  <Text style={styles.illumination}>{selectedMoon.illumination}% illuminated</Text>
                </View>
                <View style={styles.solunarBadge}>
                  <Text style={styles.solunarScore}>{selectedSolunar}/10</Text>
                  <Text style={styles.solunarLabel}>Solunar</Text>
                </View>
              </View>
              <View style={styles.speciesActive}>
                <Text style={styles.speciesActiveTitle}>Most Active Species</Text>
                <View style={styles.speciesChips}>
                  {(SPECIES_BY_PHASE[selectedMoon.name]?.species || []).map(s => (
                    <View key={s} style={styles.speciesChip}>
                      <Text style={styles.speciesChipText}>🐟 {s}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.adviceRow}>
                <MaterialCommunityIcons name="lightbulb" size={16} color={colors.secondary} />
                <Text style={styles.adviceText}>
                  {isBestDay(selectedMoon.phase)
                    ? 'This is a prime fishing day! Target feeding fish near dawn and dusk.'
                    : 'Standard conditions. Fish will be active but not peak feeding.'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Best days this month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BEST DAYS THIS MONTH</Text>
          <View style={styles.bestDaysCard}>
            {bestDays.length === 0 ? (
              <Text style={styles.noBest}>No highlighted days — all dates are worth fishing!</Text>
            ) : (
              <View style={styles.bestDaysList}>
                {bestDays.map(d => {
                  const moon = getMoonPhase(new Date(year, month, d));
                  return (
                    <TouchableOpacity key={d} style={styles.bestDayRow} onPress={() => setSelectedDay(d)}>
                      <Text style={styles.bestDayEmoji}>{moon.emoji}</Text>
                      <Text style={styles.bestDayDate}>{d} {MONTH_NAMES[month]}</Text>
                      <Text style={styles.bestDayPhase}>{moon.name}</Text>
                      <View style={styles.bestBadge}>
                        <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                        <Text style={styles.bestBadgeText}>Prime</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Phase legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MOON PHASE GUIDE</Text>
          {PHASE_LEGEND.map(p => (
            <View key={p.name} style={styles.legendRow}>
              <Text style={styles.legendEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.legendName}>{p.name}</Text>
                <Text style={styles.legendTip}>{p.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  moonHero: { fontSize: 52 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm },
  heroSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  navBtn: { width: 40, height: 40, backgroundColor: colors.surface, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  monthTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  calendarCard: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  weekRow: { flexDirection: 'row', marginBottom: spacing.sm },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 0.9, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, padding: 2 },
  todayCell: { backgroundColor: 'rgba(0,212,170,0.1)', borderWidth: 1, borderColor: colors.primary },
  selectedCell: { backgroundColor: '#A78BFA', borderWidth: 1, borderColor: '#A78BFA' },
  bestCell: { backgroundColor: 'rgba(245,158,11,0.1)' },
  moonEmoji: { fontSize: 18 },
  dayNum: { fontSize: 10, color: colors.textSecondary, marginTop: 1 },
  dayNumSelected: { color: '#fff', fontWeight: '800' },
  dayNumToday: { color: colors.primary, fontWeight: '800' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.sm },
  detailCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailEmoji: { fontSize: 44 },
  phaseName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  illumination: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  solunarBadge: { alignItems: 'center', backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  solunarScore: { fontSize: 20, fontWeight: '900', color: '#A78BFA' },
  solunarLabel: { fontSize: 10, color: colors.textSecondary },
  speciesActive: { gap: spacing.sm },
  speciesActiveTitle: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  speciesChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  speciesChip: { backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  speciesChipText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  adviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: radius.md, padding: spacing.md },
  adviceText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  bestDaysCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  bestDaysList: { gap: 0 },
  bestDayRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  bestDayEmoji: { fontSize: 22 },
  bestDayDate: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  bestDayPhase: { fontSize: 12, color: colors.textSecondary },
  bestBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 3 },
  bestBadgeText: { fontSize: 11, color: colors.secondary, fontWeight: '700' },
  noBest: { padding: spacing.md, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  legendEmoji: { fontSize: 26, width: 36, textAlign: 'center' },
  legendName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  legendTip: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 2 },
});
