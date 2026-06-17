import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity, TextInput, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../../store/catchStore';
import { colors, radius, spacing, elevation } from '../../constants/theme';
import { getSpeciesImage } from '../../constants/spotImages';

const { width } = Dimensions.get('window');
const CARD_W = (width - spacing.lg * 2 - 12) / 2;

const FILTERS = ['All', 'Species', 'Date', 'Spot'];

const CATCH_GRADS: [string, string][] = [
  ['#0F2A1C', '#061510'], ['#0F1E2E', '#060E18'],
  ['#221010', '#110808'], ['#0F1C0F', '#070D07'],
  ['#201A08', '#100D04'], ['#0F0F24', '#070710'],
];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Today, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return `${Math.floor((now.getTime() - d.getTime()) / 86400000)}d ago`;
}

export default function CatchesScreen() {
  const { catches, getStats } = useCatchStore();
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const stats = getStats();
  const pbMap = stats.personalBests || {};

  const totalWeight = catches.reduce((sum, c) => sum + (c.weight || 0), 0);
  const speciesCount = Object.keys(stats.speciesCounts || {}).length;
  const topSpecies = Object.entries(stats.speciesCounts || {})
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const filtered = useMemo(() => catches.filter(c =>
    !search || c.species.toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase())
  ), [catches, search]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Catch Log</Text>
          <Text style={s.subtitle}>
            {catches.length > 0 ? `${catches.length} catch${catches.length !== 1 ? 'es' : ''} recorded` : 'Start your fishing story'}
          </Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/add-catch' as any)}
          accessibilityRole="button"
          accessibilityLabel="Log a catch"
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats banner */}
      {catches.length > 0 && (
        <View style={s.statsBanner}>
          <View style={s.statBItem}>
            <Text style={s.statBVal}>{totalWeight > 0 ? totalWeight.toFixed(1) : '0'}<Text style={s.statBUnit}> kg</Text></Text>
            <Text style={s.statBLabel}>Total weight</Text>
          </View>
          <View style={s.statBDiv} />
          <View style={s.statBItem}>
            <Text style={s.statBVal}>{speciesCount}</Text>
            <Text style={s.statBLabel}>Species</Text>
          </View>
          <View style={s.statBDiv} />
          <View style={s.statBItem}>
            <Text style={s.statBVal} numberOfLines={1}>{stats.heaviest ? `${stats.heaviest.weight}kg` : '—'}</Text>
            <Text style={s.statBLabel}>Personal best</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={s.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={s.searchInput}
          placeholder="Search species or location…"
          placeholderTextColor={colors.textTertiary}
          value={search} onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.pill, filter === f && s.pillActive]} onPress={() => setFilter(f)}>
            <Text style={[s.pillText, filter === f && s.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={s.emptyGrad}>
            <MaterialCommunityIcons name="fish-off" size={40} color={colors.textTertiary} />
          </LinearGradient>
          <Text style={s.emptyTitle}>{search ? 'No results found' : 'No catches yet'}</Text>
          <Text style={s.emptySub}>
            {search ? 'Try a different species or location' : 'Every angler starts somewhere.\nLog your first catch today.'}
          </Text>
          {!search && (
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
              <MaterialCommunityIcons name="plus" size={16} color={colors.background} />
              <Text style={s.emptyBtnText}>Log First Catch</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const grad = CATCH_GRADS[index % CATCH_GRADS.length];
            const isPB = item.weight && pbMap[item.species] && item.weight >= pbMap[item.species];
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)}
                activeOpacity={0.85}
              >
                <View style={s.cardPhoto}>
                  <LinearGradient colors={grad} style={StyleSheet.absoluteFillObject} />
                  <Image
                    source={{ uri: getSpeciesImage(item.species) }}
                    style={[StyleSheet.absoluteFillObject, { opacity: 0.65 }]}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.55)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {isPB && (
                    <View style={s.pbBadge}>
                      <Text style={s.pbText}>PB</Text>
                    </View>
                  )}
                  {item.weight && (
                    <View style={s.weightOverlay}>
                      <Text style={s.weightOverlayText}>{item.weight} kg</Text>
                    </View>
                  )}
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardSpecies} numberOfLines={1}>{item.species}</Text>
                  <View style={s.cardMetaRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={11} color={colors.textTertiary} />
                    <Text style={s.cardLocation} numberOfLines={1}>{item.location || 'Unknown spot'}</Text>
                  </View>
                  <Text style={s.cardTime}>{timeAgo(item.date)}</Text>
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
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },

  statsBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14,
  },
  statBItem: { flex: 1, alignItems: 'center' },
  statBVal: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.3 },
  statBUnit: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  statBLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  statBDiv: { width: 1, height: 28, backgroundColor: colors.border },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

  pillsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9, minHeight: 44, borderRadius: radius.full,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: colors.background, fontWeight: '700' },

  grid: { paddingHorizontal: spacing.lg, paddingBottom: 110, gap: 12 },
  card: {
    width: CARD_W, backgroundColor: colors.surface,
    borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.1)',
    ...elevation.raised,
  },
  cardPhoto: { height: 120, position: 'relative' },
  pbBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: colors.secondary, borderRadius: radius.xs,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  pbText: { fontSize: 9, fontWeight: '900', color: '#0A0E1A', letterSpacing: 0.5 },
  weightOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.xs,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  weightOverlayText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  cardBody: { padding: 11 },
  cardSpecies: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 5, letterSpacing: -0.2 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3 },
  cardLocation: { flex: 1, fontSize: 11, color: colors.textSecondary },
  cardTime: { fontSize: 10, color: colors.textTertiary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60, paddingHorizontal: 40 },
  emptyGrad: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, borderRadius: radius.full,
    backgroundColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 13,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: colors.background },
});
