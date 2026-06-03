import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { FISH_RECORDS } from '../data/worldRecords';
import { colors, spacing, radius } from '../constants/theme';

const SPECIES_LIST = [
  { id: 'carp', name: 'Common Carp', emoji: '🐟' },
  { id: 'pike', name: 'Pike', emoji: '🦷' },
  { id: 'perch', name: 'Perch', emoji: '🎣' },
  { id: 'tench', name: 'Tench', emoji: '🌿' },
  { id: 'bream', name: 'Bream', emoji: '🫧' },
  { id: 'roach', name: 'Roach', emoji: '🔴' },
  { id: 'barbel', name: 'Barbel', emoji: '💪' },
  { id: 'chub', name: 'Chub', emoji: '🌊' },
  { id: 'salmon', name: 'Salmon', emoji: '🐠' },
  { id: 'seabass', name: 'Sea Bass', emoji: '🌊' },
  { id: 'rainbowTrout', name: 'Rainbow Trout', emoji: '🌈' },
  { id: 'brownTrout', name: 'Brown Trout', emoji: '🟤' },
  { id: 'zander', name: 'Zander', emoji: '🦈' },
  { id: 'eel', name: 'Eel', emoji: '🐍' },
  { id: 'crucianCarp', name: 'Crucian Carp', emoji: '🟡' },
  { id: 'rudd', name: 'Rudd', emoji: '🔴' },
  { id: 'dace', name: 'Dace', emoji: '💨' },
  { id: 'gudgeon', name: 'Gudgeon', emoji: '⚪' },
  { id: 'flounder', name: 'Flounder', emoji: '🐡' },
  { id: 'bleak', name: 'Bleak', emoji: '⚡' },
];

export default function RecordsScreen() {
  const router = useRouter();
  const { getStats } = useCatchStore();
  const stats = getStats();
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  const speciesWithPB = SPECIES_LIST.filter(s => {
    const key = s.name.split(' ').map((w, i) => i === 0 ? w.toLowerCase() : w).join('');
    return stats.personalBests[s.name] || stats.personalBests[s.name.split(' ')[0]];
  });

  const getPB = (speciesName: string): number => {
    return stats.personalBests[speciesName] || stats.personalBests[speciesName.split(' ')[0]] || 0;
  };

  const selected = selectedSpecies ? SPECIES_LIST.find(s => s.id === selectedSpecies) : null;
  const selectedRecord = selectedSpecies ? FISH_RECORDS[selectedSpecies] : null;
  const selectedPB = selected ? getPB(selected.name) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(245,158,11,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Records & PBs</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Your Personal Bests */}
        {Object.keys(stats.personalBests).length > 0 && (
          <View style={styles.pbSection}>
            <Text style={styles.sectionTitle}>🏆 Your Personal Bests</Text>
            {Object.entries(stats.personalBests).map(([sp, weight]) => {
              const spData = SPECIES_LIST.find(s => s.name === sp || s.name.startsWith(sp));
              const record = spData ? FISH_RECORDS[spData.id] : null;
              const ukPct = record ? Math.round((weight / record.ukRecord.weightKg) * 100) : null;
              return (
                <View key={sp} style={styles.pbCard}>
                  <Text style={styles.pbEmoji}>{spData?.emoji || '🐟'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pbSpecies}>{sp}</Text>
                    <Text style={styles.pbWeight}>{weight} kg</Text>
                    {ukPct !== null && (
                      <View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${Math.min(100, ukPct)}%`, backgroundColor: ukPct >= 80 ? colors.success : ukPct >= 50 ? colors.warning : colors.primary }]} />
                        </View>
                        <Text style={styles.progressText}>{ukPct}% of UK record ({record?.ukRecord.weightKg}kg)</Text>
                        {ukPct < 100 && (
                          <Text style={styles.targetText}>
                            {((record?.ukRecord.weightKg || 0) - weight).toFixed(1)}kg more to beat the UK record
                          </Text>
                        )}
                        {ukPct >= 100 && <Text style={[styles.targetText, { color: colors.success }]}>🎉 UK Record holder!</Text>}
                      </View>
                    )}
                  </View>
                  {ukPct && ukPct >= 90 && <MaterialCommunityIcons name="trophy" size={24} color={colors.secondary} />}
                </View>
              );
            })}
          </View>
        )}

        {/* Browse all records */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg }]}>🌍 UK & World Records</Text>
        <Text style={[styles.subTitle, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>Tap a species to see full records</Text>
        <View style={styles.speciesGrid}>
          {SPECIES_LIST.map(s => {
            const record = FISH_RECORDS[s.id];
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.speciesCard, selectedSpecies === s.id && styles.speciesCardActive]}
                onPress={() => setSelectedSpecies(selectedSpecies === s.id ? null : s.id)}
              >
                <Text style={styles.speciesEmoji}>{s.emoji}</Text>
                <Text style={styles.speciesName}>{s.name}</Text>
                {record && <Text style={styles.speciesRecord}>UK: {record.ukRecord.weightKg}kg</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected species record detail */}
        {selected && selectedRecord && (
          <View style={styles.recordDetail}>
            <Text style={styles.recordDetailTitle}>{selected.emoji} {selected.name} Records</Text>
            <View style={styles.recordCards}>
              <View style={styles.recordCard}>
                <Text style={styles.recordFlag}>🇬🇧</Text>
                <Text style={styles.recordType}>UK Record</Text>
                <Text style={styles.recordWeight}>{selectedRecord.ukRecord.weightKg} kg</Text>
                <Text style={styles.recordWeightLb}>({selectedRecord.ukRecord.weight} lb)</Text>
                <Text style={styles.recordInfo}>{selectedRecord.ukRecord.location}</Text>
                <Text style={styles.recordInfo}>{selectedRecord.ukRecord.year}</Text>
                {selectedRecord.ukRecord.angler && <Text style={styles.recordAngler}>{selectedRecord.ukRecord.angler}</Text>}
              </View>
              <View style={styles.recordCard}>
                <Text style={styles.recordFlag}>🌍</Text>
                <Text style={styles.recordType}>World Record</Text>
                <Text style={[styles.recordWeight, { color: colors.secondary }]}>{selectedRecord.worldRecord.weightKg} kg</Text>
                <Text style={styles.recordWeightLb}>({selectedRecord.worldRecord.weight} lb)</Text>
                <Text style={styles.recordInfo}>{selectedRecord.worldRecord.location}</Text>
                <Text style={styles.recordInfo}>{selectedRecord.worldRecord.year}</Text>
                {selectedRecord.worldRecord.angler && <Text style={styles.recordAngler}>{selectedRecord.worldRecord.angler}</Text>}
              </View>
            </View>
            {selectedPB > 0 && (
              <View style={styles.pbComparison}>
                <Text style={styles.pbCompTitle}>Your PB: {selectedPB} kg</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, (selectedPB / selectedRecord.ukRecord.weightKg) * 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((selectedPB / selectedRecord.ukRecord.weightKg) * 100)}% of UK record
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  subTitle: { fontSize: 13, color: colors.textSecondary },
  pbSection: { paddingHorizontal: spacing.lg },
  pbCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  pbEmoji: { fontSize: 32 },
  pbSpecies: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  pbWeight: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: spacing.xs },
  progressBar: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressText: { fontSize: 11, color: colors.textSecondary },
  targetText: { fontSize: 11, color: colors.warning, marginTop: 2 },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  speciesCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border, minWidth: 90 },
  speciesCardActive: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: colors.secondary },
  speciesEmoji: { fontSize: 24, marginBottom: 2 },
  speciesName: { fontSize: 10, color: colors.textPrimary, textAlign: 'center', fontWeight: '600' },
  speciesRecord: { fontSize: 10, color: colors.textSecondary },
  recordDetail: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  recordDetailTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  recordCards: { flexDirection: 'row', gap: spacing.md },
  recordCard: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  recordFlag: { fontSize: 24, marginBottom: 4 },
  recordType: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  recordWeight: { fontSize: 22, fontWeight: '800', color: colors.primary },
  recordWeightLb: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  recordInfo: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  recordAngler: { fontSize: 11, color: colors.textPrimary, textAlign: 'center', marginTop: 2, fontStyle: 'italic' },
  pbComparison: { marginTop: spacing.md, backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.md, padding: spacing.md },
  pbCompTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
});
