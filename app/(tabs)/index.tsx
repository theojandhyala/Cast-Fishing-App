import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useSessionStore } from '../../store/sessionStore';
import { useSolunar } from '../../hooks/useSolunar';
import { colors, spacing, radius } from '../../constants/theme';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 6) return 'Dawn patrol';
  if (h >= 6 && h < 9) return 'First light';
  if (h >= 9 && h < 12) return 'Morning bite';
  if (h >= 12 && h < 14) return 'High noon';
  if (h >= 14 && h < 17) return 'Afternoon run';
  if (h >= 17 && h < 20) return 'Golden hour';
  if (h >= 20 && h < 23) return 'Night fishing';
  return 'After dark';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'PRIME';
  if (score >= 60) return 'ACTIVE';
  if (score >= 40) return 'PATCHY';
  return 'SLOW BITE';
}

function getConditionsLabel(score: number) {
  if (score >= 80) return 'Excellent Conditions';
  if (score >= 60) return 'Good Conditions';
  if (score >= 40) return 'Fair Conditions';
  return 'Tough Conditions';
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return 'Yesterday';
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const catches = useCatchStore((s) => s.catches);
  const router = useRouter();
  const { location: gpsLocation } = useLocation();
  const activeSession = useSessionStore((s) => s.activeSession);

  const { weather, updatedAt } = useWeather(
    gpsLocation?.latitude,
    gpsLocation?.longitude,
  );

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const recentCatches = catches.slice(0, 3);
  const score = weather?.fishingScore ?? 0;
  const scoreLabel = getScoreLabel(score);

  const updatedMinAgo = updatedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000))
    : null;

  const stats = useMemo(() => {
    const speciesSet = new Set(catches.map((c) => c.species));
    const totalWeight = catches.reduce((sum, c) => sum + (c.weight ?? 0), 0);
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
      totalWeight,
    };
  }, [catches]);

  const moonPhase = weather?.moonPhase ?? 'Waxing Crescent';
  const solunar = useSolunar(gpsLocation?.latitude, gpsLocation?.longitude);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greetSmall}>{getGreeting()}</Text>
            <Text style={s.greetName}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={s.bellBtn}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Fishing Score Hero */}
        <View style={s.scoreCard}>
          <Text style={s.scoreCardLabel}>FISHING SCORE</Text>
          <View style={s.scoreRow}>
            <View style={s.scoreLeft}>
              <View style={s.scoreNumRow}>
                <Text style={s.scoreNum}>{score}</Text>
                <Text style={s.scoreDenom}>/100</Text>
              </View>
              <Text style={s.scoreConditions}>{getConditionsLabel(score)}</Text>
              {solunar?.nextWindow ? (
                <View style={s.primeRow}>
                  <Text style={s.primeLabel}>Next Prime Window</Text>
                  <Text style={s.primeTime}>
                    {solunar.nextWindow.minutesUntil > 0
                      ? `in ${solunar.nextWindow.minutesUntil < 60
                          ? `${solunar.nextWindow.minutesUntil}m`
                          : `${Math.floor(solunar.nextWindow.minutesUntil / 60)}h ${solunar.nextWindow.minutesUntil % 60}m`}`
                      : solunar.nextWindow.time}
                  </Text>
                </View>
              ) : null}
              <Text style={s.scoreUpdated}>
                {updatedMinAgo !== null
                  ? updatedMinAgo < 2 ? 'Reading the water now' : `Read ${updatedMinAgo}m ago`
                  : 'Reading the water…'}
              </Text>
            </View>
            {/* Circular ring gauge */}
            <View style={s.scoreRingWrap}>
              <View style={s.scoreRingTrack}>
                <View style={[s.scoreRingFill, {
                  transform: [{ rotate: `${Math.min(score / 100 * 270 - 135, 135)}deg` }],
                }]} />
              </View>
              <View style={s.scoreRingCenter}>
                <MaterialCommunityIcons name="fish" size={28} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>

        {/* Weather Strip */}
        <View style={s.weatherStrip}>
          {[
            { icon: 'weather-windy', value: weather ? `${weather.wind} km/h` : '—', label: 'Wind' },
            { icon: 'thermometer', value: weather ? `${weather.temp}°C` : '—', label: 'Temp' },
            { icon: 'gauge', value: weather ? `${weather.pressure}` : '—', label: 'Pressure' },
            { icon: 'moon-waxing-crescent', value: moonPhase ?? 'Waxing', label: 'Moon' },
          ].map((chip) => (
            <View key={chip.label} style={s.weatherChip}>
              <MaterialCommunityIcons name={chip.icon as any} size={18} color={colors.textSecondary} />
              <Text style={s.weatherChipValue} numberOfLines={1}>{chip.value}</Text>
              <Text style={s.weatherChipLabel}>{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.sectionPad}>
          <SectionHeader title="QUICK ACTIONS" />
          <View style={s.grid}>
            {[
              { icon: 'play-circle', title: 'Start Session', sub: 'Head out, track it', route: '/(tabs)/session' },
              { icon: 'camera-iris', title: 'Scan Fish', sub: 'Live ID in seconds', route: '/identifier' },
              { icon: 'fish', title: 'Log Catch', sub: 'Scan to record', route: '/identifier' },
              { icon: 'map-marker', title: 'Explore Spots', sub: 'Find the bite', route: '/(tabs)/map' },
            ].map((card) => (
              <TouchableOpacity
                key={card.title}
                style={s.actionCard}
                onPress={() => router.push(card.route as any)}
                activeOpacity={0.75}
              >
                <View style={s.actionIconCircle}>
                  <MaterialCommunityIcons name={card.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={s.actionTitle}>{card.title}</Text>
                <Text style={s.actionSub}>{card.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Catches */}
        <View style={s.sectionPad}>
          <SectionHeader title="RECENT CATCHES" />
          {recentCatches.length === 0 ? (
            <View style={s.emptyCard}>
              <MaterialCommunityIcons name="fish" size={32} color={colors.textTertiary} />
              <Text style={s.emptyTitle}>The water's keeping secrets.</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => router.push('/identifier' as any)}
                activeOpacity={0.75}
              >
                <Text style={s.emptyBtnText}>Scan a Fish</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
            >
              {recentCatches.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={s.catchCard}
                  onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                  activeOpacity={0.75}
                >
                  <View style={[s.catchColorBar, { backgroundColor: colors.primary }]} />
                  <View style={s.catchCardBody}>
                    <Text style={s.catchSpecies} numberOfLines={1}>{c.species}</Text>
                    {c.weight ? (
                      <View style={s.catchWeightBadge}>
                        <Text style={s.catchWeightText}>{c.weight} kg</Text>
                      </View>
                    ) : null}
                    <Text style={s.catchDate}>{timeAgo(c.date)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Stats */}
        <View style={s.sectionPad}>
          <SectionHeader title="YOUR STATS" />
          <View style={s.statsGrid}>
            {[
              { icon: 'fish', value: String(stats.total), label: 'Fish Landed', color: colors.primary },
              { icon: 'leaf', value: String(stats.species), label: 'Species Outsmarted', color: colors.secondary },
              { icon: 'clock-outline', value: '—', label: 'Hours on Water', color: colors.accent },
              { icon: 'fire', value: `${stats.streak}d`, label: 'Days Running', color: colors.accent },
            ].map((item) => (
              <View key={item.label} style={s.statCard}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                <Text style={[s.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Advisor Banner */}
        <View style={s.sectionPad}>
          <TouchableOpacity
            style={s.advisorCard}
            onPress={() => router.push('/ai-advisor' as any)}
            activeOpacity={0.75}
          >
            <View style={s.advisorIconCircle}>
              <MaterialCommunityIcons name="robot-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.advisorTitle}>Ask the AI Advisor</Text>
              <Text style={s.advisorSub}>Get tips for today's conditions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greetSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  greetName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Score hero
  scoreCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  scoreCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLeft: { gap: 4 },
  scoreNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  scoreNum: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 68,
    letterSpacing: -2,
  },
  scoreDenom: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreConditions: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  scoreUpdated: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.3,
    marginTop: 4,
  },
  primeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 16,
  },
  primeLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  primeTime: { fontSize: 12, fontWeight: '700', color: colors.primary },
  // Circular ring
  scoreRingWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingTrack: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    borderColor: colors.surface2,
  },
  scoreRingFill: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    borderColor: colors.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  scoreRingCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Weather strip
  weatherStrip: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 8,
  },
  weatherChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  weatherChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weatherChipLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },

  sectionPad: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Quick Actions 2x2
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Recent catches
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.bg,
  },
  catchCard: {
    width: 160,
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  catchColorBar: {
    height: 4,
    width: '100%',
  },
  catchCardBody: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  catchSpecies: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catchWeightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryDim,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catchWeightText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  catchDate: {
    fontSize: 11,
    color: colors.textTertiary,
  },

  // Stats 2x2
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // AI Advisor
  advisorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  advisorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  advisorSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
