import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { colors, radius, spacing } from '../constants/theme';
import { FISH_DATABASE, FISH_REGIONS, RARITY_COLOURS, filterFish, getFishDatabaseStats } from '../data/fishDatabase';
import { FISH_RARITIES, FishRarity, FishRegion, WaterType } from '../types/fish';
import { FishPhoto } from '../components/fish/FishPhoto';

type Choice<T extends string> = T | 'all';

const WATER_TYPES: WaterType[] = ['freshwater', 'saltwater', 'brackish', 'anadromous'];

export default function FishDatabaseScreen() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<Choice<FishRegion>>('all');
  const [waterType, setWaterType] = useState<Choice<WaterType>>('all');
  const [rarity, setRarity] = useState<Choice<FishRarity>>('all');
  const stats = useMemo(getFishDatabaseStats, []);
  const fish = useMemo(() => filterFish({ query, region, waterType, rarity }), [query, region, waterType, rarity]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Go back">
          <Icon name="chevron-left" size={27} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.heading}>
          <Text style={styles.title}>Fish database</Text>
          <Text style={styles.subtitle}>{stats.total} species · {stats.regions} regions</Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.notice}>
        <Icon name="shield-check-outline" size={18} color={colors.primary} />
        <Text style={styles.noticeText}>Records appear only with cited verification. Unknown data stays unknown.</Text>
      </View>

      <View style={styles.search}>
        <Icon name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Name, scientific name, region or habitat"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {!!query && <TouchableOpacity onPress={() => setQuery('')}><Icon name="close-circle" size={18} color={colors.textSecondary} /></TouchableOpacity>}
      </View>

      <FilterRow label="Region" values={FISH_REGIONS} selected={region} onSelect={setRegion} />
      <FilterRow label="Water" values={WATER_TYPES} selected={waterType} onSelect={setWaterType} />
      <FilterRow label="Rarity" values={[...FISH_RARITIES]} selected={rarity} onSelect={setRarity} colour />

      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>{fish.length} result{fish.length === 1 ? '' : 's'}</Text>
        {(region !== 'all' || waterType !== 'all' || rarity !== 'all') && (
          <TouchableOpacity onPress={() => { setRegion('all'); setWaterType('all'); setRarity('all'); }}>
            <Text style={styles.clear}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={fish}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={14}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.82}
            onPress={() => router.push({ pathname: '/species-detail', params: { id: item.id } })}
          >
            <FishPhoto scientificName={item.scientificName} commonName={item.commonName} accent={RARITY_COLOURS[item.rarity]} />
            <View style={styles.cardBody}>
              <Text style={styles.fishName} numberOfLines={1}>{item.commonName}</Text>
              <Text style={styles.scientificName} numberOfLines={1}>{item.scientificName}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.rarity, { color: RARITY_COLOURS[item.rarity] }]}>{item.rarity.toUpperCase()} · {item.xp} XP</Text>
                <Text style={styles.meta} numberOfLines={1}>{item.waterType}</Text>
              </View>
            </View>
            <View style={styles.recordState}>
              <Icon name={item.record.status === 'verified' ? 'check-decagram' : 'help-circle-outline'} size={16} color={item.record.status === 'verified' ? colors.success : colors.textSecondary} />
              <Text style={styles.recordText}>{item.record.status === 'verified' ? 'record' : 'no cited record'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={styles.empty}><Icon name="fish-off" size={44} color={colors.border} /><Text style={styles.emptyText}>No matching species</Text></View>}
      />
    </SafeAreaView>
  );
}

function FilterRow<T extends string>({ label, values, selected, onSelect, colour }: {
  label: string; values: T[]; selected: Choice<T>; onSelect: (value: Choice<T>) => void; colour?: boolean;
}) {
  return (
    <View>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {(['all', ...values] as Choice<T>[]).map((value) => {
          const active = selected === value;
          const accent = colour && value !== 'all' ? RARITY_COLOURS[value as FishRarity] : colors.primary;
          return (
            <TouchableOpacity key={value} onPress={() => onSelect(value)} style={[styles.chip, active && { borderColor: accent, backgroundColor: `${accent}18` }]}>
              <Text style={[styles.chipText, active && { color: accent }]}>{value === 'all' ? `All ${label.toLowerCase()}s` : value}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  heading: { flex: 1, alignItems: 'center' },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  notice: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.sm, borderRadius: radius.md, flexDirection: 'row', gap: 8, backgroundColor: 'rgba(0,212,170,0.08)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  noticeText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  search: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, height: 46, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  filterLabel: { marginLeft: spacing.lg, marginBottom: 5, color: colors.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  filters: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 7 },
  chip: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  resultRow: { paddingHorizontal: spacing.lg, paddingVertical: 7, flexDirection: 'row', justifyContent: 'space-between' },
  resultCount: { color: colors.textSecondary, fontSize: 12 },
  clear: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 80, gap: spacing.sm },
  card: { minHeight: 88, flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  fishIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, marginHorizontal: spacing.sm },
  fishName: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  scientificName: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  rarity: { fontSize: 10, fontWeight: '800' },
  meta: { color: colors.textSecondary, fontSize: 10, textTransform: 'capitalize' },
  recordState: { maxWidth: 70, alignItems: 'center', gap: 3 },
  recordText: { color: colors.textSecondary, fontSize: 9, textAlign: 'center' },
  empty: { paddingTop: 70, alignItems: 'center', gap: spacing.sm },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
});
