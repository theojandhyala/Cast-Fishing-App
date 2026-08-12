import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SectionList, TouchableOpacity,
} from 'react-native';
import { FishSpeciesPhoto } from '../../components/fish/FishSpeciesPhoto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../../store/catchStore';
import { colors, spacing, radius, elevation } from '../../constants/theme';

const TEAL_LINE = 'rgba(0,212,170,0.12)';
const CARD_LINE = 'rgba(255,255,255,0.06)';
const PANEL_RADIUS = 20;

// Translate a hex colour to an rgba() string with the given alpha.
function withAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.brand}>Logbook</Text>
          <View style={s.countBadge}>
            <Text style={s.countBadgeText}>{catches.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/identifier' as any)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
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
            activeOpacity={0.85}
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
          <MaterialCommunityIcons name="scale-balance" size={16} color={colors.primary} />
          <Text style={s.statValue}>{totalWeight.toFixed(1)} kg</Text>
          <Text style={s.statLabel}>Weight hauled</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <MaterialCommunityIcons name="trophy-variant" size={16} color={colors.accent} />
          <Text style={s.statValue}>
            {biggestCatch?.weight ? `${biggestCatch.weight} kg` : '—'}
          </Text>
          <Text style={s.statLabel}>Biggest</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <MaterialCommunityIcons name="fish" size={16} color={colors.secondary} />
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
          <Text style={s.emptySub}>Cast your line and log your first fish — every catch you record shows up here.</Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00E9BC', '#00B78F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.emptyBtnGrad}
            >
              <MaterialCommunityIcons name="plus" size={19} color={colors.bg} />
              <Text style={s.emptyBtnText}>Log a catch</Text>
            </LinearGradient>
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
          renderItem={({ item }) => {
            const accentColor = getSpeciesColor(item.species);
            return (
              <TouchableOpacity
                style={s.catchRow}
                onPress={() =>
                  router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)
                }
                activeOpacity={0.85}
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: withAlpha(colors.primary, 0.1),
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: withAlpha(colors.primary, 0.2),
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: CARD_LINE,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },

  filterScroll: { flexGrow: 0 },
  filterPills: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    paddingBottom: spacing.sm,
  },
  filterPill: {
    minHeight: 34,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: CARD_LINE,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  filterPillTextActive: {
    color: colors.bg,
    fontWeight: '700',
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
    borderColor: CARD_LINE,
    paddingVertical: 18,
    ...elevation.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: CARD_LINE,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },

  // Feed
  feedContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },

  // Date section header
  dateHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingTop: 12,
  },

  // Compact list rows grouped into a surface card
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: CARD_LINE,
    gap: 12,
    ...elevation.card,
  },
  catchThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
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
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: CARD_LINE,
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  pbStrip: {
    gap: 8,
    paddingRight: spacing.lg,
  },
  pbCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_LINE,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 90,
    alignItems: 'center',
    gap: 3,
    ...elevation.card,
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
    backgroundColor: withAlpha(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(colors.primary, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyBtn: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  emptyBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 26,
    paddingVertical: 16,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.bg,
    letterSpacing: 0.2,
  },
});
