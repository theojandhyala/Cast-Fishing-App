import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SectionList, TouchableOpacity,
} from 'react-native';
import { FishSpeciesPhoto } from '../../components/fish/FishSpeciesPhoto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../../store/catchStore';
import { colors, spacing, radius } from '../../constants/theme';

const TEAL_LINE = 'rgba(0,212,170,0.12)';
const PANEL_RADIUS = radius.sm;

type TimeFilter = 'all' | 'week' | 'month';

const SPECIES_COLORS: Record<string, string> = {
  default: '#00D4AA',
  Salmon: '#FF6B35',
  Trout: '#4ECDC4',
  Bass: '#45B7D1',
  Pike: '#96CEB4',
  Carp: '#FFEAA7',
  Tuna: '#6C5CE7',
  Barramundi: '#00B4D8',
  'Murray Cod': '#06D6A0',
};

function getSpeciesColor(species: string): string {
  for (const key of Object.keys(SPECIES_COLORS)) {
    if (species.toLowerCase().includes(key.toLowerCase())) return SPECIES_COLORS[key];
  }
  return SPECIES_COLORS.default;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getSectionTitle(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function CatchesScreen() {
  const { catches, getStats } = useCatchStore();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const stats = getStats();

  const totalWeight = catches.reduce((sum, c) => sum + (c.weight ?? 0), 0);
  const biggestCatch = catches.reduce(
    (best, c) => (!best || (c.weight ?? 0) > (best.weight ?? 0) ? c : best),
    null as typeof catches[number] | null,
  );
  const speciesCount = Object.keys(stats.speciesCounts ?? {}).length;

  const personalBests = useMemo(() => {
    return Object.entries(stats.personalBests ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [stats.personalBests]);

  const filteredCatches = useMemo(() => {
    if (timeFilter === 'all') return catches;
    const now = new Date();
    const cutoff = new Date(now);
    if (timeFilter === 'week') cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    return catches.filter((c) => new Date(c.date) >= cutoff);
  }, [catches, timeFilter]);

  // Group catches by date for SectionList
  const sections = useMemo(() => {
    const groups: Record<string, typeof catches> = {};
    for (const c of filteredCatches) {
      const key = new Date(c.date).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return Object.entries(groups).map(([, data]) => ({
      title: getSectionTitle(data[0].date),
      data,
    }));
  }, [filteredCatches]);

  const FILTER_LABELS: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.brand}>LOGBOOK</Text>
          <View style={s.countBadge}>
            <Text style={s.countBadgeText}>{catches.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/identifier' as any)}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.bg} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
        contentContainerStyle={s.filterPills}
      >
        {FILTER_LABELS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterPill, timeFilter === f.key && s.filterPillActive]}
            onPress={() => setTimeFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.filterPillText, timeFilter === f.key && s.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Bar */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{totalWeight.toFixed(1)} kg</Text>
          <Text style={s.statLabel}>Weight Hauled</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>
            {biggestCatch?.weight ? `${biggestCatch.weight} kg` : '—'}
          </Text>
          <Text style={s.statLabel}>Biggest</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{speciesCount}</Text>
          <Text style={s.statLabel}>Species</Text>
        </View>
      </View>

      {/* Personal Bests */}
      {personalBests.length > 0 && (
        <View style={s.pbSection}>
          <Text style={s.pbHeader}>PERSONAL BESTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pbStrip}
          >
            {personalBests.map(([species, weight]) => (
              <View key={species} style={s.pbCard}>
                <Text style={s.pbWeight}>{weight.toFixed(1)}<Text style={s.pbUnit}> kg</Text></Text>
                <Text style={s.pbSpecies} numberOfLines={1}>{species}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {filteredCatches.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIconCircle}>
            <MaterialCommunityIcons name="fish" size={32} color={colors.primary} />
          </View>
          <Text style={s.emptyTitle}>No catches yet</Text>
          <Text style={s.emptySub}>Cast your line and log your first fish.</Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.emptyBtnText}>Log a Catch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.feedContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={s.dateHeader}>{section.title}</Text>
          )}
          renderSectionFooter={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item, index, section }) => {
            const accentColor = getSpeciesColor(item.species);
            const isFirst = index === 0;
            const isLast = index === section.data.length - 1;
            return (
              <TouchableOpacity
                style={[
                  s.catchRow,
                  isFirst && s.catchRowFirst,
                  isLast && s.catchRowLast,
                  !isFirst && s.catchRowBorder,
                ]}
                onPress={() =>
                  router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)
                }
                activeOpacity={0.75}
              >
                {/* Thumbnail */}
                <FishSpeciesPhoto
                  species={item.species}
                  photo={item.photo}
                  style={s.catchThumb}
                />

                {/* Text stack */}
                <View style={s.catchInfo}>
                  <Text style={s.catchSpecies} numberOfLines={1}>{item.species}</Text>
                  <View style={s.catchMetaRow}>
                    <Text style={s.catchMeta}>{formatDate(item.date)}</Text>
                    {item.location ? (
                      <>
                        <Text style={s.catchMetaDot}>·</Text>
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={11}
                          color={colors.textTertiary}
                        />
                        <Text style={s.catchMeta} numberOfLines={1}>{item.location}</Text>
                      </>
                    ) : null}
                  </View>
                  {(item.bait || item.length) ? (
                    <View style={s.catchChipRow}>
                      {item.length ? (
                        <View style={s.condChip}>
                          <Text style={s.condChipText}>{item.length} cm</Text>
                        </View>
                      ) : null}
                      {item.bait ? (
                        <View style={s.condChip}>
                          <Text style={s.condChipText}>{item.bait}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>

                {/* Weight badge */}
                {item.weight ? (
                  <View style={[s.weightBadge, { backgroundColor: accentColor + '22' }]}>
                    <Text style={[s.weightBadgeText, { color: accentColor }]}>
                      {item.weight} kg
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  countBadge: {
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: PANEL_RADIUS,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterScroll: { flexGrow: 0 },
  filterPills: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    paddingBottom: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: PANEL_RADIUS,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  filterPillTextActive: {
    color: colors.bg,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: TEAL_LINE,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Feed
  feedContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },

  // Date section header
  dateHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingTop: 12,
  },

  // Compact list rows grouped into a surface card
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    gap: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: TEAL_LINE,
    borderRightColor: TEAL_LINE,
  },
  catchRowFirst: {
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    borderTopWidth: 1,
    borderTopColor: TEAL_LINE,
  },
  catchRowLast: {
    borderBottomLeftRadius: PANEL_RADIUS,
    borderBottomRightRadius: PANEL_RADIUS,
    borderBottomWidth: 1,
    borderBottomColor: TEAL_LINE,
  },
  catchRowBorder: {
    borderTopWidth: 1,
    borderTopColor: TEAL_LINE,
  },
  catchThumb: {
    width: 60,
    height: 60,
    borderRadius: PANEL_RADIUS,
  },
  catchInfo: {
    flex: 1,
    gap: 3,
  },
  catchSpecies: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catchMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  catchMetaDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  catchChipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  condChip: {
    backgroundColor: colors.surface2,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  condChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  weightBadge: {
    borderRadius: radius.xs,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  weightBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Personal Bests
  pbSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  pbHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  pbStrip: {
    gap: 8,
    paddingRight: spacing.lg,
  },
  pbCard: {
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 90,
    alignItems: 'center',
    gap: 3,
  },
  pbWeight: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  pbUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  pbSpecies: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 10,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1,
    borderColor: TEAL_LINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: PANEL_RADIUS,
    backgroundColor: colors.primary,
  },
  emptyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.bg,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
