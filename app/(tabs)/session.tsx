import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function formatRelTime(dateStr: string, startMs: number) {
  const diff = new Date(dateStr).getTime() - startMs;
  const m = Math.floor(Math.abs(diff) / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `+${h}h ${m % 60}m`;
  return `+${m}m`;
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

  if (!activeSession) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
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

  const spotName = activeSession.spotName;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.75}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.spotName} numberOfLines={1}>{spotName}</Text>
        <TouchableOpacity
          onPress={() => {
            endSession();
            router.replace('/session-summary' as any);
          }}
          activeOpacity={0.75}
        >
          <Text style={s.endSessionText}>End</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Timer + Weather row */}
        <View style={s.timerWeatherRow}>
          <View style={s.timerBlock}>
            <View style={s.liveChip}>
              <View style={s.liveDot} />
              <Text style={s.liveLabel}>Live Session</Text>
            </View>
            <Text style={s.timerText}>{formatElapsed(elapsedMs)}</Text>
            <Text style={s.timerSub}>Session Time</Text>
          </View>
          {weather ? (
            <View style={s.weatherBox}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={22} color={colors.textSecondary} />
              <Text style={s.weatherTemp}>{weather.temp}°C</Text>
              <Text style={s.weatherDesc} numberOfLines={2}>{weather.description}</Text>
              <Text style={s.weatherWind}>{weather.wind} km/h</Text>
            </View>
          ) : null}
        </View>

        {/* Circular Fish Activity Gauge */}
        <View style={s.gaugeWrap}>
          <Text style={s.gaugeLabel}>FISH ACTIVITY</Text>
          <View style={s.gaugeRing}>
            {/* Arc track — simulated with a border arc via border radius + overflow */}
            <View style={s.gaugeTrack}>
              <View style={[s.gaugeFill, {
                // Rotate the fill arc based on score — 180deg = half circle = 100%
                transform: [{ rotate: `${Math.min((weather?.fishingScore ?? 0) / 100 * 180, 180)}deg` }],
              }]} />
            </View>
            <View style={s.gaugeCenter}>
              <Text style={s.gaugeScore}>{weather ? weather.fishingScore : '—'}</Text>
              <Text style={s.gaugePct}>{weather ? '%' : ''}</Text>
            </View>
          </View>
          <Text style={s.gaugeVerb}>{getActivityLabel(weather?.fishingScore ?? 0)}</Text>
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

        {/* Conditions Row */}
        <View style={s.condRow}>
          <Text style={s.condRowTitle}>Conditions</Text>
          <TouchableOpacity onPress={() => router.push('/conditions' as any)} activeOpacity={0.7}>
            <Text style={s.condViewAll}>View all &rsaquo;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.condStrip}>
          {[
            { icon: 'thermometer', value: weather ? `${weather.temp}°C` : '—', label: 'Temp' },
            { icon: 'weather-windy', value: weather ? `${weather.wind} km/h` : '—', label: 'Wind' },
            { icon: 'gauge', value: weather ? `${weather.pressure}` : '—', label: 'Pressure' },
            { icon: 'waves', value: '—', label: 'Tide' },
          ].map((chip) => (
            <View key={chip.label} style={s.condChip}>
              <MaterialCommunityIcons name={chip.icon as any} size={16} color={colors.textSecondary} />
              <Text style={s.condChipValue}>{chip.value}</Text>
              <Text style={s.condChipLabel}>{chip.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Catch List */}
        {sessionCatches.length > 0 && (
          <View style={s.catchSection}>
            <Text style={s.sectionHeader}>CATCHES THIS SESSION</Text>
            <FlatList
              data={sessionCatches}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={s.catchRow}>
                  <View style={s.catchSpeciesChip}>
                    <Text style={s.catchSpeciesText}>{item.species}</Text>
                  </View>
                  {item.weight ? (
                    <Text style={s.catchWeight}>{item.weight} kg</Text>
                  ) : null}
                  <Text style={s.catchTime}>
                    {formatRelTime(item.date, new Date(activeSession.startTime).getTime())}
                  </Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={s.catchSeparator} />}
            />
          </View>
        )}

      </ScrollView>

      {/* Bottom Log Catch Bar */}
      <View style={s.bottomBar}>
        <Text style={s.scanHint}>Scan to record</Text>
        <TouchableOpacity
          style={s.logBtn}
          onPress={() => router.push('/identifier' as any)}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="camera-iris" size={20} color={colors.bg} />
          <Text style={s.logBtnText}>LOG CATCH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  endSessionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },

  // Timer + weather row
  timerWeatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 4,
  },
  timerBlock: { gap: 4 },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  liveLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  timerText: {
    fontSize: 48,
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
  weatherTemp: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  weatherDesc: { fontSize: 11, color: colors.textSecondary, textAlign: 'right' },
  weatherWind: { fontSize: 11, color: colors.textTertiary },

  // Circular gauge
  gaugeWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 8,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  gaugeRing: {
    width: 180,
    height: 90,
    overflow: 'hidden',
    alignItems: 'center',
  },
  gaugeTrack: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 14,
    borderColor: colors.surface2,
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  gaugeFill: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 14,
    borderColor: colors.primary,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transformOrigin: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 2,
  },
  gaugeScore: { fontSize: 52, fontWeight: '800', color: colors.textPrimary, lineHeight: 56 },
  gaugePct: { fontSize: 20, fontWeight: '600', color: colors.textSecondary, alignSelf: 'flex-end', marginBottom: 6 },
  gaugeVerb: { fontSize: 16, fontWeight: '600', color: colors.primary },

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

  // Conditions strip
  condRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: 10,
  },
  condRowTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  condViewAll: { fontSize: 13, color: colors.textSecondary },
  condStrip: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginBottom: spacing.md,
  },
  condChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 4,
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

  // Catch list
  catchSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  noCatches: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  catchSpeciesChip: {
    flex: 1,
    backgroundColor: colors.primaryDim,
    borderRadius: radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  catchSpeciesText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  catchWeight: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catchTime: {
    fontSize: 11,
    color: colors.textTertiary,
    minWidth: 40,
    textAlign: 'right',
  },
  catchSeparator: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 6,
  },
  scanHint: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  logBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 56,
    gap: 10,
  },
  logBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bg,
    letterSpacing: 0.5,
  },
});
