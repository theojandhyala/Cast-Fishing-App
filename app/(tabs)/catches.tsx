import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore, Catch } from '../../store/catchStore';
import { colors, radius, spacing, elevation } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - spacing.lg * 2 - 10) / 2;

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
          <Text style={s.subtitle}>{catches.length} total catches</Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/add-catch' as any)}
          accessibilityRole="button" accessibilityLabel="Log a catch"
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={s.searchInput}
          placeholder="Search species or location..."
          placeholderTextColor={colors.textTertiary}
          value={search} onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <View style={s.searchDivider} />
        <MaterialCommunityIcons name="tune-variant" size={18} color={colors.textSecondary} />
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
          <View style={s.emptyIcon}>
            <MaterialCommunityIcons name="fish" size={36} color={colors.textTertiary} />
          </View>
          <Text style={s.emptyTitle}>No catches yet</Text>
          <Text style={s.emptySub}>Go fish and log your first catch</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
            <Text style={s.emptyBtnText}>Log a Catch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 10 }}
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
                <LinearGradient colors={grad} style={s.cardPhoto}>
                  <MaterialCommunityIcons name="fish" size={32} color="rgba(0,212,170,0.2)" />
                  {isPB && (
                    <View style={s.pbBadge}>
                      <Text style={s.pbText}>PB</Text>
                    </View>
                  )}
                </LinearGradient>
                <View style={s.cardBody}>
                  <Text style={s.cardSpecies} numberOfLines={1}>{item.species}</Text>
                  <Text style={s.cardWeight}>{item.weight ? `${item.weight} kg` : '—'}</Text>
                  <Text style={s.cardLocation} numberOfLines={1}>{item.location || '—'}</Text>
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
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  searchDivider: { width: 1, height: 16, backgroundColor: colors.border },

  pillsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.full,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#051410', fontWeight: '700' },

  grid: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 10 },
  card: {
    width: CARD_W, backgroundColor: colors.surface,
    borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.1)',
    ...elevation.raised,
  },
  cardPhoto: { height: 115, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pbBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: colors.secondary, borderRadius: radius.xs,
    paddingHorizontal: 7, paddingVertical: 3,
    shadowColor: colors.secondary, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
  },
  pbText: { fontSize: 9, fontWeight: '900', color: '#0A0E1A', letterSpacing: 0.5 },
  cardBody: { padding: 11 },
  cardSpecies: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 3, letterSpacing: -0.2 },
  cardWeight: { fontSize: 18, fontWeight: '900', color: colors.primary, marginBottom: 4, letterSpacing: -0.5 },
  cardLocation: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  cardTime: { fontSize: 10, color: colors.textTertiary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary },
  emptyBtn: {
    marginTop: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 11,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
