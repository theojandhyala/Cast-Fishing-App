import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useLocationStore } from '../store/locationStore';
import { useWeather } from '../hooks/useWeather';
import { colors, spacing, radius } from '../constants/theme';

const MOON_PHASES = [
  'moon-new', 'moon-waxing-crescent', 'moon-first-quarter', 'moon-waxing-gibbous',
  'moon-full', 'moon-waning-gibbous', 'moon-last-quarter', 'moon-waning-crescent',
];

const FORECAST_7DAY = [
  { day: 'Today', icon: 'weather-partly-cloudy', high: 14, low: 9, wind: 12, windDir: 'SW', pressure: 1016, fishScore: 72, description: 'Partly Cloudy' },
  { day: 'Tuesday', icon: 'weather-pouring', high: 11, low: 7, wind: 22, windDir: 'W', pressure: 1008, fishScore: 41, description: 'Heavy Rain' },
  { day: 'Wednesday', icon: 'weather-sunny', high: 17, low: 10, wind: 8, windDir: 'S', pressure: 1024, fishScore: 91, description: 'Sunny' },
  { day: 'Thursday', icon: 'weather-partly-cloudy', high: 15, low: 9, wind: 10, windDir: 'SW', pressure: 1020, fishScore: 78, description: 'Partly Cloudy' },
  { day: 'Friday', icon: 'weather-windy', high: 13, low: 7, wind: 28, windDir: 'NW', pressure: 1012, fishScore: 55, description: 'Windy' },
  { day: 'Saturday', icon: 'weather-sunny', high: 18, low: 11, wind: 7, windDir: 'SE', pressure: 1022, fishScore: 88, description: 'Sunny' },
  { day: 'Sunday', icon: 'weather-partly-cloudy', high: 16, low: 10, wind: 11, windDir: 'S', pressure: 1019, fishScore: 81, description: 'Partly Cloudy' },
];

const PRESSURE_TREND = [1010, 1012, 1014, 1013, 1015, 1016, 1017, 1016, 1018, 1019, 1018, 1016];

const SOLUNAR = [
  { time: '06:42', label: 'Major Feed', duration: '2h', quality: 'Excellent' },
  { time: '12:14', label: 'Minor Feed', duration: '1h', quality: 'Good' },
  { time: '19:08', label: 'Major Feed', duration: '2h', quality: 'Excellent' },
  { time: '00:32', label: 'Minor Feed', duration: '1h', quality: 'Fair' },
];

function scoreColor(score: number) {
  if (score >= 75) return colors.success;
  if (score >= 50) return colors.warning;
  return colors.danger;
}

const now = new Date();
const currentHour = now.getHours();

export default function WeatherDetailScreen() {
  const router = useRouter();
  const { location } = useLocationStore();
  const { weather } = useWeather(location?.query);
  const [selectedDay, setSelectedDay] = useState(0);

  const bestDayIndex = FORECAST_7DAY.reduce((bestIdx, d, i) => d.fishScore > FORECAST_7DAY[bestIdx].fishScore ? i : bestIdx, 0);

  const pressureMin = Math.min(...PRESSURE_TREND);
  const pressureMax = Math.max(...PRESSURE_TREND);
  const pressureRange = pressureMax - pressureMin;

  const currentPressure = weather?.pressure || 1016;
  const pressureTrend = weather?.pressureTrend || 'steady';

  const current = FORECAST_7DAY[selectedDay];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(96,165,250,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather & Conditions</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pressure trend */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <MaterialCommunityIcons name="gauge" size={20} color="#60A5FA" />
            <Text style={styles.pressureTitle}>Barometric Pressure</Text>
            <Text style={styles.pressureValue}>{currentPressure} hPa</Text>
          </View>
          <View style={styles.pressureGraph}>
            {PRESSURE_TREND.map((p, i) => {
              const h = pressureRange > 0 ? ((p - pressureMin) / pressureRange) * 40 + 5 : 20;
              const isNow = i === currentHour % 12;
              return (
                <View key={i} style={styles.pressureBarCol}>
                  <View style={[styles.pressureBar, { height: h, backgroundColor: isNow ? '#60A5FA' : colors.surface2 }]} />
                  {i % 4 === 0 && <Text style={styles.pressureHour}>{i * 2}:00</Text>}
                </View>
              );
            })}
          </View>
          <View style={styles.pressureTrendRow}>
            <MaterialCommunityIcons
              name={pressureTrend === 'rising' ? 'trending-up' : pressureTrend === 'falling' ? 'trending-down' : 'arrow-right'}
              size={16}
              color={colors.textPrimary}
            />
            <Text style={styles.pressureTrendText}>
              {pressureTrend === 'rising' ? 'Pressure rising — excellent fishing conditions ahead!' :
               pressureTrend === 'falling' ? 'Pressure falling — fish may feed aggressively before the change.' :
               'Pressure stable — consistent conditions, moderate activity expected.'}
            </Text>
          </View>
        </View>

        {/* 7-day forecast */}
        <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>7-Day Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
          {FORECAST_7DAY.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayCard, selectedDay === i && styles.dayCardActive, i === bestDayIndex && styles.dayCardBest]}
              onPress={() => setSelectedDay(i)}
            >
              {i === bestDayIndex && <Text style={styles.bestBadge}>Best</Text>}
              <Text style={styles.dayName}>{f.day}</Text>
              <MaterialCommunityIcons name={f.icon as any} size={24} color={colors.textPrimary} style={styles.dayIcon} />
              <Text style={styles.dayTemp}>{f.high}°</Text>
              <View style={[styles.scoreChip, { backgroundColor: scoreColor(f.fishScore) + '22' }]}>
                <Text style={[styles.scoreText, { color: scoreColor(f.fishScore) }]}>{f.fishScore}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected day detail */}
        <View style={styles.dayDetail}>
          <Text style={styles.dayDetailName}>{current.day} — {current.description}</Text>
          <View style={styles.dayDetailGrid}>
            <DetailStat icon="thermometer" label="High" value={`${current.high}°C`} />
            <DetailStat icon="thermometer-low" label="Low" value={`${current.low}°C`} />
            <DetailStat icon="weather-windy" label="Wind" value={`${current.wind}km/h ${current.windDir}`} />
            <DetailStat icon="gauge" label="Pressure" value={`${current.pressure} hPa`} />
          </View>
          <View style={styles.fishScoreRow}>
            <Text style={styles.fishScoreLabel}>Fishing Score</Text>
            <Text style={[styles.fishScoreValue, { color: scoreColor(current.fishScore) }]}>{current.fishScore}/100</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${current.fishScore}%`, backgroundColor: scoreColor(current.fishScore) }]} />
          </View>
        </View>

        {/* Wind compass */}
        <View style={styles.compassSection}>
          <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>Wind Direction</Text>
          <View style={styles.compassCard}>
            <View style={styles.compass}>
              {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((dir, i) => {
                const angle = i * 45;
                const rad = (angle - 90) * Math.PI / 180;
                const x = 50 + 38 * Math.cos(rad);
                const y = 50 + 38 * Math.sin(rad);
                return (
                  <Text key={dir} style={[styles.compassDir, { position: 'absolute', left: `${x}%`, top: `${y}%`, transform: [{ translateX: -8 }, { translateY: -8 }], color: dir === current.windDir ? colors.primary : colors.textSecondary, fontWeight: dir === current.windDir ? '800' : '400' }]}>
                    {dir}
                  </Text>
                );
              })}
              <View style={styles.compassCenter}>
                <Text style={styles.compassWindDir}>{current.windDir}</Text>
                <Text style={styles.compassWindSpeed}>{current.wind}km/h</Text>
              </View>
            </View>
            <View style={styles.compassInfo}>
              <View style={styles.compassTipRow}>
                <MaterialCommunityIcons
                  name="circle"
                  size={10}
                  color={
                    current.windDir === 'SW' || current.windDir === 'S' ? colors.success :
                    current.windDir === 'NE' || current.windDir === 'N' ? colors.danger :
                    colors.warning
                  }
                />
                <Text style={styles.compassTip}>
                  {current.windDir === 'SW' || current.windDir === 'S' ?
                    'SW/S winds bring warm air — excellent fishing conditions' :
                    current.windDir === 'NE' || current.windDir === 'N' ?
                    'N/NE winds bring cold air — fish will be less active' :
                    'Moderate conditions — fish may be somewhat active'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Solunar times */}
        <View style={styles.solunarSection}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="weather-night" size={18} color={colors.textPrimary} />
            <Text style={styles.sectionTitle}>Solunar Feeding Times</Text>
          </View>
          {SOLUNAR.map((s, i) => (
            <View key={i} style={styles.solunarRow}>
              <View style={[styles.solunarDot, { backgroundColor: s.quality === 'Excellent' ? colors.success : s.quality === 'Good' ? colors.warning : colors.textSecondary }]} />
              <Text style={styles.solunarTime}>{s.time}</Text>
              <Text style={styles.solunarLabel}>{s.label}</Text>
              <Text style={styles.solunarDuration}>{s.duration}</Text>
              <Text style={[styles.solunarQuality, { color: s.quality === 'Excellent' ? colors.success : s.quality === 'Good' ? colors.warning : colors.textSecondary }]}>{s.quality}</Text>
            </View>
          ))}
        </View>

        {/* Moon phases */}
        <View style={styles.moonSection}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="moon-full" size={18} color={colors.textPrimary} />
            <Text style={styles.sectionTitle}>Moon Phase Calendar</Text>
          </View>
          <View style={styles.moonGrid}>
            {Array.from({ length: 30 }, (_, i) => {
              const phase = Math.floor(i / 3.75) % 8;
              return (
                <View key={i} style={styles.moonDay}>
                  <MaterialCommunityIcons name={MOON_PHASES[phase] as any} size={16} color={colors.textPrimary} />
                  <Text style={styles.moonDayNum}>{i + 1}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailStat}>
      <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
      <Text style={styles.detailStatLabel}>{label}</Text>
      <Text style={styles.detailStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg },
  sectionTitlePadded: { paddingHorizontal: spacing.lg },
  pressureCard: { backgroundColor: colors.surface, borderRadius: radius.xl, margin: spacing.lg, marginTop: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  pressureHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  pressureTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  pressureValue: { fontSize: 15, fontWeight: '700', color: '#60A5FA' },
  pressureGraph: { flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 3, marginBottom: spacing.sm },
  pressureBarCol: { flex: 1, alignItems: 'center' },
  pressureBar: { width: '100%', borderRadius: 2, minHeight: 5 },
  pressureHour: { fontSize: 8, color: colors.textSecondary, marginTop: 2 },
  pressureTrendRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  pressureTrendText: { flex: 1, fontSize: 13, color: colors.textPrimary, fontStyle: 'italic', lineHeight: 18 },
  forecastScroll: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  dayCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.sm, marginRight: spacing.sm, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: colors.border },
  dayCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.1)' },
  dayCardBest: { borderColor: colors.success + '66' },
  bestBadge: { backgroundColor: colors.success, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 1, fontSize: 9, color: '#0A0E1A', fontWeight: '800', marginBottom: 2 },
  dayName: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  dayIcon: { marginBottom: 2 },
  dayTemp: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  scoreChip: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  dayDetail: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  dayDetailName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  dayDetailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  detailStat: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', minWidth: '45%', flex: 1 },
  detailStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  detailStatValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  fishScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fishScoreLabel: { fontSize: 13, color: colors.textSecondary },
  fishScoreValue: { fontSize: 20, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: colors.surface2, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  compassSection: { paddingHorizontal: spacing.lg },
  compassCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  compass: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.surface2, alignSelf: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  compassDir: { position: 'absolute', fontSize: 11 },
  compassCenter: { position: 'absolute', top: '35%', left: 0, right: 0, alignItems: 'center' },
  compassWindDir: { fontSize: 18, fontWeight: '800', color: colors.primary },
  compassWindSpeed: { fontSize: 12, color: colors.textSecondary },
  compassInfo: { alignItems: 'center' },
  compassTipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  compassTip: { fontSize: 13, color: colors.textPrimary, textAlign: 'center', lineHeight: 18 },
  solunarSection: { paddingHorizontal: spacing.lg },
  solunarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border },
  solunarDot: { width: 8, height: 8, borderRadius: 4 },
  solunarTime: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, width: 50 },
  solunarLabel: { flex: 1, fontSize: 13, color: colors.textPrimary },
  solunarDuration: { fontSize: 12, color: colors.textSecondary, width: 30 },
  solunarQuality: { fontSize: 12, fontWeight: '600', width: 65, textAlign: 'right' },
  moonSection: { paddingHorizontal: spacing.lg },
  moonGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  moonDay: { width: '10%', alignItems: 'center', paddingVertical: 4 },
  moonDayNum: { fontSize: 9, color: colors.textSecondary },
});
