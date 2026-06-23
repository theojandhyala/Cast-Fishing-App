import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import {
  LEADERBOARD_WEEKLY,
  LEADERBOARD_MONTHLY,
  LEADERBOARD_ALL_TIME,
  LeaderboardUser,
} from '../data/leaderboardData';
import { useCatchStore } from '../store/catchStore';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing } from '../constants/theme';

// ─── Types ──────────────────────────────────────────────────────────────────

type MainTab = 'global' | 'spot' | 'friends';
type Period = 'weekly' | 'monthly' | 'alltime';

// ─── Mock data helpers ───────────────────────────────────────────────────────

const GRAFHAM_ANGLERS = [
  { id: 'g1', name: 'CarpKing', avatar: 'CK', biggestFish: 14.2, catches: 31, change: 'up' as const, changeAmount: 2 },
  { id: 'g2', name: 'Grafham_Dave', avatar: 'GD', biggestFish: 12.8, catches: 27, change: 'same' as const, changeAmount: 0 },
  { id: 'g3', name: 'TroutMaster', avatar: 'TM', biggestFish: 11.4, catches: 22, change: 'up' as const, changeAmount: 1 },
  { id: 'g4', name: 'WaterWitch', avatar: 'WW', biggestFish: 10.7, catches: 19, change: 'down' as const, changeAmount: 3 },
  { id: 'g5', name: 'LakeLord', avatar: 'LL', biggestFish: 9.9, catches: 18, change: 'up' as const, changeAmount: 4 },
  { id: 'g6', name: 'FlyFisher_J', avatar: 'FJ', biggestFish: 8.3, catches: 15, change: 'down' as const, changeAmount: 1 },
  { id: 'g7', name: 'CambsAngler', avatar: 'CA', biggestFish: 7.1, catches: 13, change: 'same' as const, changeAmount: 0 },
  { id: 'g8', name: 'NightRiser', avatar: 'NR', biggestFish: 6.5, catches: 11, change: 'up' as const, changeAmount: 2 },
  { id: 'g9', name: 'SpinKing', avatar: 'SK', biggestFish: 5.8, catches: 9, change: 'down' as const, changeAmount: 2 },
  { id: 'g10', name: 'ReservoirRex', avatar: 'RR', biggestFish: 4.2, catches: 7, change: 'same' as const, changeAmount: 0 },
];

const FRIENDS_DATA = [
  { id: 'f1', name: 'Jake M.', avatar: 'JM', biggestFish: 11.3, catches: 28, change: 'up' as const, changeAmount: 1 },
  { id: 'f2', name: 'Sarah K.', avatar: 'SK', biggestFish: 9.7, catches: 24, change: 'same' as const, changeAmount: 0 },
  { id: 'f3', name: 'Tom C.', avatar: 'TC', biggestFish: 8.4, catches: 20, change: 'up' as const, changeAmount: 2 },
  { id: 'user', name: 'You', avatar: 'ME', biggestFish: 8.5, catches: 5, change: 'up' as const, changeAmount: 5 },
  { id: 'f4', name: 'Alex R.', avatar: 'AR', biggestFish: 6.2, catches: 16, change: 'down' as const, changeAmount: 1 },
  { id: 'f5', name: 'Ben W.', avatar: 'BW', biggestFish: 4.8, catches: 12, change: 'down' as const, changeAmount: 3 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

type RankEntry = {
  id: string;
  name: string;
  avatar: string;
  biggestFish: number;
  catches: number;
  change: 'up' | 'down' | 'same';
  changeAmount: number;
};

const GOLD = '#FFD700';
const SILVER = '#C0C0C0';
const BRONZE = '#CD7F32';

function rankColor(rank: number): string {
  if (rank === 1) return GOLD;
  if (rank === 2) return SILVER;
  if (rank === 3) return BRONZE;
  return colors.textTertiary;
}

function avatarBg(rank: number, isUser: boolean): string {
  if (isUser) return 'rgba(0,212,170,0.18)';
  if (rank === 1) return 'rgba(255,215,0,0.15)';
  if (rank === 2) return 'rgba(192,192,192,0.15)';
  if (rank === 3) return 'rgba(205,127,50,0.15)';
  return 'rgba(255,255,255,0.06)';
}

function PodiumCard({ entry, rank }: { entry: RankEntry; rank: number }) {
  const gradColors: [string, string] =
    rank === 1
      ? ['rgba(255,215,0,0.18)', 'rgba(255,215,0,0.04)']
      : rank === 2
      ? ['rgba(192,192,192,0.18)', 'rgba(192,192,192,0.04)']
      : ['rgba(205,127,50,0.18)', 'rgba(205,127,50,0.04)'];
  const accent = rankColor(rank);
  return (
    <LinearGradient colors={gradColors} style={[s.podiumCard, { borderColor: accent + '55' }]}>
      <View style={[s.podiumAvatar, { backgroundColor: avatarBg(rank, false), borderColor: accent + '88' }]}>
        <Text style={[s.podiumAvatarText, { color: accent }]}>{entry.avatar}</Text>
      </View>
      <View style={s.podiumMedal}>
        {rank === 1 ? (
          <MaterialCommunityIcons name="crown" size={14} color={GOLD} />
        ) : (
          <MaterialCommunityIcons name="medal" size={14} color={accent} />
        )}
        <Text style={[s.podiumRankNum, { color: accent }]}>{rank}</Text>
      </View>
      <Text style={s.podiumName} numberOfLines={1}>{entry.name}</Text>
      <Text style={[s.podiumFish, { color: accent }]}>{entry.biggestFish}kg</Text>
      <Text style={s.podiumCatches}>{entry.catches} catches</Text>
    </LinearGradient>
  );
}

function LeaderRow({
  entry,
  rank,
  isUser,
}: {
  entry: RankEntry;
  rank: number;
  isUser: boolean;
}) {
  return (
    <View
      style={[
        s.row,
        isUser && s.rowUser,
      ]}
    >
      {isUser && <View style={s.userAccent} />}
      <View style={[s.rankBadge, { backgroundColor: rankColor(rank) + '22' }]}>
        {rank === 1 ? (
          <MaterialCommunityIcons name="crown" size={16} color={GOLD} />
        ) : rank <= 3 ? (
          <MaterialCommunityIcons name="medal" size={16} color={rankColor(rank)} />
        ) : (
          <Text style={[s.rankNum, { color: rankColor(rank) }]}>{rank}</Text>
        )}
      </View>
      <View
        style={[
          s.avatar,
          {
            backgroundColor: avatarBg(rank, isUser),
            borderColor: isUser ? colors.primary : rank <= 3 ? rankColor(rank) + '66' : colors.border,
          },
        ]}
      >
        <Text style={[s.avatarText, { color: isUser ? colors.primary : rank <= 3 ? rankColor(rank) : colors.textSecondary }]}>
          {entry.avatar}
        </Text>
      </View>
      <View style={s.rowInfo}>
        <Text style={[s.rowName, isUser && { color: colors.primary }]} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={s.rowSub}>{entry.catches} catches</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={[s.rowFish, isUser && { color: colors.primary }]}>{entry.biggestFish}kg</Text>
        <View style={s.changeRow}>
          {entry.change === 'up' && (
            <MaterialCommunityIcons name="arrow-up" size={11} color={colors.primary} />
          )}
          {entry.change === 'down' && (
            <MaterialCommunityIcons name="arrow-down" size={11} color="#EF4444" />
          )}
          {entry.change === 'same' && (
            <MaterialCommunityIcons name="minus" size={11} color={colors.textTertiary} />
          )}
          {entry.changeAmount > 0 && (
            <Text
              style={[
                s.changeAmt,
                {
                  color:
                    entry.change === 'up'
                      ? colors.primary
                      : entry.change === 'down'
                      ? '#EF4444'
                      : colors.textTertiary,
                },
              ]}
            >
              {entry.changeAmount}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Global tab content ──────────────────────────────────────────────────────

function GlobalTab() {
  const [period, setPeriod] = useState<Period>('weekly');

  const rawData =
    period === 'weekly'
      ? LEADERBOARD_WEEKLY
      : period === 'monthly'
      ? LEADERBOARD_MONTHLY
      : LEADERBOARD_ALL_TIME;

  const sorted = [...rawData].sort((a, b) => b.biggestFish - a.biggestFish);
  const top10 = sorted.slice(0, 10);
  const userEntry = sorted.find((u) => u.id === 'user');
  const userRank = userEntry ? sorted.indexOf(userEntry) + 1 : null;
  const userInTop10 = userEntry ? userRank !== null && userRank <= 10 : false;

  const toEntry = (u: LeaderboardUser): RankEntry => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    biggestFish: u.biggestFish,
    catches: u.catches,
    change: u.change,
    changeAmount: u.changeAmount,
  });

  const top3 = top10.slice(0, 3);
  const rest = top10.slice(3);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      {/* Period picker */}
      <View style={s.periodRow}>
        {(['weekly', 'monthly', 'alltime'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[s.periodChip, period === p && s.periodChipActive]}
          >
            <Text style={[s.periodText, period === p && s.periodTextActive]}>
              {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium top 3 */}
      <View style={s.podiumRow}>
        <PodiumCard entry={toEntry(top3[1])} rank={2} />
        <PodiumCard entry={toEntry(top3[0])} rank={1} />
        <PodiumCard entry={toEntry(top3[2])} rank={3} />
      </View>

      {/* Ranks 4-10 */}
      {rest.map((u, i) => (
        <LeaderRow key={u.id} entry={toEntry(u)} rank={i + 4} isUser={u.id === 'user'} />
      ))}

      {/* Pinned user row if outside top 10 */}
      {!userInTop10 && userEntry && userRank !== null && (
        <>
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>Your position</Text>
            <View style={s.dividerLine} />
          </View>
          <LeaderRow entry={toEntry(userEntry)} rank={userRank} isUser />
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Spot tab content ────────────────────────────────────────────────────────

function SpotTab() {
  const { catches } = useCatchStore();
  const SPOT_NAME = 'Grafham Water';

  const userBest = catches
    .filter((c) => c.location?.toLowerCase().includes('grafham'))
    .reduce((best, c) => Math.max(best, c.weight ?? 0), 0);

  const userEntry: RankEntry = {
    id: 'user',
    name: 'You',
    avatar: 'ME',
    biggestFish: userBest > 0 ? userBest : 3.1,
    catches: catches.filter((c) => c.location?.toLowerCase().includes('grafham')).length,
    change: 'up',
    changeAmount: 2,
  };

  const allEntries = [...GRAFHAM_ANGLERS, userEntry].sort(
    (a, b) => b.biggestFish - a.biggestFish
  );

  const top3 = allEntries.slice(0, 3);
  const rest = allEntries.slice(3);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      <View style={s.spotHeader}>
        <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
        <Text style={s.spotName}>{SPOT_NAME}</Text>
      </View>
      <Text style={s.spotSubtitle}>Sorted by biggest catch at this spot</Text>

      <View style={s.podiumRow}>
        <PodiumCard entry={top3[1]} rank={2} />
        <PodiumCard entry={top3[0]} rank={1} />
        <PodiumCard entry={top3[2]} rank={3} />
      </View>

      {rest.map((entry, i) => (
        <LeaderRow key={entry.id} entry={entry} rank={i + 4} isUser={entry.id === 'user'} />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Friends tab content ─────────────────────────────────────────────────────

function FriendsTab() {
  const sorted = [...FRIENDS_DATA].sort((a, b) => b.biggestFish - a.biggestFish);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      <View style={s.podiumRow}>
        <PodiumCard entry={top3[1]} rank={2} />
        <PodiumCard entry={top3[0]} rank={1} />
        <PodiumCard entry={top3[2]} rank={3} />
      </View>

      {rest.map((entry, i) => (
        <LeaderRow key={entry.id} entry={entry} rank={i + 4} isUser={entry.id === 'user'} />
      ))}

      <TouchableOpacity
        style={s.inviteButton}
        onPress={() => Alert.alert('Invite Friends', 'Share your Cast profile link with friends to add them.')}
      >
        <MaterialCommunityIcons name="account-plus-outline" size={18} color={colors.primary} />
        <Text style={s.inviteText}>Invite Friends</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

const TAB_LABELS: Record<MainTab, string> = {
  global: 'Global',
  spot: 'At This Spot',
  friends: 'Friends',
};

const TAB_SUBTITLES: Record<MainTab, string> = {
  global: 'Top anglers worldwide',
  spot: 'Best catches at Grafham Water',
  friends: 'How you rank among friends',
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = (params.tab as MainTab) || 'global';
  const [tab, setTab] = useState<MainTab>(initialTab);

  return (
    <View style={s.screen}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={s.headerSafe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>LEADERBOARDS</Text>
            <Text style={s.headerSub}>{TAB_SUBTITLES[tab]}</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        {/* Main tabs */}
        <View style={s.mainTabs}>
          {(Object.keys(TAB_LABELS) as MainTab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[s.mainTab, tab === t && s.mainTabActive]}
            >
              <Text style={[s.mainTabText, tab === t && s.mainTabTextActive]}>
                {TAB_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={s.content}>
        {tab === 'global' && <GlobalTab />}
        {tab === 'spot' && <SpotTab />}
        {tab === 'friends' && <FriendsTab />}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050A12' },
  headerSafe: { backgroundColor: '#050A12' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  mainTabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,212,170,0.12)',
    marginBottom: 2,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: { borderBottomColor: colors.primary },
  mainTabText: { color: colors.textTertiary, fontSize: 12, fontWeight: '700' },
  mainTabTextActive: { color: colors.primary },

  content: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  // Period picker
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  periodChipActive: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderColor: 'rgba(0,212,170,0.4)',
  },
  periodText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: colors.primary },

  // Podium
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  podiumCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
  },
  podiumAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumAvatarText: { fontSize: 11, fontWeight: '800' },
  podiumMedal: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  podiumRankNum: { fontSize: 11, fontWeight: '900' },
  podiumName: { color: colors.textPrimary, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  podiumFish: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  podiumCatches: { color: colors.textTertiary, fontSize: 9, marginTop: 1 },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.12)',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  rowUser: {
    backgroundColor: 'rgba(0,212,170,0.07)',
    borderColor: 'rgba(0,212,170,0.35)',
  },
  userAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: { fontSize: 14, fontWeight: '900', fontVariant: ['tabular-nums'] },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '800' },
  rowInfo: { flex: 1 },
  rowName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  rowSub: { color: colors.textTertiary, fontSize: 11, marginTop: 1 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  rowFish: { color: colors.textPrimary, fontSize: 15, fontWeight: '900' },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  changeAmt: { fontSize: 10, fontWeight: '700' },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: { color: colors.textTertiary, fontSize: 10, fontWeight: '700' },

  // Spot header
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  spotName: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  spotSubtitle: { color: colors.textTertiary, fontSize: 11, marginBottom: spacing.md },

  // Invite button
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.35)',
    backgroundColor: 'rgba(0,212,170,0.07)',
  },
  inviteText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
