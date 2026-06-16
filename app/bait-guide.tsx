import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BAITS, BAIT_CATEGORIES, BaitItem } from '../data/baitData';
import { colors, spacing, radius } from '../constants/theme';

const TARGET_SPECIES = ['Carp', 'Pike', 'Perch', 'Barbel', 'Tench', 'Bream', 'Roach', 'Chub', 'Trout', 'Zander'];

const BAIT_ICONS: Record<string, string> = {
  boilies: 'circle',
  pellets: 'circle-small',
  corn: 'corn',
  'luncheon-meat': 'food-steak',
  maggots: 'worm',
  worms: 'worm',
  bread: 'bread-slice',
  spinners: 'star-four-points',
  'soft-plastics': 'fish',
  'dry-flies': 'butterfly',
  nymphs: 'bug',
  'mackerel-deadbait': 'fish',
  hemp: 'sprout',
  groundbait: 'water',
  'tiger-nuts': 'peanut',
  paste: 'circle',
};

export default function BaitGuideScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'guide' | 'match'>('guide');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBait, setSelectedBait] = useState<BaitItem | null>(null);
  const [targetSpecies, setTargetSpecies] = useState('');
  const [sessionHours, setSessionHours] = useState('4');

  const filtered = BAITS.filter(b => activeCategory === 'All' || b.category === activeCategory);

  const matchedBaits = targetSpecies
    ? BAITS
        .filter(b => b.speciesEffectiveness[targetSpecies] !== undefined)
        .sort((a, b) => (b.speciesEffectiveness[targetSpecies] || 0) - (a.speciesEffectiveness[targetSpecies] || 0))
        .slice(0, 6)
    : [];

  const groundbaitAmount = Math.round(parseFloat(sessionHours || '4') * 0.4 * 10) / 10;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(16,185,129,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bait Guide</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.tabs}>
        {(['guide', 'match'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MaterialCommunityIcons
                name={t === 'guide' ? 'book-open-variant' : 'target'}
                size={14}
                color={tab === t ? '#0A0E1A' : colors.textSecondary}
              />
              <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                {t === 'guide' ? 'Bait Guide' : 'Bait Match'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'guide' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {['All', ...BAIT_CATEGORIES].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.baitList}>
              {filtered.map(bait => (
                <TouchableOpacity
                  key={bait.id}
                  style={[styles.baitCard, selectedBait?.id === bait.id && styles.baitCardActive]}
                  onPress={() => setSelectedBait(selectedBait?.id === bait.id ? null : bait)}
                >
                  <View style={styles.baitHeader}>
                    <MaterialCommunityIcons name={(BAIT_ICONS[bait.id] || 'circle') as any} size={28} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.baitName}>{bait.name}</Text>
                      <Text style={styles.baitCategory}>{bait.category}</Text>
                    </View>
                    <View style={styles.baitSeasons}>
                      {bait.seasons.slice(0, 2).map(s => (
                        <View key={s} style={styles.seasonBadge}>
                          <Text style={styles.seasonText}>{s.slice(0, 3)}</Text>
                        </View>
                      ))}
                    </View>
                    <MaterialCommunityIcons
                      name={selectedBait?.id === bait.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>

                  {selectedBait?.id === bait.id && (
                    <View style={styles.baitDetail}>
                      <Text style={styles.baitDesc}>{bait.description}</Text>

                      <Text style={styles.detailLabel}>Best Species</Text>
                      <View style={styles.speciesList}>
                        {bait.bestSpecies.map(s => (
                          <View key={s} style={styles.speciesBadge}>
                            <Text style={styles.speciesBadgeText}>{s}</Text>
                          </View>
                        ))}
                      </View>

                      <Text style={styles.detailLabel}>How to Use</Text>
                      <Text style={styles.detailText}>{bait.howToUse}</Text>

                      <Text style={styles.detailLabel}>Rig Recommendations</Text>
                      <View style={styles.speciesList}>
                        {bait.rigRecommendations.map(r => (
                          <View key={r} style={[styles.speciesBadge, { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.3)' }]}>
                            <Text style={[styles.speciesBadgeText, { color: '#60A5FA' }]}>{r}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.prepCard}>
                        <MaterialCommunityIcons name="information-outline" size={16} color={colors.warning} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.prepTitle}>Preparation Tips</Text>
                          <Text style={styles.prepText}>{bait.preparationTips}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.matchContent}>
            <Text style={styles.matchTitle}>What are you targeting?</Text>
            <View style={styles.speciesGrid}>
              {TARGET_SPECIES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speciesBtn, targetSpecies === s && styles.speciesBtnActive]}
                  onPress={() => setTargetSpecies(targetSpecies === s ? '' : s)}
                >
                  <Text style={[styles.speciesBtnText, targetSpecies === s && styles.speciesBtnTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {targetSpecies && matchedBaits.length > 0 && (
              <>
                <Text style={styles.matchResultTitle}>Best Baits for {targetSpecies}</Text>
                {matchedBaits.map((bait, i) => {
                  const score = bait.speciesEffectiveness[targetSpecies] || 0;
                  return (
                    <View key={bait.id} style={styles.matchCard}>
                      <Text style={styles.matchRank}>#{i + 1}</Text>
                      <MaterialCommunityIcons name={(BAIT_ICONS[bait.id] || 'circle') as any} size={24} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchBaitName}>{bait.name}</Text>
                        <View style={styles.scoreBar}>
                          <View style={[styles.scoreBarFill, { width: `${score * 10}%`, backgroundColor: score >= 8 ? colors.success : score >= 6 ? colors.warning : colors.primary }]} />
                        </View>
                        <Text style={styles.matchBaitTip} numberOfLines={1}>{bait.howToUse}</Text>
                      </View>
                      <Text style={[styles.matchScore, { color: score >= 8 ? colors.success : score >= 6 ? colors.warning : colors.primary }]}>{score}/10</Text>
                    </View>
                  );
                })}
              </>
            )}

            {/* Groundbait calculator */}
            <View style={styles.calcSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="scale-balance" size={16} color={colors.textPrimary} />
                <Text style={styles.calcTitle}>Groundbait Calculator</Text>
              </View>
              <Text style={styles.calcDesc}>How many hours is your session?</Text>
              <View style={styles.calcRow}>
                <TextInput
                  style={styles.calcInput}
                  value={sessionHours}
                  onChangeText={setSessionHours}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.calcUnit}>hours</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} />
                <Text style={styles.calcResult}>{groundbaitAmount} kg</Text>
              </View>
              <Text style={styles.calcNote}>Based on 400g/hr — adjust for swim size and feeding activity.</Text>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  activeTabText: { color: '#0A0E1A' },
  catScroll: { marginBottom: spacing.sm },
  catContent: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  catChipActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  catChipText: { fontSize: 13, color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: '600' },
  baitList: { paddingHorizontal: spacing.lg },
  baitCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  baitCardActive: { borderColor: colors.primary },
  baitHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  baitName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  baitCategory: { fontSize: 12, color: colors.textSecondary },
  baitSeasons: { flexDirection: 'row', gap: 3 },
  seasonBadge: { backgroundColor: colors.surface2, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  seasonText: { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
  baitDetail: { padding: spacing.md, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.border },
  baitDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 20 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: spacing.sm },
  detailText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  speciesList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  speciesBadge: { backgroundColor: 'rgba(0,212,170,0.15)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)' },
  speciesBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  prepCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.sm, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  prepTitle: { fontSize: 12, fontWeight: '700', color: colors.warning, marginBottom: 2 },
  prepText: { fontSize: 12, color: colors.textSecondary },
  matchContent: { paddingHorizontal: spacing.lg },
  matchTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  speciesBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  speciesBtnActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  speciesBtnText: { fontSize: 13, color: colors.textSecondary },
  speciesBtnTextActive: { color: colors.primary, fontWeight: '600' },
  matchResultTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  matchCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  matchRank: { fontSize: 16, fontWeight: '800', color: colors.textSecondary, width: 28, textAlign: 'center' },
  matchBaitName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  scoreBar: { height: 4, backgroundColor: colors.surface2, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  scoreBarFill: { height: '100%', borderRadius: 2 },
  matchBaitTip: { fontSize: 11, color: colors.textSecondary },
  matchScore: { fontSize: 18, fontWeight: '800', minWidth: 36, textAlign: 'right' },
  calcSection: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  calcTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  calcDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  calcRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  calcInput: { backgroundColor: colors.surface2, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 18, fontWeight: '700', color: colors.primary, width: 80, textAlign: 'center', borderWidth: 1, borderColor: colors.border },
  calcUnit: { fontSize: 14, color: colors.textSecondary },
  calcResult: { fontSize: 22, fontWeight: '800', color: colors.primary },
  calcNote: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
});
