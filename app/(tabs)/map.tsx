import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, FlatList, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WORLD_SPOTS, WorldSpot } from '../../data/worldSpots';
import { SpotCard } from '../../components/map/SpotCard';
import { Modal } from 'react-native';
import { colors, radius, spacing, elevation } from '../../constants/theme';

import { getSpotImage } from '../../constants/spotImages';
import { useLocation } from '../../hooks/useLocation';
import { haversineKm, formatDistance } from '../../utils/distance';
import { useSessionStore } from '../../store/sessionStore';

const DIFF_COLORS: Record<string, string> = {
  beginner: '#10B981', intermediate: '#F59E0B', expert: '#EF4444',
};
const TYPE_FILTERS = ['All', 'Lake', 'River', 'Sea', 'Reservoir', 'Ocean'];
const TAG_FILTERS = ['Carp', 'Predator', 'Beginner'];
const SPOT_GRAD: Record<string, readonly [string, string]> = {
  river: ['#1a3a2a', '#0d1f16'], lake: ['#1a2a3a', '#0d1620'],
  sea: ['#132035', '#0a1525'], reservoir: ['#1a2535', '#0f1928'],
  ocean: ['#0f1e30', '#0a1320'], estuary: ['#1a2a20', '#0f1a12'],
};
const TYPE_ICONS: Record<string, string> = {
  river: 'waves', lake: 'water', sea: 'anchor',
  reservoir: 'water-pump', ocean: 'sail-boat', estuary: 'water-outline',
};

export default function SpotsScreen() {
  const router = useRouter();
  const { activeSession } = useSessionStore();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [tag, setTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorldSpot | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [sortByDistance, setSortByDistance] = useState(false);
  const { location: gpsLocation } = useLocation();

  const filtered = useMemo(() => {
    let result = WORLD_SPOTS.filter(s => {
      const matchType = type === 'All' || s.type === type.toLowerCase();
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.country.toLowerCase().includes(search.toLowerCase());
      const matchTag = !tag ||
        (tag === 'Beginner' && s.difficulty === 'beginner') ||
        (tag === 'Carp' && s.species.some(sp => sp.toLowerCase().includes('carp'))) ||
        (tag === 'Predator' && s.species.some(sp => ['pike','perch','zander','bass'].some(p => sp.toLowerCase().includes(p))));
      return matchType && matchSearch && matchTag;
    });
    if (sortByDistance && gpsLocation) {
      result = [...result].sort((a, b) =>
        haversineKm(gpsLocation.latitude, gpsLocation.longitude, a.latitude, a.longitude) -
        haversineKm(gpsLocation.latitude, gpsLocation.longitude, b.latitude, b.longitude)
      );
    }
    return result;
  }, [type, search, tag, sortByDistance, gpsLocation]);

  const featured = WORLD_SPOTS.reduce((b, s) => s.rating > b.rating ? s : b, WORLD_SPOTS[0]);

  const toggleSaved = (id: string) => setSaved(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const renderSpot = ({ item: spot }: { item: WorldSpot }) => {
    const grad = (SPOT_GRAD[spot.type] || ['#1a2a3a', '#0f1924']) as [string, string];
    const diffColor = DIFF_COLORS[spot.difficulty] || colors.primary;
    const isSaved = saved.has(spot.id);
    return (
      <TouchableOpacity
        style={s.spotCard}
        onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
        activeOpacity={0.85}
      >
        {/* Difficulty stripe */}
        <View style={[s.diffStripe, { backgroundColor: diffColor }]} />
        <View style={s.spotThumb}>
          <LinearGradient colors={grad} style={StyleSheet.absoluteFillObject} />
          <Image
            source={{ uri: getSpotImage(spot) }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.8 }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        <View style={s.spotBody}>
          <View style={s.spotTopRow}>
            <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
            <TouchableOpacity
              onPress={() => toggleSaved(spot.id)}
              style={s.bookmarkBtn}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18} color={isSaved ? colors.secondary : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={s.spotMeta}>
            {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)} · {spot.country}
            {sortByDistance && gpsLocation ? `  ·  ${formatDistance(haversineKm(gpsLocation.latitude, gpsLocation.longitude, spot.latitude, spot.longitude))}` : ''}
          </Text>
          <View style={s.spotBottom}>
            <View style={s.speciesRow}>
              {spot.species.slice(0, 2).map(sp => (
                <View key={sp} style={s.speciesChip}>
                  <Text style={s.speciesText} numberOfLines={1}>{sp}</Text>
                </View>
              ))}
              {spot.species.length > 2 && <Text style={s.moreText}>+{spot.species.length - 2}</Text>}
            </View>
            <View style={s.ratingPill}>
              <MaterialCommunityIcons name="star" size={10} color={colors.secondary} />
              <Text style={s.ratingText}>{spot.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <View>
      {activeSession && (
        <TouchableOpacity style={s.sessionBanner} onPress={() => router.push('/session' as any)} activeOpacity={0.85}>
          <View style={s.sessionDot} />
          <Text style={s.sessionText}>Session active · {activeSession.spotName}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}

      <View style={s.pageHeader}>
        <View>
          <Text style={s.pageTitle}>Fishing Spots</Text>
          <Text style={s.pageCount}>{filtered.length} locations</Text>
        </View>
        <TouchableOpacity style={s.nearBtn} accessibilityRole="button">
          <MaterialCommunityIcons name="crosshairs-gps" size={15} color={colors.primary} />
          <Text style={s.nearText}>Near me</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={s.searchInput}
          placeholder="Search spots..."
          placeholderTextColor={colors.textTertiary}
          value={search} onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
        {TYPE_FILTERS.map(t => (
          <TouchableOpacity key={t} style={[s.pill, type === t && s.pillActive]} onPress={() => setType(t)}>
            <Text style={[s.pillText, type === t && s.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.pillsRow, { paddingBottom: 14 }]}>
        <TouchableOpacity
          style={[s.tagPill, s.nearPill, sortByDistance && s.nearPillActive]}
          onPress={() => setSortByDistance(v => !v)}
        >
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={12}
            color={sortByDistance ? colors.primary : colors.textSecondary}
          />
          <Text style={[s.tagText, sortByDistance && s.tagTextActive]}>Near Me</Text>
        </TouchableOpacity>
        {TAG_FILTERS.map(t => (
          <TouchableOpacity key={t} style={[s.tagPill, tag === t && s.tagPillActive]} onPress={() => setTag(tag === t ? null : t)}>
            <Text style={[s.tagText, tag === t && s.tagTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!search && type === 'All' && !tag && (
        <View style={s.featuredSection}>
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Text style={s.sectionTitle}>Top Rated</Text>
          </View>
          <TouchableOpacity
            style={s.featuredCard}
            onPress={() => router.push({ pathname: '/spot-details', params: { id: featured.id } } as any)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[...(SPOT_GRAD[featured.type] || ['#1a2a3a', '#0f1924'])] as [string, string]}
              style={StyleSheet.absoluteFillObject}
            />
            <Image
              source={{ uri: getSpotImage(featured) }}
              style={[StyleSheet.absoluteFillObject, { opacity: 0.55 }]}
              resizeMode="cover"
            />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={s.featuredOverlay}>
              <View style={s.featuredTopRow}>
                <View style={s.topRatedBadge}>
                  <MaterialCommunityIcons name="star" size={11} color={colors.secondary} />
                  <Text style={s.topRatedText}>{featured.rating} · Top Rated</Text>
                </View>
                <TouchableOpacity style={s.featuredBookmark} onPress={() => toggleSaved(featured.id)}>
                  <MaterialCommunityIcons
                    name={saved.has(featured.id) ? 'bookmark' : 'bookmark-outline'}
                    size={20} color="#fff"
                  />
                </TouchableOpacity>
              </View>
              <View>
                <Text style={s.featuredName}>{featured.name.split(',')[0]}</Text>
                <Text style={s.featuredMeta}>{featured.type.charAt(0).toUpperCase() + featured.type.slice(1)} · {featured.country}</Text>
                <View style={s.featuredSpecies}>
                  {featured.species.slice(0, 3).map(sp => (
                    <View key={sp} style={s.featuredChip}>
                      <Text style={s.featuredChipText}>{sp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
            <MaterialCommunityIcons
              name={(TYPE_ICONS[featured.type] || 'water') as any}
              size={80} color="rgba(255,255,255,0.05)"
              style={{ position: 'absolute', right: -10, top: 20 }}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={s.sectionHead}>
        <View style={s.sectionBar} />
        <Text style={s.sectionTitle}>{search || type !== 'All' || tag ? 'Results' : 'All Spots'}</Text>
        <Text style={s.countText}>{filtered.length}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderSpot}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setSelected(null)} />
        {selected && <SpotCard spot={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  sessionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: spacing.lg, marginTop: spacing.sm,
    backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    paddingHorizontal: 14, paddingVertical: 11,
  },
  sessionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  sessionText: { flex: 1, fontSize: 13, color: colors.primary, fontWeight: '600' },

  pageHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  pageTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  pageCount: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  nearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)', marginTop: 4,
  },
  nearText: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

  pillsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.full,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#051410', fontWeight: '700' },

  tagPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  tagPillActive: { borderColor: colors.secondary, backgroundColor: 'rgba(245,158,11,0.1)' },
  nearPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  nearPillActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.1)' },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tagTextActive: { color: colors.secondary },

  featuredSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  featuredCard: {
    height: 210, borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.15)',
    ...elevation.card,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject, padding: 16,
    justifyContent: 'space-between',
  },
  featuredTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRatedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)',
  },
  topRatedText: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  featuredBookmark: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  featuredName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  featuredMeta: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  featuredSpecies: { flexDirection: 'row', gap: 6 },
  featuredChip: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.xs,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  featuredChipText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: 12, marginTop: 4,
  },
  sectionBar: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  countText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  spotCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg, marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  diffStripe: { width: 3 },
  spotThumb: { width: 78, alignItems: 'center', justifyContent: 'center', minHeight: 86 },
  spotBody: { flex: 1, paddingHorizontal: 12, paddingVertical: 11 },
  spotTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  spotName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  bookmarkBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: -6 },
  spotMeta: { fontSize: 11, color: colors.textSecondary, marginBottom: 8 },
  spotBottom: { flexDirection: 'row', alignItems: 'center' },
  speciesRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  speciesChip: {
    backgroundColor: colors.surface2, borderRadius: radius.xs,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  speciesText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
  moreText: { fontSize: 10, color: colors.textTertiary },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: colors.secondary },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
});
