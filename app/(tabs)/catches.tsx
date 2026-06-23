import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../../store/catchStore';
import { colors, spacing, radius } from '../../constants/theme';

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

  const filteredCatches = useMemo(() => {
    if (timeFilter === 'all') return catches;
    const now = new Date();
    const cutoff = new Date(now);
    if (timeFilter === 'week') cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    return catches.filter((c) => new Date(c.date) >= cutoff);
  }, [catches, timeFilter]);

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
          <Text style={s.headerTitle}>Logbook</Text>
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
          <Text style={s.statLabel}>Total Weight</Text>
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

      {filteredCatches.length === 0 ? (
        <View style={s.empty}>
          <MaterialCommunityIcons name="fish" size={48} color={colors.textTertiary} />
          <Text style={s.emptyTitle}>No catches yet</Text>
          <Text style={s.emptySub}>Scan your first fish to get started.</Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.emptyBtnText}>Scan a Fish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCatches}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.feedContent}
          renderItem={({ item }) => {
            const accentColor = getSpeciesColor(item.species);
            return (
              <TouchableOpacity
                style={s.catchCard}
                onPress={() =>
                  router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)
                }
                activeOpacity={0.75}
              >
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={s.catchPhoto} />
                ) : (
                  <View style={[s.catchAccentBar, { backgroundColor: accentColor }]} />
                )}

                <View style={s.catchContent}>
                  {/* Row 1: Species + weight badge */}
                  <View style={s.catchRow1}>
                    <Text style={s.catchSpecies}>{item.species}</Text>
                    {item.weight ? (
                      <View style={[s.weightBadge, { backgroundColor: accentColor + '22' }]}>
                        <Text style={[s.weightBadgeText, { color: accentColor }]}>
                          {item.weight} kg
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Row 2: Date + location */}
                  <View style={s.catchRow2}>
                    <Text style={s.catchMeta}>{formatDate(item.date)}</Text>
                    {item.location ? (
                      <>
                        <Text style={s.catchMetaDot}>·</Text>
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={12}
                          color={colors.textTertiary}
                        />
                        <Text style={s.catchMeta} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </>
                    ) : null}
                  </View>

                  {/* Row 3: Condition chips */}
                  <View style={s.catchRow3}>
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
                </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterPills: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginBottom: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },

  // Feed
  feedContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: 10,
  },
  catchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  catchPhoto: {
    width: '100%',
    height: 200,
  },
  catchAccentBar: {
    width: 4,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  catchContent: {
    padding: 16,
    paddingLeft: 20,
    gap: 6,
  },
  catchRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  catchSpecies: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: -0.2,
  },
  weightBadge: {
    borderRadius: radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weightBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  catchRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  catchMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  catchMetaDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  catchRow3: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  condChip: {
    backgroundColor: colors.surface2,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  condChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.bg,
  },
});
