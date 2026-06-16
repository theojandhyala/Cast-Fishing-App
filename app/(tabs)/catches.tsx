import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore, Catch } from '../../store/catchStore';
import { colors, radius, spacing, elevation } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - spacing.lg * 2 - 12) / 2;

const FILTERS = ['All', 'Species', 'Date', 'Spot'];

const CATCH_GRADIENTS: [string, string][] = [
  ['#1a3a2a', '#0d1f16'],
  ['#1a2a3a', '#0d1620'],
  ['#2a1a1a', '#1a0d0d'],
  ['#1a2a1a', '#0d1a0d'],
  ['#2a2a1a', '#1a1a0d'],
  ['#1a1a3a', '#0d0d20'],
];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Today, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  return `${days} days ago`;
}

export default function CatchesScreen() {
  const { catches, getStats } = useCatchStore();
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const stats = getStats();
  // Map species → personal best weight for PB badge
  const pbMap = stats.personalBests || {};

  const filtered = useMemo(() => catches.filter((c) => {
    if (search) {
      return c.species.toLowerCase().includes(search.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(search.toLowerCase());
    }
    return true;
  }), [catches, search]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Search */}
      <View style={s.searchRow}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={s.searchInput}
          placeholder="Search catches..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <MaterialCommunityIcons name="tune-variant" size={18} color={colors.textSecondary} />
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.pill, filter === f && s.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.pillText, filter === f && s.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <MaterialCommunityIcons name="fish" size={48} color={colors.textTertiary} />
          <Text style={s.emptyText}>No catches yet</Text>
          <Text style={s.emptySub}>Go fish and log your first catch!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item, index }) => {
            const grad = CATCH_GRADIENTS[index % CATCH_GRADIENTS.length];
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: item.id } } as any)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={grad} style={s.cardPhoto}>
                  <MaterialCommunityIcons name="fish" size={28} color="rgba(0,212,170,0.35)" />
                  {item.weight && pbMap[item.species] && item.weight >= pbMap[item.species] && (
                    <View style={s.pbBadge}><Text style={s.pbBadgeText}>PB</Text></View>
                  )}
                </LinearGradient>
                <View style={s.cardInfo}>
                  <Text style={s.cardSpecies} numberOfLines={1}>{item.species}</Text>
                  <Text style={s.cardWeight}>{item.weight ? `${item.weight} kg` : '—'}</Text>
                  <Text style={s.cardMeta} numberOfLines={1}>{item.location || '—'}</Text>
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

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

  pillsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm },
  pill: {
    paddingHorizontal: 16, paddingVertical: 11, minHeight: 44, borderRadius: radius.full,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: colors.background },

  grid: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 12 },
  card: {
    width: CARD_SIZE, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...elevation.raised,
  },
  cardPhoto: { height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pbBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  pbBadgeText: { fontSize: 9, fontWeight: '800', color: '#0A0E1A', letterSpacing: 0.5 },
  cardInfo: { padding: 10 },
  cardSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  cardWeight: { fontSize: 13, color: colors.primary, fontWeight: '700', marginBottom: 2 },
  cardMeta: { fontSize: 11, color: colors.textSecondary },
  cardTime: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary },
});
