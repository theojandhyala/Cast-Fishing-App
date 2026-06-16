import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from '../store/locationStore';
import { useWeather } from '../hooks/useWeather';
import { colors, radius, spacing, typography, fonts } from '../constants/theme';

const SOLUNAR_WINDOWS = [
  { time: '05:30', duration: '1h 40m', quality: 'major', label: 'Major Feeding' },
  { time: '11:45', duration: '45m', quality: 'minor', label: 'Minor Feeding' },
  { time: '18:00', duration: '1h 50m', quality: 'major', label: 'Major Feeding' },
  { time: '23:15', duration: '40m', quality: 'minor', label: 'Minor Feeding' },
];

const FORECAST = [
  { day: 'Today', icon: 'weather-partly-cloudy', high: 14, low: 8, score: 7 },
  { day: 'Tomorrow', icon: 'weather-rainy', high: 12, low: 7, score: 5 },
  { day: 'Wed', icon: 'weather-pouring', high: 11, low: 6, score: 4 },
  { day: 'Thu', icon: 'weather-sunny', high: 15, low: 9, score: 8 },
  { day: 'Fri', icon: 'weather-sunny', high: 17, low: 10, score: 9 },
  { day: 'Sat', icon: 'weather-sunny', high: 16, low: 9, score: 8 },
  { day: 'Sun', icon: 'weather-partly-cloudy', high: 14, low: 8, score: 6 },
];

const TIDE_CURVE = [0.4, 0.55, 0.75, 0.95, 1.0, 0.85, 0.6, 0.4];
const SOLUNAR_BARS = [25, 40, 55, 70, 85, 100, 90, 65];

export default function ConditionsScreen() {
  const router = useRouter();
  const { location } = useLocationStore();
  const { weather } = useWeather(location?.query);

  const w = weather || {
    temp: 18,
    wind: 12,
    windDirection: 315,
    feelsLike: 17,
    pressure: 1014,
    pressureTrend: 'rising' as const,
    moonPhase: 'Waxing Crescent',
    humidity: 72,
    fishingScore: 7,
    city: 'Rocky Point',
    description: 'Partly Cloudy',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerLocation}>
          <MaterialCommunityIcons name="map-marker" size={15} color={colors.primary} />
          <Text style={styles.headerLocationText}>{location?.name || w.city}</Text>
        </View>
        <TouchableOpacity hitSlop={10}>
          <MaterialCommunityIcons name="bookmark-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Current conditions hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroTemp}>{Math.round(w.temp)}<Text style={styles.heroTempUnit}>°C</Text></Text>
              <Text style={styles.heroDesc}>{w.description}</Text>
            </View>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={48} color={colors.secondary} />
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Wind</Text>
              <Text style={styles.heroStatValue}>{w.wind} km/h</Text>
              <Text style={styles.heroStatSub}>NW</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Feels Like</Text>
              <Text style={styles.heroStatValue}>{w.feelsLike ?? w.temp - 1}°C</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Pressure</Text>
              <Text style={styles.heroStatValue}>{w.pressure} hPa</Text>
            </View>
          </View>
        </View>

        {/* Tide */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tide</Text>
          <View style={styles.tideRow}>
            <Text style={styles.tideValue}>1.2<Text style={styles.tideUnit}>m</Text></Text>
            <View>
              <Text style={styles.tideTrend}>Rising</Text>
              <Text style={styles.tideSub}>High 18:42</Text>
            </View>
          </View>
          <View style={styles.curveWrap}>
            {TIDE_CURVE.map((v, i) => (
              <View key={i} style={[styles.curveBar, { height: `${v * 100}%` }]} />
            ))}
          </View>
          <View style={styles.curveLabels}>
            <Text style={styles.curveLabel}>00:00</Text>
            <Text style={styles.curveLabel}>06:00</Text>
            <Text style={styles.curveLabel}>12:00</Text>
            <Text style={styles.curveLabel}>18:00</Text>
            <Text style={styles.curveLabel}>24:00</Text>
          </View>
        </View>

        {/* Solunar */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Solunar Activity</Text>
          <Text style={styles.solunarValue}>{Math.round(w.fishingScore * 10) >= 70 ? Math.round(w.fishingScore * 10) : 85}<Text style={styles.tideUnit}>%</Text></Text>
          <Text style={styles.solunarSub}>High Activity</Text>
          <View style={styles.barsWrap}>
            {SOLUNAR_BARS.map((h, i) => (
              <View key={i} style={[styles.bar, { height: `${h}%` }]} />
            ))}
          </View>
          <View style={styles.curveLabels}>
            <Text style={styles.curveLabel}>00:00</Text>
            <Text style={styles.curveLabel}>06:00</Text>
            <Text style={styles.curveLabel}>12:00</Text>
            <Text style={styles.curveLabel}>18:00</Text>
            <Text style={styles.curveLabel}>24:00</Text>
          </View>
        </View>

        {/* Solunar feeding windows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feeding Windows</Text>
          {SOLUNAR_WINDOWS.map((win) => (
            <View key={win.time} style={[styles.windowCard, win.quality === 'major' && styles.windowCardMajor]}>
              <View style={[styles.windowDot, { backgroundColor: win.quality === 'major' ? colors.primary : colors.secondary }]} />
              <View style={styles.windowInfo}>
                <Text style={styles.windowTime}>{win.time}</Text>
                <Text style={styles.windowLabel}>{win.label}</Text>
              </View>
              <View style={styles.windowRight}>
                <Text style={styles.windowDuration}>{win.duration}</Text>
                <View style={[styles.windowBadge, win.quality === 'major' && styles.windowBadgeMajor]}>
                  <Text style={[styles.windowBadgeText, win.quality === 'major' && { color: colors.primary }]}>
                    {win.quality.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 7-day forecast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.forecastRow}>
              {FORECAST.map((day) => {
                const scoreColor = day.score >= 7 ? colors.primary : day.score >= 5 ? colors.secondary : colors.danger;
                return (
                  <View key={day.day} style={styles.forecastCard}>
                    <Text style={styles.forecastDay}>{day.day}</Text>
                    <MaterialCommunityIcons name={day.icon as any} size={22} color={colors.textSecondary} />
                    <Text style={styles.forecastHigh}>{day.high}°</Text>
                    <Text style={styles.forecastLow}>{day.low}°</Text>
                    <View style={[styles.forecastScore, { backgroundColor: scoreColor + '22' }]}>
                      <Text style={[styles.forecastScoreText, { color: scoreColor }]}>{day.score}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerLocation: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerLocationText: { ...typography.label, fontSize: 15 },
  content: { padding: spacing.lg, paddingTop: spacing.sm },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  heroTemp: { ...typography.monoLarge, fontSize: 40 },
  heroTempUnit: { fontSize: 18, color: colors.textSecondary, fontFamily: fonts.mono },
  heroDesc: { ...typography.bodySmall, marginTop: 2 },
  heroStatsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  heroStat: { flex: 1, gap: 3 },
  heroStatLabel: { ...typography.caption, fontSize: 10 },
  heroStatValue: { ...typography.label, fontSize: 14 },
  heroStatSub: { ...typography.caption, fontSize: 10, textTransform: 'none', color: colors.textTertiary },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: { ...typography.caption, marginBottom: spacing.sm },
  tideRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  tideValue: { ...typography.monoLarge, fontSize: 32 },
  tideUnit: { fontSize: 15, color: colors.textSecondary, fontFamily: fonts.mono },
  tideTrend: { ...typography.label, color: colors.primary, textAlign: 'right' },
  tideSub: { ...typography.caption, fontSize: 10, textTransform: 'none', textAlign: 'right', marginTop: 2 },
  curveWrap: { flexDirection: 'row', alignItems: 'flex-end', height: 56, gap: 4 },
  curveBar: { flex: 1, backgroundColor: 'rgba(0,212,170,0.35)', borderRadius: radius.xs, minHeight: 4 },
  curveLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  curveLabel: { fontSize: 9, color: colors.textTertiary, fontFamily: fonts.mono },

  solunarValue: { ...typography.monoLarge, fontSize: 32 },
  solunarSub: { ...typography.bodySmall, marginBottom: spacing.md },
  barsWrap: { flexDirection: 'row', alignItems: 'flex-end', height: 48, gap: 5 },
  bar: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.xs, minHeight: 4 },

  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.caption, marginBottom: spacing.sm },
  windowCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  windowCardMajor: { borderColor: 'rgba(0,212,170,0.3)', backgroundColor: 'rgba(0,212,170,0.06)' },
  windowDot: { width: 8, height: 8, borderRadius: 4 },
  windowInfo: { flex: 1 },
  windowTime: { ...typography.mono, fontSize: 15 },
  windowLabel: { ...typography.caption, fontSize: 10, textTransform: 'none', marginTop: 2 },
  windowRight: { alignItems: 'flex-end', gap: 4 },
  windowDuration: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.mono },
  windowBadge: { backgroundColor: colors.surface2, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  windowBadgeMajor: { backgroundColor: 'rgba(0,212,170,0.15)' },
  windowBadgeText: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 },

  forecastRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.sm },
  forecastCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', width: 72, borderWidth: 1, borderColor: colors.border, gap: 5,
  },
  forecastDay: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  forecastHigh: { ...typography.mono, fontSize: 14 },
  forecastLow: { fontSize: 12, color: colors.textTertiary, fontFamily: fonts.mono },
  forecastScore: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  forecastScoreText: { fontSize: 11, fontWeight: '800' },
});
