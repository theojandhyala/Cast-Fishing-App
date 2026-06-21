import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, FlatList, Dimensions,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GLOBAL_FISH_DATABASE, GlobalFish, RARITY_ORDER } from '../data/globalFishDatabase';
import { colors, radius, spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.sm) / 2;

const RARITY_LABELS: Record<GlobalFish['rarity'], string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

const TYPE_LABELS: Record<GlobalFish['type'], string> = {
  freshwater: 'Freshwater',
  saltwater: 'Saltwater',
  game: 'Game',
  coarse: 'Coarse',
  sea: 'Sea',
  tropical: 'Tropical',
  migratory: 'Migratory',
};

const DIFFICULTY_COLORS = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export default function FishDatabaseScreen() {
  const [search, setSearch] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<GlobalFish['rarity'] | 'all'>('all');
  const [selectedType, setSelectedType] = useState<GlobalFish['type'] | 'all'>('all');
  const [selectedFish, setSelectedFish] = useState<GlobalFish | null>(null);

  const filtered = useMemo(() => {
    let list = GLOBAL_FISH_DATABASE;
    if (selectedRarity !== 'all') list = list.filter(f => f.rarity === selectedRarity);
    if (selectedType !== 'all') list = list.filter(f => f.type === selectedType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.latinName.toLowerCase().includes(q) ||
        f.regions.some(r => r.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, selectedRarity, selectedType]);

  const rarityChips = (['all', ...RARITY_ORDER] as const);
  const typeChips = (['all', ...Object.keys(TYPE_LABELS)] as const);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Fish Database</Text>
          <Text style={styles.subtitle}>{GLOBAL_FISH_DATABASE.length} species worldwide</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, species, region..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rarity filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {rarityChips.map(r => {
          const color = r === 'all' ? colors.primary : GLOBAL_FISH_DATABASE.find(f => f.rarity === r)?.rarityColor ?? colors.primary;
          const active = selectedRarity === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.chip, active && { backgroundColor: color + '22', borderColor: color }]}
              onPress={() => setSelectedRarity(r as any)}
            >
              {r !== 'all' && <View style={[styles.rarityDot, { backgroundColor: color }]} />}
              <Text style={[styles.chipText, active && { color }]}>
                {r === 'all' ? 'All Rarities' : RARITY_LABELS[r as GlobalFish['rarity']]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {typeChips.map(t => {
          const active = selectedType === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSelectedType(t as any)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t === 'all' ? 'All Types' : TYPE_LABELS[t as GlobalFish['type']]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.countLabel}>Showing {filtered.length} species</Text>

      {/* Fish grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: spacing.sm }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.fishCard, { width: CARD_WIDTH, borderColor: item.rarityColor + '44' }]}
            onPress={() => setSelectedFish(item)}
            activeOpacity={0.85}
          >
            <View style={[styles.rarityBar, { backgroundColor: item.rarityColor }]} />
            <MaterialCommunityIcons name="fish" size={32} color={item.rarityColor} style={styles.fishIcon} />
            <Text style={styles.fishName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.fishLatin} numberOfLines={1}>{item.latinName}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.rarityBadge, { backgroundColor: item.rarityColor + '22' }]}>
                <Text style={[styles.rarityText, { color: item.rarityColor }]}>
                  {item.rarity === 'mythic' ? 'MYTHIC' : RARITY_LABELS[item.rarity].toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.cardStats}>
              <View style={styles.statLabelRow}>
                <MaterialCommunityIcons name="scale-balance" size={12} color={colors.textSecondary} />
                <Text style={styles.statLabel}>{item.averageWeight}</Text>
              </View>
              <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] }]} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="fish-off" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No fish found</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedFish} transparent animationType="slide" onRequestClose={() => setSelectedFish(null)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setSelectedFish(null)} />
        {selectedFish && (
          <ScrollView style={styles.detailSheet} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailHandle} />
            {/* Header */}
            <View style={styles.detailHeader}>
              <MaterialCommunityIcons name="fish" size={40} color={selectedFish.rarityColor} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailName}>{selectedFish.name}</Text>
                <Text style={styles.detailLatin}>{selectedFish.latinName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFish(null)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Rarity badge */}
            <View style={[styles.detailRarityRow, { backgroundColor: selectedFish.rarityColor + '18' }]}>
              <View style={[styles.rarityDot, { backgroundColor: selectedFish.rarityColor, width: 10, height: 10, borderRadius: 5 }]} />
              <Text style={[styles.detailRarityText, { color: selectedFish.rarityColor }]}>
                {selectedFish.rarity === 'mythic' ? 'MYTHIC' : RARITY_LABELS[selectedFish.rarity].toUpperCase()}
              </Text>
              <Text style={styles.typeTag}>{TYPE_LABELS[selectedFish.type]}</Text>
            </View>

            <Text style={styles.detailDescription}>{selectedFish.description}</Text>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>AVG WEIGHT</Text>
                <Text style={styles.statBoxValue}>{selectedFish.averageWeight}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>RECORD</Text>
                <Text style={styles.statBoxValue}>{selectedFish.recordWeight}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>DIFFICULTY</Text>
                <Text style={[styles.statBoxValue, { color: DIFFICULTY_COLORS[selectedFish.difficulty] }]}>
                  {selectedFish.difficulty.charAt(0).toUpperCase() + selectedFish.difficulty.slice(1)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>CATCH RATE</Text>
                <Text style={styles.statBoxValue}>{selectedFish.catchRate}%</Text>
              </View>
            </View>

            {/* Catch rate bar */}
            <View style={styles.catchBarContainer}>
              <View style={[styles.catchBarFill, { width: `${selectedFish.catchRate}%`, backgroundColor: selectedFish.rarityColor }]} />
            </View>

            {/* Habitat */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>HABITAT</Text>
              <Text style={styles.sectionValue}>{selectedFish.habitat}</Text>
            </View>

            {/* Regions */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>FOUND IN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.regionChips}>
                  {selectedFish.regions.map(r => (
                    <View key={r} style={styles.regionChip}>
                      <Text style={styles.regionChipText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Best Bait */}
            {selectedFish.bestBait.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>BEST BAIT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.regionChips}>
                    {selectedFish.bestBait.map(b => (
                      <View key={b} style={[styles.regionChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '44' }]}>
                        <Text style={[styles.regionChipText, { color: colors.primary }]}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Best Season */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>BEST SEASON</Text>
              <Text style={styles.sectionValue}>{selectedFish.bestSeason.join(' · ')}</Text>
            </View>

            {/* Best Time */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>BEST TIME</Text>
              <Text style={styles.sectionValue}>{selectedFish.bestTime}</Text>
            </View>

            {/* Legal size if applicable */}
            {selectedFish.legalSize && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>MINIMUM LEGAL SIZE</Text>
                <Text style={[styles.sectionValue, { color: colors.danger }]}>{selectedFish.legalSize}cm</Text>
              </View>
            )}

            {/* Pro Tip */}
            <View style={styles.tipBox}>
              <MaterialCommunityIcons name="lightbulb" size={16} color={colors.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>PRO TIP</Text>
                <Text style={styles.tipText}>{selectedFish.tip}</Text>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  searchRow: {
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
  filterScroll: { flexGrow: 0 },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  rarityDot: { width: 7, height: 7, borderRadius: 3.5 },
  countLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  grid: { paddingHorizontal: spacing.lg },
  fishCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  rarityBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  fishIcon: { alignSelf: 'center', marginTop: 8, marginBottom: 4 },
  fishName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  fishLatin: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
  cardMeta: { alignItems: 'center', marginTop: 6 },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  rarityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statLabel: { fontSize: 10, color: colors.textSecondary },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  detailSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  detailContent: { padding: spacing.lg },
  detailHandle: {
    width: 40, height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },

  detailName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  detailLatin: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  detailRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  detailRarityText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.8, flex: 1 },
  typeTag: {
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  detailDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  statBoxLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  statBoxValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  catchBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  catchBarFill: { height: 4, borderRadius: 2 },
  detailSection: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionValue: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  regionChips: { flexDirection: 'row', gap: spacing.xs },
  regionChip: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  regionChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  tipTitle: { fontSize: 10, fontWeight: '800', color: colors.secondary, letterSpacing: 0.5, marginBottom: 3 },
  tipText: { fontSize: 13, color: colors.secondary, lineHeight: 19 },
});
