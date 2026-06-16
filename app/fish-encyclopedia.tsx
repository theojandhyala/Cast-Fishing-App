import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { species as allSpecies } from '../data/species';
import { RarityBadge } from '../components/catches/RarityBadge';
import { colors, radius, spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.sm) / 2;

type RarityFilter = 'All' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
type WaterFilter = 'All' | 'Freshwater' | 'Saltwater';

const RARITY_FILTERS: RarityFilter[] = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const WATER_FILTERS: WaterFilter[] = ['All', 'Freshwater', 'Saltwater'];

export default function FishEncyclopediaScreen() {
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('All');
  const [waterFilter, setWaterFilter] = useState<WaterFilter>('All');
  const router = useRouter();

  const mythicSpecies = useMemo(() =>
    allSpecies.filter((s: any) => s.rarity === 'mythic'), []);

  const filtered = useMemo(() => allSpecies.filter((s: any) => {
    const matchRarity = rarityFilter === 'All' || s.rarity?.toLowerCase() === rarityFilter.toLowerCase();
    const matchWater = waterFilter === 'All' ||
      (waterFilter === 'Freshwater' && (s.type === 'coarse' || s.type === 'game')) ||
      (waterFilter === 'Saltwater' && s.type === 'sea');
    return matchRarity && matchWater;
  }), [rarityFilter, waterFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fish Encyclopedia</Text>
          <Text style={styles.subtitle}>{allSpecies.length} species catalogued</Text>
          <TouchableOpacity onPress={() => router.push('/fish-database')} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Browse All Fish (300+) →</Text>
          </TouchableOpacity>
        </View>

        {/* Mythic Featured */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mythic Catches</Text>
          <Text style={styles.sectionSub}>Extraordinarily rare species</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mythicScroll}>
          {mythicSpecies.map((s: any) => (
            <TouchableOpacity
              key={s.id}
              style={styles.mythicCard}
              onPress={() => router.push({ pathname: '/species-detail', params: { id: s.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.mythicStamp}>
                <Text style={styles.mythicStampText}>MYTHIC</Text>
              </View>
              <MaterialCommunityIcons name="fish" size={40} color={colors.textPrimary} style={styles.mythicEmoji} />
              <Text style={styles.mythicName} numberOfLines={1}>{s.name}</Text>
              <Text style={styles.mythicLatin} numberOfLines={1}>{s.latinName}</Text>
              <RarityBadge rarity={s.rarity} rarityColor={s.rarityColor} size="sm" />
              <View style={styles.mythicStats}>
                <Text style={styles.mythicStat}>Record: {s.recordWeight}kg</Text>
                <Text style={styles.mythicCatchRate}>Catch rate: {s.catchRate}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse All Species</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {RARITY_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, rarityFilter === f && styles.filterChipActive]}
              onPress={() => setRarityFilter(f)}
            >
              <Text style={[styles.filterChipText, rarityFilter === f && styles.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {WATER_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, waterFilter === f && styles.filterChipActive]}
              onPress={() => setWaterFilter(f)}
            >
              <Text style={[styles.filterChipText, waterFilter === f && styles.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Species Grid */}
        <View style={styles.grid}>
          {filtered.map((s: any) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.speciesCard,
                s.rarity === 'mythic' && styles.mythicSpeciesCard,
              ]}
              onPress={() => router.push({ pathname: '/species-detail', params: { id: s.id } })}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="fish" size={32} color={colors.textPrimary} style={styles.cardEmoji} />
              <Text style={styles.cardName} numberOfLines={2}>{s.name}</Text>
              <Text style={styles.cardLatin} numberOfLines={1}>{s.latinName}</Text>
              {s.rarity && (
                <RarityBadge rarity={s.rarity} rarityColor={s.rarityColor || '#9CA3AF'} size="sm" />
              )}
              <View style={styles.cardStats}>
                <Text style={styles.cardCatchRate}>{s.catchRate ?? '?'}% catch</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  sectionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  mythicScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  mythicCard: {
    width: 160,
    backgroundColor: '#1a0a1a',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#EC4899',
    alignItems: 'center',
    position: 'relative',
  },
  mythicStamp: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  mythicStampText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  mythicEmoji: { fontSize: 40, marginTop: spacing.sm, marginBottom: spacing.xs },
  mythicName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  mythicLatin: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.xs },
  mythicStats: { marginTop: spacing.xs, alignItems: 'center' },
  mythicStat: { fontSize: 11, color: colors.textSecondary },
  mythicCatchRate: { fontSize: 11, color: '#EC4899', fontWeight: '700' },
  filterRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.primary },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, gap: spacing.sm,
  },
  speciesCard: {
    width: CARD_WIDTH, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  mythicSpeciesCard: {
    borderColor: '#EC4899', backgroundColor: '#1a0a1a',
  },
  cardEmoji: { fontSize: 32, marginBottom: spacing.xs },
  cardName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 2 },
  cardLatin: { fontSize: 10, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.xs, textAlign: 'center' },
  cardStats: { marginTop: spacing.xs },
  cardCatchRate: { fontSize: 11, color: colors.textSecondary },
});
