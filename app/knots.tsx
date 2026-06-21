import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { knots } from '../data/knots';
import { KnotCard } from '../components/knots/KnotCard';
import { useUserStore } from '../store/userStore';
import { colors, radius, spacing } from '../constants/theme';

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Expert'];

export default function KnotsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const router = useRouter();
  const { bookmarkKnot, unbookmarkKnot, isKnotBookmarked } = useUserStore();

  const filtered = knots.filter((k) => {
    const matchesSearch =
      search === '' ||
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.useCase.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || k.difficulty === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{knots.length} essential knots for UK fishing</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search knots..."
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
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Knot grid */}
      <View style={styles.grid}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No knots found</Text>
          </View>
        ) : (
          filtered.map((k, i) => {
            const isEven = i % 2 === 0;
            const nextKnot = filtered[i + 1];
            if (!isEven) return null;
            return (
              <View key={k.id} style={styles.row}>
                <KnotCard
                  knot={k}
                  onPress={() => router.push({ pathname: '/knot-detail', params: { id: k.id } })}
                  bookmarked={isKnotBookmarked(k.id)}
                  onBookmark={() =>
                    isKnotBookmarked(k.id) ? unbookmarkKnot(k.id) : bookmarkKnot(k.id)
                  }
                />
                {nextKnot ? (
                  <KnotCard
                    knot={nextKnot}
                    onPress={() => router.push({ pathname: '/knot-detail', params: { id: nextKnot.id } })}
                    bookmarked={isKnotBookmarked(nextKnot.id)}
                    onBookmark={() =>
                      isKnotBookmarked(nextKnot.id) ? unbookmarkKnot(nextKnot.id) : bookmarkKnot(nextKnot.id)
                    }
                  />
                ) : (
                  <View style={{ flex: 1, margin: spacing.xs }} />
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
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
    marginLeft: -spacing.lg,
    marginRight: -spacing.lg,
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
  grid: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    width: '100%',
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
