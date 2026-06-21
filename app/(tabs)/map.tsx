import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WORLD_SPOTS, WorldSpot } from '../../data/worldSpots';
import { SpotCard } from '../../components/map/SpotCard';
import { colors, radius, spacing, elevation } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     colors.success,
  intermediate: colors.secondary,
  expert:       colors.danger,
};

const TYPE_FILTERS = ['All', 'Lake', 'River', 'Sea', 'Reservoir', 'Ocean'];
const TAG_FILTERS = ['Carp', 'Predator', 'Beginner'];

const SPOT_GRADIENTS: Record<string, readonly [string, string]> = {
  river:     ['#1a3a2a', '#0d1f16'],
  lake:      ['#1a2a3a', '#0d1620'],
  sea:       ['#132035', '#0a1525'],
  reservoir: ['#1a2535', '#0f1928'],
  ocean:     ['#0f1e30', '#0a1320'],
  estuary:   ['#1a2a20', '#0f1a12'],
  private:   ['#1a1a2a', '#0f0f1a'],
};

const TYPE_ICONS: Record<string, string> = {
  river: 'waves', lake: 'water', sea: 'anchor',
  reservoir: 'water-pump', ocean: 'sail-boat', estuary: 'water-outline', private: 'lock',
};

export default function SpotsScreen() {
  const router = useRouter();
  const { activeSession } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<WorldSpot | null>(null);
  const [savedSpots, setSavedSpots] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => WORLD_SPOTS.filter((s) => {
    const matchType = selectedType === 'All' || s.type === selectedType.toLowerCase();
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = !selectedTag ||
      (selectedTag === 'Beginner' && s.difficulty === 'beginner') ||
      (selectedTag === 'Carp' && s.species.some(sp => sp.toLowerCase().includes('carp'))) ||
      (selectedTag === 'Predator' && s.species.some(sp => ['pike', 'perch', 'zander', 'bass', 'predator'].some(p => sp.toLowerCase().includes(p))));
    return matchType && matchSearch && matchTag;
  }), [selectedType, searchQuery, selectedTag]);

  const featuredSpot = WORLD_SPOTS.reduce((best, s) => s.rating > best.rating ? s : best, WORLD_SPOTS[0]);

  const toggleSaved = (id: string) => {
    setSavedSpots(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderSpot = ({ item: spot }: { item: WorldSpot }) => {
    const grad = SPOT_GRADIENTS[spot.type] || ['#1a2a3a', '#0f1924'];
    const isSaved = savedSpots.has(spot.id);
    const diffColor = DIFFICULTY_COLORS[spot.difficulty] || colors.primary;
    return (
      <TouchableOpacity
        style={s.spotCard}
        onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${spot.name}, ${spot.type} in ${spot.country}`}
      >
        <LinearGradient colors={[...grad] as [string, string]} style={s.spotPhoto}>
          <MaterialCommunityIcons name={TYPE_ICONS[spot.type] as any} size={24} color="rgba(255,255,255,0.3)" />
        </LinearGradient>

        <View style={s.spotBody}>
          <View style={s.spotTopRow}>
            <Text style={s.spotName} numberOfLines={1}>{spot.name}</Text>
            <TouchableOpacity
              onPress={() => toggleSaved(spot.id)}
              style={s.bookmarkBtn}
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save spot'}
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
          </Text>

          <View style={s.spotBottomRow}>
            <View style={s.speciesRow}>
              {spot.species.slice(0, 2).map((sp) => (
                <View key={sp} style={s.speciesChip}>
                  <Text style={s.speciesText}>{sp}</Text>
                </View>
              ))}
              {spot.species.length > 2 && (
                <Text style={s.moreText}>+{spot.species.length - 2}</Text>
              )}
            </View>
            <View style={s.spotRightBadges}>
              <View style={s.ratingPill}>
                <MaterialCommunityIcons name="star" size={10} color={colors.secondary} />
                <Text style={s.ratingText}>{spot.rating}</Text>
              </View>
              <View style={[s.diffBadge, { backgroundColor: diffColor + '22', borderColor: diffColor + '44' }]}>
                <Text style={[s.diffText, { color: diffColor }]}>
                  {spot.difficulty === 'beginner' ? 'B' : spot.difficulty === 'intermediate' ? 'I' : 'E'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      {activeSession && (
        <TouchableOpacity style={s.sessionBanner} onPress={() => router.push('/session' as any)} activeOpacity={0.85}>
          <View style={s.sessionDot} />
          <Text style={s.sessionText}>Session active · {activeSession.spotName}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Fishing Spots</Text>
          <Text style={s.headerSub}>{filtered.length} locations</Text>
        </View>
        <TouchableOpacity style={s.nearBtn} accessibilityRole="button" accessibilityLabel="Near me">
          <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.primary} />
          <Text style={s.nearText}>Near me</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
              <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
        {TYPE_FILTERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.pill, selectedType === t && s.pillActive]}
            onPress={() => setSelectedType(t)}
            accessibilityRole="button"
          >
            <Text style={[s.pillText, selectedType === t && s.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tag pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.pillsRow, { paddingBottom: 12 }]}>
        {TAG_FILTERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tagPill, selectedTag === t && s.tagPillActive]}
            onPress={() => setSelectedTag(selectedTag === t ? null : t)}
            accessibilityRole="button"
          >
            <Text style={[s.tagPillText, selectedTag === t && s.tagPillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured spot hero — only show when no filters active */}
      {!searchQuery && selectedType === 'All' && !selectedTag && (
        <View style={s.featuredSection}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionAccent} />
            <Text style={s.sectionTitle}>Top Rated</Text>
          </View>
          <TouchableOpacity
            style={s.featuredCard}
            onPress={() => router.push({ pathname: '/spot-details', params: { id: featuredSpot.id } } as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[...(SPOT_GRADIENTS[featuredSpot.type] || ['#1a2a3a', '#0f1924'])] as [string, string]}
              style={s.featuredGradient}
            >
              <MaterialCommunityIcons
                name={TYPE_ICONS[featuredSpot.type] as any}
                size={40} color="rgba(255,255,255,0.15)"
              />
            </LinearGradient>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={s.featuredOverlay}
            >
              <View style={s.featuredTopRow}>
                <View style={s.topRatedPill}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                  <Text style={s.topRatedText}>{featuredSpot.rating} · Top Rated</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleSaved(featuredSpot.id)}
                  style={s.featuredBookmark}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name={savedSpots.has(featuredSpot.id) ? 'bookmark' : 'bookmark-outline'}
                    size={20} color="#fff"
                  />
                </TouchableOpacity>
              </View>
              <View style={s.featuredBottom}>
                <Text style={s.featuredName}>{featuredSpot.name}</Text>
                <Text style={s.featuredMeta}>
                  {featuredSpot.type.charAt(0).toUpperCase() + featuredSpot.type.slice(1)} · {featuredSpot.country}
                </Text>
                <View style={s.featuredSpecies}>
                  {featuredSpot.species.slice(0, 3).map((sp) => (
                    <View key={sp} style={s.featuredSpeciesChip}>
                      <Text style={s.featuredSpeciesText}>{sp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* List header */}
      <View style={s.sectionHeaderRow}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>{searchQuery || selectedType !== 'All' || selectedTag ? 'Results' : 'All Spots'}</Text>
        <Text style={s.sectionCount}>{filtered.length}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderSpot}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={!!selectedSpot} transparent animationType="slide" onRequestClose={() => setSelectedSpot(null)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setSelectedSpot(null)} />
        {selectedSpot && <SpotCard spot={selectedSpot} onClose={() => setSelectedSpot(null)} />}
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  sessionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: spacing.lg, marginTop: spacing.sm,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  sessionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  sessionText: { flex: 1, fontSize: 13, color: colors.primary, fontWeight: '600' },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  nearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
    marginTop: 4,
  },
  nearText: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  searchRow: {
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

  pillsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9, minHeight: 36,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#051410', fontWeight: '700' },

  tagPill: {
    paddingHorizontal: 14, paddingVertical: 7, minHeight: 32,
    borderRadius: radius.full, backgroundColor: 'transparent',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tagPillActive: { borderColor: colors.secondary, backgroundColor: 'rgba(245,158,11,0.1)' },
  tagPillText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tagPillTextActive: { color: colors.secondary },

  featuredSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },

  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: 12, marginTop: 4,
  },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sectionCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  featuredCard: {
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    ...elevation.card,
    height: 200,
  },
  featuredGradient: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRatedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
  },
  topRatedText: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  featuredBookmark: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  featuredBottom: {},
  featuredName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 3 },
  featuredMeta: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  featuredSpecies: { flexDirection: 'row', gap: 6 },
  featuredSpeciesChip: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  featuredSpeciesText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },

  spotCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg, marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  spotPhoto: {
    width: 80, alignItems: 'center', justifyContent: 'center',
    minHeight: 88,
  },
  spotBody: { flex: 1, paddingHorizontal: 12, paddingVertical: 12 },
  spotTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  spotName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  bookmarkBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  spotMeta: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  spotBottomRow: { flexDirection: 'row', alignItems: 'center' },
  speciesRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  speciesChip: {
    backgroundColor: colors.surface2, borderRadius: radius.xs,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  speciesText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
  moreText: { fontSize: 11, color: colors.textTertiary },
  spotRightBadges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: colors.secondary },
  diffBadge: {
    width: 22, height: 22, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  diffText: { fontSize: 10, fontWeight: '800' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
});
