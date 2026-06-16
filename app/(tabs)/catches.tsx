import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCatchStore, Catch } from '../../store/catchStore';
import { CatchCard } from '../../components/catches/CatchCard';
import { CatchStats } from '../../components/catches/CatchStats';
import { colors, radius, spacing, typography, fonts } from '../../constants/theme';

const FILTERS = ['All', 'Today', 'This Week', 'This Month'];

export default function CatchesScreen() {
  const { catches, getStats } = useCatchStore();
  const [filter, setFilter] = useState('All');
  const [mode, setMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const stats = getStats();

  const filteredCatches = catches.filter((c) => {
    const date = new Date(c.date);
    const now = new Date();
    if (filter === 'Today') {
      return date.toDateString() === now.toDateString();
    }
    if (filter === 'This Week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }
    if (filter === 'This Month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Catch Log</Text>
            <Text style={styles.subtitle}>{stats.total} total catches</Text>
          </View>
          <TouchableOpacity
            onPress={() => setMode(mode === 'grid' ? 'list' : 'grid')}
            style={styles.viewToggle}
          >
            <MaterialCommunityIcons
              name={mode === 'grid' ? 'view-list' : 'view-grid'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <CatchStats stats={stats} />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Catches */}
        {filteredCatches.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="fish" size={56} color={colors.textTertiary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyText}>No catches yet</Text>
            <Text style={styles.emptySubtext}>Go fish and log your first catch!</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCatches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              mode === 'list'
                ? <CatchCard item={item} mode="list" />
                : <View style={styles.gridItem}><CatchCard item={item} mode="grid" /></View>
            )}
            numColumns={mode === 'grid' ? 2 : 1}
            key={mode}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-catch')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#0A0E1A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  viewToggle: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  gridItem: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
