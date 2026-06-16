import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WORLD_SPOTS, WorldSpot } from '../../data/worldSpots';
import { SpotCard } from '../../components/map/SpotCard';
import { colors, radius, spacing, elevation } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

const TYPE_FILTERS = ['All', 'Sea', 'Lake', 'River', 'Ocean', 'Reservoir'];
const TAG_FILTERS = ['Carp', 'Predator', 'Beginner Friendly'];

const SPOT_GRADIENTS: Record<string, [string, string]> = {
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
      (selectedTag === 'Beginner Friendly' && s.difficulty === 'beginner') ||
      (selectedTag === 'Carp' && s.species.some(sp => sp.toLowerCase().includes('carp'))) ||
      (selectedTag === 'Predator' && s.species.some(sp => ['pike', 'perch', 'zander', 'bass', 'predator'].some(p => sp.toLowerCase().includes(p))));
    return matchType && matchSearch && matchTag;
  }), [selectedType, searchQuery, selectedTag]);

  const toggleSaved = (id: string) => {
    setSavedSpots(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Active session banner */}
      {activeSession && (
        <TouchableOpacity style={s.sessionBanner} onPress={() => router.push('/session' as any)} activeOpacity={0.85}>
          <View style={s.sessionDot} />
          <Text style={s.sessionText}>Session in progress · {activeSession.spotName}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Search spots..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={s.filterIconBtn}>
          <MaterialCommunityIcons name="tune-variant" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Type filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
        {TYPE_FILTERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.pill, selectedType === t && s.pillActive]}
            onPress={() => setSelectedType(t)}
          >
            <Text style={[s.pillText, selectedType === t && s.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tag filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
        {TAG_FILTERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.pill, selectedTag === t && s.pillActive]}
            onPress={() => setSelectedTag(selectedTag === t ? null : t)}
          >
            <Text style={[s.pillText, selectedTag === t && s.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Spot list */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {filtered.map((spot) => {
          const grad = SPOT_GRADIENTS[spot.type] || ['#1a2a3a', '#0f1924'];
          const isSaved = savedSpots.has(spot.id);
          return (
            <TouchableOpacity
              key={spot.id}
              style={s.spotCard}
              onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
              activeOpacity={0.85}
            >
              {/* Photo thumbnail */}
              <LinearGradient colors={grad} style={s.spotPhoto}>
                <MaterialCommunityIcons
                  name={TYPE_ICONS[spot.type] as any}
                  size={22} color="rgba(255,255,255,0.25)"
                />
              </LinearGradient>

              {/* Info */}
              <View style={s.spotInfo}>
                <Text style={s.spotName} numberOfLines={1}>{spot.name}</Text>
                <Text style={s.spotSub} numberOfLines={1}>
                  {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)} · {spot.country}
                </Text>
                <View style={s.speciesRow}>
                  {spot.species.slice(0, 3).map((sp) => (
                    <MaterialCommunityIcons key={sp} name="fish" size={13} color={colors.textTertiary} />
                  ))}
                  {spot.species.length > 3 && (
                    <Text style={s.moreText}>+{spot.species.length - 3}</Text>
                  )}
                </View>
              </View>

              {/* Right: bookmark + rating */}
              <View style={s.spotRight}>
                <TouchableOpacity onPress={() => toggleSaved(spot.id)} style={s.bookmarkBtn}>
                  <MaterialCommunityIcons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={20} color={isSaved ? colors.secondary : colors.textSecondary}
                  />
                </TouchableOpacity>
                <View style={s.ratingRow}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                  <Text style={s.ratingText}>{spot.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Spot detail modal */}
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
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: radius.md, padding: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  sessionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  sessionText: { flex: 1, fontSize: 13, color: colors.primary, fontWeight: '600' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  filterIconBtn: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 10,
  },

  pillsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: colors.background },

  spotCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  spotPhoto: {
    width: 80, height: 80, alignItems: 'center', justifyContent: 'center',
  },
  spotInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  spotName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  spotSub: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  speciesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moreText: { fontSize: 11, color: colors.textTertiary },

  spotRight: { alignItems: 'center', paddingRight: 14, gap: 8 },
  bookmarkBtn: { padding: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.secondary },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
});
