import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../../store/catchStore';
import { colors, radius, spacing, elevation } from '../../constants/theme';

const TABS = ['My Catches', 'Statistics'] as const;
type Tab = typeof TABS[number];

const CATCH_GRADS: [string, string][] = [
  ['#0F2A1C', '#061510'], ['#0F1E2E', '#060E18'],
  ['#221010', '#110808'], ['#0F1C0F', '#070D07'],
  ['#201A08', '#100D04'], ['#0F0F24', '#070710'],
];

function getSpeciesIcon(species: string): string {
  const s = species.toLowerCase();
  if (s.includes('bass')) return 'fish';
  if (s.includes('trout') || s.includes('salmon')) return 'fish';
  if (s.includes('pike') || s.includes('perch')) return 'fish';
  if (s.includes('carp')) return 'fish';
  if (s.includes('tuna') || s.includes('marlin')) return 'sail-boat';
  if (s.includes('shark')) return 'fish';
  if (s.includes('catfish')) return 'fish';
  if (s.includes('bream')) return 'fish';
  return 'fish';
}

function getSpeciesColor(species: string): string {
  const s = species.toLowerCase();
  if (s.includes('bass')) return colors.primary;
  if (s.includes('trout')) return '#60A5FA';
  if (s.includes('salmon')) return '#F472B6';
  if (s.includes('pike')) return '#34D399';
  if (s.includes('carp')) return colors.secondary;
  if (s.includes('tuna')) return '#2DD4FF';
  return 'rgba(0,212,170,0.7)';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} - ${hour}:${m} ${ampm}`;
}

export default function CatchesScreen() {
  const { catches, getStats } = useCatchStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('My Catches');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const stats = getStats();

  const totalWeight = catches.reduce((sum, c) => sum + (c.weight || 0), 0);
  const speciesCount = Object.keys(stats.speciesCounts || {}).length;
  const topSpecies = Object.entries(stats.speciesCounts || {})
    .sort((a, b) => b[1] - a[1]);

  const toggleSaved = (id: string) => setSaved(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Tab switcher */}
      <View style={s.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.85}
          >
            <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'My Catches' ? (
        <>
          {/* Filter row */}
          <View style={s.filterRow}>
            <TouchableOpacity style={s.filterPill}>
              <Text style={s.filterPillText}>All Species</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.filterIcon}>
              <MaterialCommunityIcons name="calendar-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.filterIcon}>
              <MaterialCommunityIcons name="sort-variant" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {catches.length === 0 ? (
            <View style={s.empty}>
              <MaterialCommunityIcons name="fish-off" size={48} color={colors.textTertiary} />
              <Text style={s.emptyTitle}>No catches yet</Text>
              <Text style={s.emptySub}>Every angler starts somewhere.{'\n'}Log your first catch today.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
                <MaterialCommunityIcons name="plus" size={16} color={colors.background} />
                <Text style={s.emptyBtnText}>Log First Catch</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={catches}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={s.separator} />}
              renderItem={({ item, index }) => {
                const grad = CATCH_GRADS[index % CATCH_GRADS.length];
                const isSaved = saved.has(item.id);
                return (
                  <TouchableOpacity
                    style={s.catchRow}
                    onPress={() => router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)}
                    activeOpacity={0.85}
                  >
                    {/* Fish photo */}
                    <LinearGradient colors={grad} style={s.catchPhoto}>
                      <View style={s.catchPhotoIcon}>
                        <MaterialCommunityIcons
                          name={getSpeciesIcon(item.species) as any}
                          size={28}
                          color={getSpeciesColor(item.species)}
                        />
                      </View>
                    </LinearGradient>

                    {/* Info */}
                    <View style={s.catchBody}>
                      <Text style={s.catchSpecies} numberOfLines={1}>{item.species}</Text>
                      {(item.length || item.weight) && (
                        <Text style={s.catchMeasure}>
                          {[
                            item.length ? `${item.length} cm` : null,
                            item.weight ? `${item.weight} kg` : null,
                          ].filter(Boolean).join(' - ')}
                        </Text>
                      )}
                      <Text style={s.catchDate}>{formatDate(item.date)}</Text>
                    </View>

                    {/* Bookmark */}
                    <TouchableOpacity
                      style={s.bookmarkBtn}
                      onPress={() => toggleSaved(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={isSaved ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </>
      ) : (
        // Statistics tab
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Stats grid */}
          <View style={s.statsGrid}>
            {[
              { val: String(catches.length), label: 'Total Catches', icon: 'fish', color: colors.primary },
              { val: String(speciesCount), label: 'Species', icon: 'dna', color: '#60A5FA' },
              { val: totalWeight > 0 ? `${totalWeight.toFixed(1)}kg` : '0', label: 'Total Weight', icon: 'weight', color: colors.secondary },
              { val: stats.heaviest ? `${stats.heaviest.weight}kg` : '—', label: 'Personal Best', icon: 'trophy', color: '#F472B6' },
            ].map(item => (
              <View key={item.label} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: item.color + '20' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={s.statVal}>{item.val}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Top species */}
          {topSpecies.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>TOP SPECIES</Text>
              <View style={s.speciesCard}>
                {topSpecies.slice(0, 6).map(([species, count], i) => {
                  const pct = (count / topSpecies[0][1]) * 100;
                  return (
                    <View key={species} style={[s.speciesRow, i > 0 && s.speciesRowBorder]}>
                      <Text style={s.speciesName} numberOfLines={1}>{species}</Text>
                      <View style={s.speciesBarWrap}>
                        <View style={[s.speciesBar, { width: `${pct}%` }]} />
                      </View>
                      <Text style={s.speciesCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {catches.length === 0 && (
            <View style={s.empty}>
              <MaterialCommunityIcons name="chart-bar" size={48} color={colors.textTertiary} />
              <Text style={s.emptyTitle}>No stats yet</Text>
              <Text style={s.emptySub}>Log catches to see your fishing statistics.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tabBtnTextActive: { color: colors.background },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterPillText: { flex: 1, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterIcon: {
    width: 42,
    height: 42,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Catch rows
  separator: { height: 1, backgroundColor: colors.border },
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    gap: 14,
    backgroundColor: colors.background,
  },
  catchPhoto: {
    width: 68,
    height: 68,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchPhotoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchBody: { flex: 1, gap: 4 },
  catchSpecies: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  catchMeasure: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  catchDate: { fontSize: 11, color: colors.textTertiary },
  bookmarkBtn: { padding: 4 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, borderRadius: radius.full,
    backgroundColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 13,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: colors.background },

  // Stats tab
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
    ...elevation.raised,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.8 },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 10, fontWeight: '800', color: colors.textTertiary,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },

  speciesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  speciesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  speciesRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  speciesName: { width: 120, fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  speciesBarWrap: {
    flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
  },
  speciesBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  speciesCount: { width: 28, fontSize: 13, fontWeight: '800', color: colors.primary, textAlign: 'right' },
});
