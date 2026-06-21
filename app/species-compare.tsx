import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { species as allSpecies } from '../data/species';
import { RarityBadge } from '../components/catches/RarityBadge';
import { colors, radius, spacing } from '../constants/theme';

const difficultyRank: Record<string, number> = { beginner: 1, intermediate: 2, expert: 3 };

export default function SpeciesCompareScreen() {
  const [speciesA, setSpeciesA] = useState<string>('carp');
  const [speciesB, setSpeciesB] = useState<string>('pike');
  const [showPickerA, setShowPickerA] = useState(false);
  const [showPickerB, setShowPickerB] = useState(false);

  const fishA = allSpecies.find(s => s.id === speciesA) as any;
  const fishB = allSpecies.find(s => s.id === speciesB) as any;

  const rarityRank: Record<string, number> = {
    common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6
  };

  const harderFish = (() => {
    if (!fishA || !fishB) return null;
    const scoreA = (difficultyRank[fishA.difficulty] || 1) + (rarityRank[fishA.rarity] || 1);
    const scoreB = (difficultyRank[fishB.difficulty] || 1) + (rarityRank[fishB.rarity] || 1);
    if (scoreA > scoreB) return fishA;
    if (scoreB > scoreA) return fishB;
    return null;
  })();

  const rows = [
    {
      label: 'Rarity',
      renderA: (f: any) => <RarityBadge rarity={f.rarity || 'common'} rarityColor={f.rarityColor || '#9CA3AF'} size="sm" />,
      renderB: (f: any) => <RarityBadge rarity={f.rarity || 'common'} rarityColor={f.rarityColor || '#9CA3AF'} size="sm" />,
    },
    {
      label: 'Difficulty',
      renderA: (f: any) => <Text style={styles.compareValue}>{f.difficulty}</Text>,
      renderB: (f: any) => <Text style={styles.compareValue}>{f.difficulty}</Text>,
    },
    {
      label: 'Avg Weight',
      renderA: (f: any) => <Text style={styles.compareValue}>{f.averageWeight}</Text>,
      renderB: (f: any) => <Text style={styles.compareValue}>{f.averageWeight}</Text>,
    },
    {
      label: 'Record',
      renderA: (f: any) => <Text style={styles.compareValue}>{f.recordWeight}kg</Text>,
      renderB: (f: any) => <Text style={styles.compareValue}>{f.recordWeight}kg</Text>,
    },
    {
      label: 'Legal Size',
      renderA: (f: any) => <Text style={styles.compareValue}>{f.legalSize}cm</Text>,
      renderB: (f: any) => <Text style={styles.compareValue}>{f.legalSize}cm</Text>,
    },
    {
      label: 'Best Season',
      renderA: (f: any) => <Text style={styles.compareValue} numberOfLines={2}>{f.bestSeasons?.join(', ')}</Text>,
      renderB: (f: any) => <Text style={styles.compareValue} numberOfLines={2}>{f.bestSeasons?.join(', ')}</Text>,
    },
    {
      label: 'Top Bait',
      renderA: (f: any) => <Text style={styles.compareValue} numberOfLines={2}>{f.baits?.[0]?.name || '—'}</Text>,
      renderB: (f: any) => <Text style={styles.compareValue} numberOfLines={2}>{f.baits?.[0]?.name || '—'}</Text>,
    },
    {
      label: 'Catch Rate',
      renderA: (f: any) => <Text style={[styles.compareValue, { color: colors.primary }]}>{f.catchRate ?? '?'}%</Text>,
      renderB: (f: any) => <Text style={[styles.compareValue, { color: colors.primary }]}>{f.catchRate ?? '?'}%</Text>,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Species Compare</Text>
          <Text style={styles.subtitle}>Compare any two species side by side</Text>
        </View>

        {/* Pickers */}
        <View style={styles.pickerRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => { setShowPickerA(!showPickerA); setShowPickerB(false); }}>
              <MaterialCommunityIcons name="fish" size={20} color={colors.textPrimary} style={styles.pickerEmoji} />
              <Text style={styles.pickerName} numberOfLines={1}>{fishA?.commonName}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            {showPickerA && (
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {allSpecies.map(s => (
                  <TouchableOpacity key={s.id} style={styles.dropdownItem} onPress={() => { setSpeciesA(s.id); setShowPickerA(false); }}>
                    <MaterialCommunityIcons name="fish" size={16} color={colors.textSecondary} style={styles.dropdownEmoji} />
                    <Text style={[styles.dropdownText, speciesA === s.id && { color: colors.primary }]}>{s.commonName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => { setShowPickerB(!showPickerB); setShowPickerA(false); }}>
              <MaterialCommunityIcons name="fish" size={20} color={colors.textPrimary} style={styles.pickerEmoji} />
              <Text style={styles.pickerName} numberOfLines={1}>{fishB?.commonName}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            {showPickerB && (
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {allSpecies.map(s => (
                  <TouchableOpacity key={s.id} style={styles.dropdownItem} onPress={() => { setSpeciesB(s.id); setShowPickerB(false); }}>
                    <MaterialCommunityIcons name="fish" size={16} color={colors.textSecondary} style={styles.dropdownEmoji} />
                    <Text style={[styles.dropdownText, speciesB === s.id && { color: colors.primary }]}>{s.commonName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Comparison Table */}
        {fishA && fishB && (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeader, { flex: 2, textAlign: 'left' }]}>Stat</Text>
              <Text style={[styles.tableHeader, { flex: 2, textAlign: 'center' }]}>{fishA.commonName}</Text>
              <Text style={[styles.tableHeader, { flex: 2, textAlign: 'center' }]}>{fishB.commonName}</Text>
            </View>
            {rows.map(row => (
              <View key={row.label} style={styles.tableRow}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <View style={styles.rowCell}>{row.renderA(fishA)}</View>
                <View style={styles.rowCell}>{row.renderB(fishB)}</View>
              </View>
            ))}
          </View>
        )}

        {/* Conclusion */}
        {harderFish && (
          <View style={styles.conclusionCard}>
            <MaterialCommunityIcons name="fish" size={40} color={colors.primary} style={styles.conclusionEmoji} />
            <View>
              <Text style={styles.conclusionTitle}>{harderFish.name} is harder to catch</Text>
              <Text style={styles.conclusionText}>
                Higher rarity + difficulty rating makes {harderFish.commonName} the greater challenge.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md,
  },
  pickerBtn: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  pickerEmoji: { fontSize: 20 },
  pickerName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  vsCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, marginTop: 12,
  },
  vsText: { fontSize: 13, fontWeight: '900', color: colors.textSecondary },
  dropdownScroll: {
    maxHeight: 200, backgroundColor: colors.surface2,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    marginTop: 4,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, gap: spacing.sm },
  dropdownEmoji: { fontSize: 16 },
  dropdownText: { fontSize: 13, color: colors.textSecondary },
  table: { marginHorizontal: spacing.lg, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: colors.surface2, padding: spacing.md },
  tableHeader: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, flex: 2, textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  rowLabel: { flex: 2, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  rowCell: { flex: 2, alignItems: 'center' },
  compareValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', textAlign: 'center' },
  conclusionCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
  },
  conclusionEmoji: { fontSize: 40 },
  conclusionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  conclusionText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
