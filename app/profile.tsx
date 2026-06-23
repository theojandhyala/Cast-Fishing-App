import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { colors, radius, spacing, elevation } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Simple sparkline chart — no external library needed
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function SparklineChart({ catches }: { catches: any[] }) {
  const chartWidth = SCREEN_WIDTH - spacing.lg * 2 - 32;
  const chartHeight = 60;

  // Count catches per month for current year
  const year = new Date().getFullYear();
  const monthlyCounts = Array(12).fill(0);
  catches.forEach(c => {
    const d = new Date(c.date);
    if (d.getFullYear() === year) {
      monthlyCounts[d.getMonth()]++;
    }
  });

  const maxCount = Math.max(...monthlyCounts, 1);
  const points = monthlyCounts.map((count, i) => ({
    x: (i / 11) * chartWidth,
    y: chartHeight - (count / maxCount) * chartHeight,
    count,
  }));

  // Build SVG path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View style={{ height: chartHeight + 24 }}>
      {/* Simple bar chart using Views */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, gap: 2 }}>
        {monthlyCounts.map((count, i) => {
          const barH = maxCount > 0 ? (count / maxCount) * chartHeight : 0;
          const isCurrentMonth = i === new Date().getMonth();
          return (
            <View key={i} style={{ flex: 1, height: chartHeight, justifyContent: 'flex-end', alignItems: 'center' }}>
              <View
                style={{
                  width: '75%',
                  height: Math.max(2, barH),
                  borderRadius: 2,
                  backgroundColor: isCurrentMonth ? colors.primary : 'rgba(0,212,170,0.35)',
                }}
              />
            </View>
          );
        })}
      </View>
      {/* Month labels */}
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

  // Estimate unique spots
  const uniqueSpots = new Set(catches.map(c => c.location).filter(Boolean)).size;

  // Days active (unique days with catches)
  const uniqueDays = new Set(
    catches.map(c => new Date(c.date).toDateString())
  ).size;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Avatar + name block */}
        <View style={s.profileHeader}>
          {/* Avatar */}
          <LinearGradient colors={['rgba(0,212,170,0.3)', 'rgba(0,212,170,0.08)']} style={s.avatarRing}>
            <View style={s.avatarInner}>
              <MaterialCommunityIcons name="account" size={44} color={colors.primary} />
            </View>
          </LinearGradient>

          <View style={s.identity}>
            <Text style={s.displayName}>{displayName}</Text>
            <Text style={s.handle}>{handle}</Text>
            <TouchableOpacity onPress={() => router.push('/settings' as any)}><Text style={s.editProfileLink}>Edit Profile</Text></TouchableOpacity>
          </View>
        </View>

        {/* 4-stat row */}
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

        {/* Menu items */}
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuRow, i > 0 && s.menuRowBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.textSecondary} />
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

  profileHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(0,212,170,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  identity: { flex: 1, alignItems: 'flex-start' },
  displayName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  handle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editProfileLink: { color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 7 },
  proBadge: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  proBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    ...elevation.raised,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.8 },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },

  // Chart card
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chartYear: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  // Menu
  menuCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
  },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },

  // CTAs
  ctaRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  proBtn: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  proBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  proBtnText: { fontSize: 14, fontWeight: '800', color: '#031A12' },
});
