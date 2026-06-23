import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useSessionStore } from '../../store/sessionStore';
import { useSolunar } from '../../hooks/useSolunar';
import { colors, spacing, radius } from '../../constants/theme';

function getConditionsLabel(score: number) {
  if (score >= 80) return 'Excellent Conditions';
  if (score >= 60) return 'Good Conditions';
  if (score >= 40) return 'Fair Conditions';
  return 'Tough Conditions';
}

function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function getSunTimes(lat: number, lng: number, date = new Date()) {
  const J = date.getTime() / 86400000 + 2440587.5;
  const n = Math.ceil(J - 2451545 + 0.0008);
  const Jstar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C = 1.9148 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180);
  const lam = (M + C + 180 + 102.9372) % 360;
  const Jtransit =
    2451545 +
    Jstar +
    0.0053 * Math.sin((M * Math.PI) / 180) -
    0.0069 * Math.sin((2 * lam * Math.PI) / 180);
  const d =
    (Math.asin(Math.sin((lam * Math.PI) / 180) * Math.sin((23.45 * Math.PI) / 180)) * 180) /
    Math.PI;
  const latR = (lat * Math.PI) / 180;
  const h0 = (-0.8333 * Math.PI) / 180;
  const cosOmega =
    (Math.sin(h0) - Math.sin(latR) * Math.sin((d * Math.PI) / 180)) /
    (Math.cos(latR) * Math.cos((d * Math.PI) / 180));
  if (Math.abs(cosOmega) > 1) return null;
  const omega = (Math.acos(cosOmega) * 180) / Math.PI;
  const Jrise = Jtransit - omega / 360;
  const Jset = Jtransit + omega / 360;
  const offsetMin = -date.getTimezoneOffset();
  const toTime = (Jd: number) => {
    const totalMin = Math.round(((Jd - 2440587.5) * 1440) % 1440);
    const localMin = ((totalMin + offsetMin) % 1440 + 1440) % 1440;
    const h = Math.floor(localMin / 60);
    const m = localMin % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  return { sunrise: toTime(Jrise), sunset: toTime(Jset) };
}

function ScoreRing({ score }: { score: number }) {
  const SIZE = 110;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 44;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * R;
  const filled = (score / 100) * circumference;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          stroke={colors.surface2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </Svg>
      <MaterialCommunityIcons name="fish" size={28} color={colors.primary} />
    </View>
  );
}

const ACTION_CARDS = [
  { icon: 'play-circle-outline', title: 'Start Session', route: '/(tabs)/session' },
  { icon: 'camera-outline', title: 'Scan Fish', route: '/identifier' },
  { icon: 'notebook-outline', title: 'Log Catch', route: '/identifier' },
  { icon: 'map-marker-outline', title: 'Explore Spots', route: '/(tabs)/map' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const catches = useCatchStore((s) => s.catches);
  const router = useRouter();
  const { location: gpsLocation } = useLocation();
  const activeSession = useSessionStore((s) => s.activeSession);

  const { weather } = useWeather(
    gpsLocation?.latitude,
    gpsLocation?.longitude,
  );

  const score = weather?.fishingScore ?? 0;
  const moonPhase = weather?.moonPhase ?? 'Waxing Crescent';
  const solunar = useSolunar(gpsLocation?.latitude, gpsLocation?.longitude);

  const windDir = weather?.windDirection != null
    ? degreesToCompass(weather.windDirection)
    : 'NE';

  const sunTimes = useMemo(() => {
    if (gpsLocation) {
      return getSunTimes(gpsLocation.latitude, gpsLocation.longitude);
    }
    return null;
  }, [gpsLocation?.latitude, gpsLocation?.longitude]);

  const stats = useMemo(() => {
    const speciesSet = new Set(catches.map((c) => c.species));
    let streak = 0;
    const days = new Set(catches.map((c) => new Date(c.date).toDateString()));
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) streak++;
      else break;
    }
    return {
      total: catches.length,
      species: speciesSet.size,
      streak,
    };
  }, [catches]);

  const nextWindowStr = useMemo(() => {
    if (!solunar?.nextWindow) return null;
    const min = solunar.nextWindow.minutesUntil;
    if (min <= 0) return solunar.nextWindow.time;
    if (min < 60) return `in ${min}m`;
    return `in ${Math.floor(min / 60)}h ${min % 60}m`;
  }, [solunar]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerIconBtn}
            onPress={() => {}}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Home</Text>
          <TouchableOpacity
            style={s.headerIconBtn}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Location chip */}
        <View style={s.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.textTertiary} />
          <Text style={s.locationText}>
            {gpsLocation ? 'Your Location' : 'Gold Coast, QLD'}
          </Text>
        </View>

        {/* Score Card */}
        <View style={s.scoreCard}>
          <Text style={s.scoreCardLabel}>FISHING SCORE</Text>
          <View style={s.scoreNumRow}>
            <Text style={s.scoreNum}>{score}</Text>
            <Text style={s.scoreDenom}>/100</Text>
          </View>
          <Text style={s.scoreConditions}>{getConditionsLabel(score)}</Text>
          <View style={s.scoreBarTrack}>
            <View style={[s.scoreBarFill, { width: `${score}%` as any }]} />
          </View>
          {nextWindowStr ? (
            <View style={s.primeInline}>
              <MaterialCommunityIcons name="clock-outline" size={11} color={colors.textTertiary} />
              <Text style={s.primeInlineText}>Next prime {nextWindowStr}</Text>
            </View>
          ) : null}
        </View>

        {/* Sunrise / Sunset arc */}
        <View style={s.sunRow}>
          <View style={s.sunSide}>
            <MaterialCommunityIcons name="weather-sunset-up" size={16} color={colors.accent} />
            <Text style={s.sunTime}>{sunTimes?.sunrise ?? '5:42 AM'}</Text>
            <Text style={s.sunLabel}>Sunrise</Text>
          </View>
          <View style={s.sunArcWrap}>
            <Svg width={100} height={40}>
              <Path
                d="M 5 35 Q 50 5 95 35"
                stroke={colors.accent}
                strokeWidth={2}
                fill="none"
                strokeDasharray="4 3"
              />
              <Circle cx={50} cy={12} r={5} fill={colors.accent} />
            </Svg>
          </View>
          <View style={s.sunSide}>
            <MaterialCommunityIcons name="weather-sunset-down" size={16} color={colors.accent} />
            <Text style={s.sunTime}>{sunTimes?.sunset ?? '6:27 PM'}</Text>
            <Text style={s.sunLabel}>Sunset</Text>
          </View>
        </View>

        {/* Weather chips */}
        <View style={s.weatherStrip}>
          {[
            {
              icon: 'weather-windy',
              value: weather ? `${weather.wind} km/h` : '12 km/h',
              sub: windDir,
            },
            {
              icon: 'thermometer',
              value: weather ? `${weather.temp}°C` : '23°C',
              sub: 'Temp',
            },
            {
              icon: 'gauge',
              value: weather ? `${weather.pressure} hPa` : '1016 hPa',
              sub: 'Steady',
            },
            {
              icon: 'moon-waxing-crescent',
              value: moonPhase,
              sub: 'Moon',
            },
          ].map((chip, i) => (
            <View key={i} style={s.weatherChip}>
              <MaterialCommunityIcons name={chip.icon as any} size={18} color={colors.textSecondary} />
              <Text style={s.weatherChipValue} numberOfLines={1}>{chip.value}</Text>
              <Text style={s.weatherChipSub} numberOfLines={1}>{chip.sub}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionHeader}>QUICK ACTIONS</Text>
          <View style={s.actionsList}>
            {ACTION_CARDS.map((card, i) => (
              <TouchableOpacity
                key={card.title}
                style={[s.actionRow, i < ACTION_CARDS.length - 1 && s.actionRowBorder]}
                onPress={() => router.push(card.route as any)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name={card.icon as any} size={20} color={colors.textSecondary} />
                <Text style={s.actionRowTitle}>{card.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Your Stats */}
        <View style={s.section}>
          <View style={s.statsHeaderRow}>
            <Text style={s.sectionHeader}>YOUR STATS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} activeOpacity={0.75}>
              <Text style={s.viewAll}>View all &rsaquo;</Text>
            </TouchableOpacity>
          </View>
          <View style={s.statsRow}>
            {[
              { value: String(stats.total), label: 'Total Catches' },
              { value: String(stats.species), label: 'Species' },
              { value: '142', label: 'Hours Fished' },
              { value: String(stats.streak), label: 'Day Streak' },
            ].map((item) => (
              <View key={item.label} style={s.statItem}>
                <Text style={s.statValue}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  locationText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },

  // Score card
  scoreCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  scoreCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 2,
    marginBottom: 10,
  },
  scoreCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
  },
  scoreLeft: { gap: 2 },
  scoreNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  scoreNum: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 60,
    letterSpacing: -2,
  },
  scoreDenom: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  scoreConditions: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 2,
  },
  scoreBarWrap: {
    flex: 1,
    gap: 6,
    paddingBottom: 4,
  },
  scoreBarTrack: {
    height: 3,
    backgroundColor: colors.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  primeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primeInlineText: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500',
  },

  // Sun row
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: 8,
  },
  sunSide: { alignItems: 'center', gap: 2 },
  sunTime: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  sunLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },
  sunArcWrap: { flex: 1, alignItems: 'center' },

  // Weather chips
  weatherStrip: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 8,
  },
  weatherChip: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 10,
  },
  weatherChipValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  weatherChipSub: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 2,
    marginBottom: 10,
  },

  // Quick Actions
  actionsList: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 12,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionRowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Stats
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
