import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function getActivityLabel(score: number) {
  if (score >= 80) return 'Very High';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function ArcGauge({ score }: { score: number }) {
  const SIZE = 220;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 90;
  const strokeWidth = 16;

  const startAngle = 150 * (Math.PI / 180);
  const totalArcDeg = 240;
  const progressAngle = (score / 100) * totalArcDeg;
  const endAngle = (150 + progressAngle) * (Math.PI / 180);

  function polarToCartesian(angle: number) {
    return {
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
    };
  }

  const start = polarToCartesian(startAngle);
  const trackEnd = polarToCartesian((150 + 240) * (Math.PI / 180));
  const end = polarToCartesian(endAngle);
  const largeArc = progressAngle > 180 ? 1 : 0;

  const trackPath = `M ${start.x} ${start.y} A ${R} ${R} 0 1 1 ${trackEnd.x} ${trackEnd.y}`;
  const fillPath = score > 0
    ? `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`
    : '';

  return (
    <View style={{ alignItems: 'center', marginVertical: spacing.sm }}>
      <View style={{ width: SIZE, height: SIZE * 0.82, alignItems: 'center' }}>
        <Svg width={SIZE} height={SIZE * 0.82}>
          {/* Track */}
          <Path
            d={trackPath}
            stroke={colors.surface2}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Fill */}
          {score > 0 && (
            <Path
              d={fillPath}
              stroke={colors.primary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
          {/* Tip dot */}
          {score > 0 && (
            <Circle cx={end.x} cy={end.y} r={4} fill="white" />
          )}
        </Svg>
        {/* Center text overlay */}
        <View style={s.gaugeCenterOverlay}>
          <Text style={s.gaugeScoreText}>{score}<Text style={s.gaugePctText}>%</Text></Text>
          <Text style={s.gaugeVerbText}>{getActivityLabel(score)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function SessionTab() {
  const router = useRouter();
  const activeSession = useSessionStore((s) => s.activeSession);
  const endSession = useSessionStore((s) => s.endSession);
  const catches = useCatchStore((s) => s.catches);
  const [now, setNow] = useState(Date.now());

  const { weather } = useWeather(
    activeSession?.latitude,
    activeSession?.longitude,
  );

  useEffect(() => {
    if (!activeSession) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeSession]);

  const elapsedMs = activeSession
    ? now - new Date(activeSession.startTime).getTime()
    : 0;

  const sessionCatches = catches.filter((c) =>
    activeSession?.catchIds.includes(c.id),
  );

  const windDir = weather?.windDirection != null
    ? degreesToCompass(weather.windDirection)
    : 'NE';

  if (!activeSession) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ width: 40 }} />
          <Text style={s.headerTitle}>Session</Text>
          <TouchableOpacity
            style={s.headerIconBtn}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={s.noSession}>
          <View style={s.noSessionIconCircle}>
            <MaterialCommunityIcons name="fish" size={36} color={colors.primary} />
          </View>
          <Text style={s.noSessionTitle}>Not on the water yet.</Text>
          <Text style={s.noSessionSub}>The fish aren't catching themselves.</Text>
          <TouchableOpacity
            style={s.startBtn}
            onPress={() => router.push('/(tabs)/map' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.startBtnText}>Start Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ width: 40 }} />
        <Text style={s.headerTitle}>Session</Text>
        <TouchableOpacity
          style={s.headerIconBtn}
          onPress={() => router.push('/notifications' as any)}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Live Session pill */}
        <View style={s.livePillRow}>
          <View style={s.liveChip}>
            <View style={s.liveDot} />
            <Text style={s.liveLabel}>Live Session</Text>
          </View>
        </View>

        {/* Timer + Weather row */}
        <View style={s.timerWeatherRow}>
          <View style={s.timerBlock}>
            <Text style={s.timerText}>{formatElapsed(elapsedMs)}</Text>
            <Text style={s.timerSub}>Session Time</Text>
          </View>
          {weather ? (
            <View style={s.weatherBox}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={22} color={colors.textSecondary} />
              <Text style={s.weatherTemp}>{weather.temp}°C</Text>
              <Text style={s.weatherDesc} numberOfLines={2}>{weather.description}</Text>
              <Text style={s.weatherWind}>{windDir} {weather.wind} km/h</Text>
            </View>
          ) : null}
        </View>

        {/* Fish Activity Gauge */}
        <View style={s.gaugeWrap}>
          <Text style={s.gaugeLabel}>FISH ACTIVITY</Text>
          <ArcGauge score={weather?.fishingScore ?? 0} />
        </View>

        {/* Catches + Keepers */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statHeaderLabel}>CATCHES</Text>
            <Text style={s.statValue}>{sessionCatches.length}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statHeaderLabel}>KEEPERS</Text>
            <Text style={s.statValue}>
              {sessionCatches.filter((c) => (c.weight ?? 0) > 0).length}
            </Text>
          </View>
        </View>

        {/* Log Catch button full width */}
        <View style={s.logCatchWrap}>
          <TouchableOpacity
            style={s.logBtn}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.logBtnText}>+ Log Catch</Text>
          </TouchableOpacity>
        </View>

        {/* Conditions section */}
        <View style={s.condHeaderRow}>
          <Text style={s.condHeaderTitle}>Conditions</Text>
          <TouchableOpacity onPress={() => router.push('/conditions' as any)} activeOpacity={0.7}>
            <Text style={s.condViewAll}>View all &rsaquo;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.condStrip}>
          {[
            { value: weather ? `${weather.temp}°C` : '—', label: 'Temp' },
            { value: weather ? `${weather.wind} km/h Wind ${windDir}` : '—', label: 'Wind NE' },
            { value: weather ? `${weather.pressure} hPa` : '—', label: 'Pressure' },
            { value: '2.1m', label: 'Tide ↑' },
          ].map((chip) => (
            <View key={chip.label} style={s.condChip}>
              <Text style={s.condChipValue}>{chip.value}</Text>
              <Text style={s.condChipLabel}>{chip.label}</Text>
            </View>
          ))}
        </ScrollView>

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

  // No session
  noSession: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 12,
  },
  noSessionIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noSessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  noSessionSub: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  startBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingVertical: 16,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bg,
  },

  // Live pill
  livePillRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  liveLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },

  // Timer + weather
  timerWeatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: 4,
  },
  timerBlock: { gap: 2 },
  timerText: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerSub: { fontSize: 12, color: colors.textTertiary, fontWeight: '500' },
  weatherBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'flex-end',
    gap: 2,
    minWidth: 110,
  },
  weatherTemp: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  weatherDesc: { fontSize: 11, color: colors.textSecondary, textAlign: 'right' },
  weatherWind: { fontSize: 11, color: colors.textTertiary },

  // Gauge
  gaugeWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  gaugeCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeScoreText: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 56,
  },
  gaugePctText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gaugeVerbText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },

  // Catches + keepers
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 44,
  },

  // Log Catch button
  logCatchWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  logBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 54,
  },
  logBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bg,
    letterSpacing: 0.5,
  },

  // Conditions
  condHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: 10,
  },
  condHeaderTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  condViewAll: { fontSize: 13, color: colors.textSecondary },
  condStrip: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    paddingBottom: spacing.md,
  },
  condChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 3,
  },
  condChipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  condChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
  },
});
