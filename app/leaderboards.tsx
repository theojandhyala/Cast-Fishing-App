import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LEADERBOARD_WEEKLY, LEADERBOARD_MONTHLY, LEADERBOARD_ALL_TIME, LeaderboardUser } from '../data/leaderboardData';
import { colors, radius, spacing } from '../constants/theme';

type Tab = 'weekly' | 'monthly' | 'alltime';
type Filter = 'catches' | 'biggest' | 'species' | 'spots';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function getScore(user: LeaderboardUser, filter: Filter): string {
  switch (filter) {
    case 'catches': return `${user.catches} catches`;
    case 'biggest': return `${user.biggestFish}kg`;
    case 'species': return `${user.species} species`;
    case 'spots': return `${user.spotsAdded} spots`;
  }
}

export default function LeaderboardsScreen() {
  const [tab, setTab] = useState<Tab>('weekly');
  const [filter, setFilter] = useState<Filter>('catches');

  const data = tab === 'weekly' ? LEADERBOARD_WEEKLY : tab === 'monthly' ? LEADERBOARD_MONTHLY : LEADERBOARD_ALL_TIME;

  const sorted = [...data].sort((a, b) => {
    if (filter === 'catches') return b.catches - a.catches;
    if (filter === 'biggest') return b.biggestFish - a.biggestFish;
    if (filter === 'species') return b.species - a.species;
    return b.spotsAdded - a.spotsAdded;
  });

  const userEntry = sorted.find(u => u.id === 'user');
  const userRank = userEntry ? sorted.indexOf(userEntry) + 1 : '-';

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['weekly', 'monthly', 'alltime'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {([
          { key: 'catches', label: 'Most Catches' },
          { key: 'biggest', label: 'Biggest Fish' },
          { key: 'species', label: 'Most Species' },
          { key: 'spots', label: 'Most Spots' },
        ] as { key: Filter; label: string }[]).map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {sorted.map((user, index) => {
          const rank = index + 1;
          const isUser = user.id === 'user';
          const isTop3 = rank <= 3;
          return (
            <View key={user.id} style={[styles.row, isUser && styles.rowUser, isTop3 && styles.rowTop]}>
              <View style={[styles.rankBadge, isTop3 && { backgroundColor: RANK_COLORS[rank - 1] + '33' }]}>
                <Text style={[styles.rankText, isTop3 && { color: RANK_COLORS[rank - 1] }]}>#{rank}</Text>
              </View>
              <View style={[styles.avatar, isUser && { backgroundColor: colors.primary + '33', borderColor: colors.primary }]}>
                <Text style={[styles.avatarText, isUser && { color: colors.primary }]}>{user.avatar}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.userName, isUser && styles.userNameHighlight]}>{user.name}</Text>
                <Text style={styles.score}>{getScore(user, filter)}</Text>
              </View>
              <View style={styles.changeRow}>
                {user.change !== 'same' && (
                  <MaterialCommunityIcons
                    name={user.change === 'up' ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color={user.change === 'up' ? colors.success : colors.danger}
                  />
                )}
                {user.changeAmount > 0 && (
                  <Text style={{ fontSize: 11, color: user.change === 'up' ? colors.success : colors.danger }}>{user.changeAmount}</Text>
                )}
              </View>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky user card */}
      <View style={styles.stickyCard}>
        <MaterialCommunityIcons name="account" size={16} color={colors.primary} />
        <Text style={styles.stickyText}>Your Rank: <Text style={styles.stickyRank}>#{userRank}</Text></Text>
        <Text style={styles.stickyScore}>{userEntry ? getScore(userEntry, filter) : '-'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#0A0E1A' },
  filters: { marginTop: spacing.sm },
  filtersContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary + '22', borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  rowUser: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.06)' },
  rowTop: { borderWidth: 1 },
  rankBadge: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  rankText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  avatarText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  info: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  userNameHighlight: { color: colors.primary },
  score: { fontSize: 12, color: colors.textSecondary },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  stickyCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xl },
  stickyText: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  stickyRank: { color: colors.primary, fontWeight: '700' },
  stickyScore: { fontSize: 14, color: colors.textSecondary },
});
