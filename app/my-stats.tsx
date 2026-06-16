import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCatchStore, Catch } from '../store/catchStore';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing, fonts } from '../constants/theme';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function computeStats(catches: Catch[]) {
  if (catches.length === 0) {
    return {
      total: 0,
      speciesCounts: {} as Record<string, number>,
      byMonth: new Array(12).fill(0) as number[],
      byDayOfWeek: new Array(7).fill(0) as number[],
      byTimeOfDay: { dawn: 0, morning: 0, afternoon: 0, evening: 0, night: 0 },
      baitCounts: {} as Record<string, number>,
      heaviest: null as Catch | null,
      totalWeight: 0,
      avgSizePerSpecies: {} as Record<string, number>,
      locations: [] as string[],
      longestStreak: 0,
      thisMonth: 0,
      lastMonth: 0,
    };
  }

  const speciesCounts: Record<string, number> = {};
  const byMonth = new Array(12).fill(0);
  const byDayOfWeek = new Array(7).fill(0);
  const byTimeOfDay = { dawn: 0, morning: 0, afternoon: 0, evening: 0, night: 0 };
  const baitCounts: Record<string, number> = {};
  const speciesWeightSum: Record<string, number> = {};
  const locationSet = new Set<string>();
  let heaviest: Catch | null = null;
  let totalWeight = 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  let thisMonth = 0;
  let lastMonth = 0;

  const sortedDates: string[] = [];

  for (const c of catches) {
    const d = new Date(c.date);
    speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1;
    speciesWeightSum[c.species] = (speciesWeightSum[c.species] || 0) + c.weight;
    byMonth[d.getMonth()]++;
    byDayOfWeek[d.getDay()]++;
    const h = d.getHours();
    if (h >= 5 && h < 7) byTimeOfDay.dawn++;
    else if (h >= 7 && h < 12) byTimeOfDay.morning++;
    else if (h >= 12 && h < 17) byTimeOfDay.afternoon++;
    else if (h >= 17 && h < 21) byTimeOfDay.evening++;
    else byTimeOfDay.night++;
    if (c.bait) baitCounts[c.bait] = (baitCounts[c.bait] || 0) + 1;
    if (c.location) locationSet.add(c.location);
    if (!heaviest || c.weight > heaviest.weight) heaviest = c;
    totalWeight += c.weight;
    sortedDates.push(d.toDateString());
    if (d >= thisMonthStart) thisMonth++;
    else if (d >= lastMonthStart) lastMonth++;
  }

  // Longest streak
  const uniqueDays = [...new Set(sortedDates)].sort();
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  const avgSizePerSpecies: Record<string, number> = {};
  for (const s of Object.keys(speciesCounts)) {
    avgSizePerSpecies[s] = Math.round((speciesWeightSum[s] / speciesCounts[s]) * 10) / 10;
  }

  return {
    total: catches.length,
    speciesCounts,
    byMonth,
    byDayOfWeek,
    byTimeOfDay,
    baitCounts,
    heaviest,
    totalWeight: Math.round(totalWeight * 10) / 10,
    avgSizePerSpecies,
    locations: [...locationSet],
    longestStreak: catches.length === 0 ? 0 : longestStreak,
    thisMonth,
    lastMonth,
  };
}

const SPECIES_COLORS = ['#00D4AA', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#EF4444', '#F97316'];

function MiniBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((v, i) => (
          <View key={i} style={chartStyles.barCol}>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { height: `${Math.round((v / max) * 100)}%` }]} />
            </View>
            <Text style={chartStyles.barLabel}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { width: '100%' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  barCol: { flex: 1, alignItems: 'center', height: 96 },
  barTrack: { flex: 1, width: '100%', backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  barLabel: { fontSize: 8, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
});

function MiniPieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <Text style={{ color: colors.textSecondary, fontSize: 12 }}>No data</Text>;
  return (
    <View style={pieStyles.container}>
      {data.slice(0, 6).map((d, i) => (
        <View key={i} style={pieStyles.row}>
          <View style={[pieStyles.dot, { backgroundColor: d.color }]} />
          <Text style={pieStyles.label} numberOfLines={1}>{d.label}</Text>
          <View style={pieStyles.track}>
            <View style={[pieStyles.fill, { width: `${Math.round((d.value / total) * 100)}%`, backgroundColor: d.color }]} />
          </View>
          <Text style={pieStyles.pct}>{Math.round((d.value / total) * 100)}%</Text>
        </View>
      ))}
    </View>
  );
}

const pieStyles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 12, color: colors.textPrimary, width: 70 },
  track: { flex: 1, height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 11, color: colors.textSecondary, width: 32, textAlign: 'right' },
});

export default function MyStatsScreen() {
  const { catches } = useCatchStore();
  const { user } = useAuthStore();
  const stats = useMemo(() => computeStats(catches), [catches]);

  const yearsLabel = (() => {
    if (!user?.joinedAt) return '< 1 year';
    const joined = new Date(user.joinedAt);
    const years = Math.floor((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365));
    return years < 1 ? '< 1 year' : `${years} year${years > 1 ? 's' : ''}`;
  })();

  const trendIcon = stats.thisMonth > stats.lastMonth ? 'arrow-up-bold' : stats.thisMonth < stats.lastMonth ? 'arrow-down-bold' : 'arrow-right-bold';
  const trendColor = stats.thisMonth > stats.lastMonth ? colors.success : stats.thisMonth < stats.lastMonth ? colors.danger : colors.textSecondary;

  const speciesPieData = Object.entries(stats.speciesCounts).map(([label, value], i) => ({
    label,
    value,
    color: SPECIES_COLORS[i % SPECIES_COLORS.length],
  }));

  const bestDayIdx = stats.byDayOfWeek.indexOf(Math.max(...stats.byDayOfWeek));
  const bestTimeEntry = Object.entries(stats.byTimeOfDay).sort((a, b) => b[1] - a[1])[0];
  const bestTimeLabel = bestTimeEntry ? bestTimeEntry[0].charAt(0).toUpperCase() + bestTimeEntry[0].slice(1) : '-';

  const topBaits = Object.entries(stats.baitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(0,212,170,0.12)', 'transparent']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>My Fishing Story</Text>
          <Text style={styles.headerSub}>Fishing for {yearsLabel}</Text>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{stats.total}</Text>
              <Text style={styles.headerStatLabel}>Total Catches</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{Object.keys(stats.speciesCounts).length}</Text>
              <Text style={styles.headerStatLabel}>Species</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{stats.totalWeight}kg</Text>
              <Text style={styles.headerStatLabel}>Total Weight</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* This Month vs Last */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Catches</Text>
            <View style={styles.monthRow}>
              <View style={styles.monthBox}>
                <Text style={styles.monthValue}>{stats.thisMonth}</Text>
                <Text style={styles.monthLabel}>This Month</Text>
              </View>
              <View style={styles.trendArrow}>
                <MaterialCommunityIcons name={trendIcon as any} size={32} color={trendColor} />
              </View>
              <View style={styles.monthBox}>
                <Text style={styles.monthValue}>{stats.lastMonth}</Text>
                <Text style={styles.monthLabel}>Last Month</Text>
              </View>
            </View>
          </View>

          {/* Species Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Species Caught</Text>
            {speciesPieData.length > 0 ? (
              <MiniPieChart data={speciesPieData} />
            ) : (
              <Text style={styles.emptyText}>No catches logged yet</Text>
            )}
          </View>

          {/* Catches by Month */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Catches by Month</Text>
            <MiniBarChart data={stats.byMonth} labels={MONTH_NAMES} />
          </View>

          {/* Best Day & Time */}
          <View style={styles.row}>
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardTitle}>Best Day</Text>
              <MaterialCommunityIcons name="calendar-star" size={32} color={colors.primary} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.bigValue}>{stats.total > 0 ? DAY_NAMES[bestDayIdx] : '-'}</Text>
              <Text style={styles.smallSub}>Most catches</Text>
            </View>
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardTitle}>Best Time</Text>
              <MaterialCommunityIcons name="weather-sunset-up" size={32} color={colors.primary} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.bigValue}>{stats.total > 0 ? bestTimeLabel : '-'}</Text>
              <Text style={styles.smallSub}>Time of day</Text>
            </View>
          </View>

          {/* Top Baits */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top Baits</Text>
            {topBaits.length > 0 ? (
              <View style={styles.baitList}>
                {topBaits.map(([bait, count], i) => (
                  <View key={bait} style={styles.baitRow}>
                    <View style={styles.baitRank}>
                      <Text style={styles.baitRankText}>#{i + 1}</Text>
                    </View>
                    <Text style={styles.baitName}>{bait}</Text>
                    <Text style={styles.baitCount}>{count} uses</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No bait data yet</Text>
            )}
          </View>

          {/* Heaviest Catch */}
          {stats.heaviest && (
            <View style={[styles.card, styles.pbCard]}>
              <View style={styles.pbTitleRow}>
                <Text style={styles.cardTitle}>Heaviest Catch Ever</Text>
                <MaterialCommunityIcons name="trophy" size={16} color={colors.secondary} />
              </View>
              <View style={styles.pbRow}>
                <View style={styles.pbIconBox}>
                  <MaterialCommunityIcons name="fish" size={32} color={colors.secondary} />
                </View>
                <View style={styles.pbInfo}>
                  <Text style={styles.pbSpecies}>{stats.heaviest.species}</Text>
                  <Text style={styles.pbWeight}>{stats.heaviest.weight}kg</Text>
                  {stats.heaviest.location && (
                    <View style={styles.pbLocationRow}>
                      <MaterialCommunityIcons name="map-marker" size={12} color={colors.textSecondary} />
                      <Text style={styles.pbLocation}>{stats.heaviest.location}</Text>
                    </View>
                  )}
                  <Text style={styles.pbDate}>
                    {new Date(stats.heaviest.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Average size per species */}
          {Object.keys(stats.avgSizePerSpecies).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Average Size per Species</Text>
              <View style={styles.avgList}>
                {Object.entries(stats.avgSizePerSpecies).map(([sp, avg]) => (
                  <View key={sp} style={styles.avgRow}>
                    <Text style={styles.avgSpecies}>{sp}</Text>
                    <Text style={styles.avgValue}>{avg}kg avg</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Locations */}
          {stats.locations.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fishing Locations ({stats.locations.length})</Text>
              <View style={styles.locationList}>
                {stats.locations.map((loc) => (
                  <View key={loc} style={styles.locationChip}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
                    <Text style={styles.locationText}>{loc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Longest Streak */}
          <View style={[styles.card, styles.streakCard]}>
            <MaterialCommunityIcons name="fire" size={28} color={colors.secondary} />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Longest Streak</Text>
              <Text style={styles.streakValue}>{stats.longestStreak} consecutive day{stats.longestStreak !== 1 ? 's' : ''}</Text>
            </View>
          </View>

        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  headerStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    color: colors.primary,
  },
  headerStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  halfCard: {
    flex: 1,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  monthBox: {
    alignItems: 'center',
  },
  monthValue: {
    fontFamily: fonts.monoBold,
    fontSize: 36,
    color: colors.textPrimary,
  },
  monthLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  trendArrow: {
    alignItems: 'center',
  },
  bigValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  smallSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  baitList: {
    gap: spacing.sm,
  },
  baitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  baitRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baitRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  baitName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  baitCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pbCard: {
    borderLeftColor: colors.secondary,
  },
  pbTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  pbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pbIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(245,158,11,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pbInfo: {
    flex: 1,
    gap: 3,
  },
  pbSpecies: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pbWeight: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    color: colors.secondary,
  },
  pbLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pbLocation: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pbDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  avgList: {
    gap: spacing.xs,
  },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avgSpecies: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  avgValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  locationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  locationText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderLeftColor: colors.secondary,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
