import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../../store/catchStore';
import { colors, radius, spacing, elevation } from '../../constants/theme';
import { FishSpeciesPhoto } from '../../components/fish/FishSpeciesPhoto';

const TABS = ['Catches', 'Stats'] as const;
type Tab = typeof TABS[number];
type SortMode = 'Newest' | 'Heaviest' | 'Longest';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default function CatchesScreen() {
  const { catches, getStats } = useCatchStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Catches');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('Newest');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const stats = getStats();

  const totalWeight = catches.reduce((sum, c) => sum + (c.weight || 0), 0);
  const speciesCount = Object.keys(stats.speciesCounts || {}).length;
  const topSpecies = Object.entries(stats.speciesCounts || {})
    .sort((a, b) => b[1] - a[1]);

  const filteredCatches = useMemo(() => {
    if (timeFilter === 'all') return catches;
    const now = new Date();
    const cutoff = new Date(now);
    if (timeFilter === 'week') cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    return catches.filter(c => new Date(c.date) >= cutoff);
  }, [catches, timeFilter]);

  const visibleCatches = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matches = query
      ? filteredCatches.filter((item) => [item.species, item.location, item.bait].some((value) => value?.toLocaleLowerCase().includes(query)))
      : [...filteredCatches];
    return matches.sort((a, b) =>
      sortMode === 'Heaviest'
        ? (b.weight || 0) - (a.weight || 0)
        : sortMode === 'Longest'
          ? (b.length || 0) - (a.length || 0)
          : new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredCatches, search, sortMode]);

  const cycleSort = () =>
    setSortMode((current) =>
      current === 'Newest' ? 'Heaviest' : current === 'Heaviest' ? 'Longest' : 'Newest'
    );

  const toggleSaved = (id: string) =>
    setSaved((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Logbook</Text>
          <Text style={s.headerSub}>{catches.length} catches</Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/add-catch' as any)}
          accessibilityRole="button"
          accessibilityLabel="Log a catch"
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* ── Tab Pills ── */}
      <View style={s.tabPillRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tabPill, activeTab === tab && s.tabPillActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.85}
          >
            <Text style={[s.tabPillText, activeTab === tab && s.tabPillTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Catches' ? (
        <>
          {/* Time filter pills */}
          <View style={s.timeFilterRow}>
            {(['all', 'week', 'month'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[s.timeFilterPill, timeFilter === f && s.timeFilterPillActive]}
                onPress={() => setTimeFilter(f)}
              >
                <Text style={[s.timeFilterText, timeFilter === f && s.timeFilterTextActive]}>
                  {f === 'all' ? 'All' : f === 'week' ? 'Week' : 'Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search + Sort */}
          <View style={s.filterRow}>
            <View style={s.searchBox}>
              <MaterialCommunityIcons name="magnify" size={17} color={colors.textTertiary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search catches..."
                placeholderTextColor={colors.textTertiary}
                style={s.searchInput}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              style={s.sortBtn}
              onPress={cycleSort}
              accessibilityRole="button"
              accessibilityLabel={`Sort catches. Currently: ${sortMode}`}
            >
              <MaterialCommunityIcons name="sort-variant" size={18} color={colors.textSecondary} />
              <Text style={s.sortBtnText}>{sortMode}</Text>
            </TouchableOpacity>
          </View>

          {catches.length === 0 ? (
            <View style={s.empty}>
              <MaterialCommunityIcons name="fish" size={48} color="rgba(0,212,170,0.25)" />
              <Text style={s.emptyTitle}>No catches yet</Text>
              <Text style={s.emptySub}>Every angler starts somewhere.{'\n'}Log your first catch today.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
                <MaterialCommunityIcons name="plus" size={16} color={colors.background} />
                <Text style={s.emptyBtnText}>Log First Catch</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={visibleCatches}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={s.catchGridRow}
              contentContainerStyle={s.catchGrid}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSaved = saved.has(item.id);
                return (
                  <TouchableOpacity
                    style={s.catchCard}
                    onPress={() => router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)}
                    activeOpacity={0.85}
                  >
                    <View style={s.catchCardBg}>
                      <FishSpeciesPhoto species={item.species} photo={item.photo} style={s.catchPhoto} />
                      <TouchableOpacity
                        style={s.bookmarkBtn}
                        onPress={(e) => { e.stopPropagation(); toggleSaved(item.id); }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name={isSaved ? 'bookmark' : 'bookmark-outline'}
                          size={16}
                          color={isSaved ? colors.primary : 'rgba(255,255,255,0.5)'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={s.catchCardBody}>
                      <Text style={s.catchSpecies} numberOfLines={1}>{item.species}</Text>
                      <View style={s.catchChips}>
                        {item.weight ? (
                          <View style={s.chipTeal}>
                            <Text style={s.chipTealText}>{item.weight}kg</Text>
                          </View>
                        ) : null}
                        {item.length ? (
                          <View style={s.chipGray}>
                            <Text style={s.chipGrayText}>{item.length}cm</Text>
                          </View>
                        ) : null}
                      </View>
                      {item.location ? (
                        <View style={s.catchLocation}>
                          <MaterialCommunityIcons name="map-marker-outline" size={10} color={colors.textTertiary} />
                          <Text style={s.catchLocationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      ) : null}
                      <Text style={s.catchDate}>{formatDate(item.date)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </>
      ) : (
        // ── Stats Tab ──
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {catches.length === 0 ? (
            <View style={s.empty}>
              <MaterialCommunityIcons name="fish" size={48} color="rgba(0,212,170,0.25)" />
              <Text style={s.emptyTitle}>No catches yet</Text>
              <Text style={s.emptySub}>Log catches to see your fishing statistics.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
                <Text style={s.emptyBtnText}>Start Fishing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Big numbers */}
              <View style={s.bigStats}>
                {[
                  { val: String(catches.length), label: 'Total' },
                  { val: String(speciesCount), label: 'Species' },
                  { val: stats.heaviest ? `${stats.heaviest.weight}kg` : '—', label: 'Heaviest' },
                  { val: String(catches.filter((c) => {
                    const d = new Date(c.date);
                    const now = new Date();
                    return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                  }).length), label: 'This Week' },
                ].map((item) => (
                  <View key={item.label} style={s.bigStatItem}>
                    <Text style={s.bigStatVal}>{item.val}</Text>
                    <Text style={s.bigStatLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Weight stats row */}
              {catches.length > 0 && (() => {
                const weights = catches.filter(c => c.weight).map(c => c.weight!);
                if (!weights.length) return null;
                const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
                const max = Math.max(...weights);
                return (
                  <View style={s.weightRow}>
                    {[
                      { label: 'Best', val: `${max.toFixed(1)}kg` },
                      { label: 'Avg', val: `${avg.toFixed(1)}kg` },
                      { label: 'Count', val: `${weights.length}` },
                    ].map(({ label, val }) => (
                      <View key={label} style={s.weightStat}>
                        <Text style={s.weightVal}>{val}</Text>
                        <Text style={s.weightLabel}>{label}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}

              {/* Species chart */}
              {topSpecies.length > 0 && (
                <View style={s.speciesSection}>
                  <Text style={s.sectionTitle}>Top Species</Text>
                  <View style={s.speciesCard}>
                    {topSpecies.slice(0, 6).map(([species, count], i) => {
                      const pct = (count / topSpecies[0][1]) * 100;
                      return (
                        <View key={species} style={[s.speciesRow, i > 0 && s.speciesRowBorder]}>
                          <Text style={s.speciesName} numberOfLines={1}>{species}</Text>
                          <View style={s.speciesBarWrap}>
                            <View style={[s.speciesBar, { width: `${pct}%` as any }]} />
                          </View>
                          <Text style={s.speciesCount}>{count}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050A12' },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '700', color: colors.textPrimary,
  },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#00D4AA', alignItems: 'center', justifyContent: 'center',
  },

  // ── Tab Pills ──
  tabPillRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface2,
    borderRadius: 50,
    padding: 3, gap: 3,
  },
  tabPill: {
    flex: 1, paddingVertical: 9,
    borderRadius: 50,
    alignItems: 'center',
  },
  tabPillActive: { backgroundColor: colors.primary },
  tabPillText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tabPillTextActive: { color: colors.background, fontWeight: '700' },

  // Time filter pills
  timeFilterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  timeFilterPill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  timeFilterPillActive: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderColor: colors.primary,
  },
  timeFilterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  timeFilterTextActive: { color: colors.primary },

  // ── Filter Row ──
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 13, paddingVertical: 0 },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surface, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  sortBtnText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  // ── Catch Grid ──
  catchGrid: { paddingHorizontal: spacing.md, paddingBottom: 100, gap: spacing.sm },
  catchGridRow: { gap: spacing.sm },
  catchCard: {
    flex: 1, minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  catchCardBg: { position: 'relative' },
  catchPhoto: { width: '100%', height: 108 },
  bookmarkBtn: {
    position: 'absolute', top: 7, right: 7,
    width: 28, height: 28, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(2,11,17,0.72)',
  },
  catchCardBody: { padding: 10, gap: 4 },
  catchSpecies: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  catchChips: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  chipTeal: {
    backgroundColor: 'rgba(0,212,170,0.15)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  chipTealText: { fontSize: 10, fontWeight: '700', color: '#00D4AA' },
  chipGray: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  chipGrayText: { fontSize: 10, color: colors.textSecondary },
  catchLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  catchLocationText: { fontSize: 10, color: colors.textSecondary, flex: 1 },
  catchDate: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },

  // ── Empty ──
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingTop: 80, paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    borderRadius: radius.full, backgroundColor: '#00D4AA',
    paddingHorizontal: 24, paddingVertical: 13,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: colors.background },

  // ── Stats Tab ──
  bigStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  bigStatItem: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  bigStatVal: { fontSize: 36, fontWeight: '800', color: '#00D4AA' },
  bigStatLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(255,255,255,0.4)' },

  // Weight stats row
  weightRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 12,
    marginHorizontal: spacing.lg,
  },
  weightStat: { alignItems: 'center' },
  weightVal: { fontSize: 18, fontWeight: '800', color: colors.primary },
  weightLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },

  speciesSection: {
    paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 12,
  },
  speciesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  speciesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  speciesRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  speciesName: { width: 110, fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  speciesBarWrap: {
    flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.full, overflow: 'hidden',
  },
  speciesBar: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  speciesCount: { width: 24, fontSize: 13, fontWeight: '800', color: '#00D4AA', textAlign: 'right' },
});
