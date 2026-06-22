import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useCatchStore, Catch } from '../store/catchStore';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing, fonts, typography } from '../constants/theme';

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SPECIES_COLORS = [
  '#00D4AA', '#F59E0B', '#2DD4FF', '#EC4899',
  '#8B5CF6', '#10B981', '#EF4444', '#F97316',
];

const BAIT_COLORS = ['#00D4AA', '#F59E0B', '#2DD4FF', '#EC4899', '#8B5CF6'];

// ─── Data helpers ─────────────────────────────────────────────────────────────

function getHour(c: Catch): number {
  return c.hourOfDay ?? new Date(c.date).getHours();
}

function formatHour(h: number): string {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

function confidenceLabel(n: number): { label: string; color: string } {
  if (n >= 10) return { label: 'High confidence', color: '#00D4AA' };
  if (n >= 5) return { label: 'Medium confidence', color: '#F59E0B' };
  return { label: 'Low confidence', color: '#8B95A7' };
}

interface ComputedStats {
  total: number;
  speciesCounts: Record<string, number>;
  speciesWeightSum: Record<string, number>;
  byMonth: number[];
  byHour: number[];
  baitCounts: Record<string, number>;
  locationSet: string[];
  bestHour: number;
  bestHourCount: number;
  topBait: string | null;
  topBaitCount: number;
  topSpecies: string | null;
  topSpeciesCount: number;
  topSpeciesAvg: number;
  morningRate: number;
  eveningRate: number;
  personalBests: Array<{ species: string; best: number; avg: number }>;
}

function computeStats(catches: Catch[]): ComputedStats {
  const speciesCounts: Record<string, number> = {};
  const speciesWeightSum: Record<string, number> = {};
  const byMonth = new Array(12).fill(0) as number[];
  const byHour = new Array(24).fill(0) as number[];
  const baitCounts: Record<string, number> = {};
  const locationSet = new Set<string>();
  const speciesBest: Record<string, number> = {};

  for (const c of catches) {
    const d = new Date(c.date);
    const h = getHour(c);

    speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1;
    speciesWeightSum[c.species] = (speciesWeightSum[c.species] || 0) + c.weight;
    if (!speciesBest[c.species] || c.weight > speciesBest[c.species]) {
      speciesBest[c.species] = c.weight;
    }

    byMonth[d.getMonth()]++;
    byHour[h]++;

    if (c.bait) baitCounts[c.bait] = (baitCounts[c.bait] || 0) + 1;
    if (c.location) locationSet.add(c.location);
  }

  const bestHour = byHour.indexOf(Math.max(...byHour));
  const bestHourCount = byHour[bestHour];

  const baitEntries = Object.entries(baitCounts).sort((a, b) => b[1] - a[1]);
  const topBait = baitEntries[0]?.[0] ?? null;
  const topBaitCount = baitEntries[0]?.[1] ?? 0;

  const speciesEntries = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);
  const topSpecies = speciesEntries[0]?.[0] ?? null;
  const topSpeciesCount = speciesEntries[0]?.[1] ?? 0;
  const topSpeciesAvg = topSpecies
    ? Math.round((speciesWeightSum[topSpecies] / speciesCounts[topSpecies]) * 10) / 10
    : 0;

  const morningTotal = byHour.slice(5, 12).reduce((a, b) => a + b, 0);
  const eveningTotal = byHour.slice(17, 22).reduce((a, b) => a + b, 0);
  const morningRate = morningTotal / 7;
  const eveningRate = eveningTotal / 5;

  const personalBests = Object.entries(speciesBest)
    .map(([species, best]) => ({
      species,
      best,
      avg: Math.round((speciesWeightSum[species] / speciesCounts[species]) * 10) / 10,
    }))
    .sort((a, b) => b.best - a.best);

  return {
    total: catches.length,
    speciesCounts,
    speciesWeightSum,
    byMonth,
    byHour,
    baitCounts,
    locationSet: [...locationSet],
    bestHour,
    bestHourCount,
    topBait,
    topBaitCount,
    topSpecies,
    topSpeciesCount,
    topSpeciesAvg,
    morningRate,
    eveningRate,
    personalBests,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={pillStyles.pill}>
      <Text style={pillStyles.value}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  value: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.primary,
    lineHeight: 24,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

function InsightCard({
  stat,
  text,
  sampleCount,
  accentColor = colors.primary,
}: {
  stat: string;
  text: string;
  sampleCount: number;
  accentColor?: string;
}) {
  const conf = confidenceLabel(sampleCount);
  return (
    <View style={[insightStyles.card, { borderLeftColor: accentColor }]}>
      <Text style={[insightStyles.stat, { color: accentColor }]}>{stat}</Text>
      <Text style={insightStyles.text}>{text}</Text>
      <View style={insightStyles.confRow}>
        <View style={[insightStyles.confDot, { backgroundColor: conf.color }]} />
        <Text style={[insightStyles.confLabel, { color: conf.color }]}>{conf.label}</Text>
        <Text style={insightStyles.sampleCount}>({sampleCount} catches)</Text>
      </View>
    </View>
  );
}

const insightStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    marginBottom: spacing.sm,
  },
  stat: {
    fontFamily: fonts.monoBold,
    fontSize: 32,
    marginBottom: 4,
    lineHeight: 36,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  confRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  confDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  sampleCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
  },
});

function HourlyChart({ byHour, currentHour }: { byHour: number[]; currentHour: number }) {
  const max = Math.max(...byHour, 1);
  const BAR_HEIGHT = 64;
  const keyLabels: Record<number, string> = { 0: '12a', 6: '6a', 12: '12p', 18: '6p' };

  return (
    <View style={hourlyStyles.wrapper}>
      <View style={hourlyStyles.bars}>
        {byHour.map((v, i) => {
          const h = Math.round((v / max) * BAR_HEIGHT);
          const isActive = i === currentHour;
          const hasLabel = keyLabels[i] !== undefined;
          return (
            <View key={i} style={hourlyStyles.col}>
              <View style={[hourlyStyles.track, { height: BAR_HEIGHT }]}>
                <View
                  style={[
                    hourlyStyles.bar,
                    { height: h, backgroundColor: isActive ? colors.primary : 'rgba(0,212,170,0.25)' },
                  ]}
                />
              </View>
              <Text style={[hourlyStyles.tickLabel, { opacity: hasLabel ? 1 : 0 }]}>
                {keyLabels[i] ?? ' '}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const hourlyStyles = StyleSheet.create({
  wrapper: { width: '100%' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  col: { flex: 1, alignItems: 'center' },
  track: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: 3 },
  tickLabel: {
    fontSize: 7,
    color: colors.textSecondary,
    marginTop: 3,
    fontFamily: fonts.mono,
  },
});

function BaitBars({ baitCounts }: { baitCounts: Record<string, number> }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const entries = Object.entries(baitCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = entries[0]?.[1] ?? 1;

  if (entries.length === 0) {
    return (
      <Text style={emptyStyle.text}>
        No bait data logged yet — add bait when logging catches
      </Text>
    );
  }

  return (
    <View style={{ gap: spacing.sm }} onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}>
      {entries.map(([bait, count], i) => {
        const barW = containerWidth > 0 ? Math.round((count / max) * (containerWidth - 80)) : 0;
        return (
          <View key={bait} style={baitBarStyles.row}>
            <Text style={baitBarStyles.name} numberOfLines={1}>{bait}</Text>
            <View style={baitBarStyles.trackWrap}>
              <View style={[baitBarStyles.fill, { width: barW, backgroundColor: BAIT_COLORS[i % BAIT_COLORS.length] }]} />
            </View>
            <Text style={baitBarStyles.count}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SpeciesBars({ speciesCounts }: { speciesCounts: Record<string, number> }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const entries = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  if (entries.length === 0) {
    return <Text style={emptyStyle.text}>No catches logged yet</Text>;
  }

  return (
    <View style={{ gap: spacing.sm }} onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}>
      {entries.map(([species, count], i) => {
        const barW = containerWidth > 0 ? Math.round((count / max) * (containerWidth - 80)) : 0;
        return (
          <View key={species} style={baitBarStyles.row}>
            <Text style={baitBarStyles.name} numberOfLines={1}>{species}</Text>
            <View style={baitBarStyles.trackWrap}>
              <View style={[baitBarStyles.fill, { width: barW, backgroundColor: SPECIES_COLORS[i % SPECIES_COLORS.length] }]} />
            </View>
            <Text style={baitBarStyles.count}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

const baitBarStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 28 },
  name: { width: 80, fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textPrimary },
  trackWrap: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: { height: 10, borderRadius: 5 },
  count: { width: 24, fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, textAlign: 'right' },
});

function MonthlyChart({ byMonth }: { byMonth: number[] }) {
  const max = Math.max(...byMonth, 1);
  const BAR_HEIGHT = 56;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
      {byMonth.map((v, i) => {
        const h = Math.round((v / max) * BAR_HEIGHT);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: '100%', height: BAR_HEIGHT, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' }}>
              <View style={{ width: '100%', height: h, backgroundColor: v > 0 ? 'rgba(0,212,170,0.6)' : 'transparent', borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 7, color: colors.textSecondary, marginTop: 3, fontFamily: fonts.mono }}>
              {MONTH_NAMES[i].slice(0, 1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const emptyStyle = StyleSheet.create({
  text: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
    lineHeight: 20,
  },
});

function Section({
  title,
  icon,
  accentColor = colors.primary,
  children,
}: {
  title: string;
  icon: string;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrapper}>
      <View style={sectionStyles.titleRow}>
        <View style={[sectionStyles.iconBadge, { backgroundColor: `${accentColor}18` }]}>
          <Icon name={icon as any} size={14} color={accentColor} />
        </View>
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MyStatsScreen() {
  const { catches } = useCatchStore();
  const { user } = useAuthStore();
  const currentHour = new Date().getHours();

  const stats = useMemo(() => computeStats(catches), [catches]);

  const insights = useMemo(() => {
    const result: Array<{ stat: string; text: string; sampleCount: number; accentColor?: string }> = [];

    if (catches.length === 0) return result;

    result.push({
      stat: formatHour(stats.bestHour),
      text: `You catch most fish at ${formatHour(stats.bestHour)} — ${stats.bestHourCount} of your catches happened in this window.`,
      sampleCount: stats.bestHourCount,
      accentColor: colors.primary,
    });

    if (stats.topBait) {
      result.push({
        stat: stats.topBait,
        text: `Your most successful bait overall is ${stats.topBait} (${stats.topBaitCount} catches).`,
        sampleCount: stats.topBaitCount,
        accentColor: colors.secondary,
      });
    } else {
      result.push({
        stat: '—',
        text: 'Not enough bait data. Try adding bait when logging your next catch.',
        sampleCount: 0,
        accentColor: colors.textTertiary,
      });
    }

    if (stats.topSpecies) {
      result.push({
        stat: `${stats.topSpeciesCount}×`,
        text: `${stats.topSpecies} is your most caught species — ${stats.topSpeciesCount} catches, averaging ${stats.topSpeciesAvg}kg.`,
        sampleCount: stats.topSpeciesCount,
        accentColor: '#2DD4FF',
      });
    }

    if (catches.length >= 5 && (stats.morningRate > 0 || stats.eveningRate > 0)) {
      const isMorningBetter = stats.morningRate >= stats.eveningRate;
      const ratio = isMorningBetter
        ? stats.eveningRate > 0 ? (stats.morningRate / stats.eveningRate).toFixed(1) : '∞'
        : stats.morningRate > 0 ? (stats.eveningRate / stats.morningRate).toFixed(1) : '∞';
      const better = isMorningBetter ? 'morning' : 'evening';
      const worse = isMorningBetter ? 'evening' : 'morning';
      result.push({
        stat: `${ratio}×`,
        text: `Your catch rate is ${ratio}× higher in the ${better} vs ${worse}.`,
        sampleCount: catches.length,
        accentColor: '#8B5CF6',
      });
    }

    return result;
  }, [catches, stats]);

  const isEmpty = catches.length < 3;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <LinearGradient
          colors={['rgba(0,212,170,0.18)', 'rgba(0,212,170,0.04)', 'transparent']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Pattern Lab</Text>
              <Text style={styles.headerSub}>What actually works for you</Text>
            </View>
            <View style={styles.headerIcon}>
              <Icon name="flask-outline" size={22} color={colors.primary} />
            </View>
          </View>
          <View style={styles.pillRow}>
            <StatPill label="Total Catches" value={stats.total} />
            <StatPill label="Species" value={Object.keys(stats.speciesCounts).length} />
            <StatPill label="Locations" value={stats.locationSet.length} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {isEmpty ? (
            <View style={styles.emptyState}>
              <Icon name="fish-off" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>Start logging catches</Text>
              <Text style={styles.emptyBody}>
                Log at least 3 catches to unlock your personal insights and patterns.
              </Text>
            </View>
          ) : (
            <>
              <Section title="Your Fishing Brain" icon="brain" accentColor={colors.primary}>
                {insights.map((ins, i) => (
                  <InsightCard key={i} {...ins} />
                ))}
              </Section>

              <Section title="Your Most Productive Hours" icon="clock-outline" accentColor="#2DD4FF">
                <HourlyChart byHour={stats.byHour} currentHour={currentHour} />
              </Section>

              <Section title="What's Working" icon="hook" accentColor={colors.secondary}>
                <BaitBars baitCounts={stats.baitCounts} />
              </Section>

              <Section title="Species Caught" icon="fish" accentColor="#EC4899">
                <SpeciesBars speciesCounts={stats.speciesCounts} />
              </Section>

              {stats.personalBests.length > 0 && (
                <Section title="Personal Records" icon="trophy-outline" accentColor={colors.secondary}>
                  {stats.personalBests.map((pb, i) => (
                    <View key={pb.species} style={pbStyles.row}>
                      <View style={pbStyles.rankBadge}>
                        <Text style={pbStyles.rank}>#{i + 1}</Text>
                      </View>
                      <Text style={pbStyles.species} numberOfLines={1}>{pb.species}</Text>
                      <View style={pbStyles.weights}>
                        <Text style={pbStyles.best}>{pb.best}kg</Text>
                        <Text style={pbStyles.avg}>{pb.avg}kg avg</Text>
                      </View>
                    </View>
                  ))}
                </Section>
              )}

              <Section title="Catches by Month" icon="calendar-month-outline" accentColor={colors.primary}>
                <MonthlyChart byMonth={stats.byMonth} />
              </Section>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const pbStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.secondary },
  species: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary },
  weights: { alignItems: 'flex-end', gap: 1 },
  best: { fontFamily: fonts.monoBold, fontSize: 15, color: colors.secondary },
  avg: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: { flexDirection: 'row', gap: spacing.sm },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
