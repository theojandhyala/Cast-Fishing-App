import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WORLD_SPOTS, WorldSpot } from '../../data/worldSpots';
import { SpotCard } from '../../components/map/SpotCard';
import { colors, radius, spacing, typography, fonts } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

const { height } = Dimensions.get('window');

const CONTINENTS = ['All', 'Europe', 'Americas', 'Asia', 'Africa', 'Oceania'];
const TYPES = ['All', 'River', 'Lake', 'Sea', 'Ocean', 'Reservoir', 'Estuary'];

const typeIcons: Record<string, string> = {
  river: 'waves',
  lake: 'water',
  sea: 'anchor',
  reservoir: 'water-pump',
  ocean: 'sail-boat',
  estuary: 'water-outline',
  private: 'lock',
};

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export default function MapScreen() {
  const router = useRouter();
  const { activeSession } = useSessionStore();
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<WorldSpot | null>(null);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotCountry, setNewSpotCountry] = useState('');
  const [newSpotDesc, setNewSpotDesc] = useState('');
  const [userSpots, setUserSpots] = useState<WorldSpot[]>([]);

  const allSpots = useMemo(() => [...WORLD_SPOTS, ...userSpots], [userSpots]);

  const filtered = useMemo(() => allSpots.filter((s) => {
    const matchContinent = selectedContinent === 'All' || s.continent === selectedContinent;
    const matchType = selectedType === 'All' || s.type === selectedType.toLowerCase();
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchContinent && matchType && matchSearch;
  }), [allSpots, selectedContinent, selectedType, searchQuery]);

  const handleAddSpot = () => {
    if (!newSpotName.trim()) return;
    const newSpot: WorldSpot = {
      id: `user_${Date.now()}`,
      name: newSpotName,
      country: newSpotCountry || 'Unknown',
      region: 'User Added',
      continent: 'Europe',
      type: 'river',
      latitude: 51.5,
      longitude: -0.1,
      species: [],
      bestBait: [],
      bestSeason: ['Year-round'],
      rating: 0,
      permitRequired: false,
      difficulty: 'beginner',
      description: newSpotDesc,
      tips: '',
      facilities: [],
    };
    setUserSpots(prev => [newSpot, ...prev]);
    setNewSpotName('');
    setNewSpotCountry('');
    setNewSpotDesc('');
    setShowAddSpot(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fishing Spots</Text>
        <Text style={styles.subtitle}>{allSpots.length} SPOTS WORLDWIDE</Text>
      </View>

      {activeSession && (
        <TouchableOpacity style={styles.resumeBanner} onPress={() => router.push('/session')} activeOpacity={0.85}>
          <View style={styles.resumeDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeLabel}>SESSION IN PROGRESS</Text>
            <Text style={styles.resumeSpot}>{activeSession.spotName}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search spots, countries, regions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Continent filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {CONTINENTS.map((c) => (
          <TouchableOpacity key={c} style={[styles.chip, selectedContinent === c && styles.chipActive]} onPress={() => setSelectedContinent(c)}>
            <Text style={[styles.chipText, selectedContinent === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, selectedType === t && styles.chipActive]} onPress={() => setSelectedType(t)}>
            <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Result count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>Showing {filtered.length} spots worldwide</Text>
        <TouchableOpacity style={styles.addSpotBtn} onPress={() => setShowAddSpot(true)}>
          <MaterialCommunityIcons name="plus" size={16} color={colors.background} />
          <Text style={styles.addSpotText}>Add Spot</Text>
        </TouchableOpacity>
      </View>

      {/* Spot list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filtered.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.spotRow}
            onPress={() => setSelectedSpot(spot)}
            activeOpacity={0.85}
          >
            <View style={[styles.spotTypeIcon, { borderColor: difficultyColors[spot.difficulty] + '44' }]}>
              <MaterialCommunityIcons
                name={typeIcons[spot.type] as any}
                size={20}
                color={difficultyColors[spot.difficulty]}
              />
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
              <Text style={styles.spotCountry} numberOfLines={1}>{spot.country} · {spot.region}</Text>
              <Text style={styles.spotSpecies} numberOfLines={1}>
                {spot.species.slice(0, 3).join(' · ')}
              </Text>
            </View>
            <View style={styles.spotMeta}>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                <Text style={styles.rating}>{spot.rating}</Text>
              </View>
              {spot.permitRequired && (
                <Text style={styles.permit}>Permit</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Spot detail bottom sheet */}
      <Modal
        visible={!!selectedSpot}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSpot(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedSpot(null)}
        />
        {selectedSpot && (
          <SpotCard
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
          />
        )}
      </Modal>

      {/* Add Spot Modal */}
      <Modal visible={showAddSpot} transparent animationType="slide" onRequestClose={() => setShowAddSpot(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAddSpot(false)} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md }}>Add a Spot</Text>
          <Text style={styles.inputLabel}>Spot Name *</Text>
          <TextInput style={styles.textInput} placeholder="e.g. River Thames, London" placeholderTextColor={colors.textSecondary} value={newSpotName} onChangeText={setNewSpotName} />
          <Text style={styles.inputLabel}>Country</Text>
          <TextInput style={styles.textInput} placeholder="e.g. United Kingdom" placeholderTextColor={colors.textSecondary} value={newSpotCountry} onChangeText={setNewSpotCountry} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Describe this spot..." placeholderTextColor={colors.textSecondary} value={newSpotDesc} onChangeText={setNewSpotDesc} multiline />
          <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg }} onPress={handleAddSpot}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.background }}>Save Spot</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 4,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(0,212,170,0.06)',
  },
  resumeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  resumeLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  resumeSpot: {
    ...typography.label,
    marginTop: 2,
  },
  mapContainer: {
    margin: spacing.lg,
    marginTop: spacing.sm,
  },
  mapPlaceholder: {
    backgroundColor: 'rgba(0,212,170,0.06)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    padding: spacing.lg,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  mapSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  mapPin: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pinLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    maxWidth: 80,
    textAlign: 'center',
  },
  mapNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  spotTypeIcon: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  spotCountry: {
    fontSize: 11,
    color: colors.primary,
    marginBottom: 2,
    fontWeight: '600',
  },
  spotSpecies: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  addSpotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  addSpotText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.background,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  permit: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
