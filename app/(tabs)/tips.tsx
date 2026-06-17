import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { species } from '../../data/species';
import { FishTipCard } from '../../components/fish/FishTipCard';
import { colors, radius, spacing } from '../../constants/theme';

const FILTERS = ['All', 'Coarse', 'Sea', 'Game', 'Freshwater'];

export default function TipsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const router = useRouter();

  const filtered = species.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.commonName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      s.type === filter.toLowerCase() ||
      (filter === 'Freshwater' && s.type === 'coarse');
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Species Guide</Text>
        <Text style={styles.subtitle}>{species.length} UK species</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search species..."
          placeholderTextColor={colors.textSecondary}
        />
        {search !== '' && (
          <MaterialCommunityIcons
            name="close"
            size={18}
            color={colors.textSecondary}
            onPress={() => setSearch('')}
          />
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => (
          <View key={f}>
            <Text
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              {f}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify" size={40} color={colors.textTertiary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No species found</Text>
          </View>
        ) : (
          filtered.map((s) => (
            <FishTipCard
              key={s.id}
              species={s}
              onPress={() => router.push({ pathname: '/species-detail', params: { id: s.id } })}
            />
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: colors.primary,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
