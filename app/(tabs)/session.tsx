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
          <Text style={s.noSessionTitle}>No Active Session</Text>
          <Text style={s.noSessionSub}>Head to a spot and start fishing</Text>
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

        {/* Hero Timer */}
        <View style={s.heroBlock}>
          <Text style={s.timerText}>{formatElapsed(elapsedMs)}</Text>
          <View style={s.activeRow}>
            <View style={s.activeDot} />
            <Text style={s.activeLabel}>Active at {spotName}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { label: 'Catches', value: String(sessionCatches.length) },
            { label: 'Activity', value: weather ? `${weather.fishingScore}%` : '—' },
            { label: 'Weather', value: weather ? `${weather.temp}°C` : '—' },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Conditions Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.condStrip}
        >
          {[
            { icon: 'weather-windy', value: weather ? `${weather.wind} km/h` : '—', label: 'Wind' },
            { icon: 'thermometer', value: weather ? `${weather.temp}°C` : '—', label: 'Temp' },
            { icon: 'gauge', value: weather ? `${weather.pressure}` : '—', label: 'Pressure' },
            { icon: 'moon-waxing-crescent', value: '—', label: 'Solunar' },
          ].map((chip) => (
            <View key={chip.label} style={s.condChip}>
              <MaterialCommunityIcons name={chip.icon as any} size={16} color={colors.textSecondary} />
              <Text style={s.condChipValue}>{chip.value}</Text>
              <Text style={s.condChipLabel}>{chip.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Catch List */}
        <View style={s.catchSection}>
          <Text style={s.sectionHeader}>CATCHES THIS SESSION</Text>
          {sessionCatches.length === 0 ? (
            <Text style={s.noCatches}>No catches yet</Text>
          ) : (
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
          )}
        </View>

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

  // Hero timer
  heroBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: 10,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  activeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Stats row
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
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },

  // Conditions strip
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
