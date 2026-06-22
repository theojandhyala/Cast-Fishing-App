import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from '../store/locationStore';
import { useLocation } from '../hooks/useLocation';
import { useWeather } from '../hooks/useWeather';
import { useMarineConditions } from '../hooks/useMarineConditions';
import { colors, radius, spacing, typography, fonts } from '../constants/theme';

function formatMarineTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(-5) : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ConditionsScreen() {
  const router = useRouter();
  const { location } = useLocationStore();
  const { location: gpsLocation } = useLocation();
  const latitude = location?.latitude ?? gpsLocation?.latitude;
  const longitude = location?.longitude ?? gpsLocation?.longitude;
  const { weather, loading, refresh: refreshWeather, updatedAt } = useWeather(latitude, longitude);
  const { marine, loading: marineLoading, error: marineError, refresh: refreshMarine } = useMarineConditions(latitude, longitude);

  const w = weather || {
    temp: 18,
    wind: 12,
    windDirection: 315,
    feelsLike: 17,
    pressure: 1014,
    pressureTrend: 'rising' as const,
    moonPhase: 'Waxing Crescent',
    humidity: 72,
    fishingScore: 70,
    city: 'Rocky Point',
    description: 'Partly Cloudy',
  };
  const activityBars = useMemo(() => {
    const hourly = weather?.hourlyToday ?? [];
    return Array.from({ length: 8 }, (_, index) => hourly[index * 3]?.fishingScore ?? w.fishingScore);
  }, [weather?.hourlyToday, w.fishingScore]);
  const tideBars = useMemo(() => {
    const series = marine?.tideSeries ?? [];
    if (!series.length) return [];
    const sampled = Array.from({ length: 8 }, (_, index) => series[Math.min(series.length - 1, index * 3)]?.heightM ?? 0);
    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    return sampled.map((height) => max === min ? 50 : 12 + ((height - min) / (max - min)) * 88);
  }, [marine?.tideSeries]);
  const feedingWindows = weather?.solunarTimes ?? [];
  const forecast = weather?.forecast7day ?? [];
  const refreshAll = () => { refreshWeather(); refreshMarine(); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerLocation}>
          <MaterialCommunityIcons name="map-marker" size={15} color={colors.primary} />
          <Text style={styles.headerLocationText}>{location?.name || (gpsLocation ? 'Current location' : w.city)}</Text>
        </View>
        <TouchableOpacity hitSlop={10} onPress={refreshAll} disabled={loading || marineLoading} accessibilityRole="button" accessibilityLabel="Refresh live fishing conditions">
          <MaterialCommunityIcons name={loading || marineLoading ? 'progress-clock' : 'refresh'} size={22} color={colors.textSecondary} />
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
            <MaterialCommunityIcons name={(weather?.icon || 'weather-partly-cloudy') as any} size={48} color={colors.secondary} />
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Wind</Text>
              <Text style={styles.heroStatValue}>{w.wind} km/h</Text>
              <Text style={styles.heroStatSub}>{Math.round(w.windDirection)}°</Text>
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
            <Text style={styles.tideValue}>{marine?.seaLevelM?.toFixed(2) ?? '—'}<Text style={styles.tideUnit}>m</Text></Text>
            <View>
              <Text style={styles.tideTrend}>{marine?.tideTrend ? marine.tideTrend[0].toUpperCase() + marine.tideTrend.slice(1) : 'Loading'}</Text>
              <Text style={styles.tideSub}>High {formatMarineTime(marine?.nextHigh?.time)} · Low {formatMarineTime(marine?.nextLow?.time)}</Text>
            </View>
          </View>
          <View style={styles.curveWrap}>
            {(tideBars.length ? tideBars : [8, 8, 8, 8, 8, 8, 8, 8]).map((height, i) => <View key={i} style={[styles.curveBar, { height: `${height}%`, opacity: tideBars.length ? 1 : 0.25 }]} />)}
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
          <Text style={styles.solunarValue}>{Math.round(w.fishingScore)}<Text style={styles.tideUnit}>%</Text></Text>
          <Text style={styles.solunarSub}>{w.fishingScore >= 75 ? 'High' : w.fishingScore >= 50 ? 'Moderate' : 'Low'} Activity · changes through the day</Text>
          <View style={styles.barsWrap}>
            {activityBars.map((h, i) => (
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
          {feedingWindows.map((win) => (
            <View key={`${win.type}-${win.start}`} style={[styles.windowCard, win.type === 'major' && styles.windowCardMajor]}>
              <View style={[styles.windowDot, { backgroundColor: win.type === 'major' ? colors.primary : colors.secondary }]} />
              <View style={styles.windowInfo}>
                <Text style={styles.windowTime}>{win.start}–{win.end}</Text>
                <Text style={styles.windowLabel}>{win.type === 'major' ? 'Major Feeding' : 'Minor Feeding'}</Text>
              </View>
              <View style={styles.windowRight}>
                <Text style={styles.windowDuration}>{win.rating}/5</Text>
                <View style={[styles.windowBadge, win.type === 'major' && styles.windowBadgeMajor]}>
                  <Text style={[styles.windowBadgeText, win.type === 'major' && { color: colors.primary }]}>
                    {win.type.toUpperCase()}
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
              {forecast.map((day) => {
                const scoreColor = day.fishingScore >= 70 ? colors.primary : day.fishingScore >= 50 ? colors.secondary : colors.danger;
                return (
                  <View key={day.date} style={styles.forecastCard}>
                    <Text style={styles.forecastDay}>{day.dayName}</Text>
                    <MaterialCommunityIcons name={day.icon as any} size={22} color={colors.textSecondary} />
                    <Text style={styles.forecastHigh}>{day.high}°</Text>
                    <Text style={styles.forecastLow}>{day.low}°</Text>
                    <View style={[styles.forecastScore, { backgroundColor: scoreColor + '22' }]}>
                      <Text style={[styles.forecastScoreText, { color: scoreColor }]}>{day.fishingScore}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <Text style={styles.liveNote}>
          {marineError ? `${marineError}. Weather remains live.` : `Live weather and marine forecast · updated ${updatedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? 'now'}`}
        </Text>

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
  liveNote: { color: colors.textTertiary, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: spacing.sm },
});
