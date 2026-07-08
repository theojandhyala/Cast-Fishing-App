import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { colors, radius, spacing } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function SparklineChart({ catches }: { catches: any[] }) {
  const chartHeight = 60;
  const year = new Date().getFullYear();
  const monthlyCounts = Array(12).fill(0);
  catches.forEach(c => {
    const d = new Date(c.date);
    if (d.getFullYear() === year) {
      monthlyCounts[d.getMonth()]++;
    }
  });
  const maxCount = Math.max(...monthlyCounts, 1);
  return (
    <View style={{ height: chartHeight + 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, gap: 2 }}>
        {monthlyCounts.map((count, i) => {
          const barH = maxCount > 0 ? (count / maxCount) * chartHeight : 0;
          const isCurrentMonth = i === new Date().getMonth();
          return (
            <View key={i} style={{ flex: 1, height: chartHeight, justifyContent: 'flex-end', alignItems: 'center' }}>
              <View style={{
                width: '75%', height: Math.max(2, barH), borderRadius: 2,
                backgroundColor: isCurrentMonth ? colors.primary : 'rgba(0,212,170,0.35)',
              }} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {MONTHS.map((m, i) => (
          <Text key={m} style={{ flex: 1, fontSize: 7, color: colors.textTertiary, textAlign: 'center' }}>
            {i % 3 === 0 ? m : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const MENU_ITEMS = [
  { icon: 'account-group-outline', label: 'Friends', route: '/friends' },
  { icon: 'earth', label: 'Community & Head-to-head', route: '/(tabs)/social' },
  { icon: 'trophy-outline', label: 'Leaderboard', route: '/leaderboard' },
  { icon: 'trophy-outline', label: 'Personal Records', route: '/records' },
  { icon: 'medal-outline', label: 'Achievements', route: '/challenges' },
  { icon: 'bag-personal-outline', label: 'Gear', route: '/gear-tracker' },
  { icon: 'heart-outline', label: 'Favourite Spots', route: '/map' },
  { icon: 'cog-outline', label: 'Settings', route: '/settings' },
  { icon: 'help-circle-outline', label: 'Help & Support', route: '/settings' },
  { icon: 'information-outline', label: 'About Cast Fishing', route: '/settings' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const stats = getStats();

  const displayName = user?.name || 'Angler Pro';
  const handle = '@' + (user?.email?.split('@')[0] || 'angler').toLowerCase().replace(/\s/g, '');
  const speciesCount = Object.keys(stats.speciesCounts || {}).length;
  const uniqueSpots = new Set(catches.map(c => c.location).filter(Boolean)).size;
  const uniqueDays = new Set(catches.map(c => new Date(c.date).toDateString())).size;

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Catch streak
  const catchStreak = useMemo(() => {
    if (!catches.length) return 0;
    const days = new Set(catches.map(c => new Date(c.date).toDateString()));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) streak++; else break;
    }
    return streak;
  }, [catches]);

  const milestones = [
    { icon: 'fish', label: 'First Catch', done: catches.length >= 1 },
    { icon: 'numeric-10-circle-outline', label: '10 Catches', done: catches.length >= 10 },
    { icon: 'trophy-outline', label: '50 Catches', done: catches.length >= 50 },
    { icon: 'star-outline', label: 'Week Streak', done: catchStreak >= 7 },
  ].filter(m => m.done);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>PROFILE</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Avatar + identity ── */}
        <View style={s.profileHeader}>
          <View style={s.avatarRing}>
            <Text style={s.avatarInitials}>{initials}</Text>
          </View>

          <View style={s.identity}>
            <Text style={s.displayName}>{displayName}</Text>
            <Text style={s.handle}>{handle}</Text>
            <TouchableOpacity onPress={() => router.push('/settings' as any)}>
              <Text style={s.editProfileLink}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4-stat row ── */}
        <View style={s.statsRow}>
          {[
            { val: catches.length, label: 'Catches' },
            { val: speciesCount, label: 'Species' },
            { val: uniqueSpots || 0, label: 'Spots' },
            { val: uniqueDays, label: 'Days' },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.statItem}>
                <Text style={s.statVal}>{item.val}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── Milestones ── */}
        {milestones.length > 0 && (
          <View style={s.milestonesRow}>
            {milestones.map(m => (
              <View key={m.label} style={s.milestoneBadge}>
                <MaterialCommunityIcons name={m.icon as any} size={16} color={colors.primary} />
                <Text style={s.milestoneLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Menu items ── */}
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuRow, i > 0 && s.menuRowBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={s.menuIconWrap}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 13, fontWeight: '900', color: colors.textPrimary, letterSpacing: 0.5,
  },

  profileHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md, paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  avatarRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 26, fontWeight: '800', color: '#00D4AA',
  },
  identity: { flex: 1, alignItems: 'flex-start' },
  displayName: {
    fontSize: 20, fontWeight: '800', color: colors.textPrimary,
  },
  handle: {
    fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2,
  },
  editProfileLink: {
    color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 7,
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 18,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 26, fontWeight: '800', color: '#00D4AA' },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },

  // Milestones
  milestonesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginHorizontal: spacing.lg, marginBottom: 16,
  },
  milestoneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  milestoneLabel: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },

  menuCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 16,
  },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
});
