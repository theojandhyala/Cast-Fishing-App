import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../ui/Icon';
import { colors, radius, spacing } from '../../constants/theme';

export interface SpotLeaderboardProps {
  spotName: string;
  spotId: string;
}

// ─── Deterministic mock data from spotId ─────────────────────────────────────

const FIRST_NAMES = ['CarpKing', 'LakeLord', 'WaterWitch', 'TroutMaster', 'FlyFisher', 'NightCast', 'RiverRat', 'BassFisher', 'SpinKing', 'AngleAce'];
const LAST_TAGS = ['_UK', '_Dave', '_Pro', '_J', '_99', '_XL', '_Go', '_One', ''];

function seedHash(spotId: string): number {
  return spotId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

interface SpotEntry {
  id: string;
  name: string;
  avatar: string;
  biggestFish: number;
}

function generateSpotEntries(spotId: string): SpotEntry[] {
  const seed = seedHash(spotId);
  const entries: SpotEntry[] = [];
  for (let i = 0; i < 5; i++) {
    const nameIdx = (seed + i * 7) % FIRST_NAMES.length;
    const tagIdx = (seed + i * 3) % LAST_TAGS.length;
    const name = FIRST_NAMES[nameIdx] + LAST_TAGS[tagIdx];
    const avatar = name.slice(0, 2).toUpperCase();
    // Weight between 2.0 and 18.0 decreasing from top
    const weight = Math.round(((seed % 10) + 8 - i * 1.5) * 10) / 10;
    entries.push({ id: `spot-${spotId}-${i}`, name, avatar, biggestFish: Math.max(1.0, weight) });
  }
  return entries.sort((a, b) => b.biggestFish - a.biggestFish);
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

// ─── Component ────────────────────────────────────────────────────────────────

export function SpotLeaderboard({ spotName, spotId }: SpotLeaderboardProps) {
  const router = useRouter();
  const entries = generateSpotEntries(spotId);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <MaterialCommunityIcons name="trophy-outline" size={16} color={colors.primary} />
        <Text style={s.title}>Top Anglers Here</Text>
      </View>

      {entries.map((entry, i) => {
        const rank = i + 1;
        const accent = rank <= 3 ? RANK_COLORS[rank - 1] : colors.textTertiary;
        return (
          <View key={entry.id} style={s.row}>
            <View style={[s.rankBadge, { backgroundColor: accent + '22' }]}>
              {rank === 1 ? (
                <MaterialCommunityIcons name="crown" size={13} color="#FFD700" />
              ) : rank <= 3 ? (
                <MaterialCommunityIcons name="medal" size={13} color={accent} />
              ) : (
                <Text style={[s.rankNum, { color: accent }]}>{rank}</Text>
              )}
            </View>
            <View style={[s.avatar, { backgroundColor: accent + '18', borderColor: accent + '55' }]}>
              <Text style={[s.avatarText, { color: accent }]}>{entry.avatar}</Text>
            </View>
            <Text style={s.name} numberOfLines={1}>{entry.name}</Text>
            <Text style={[s.fish, rank <= 3 && { color: accent }]}>{entry.biggestFish}kg</Text>
          </View>
        );
      })}

      <TouchableOpacity
        style={s.viewAll}
        onPress={() => router.push({ pathname: '/leaderboard', params: { tab: 'spot', spotId, spotName } } as any)}
      >
        <Text style={s.viewAllText}>View Full Leaderboard</Text>
        <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.12)',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  title: { color: colors.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: { fontSize: 12, fontWeight: '900' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 10, fontWeight: '800' },
  name: { flex: 1, color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  fish: { color: colors.textSecondary, fontSize: 14, fontWeight: '800' },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  viewAllText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
