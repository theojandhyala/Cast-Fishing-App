import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { colors, radius, spacing } from '../../constants/theme';

const MENU_SECTIONS = [
  {
    section: 'MY FISHING',
    items: [
      { icon: 'account-circle', label: 'My Profile', route: '/profile', desc: 'XP, level & badges', comingSoon: false, isPro: false },
      { icon: 'chart-bar', label: 'My Stats', route: '/my-stats', desc: 'Full fishing analytics', comingSoon: false, isPro: false },
      { icon: 'trophy', label: 'My Records', route: '/records', desc: 'PBs vs UK records', comingSoon: false, isPro: false },
      { icon: 'toolbox', label: 'My Gear', route: '/gear-tracker', desc: 'Tackle & kit tracker', comingSoon: false, isPro: false },
      { icon: 'calendar-clock', label: 'Trip Planner', route: '/trip-planner', desc: 'Plan your sessions', comingSoon: false, isPro: false },
      { icon: 'share-variant', label: 'Share a Catch', route: '/catch-card-share', desc: 'Create shareable catch cards', comingSoon: false, isPro: false },
      { icon: 'magnify', label: 'Search', route: '/search', desc: 'Search spots, species, knots', comingSoon: false, isPro: false },
      { icon: 'book-open', label: 'Fishing Journal', route: '/fishing-journal', desc: 'Session notes & memories', comingSoon: false, isPro: false },
    ],
  },
  {
    section: 'TOOLS',
    items: [
      { icon: 'book-open-page-variant', label: 'Fish Encyclopedia', route: '/fish-encyclopedia', desc: '25+ species with rarity system', comingSoon: false, isPro: false },
      { icon: 'database', label: 'Fish Database', route: '/fish-database', desc: 'Global fish database with rarities', comingSoon: false, isPro: true },
      { icon: 'radar', label: 'Fish Radar', route: '/fish-radar', desc: "What's active near you", comingSoon: false, isPro: false },
      { icon: 'format-list-bulleted', label: 'Quest Log', route: '/quests', desc: 'Daily, weekly & story quests', comingSoon: false, isPro: false },
      { icon: 'compare', label: 'Species Compare', route: '/species-compare', desc: 'Compare any two fish', comingSoon: false, isPro: false },
      { icon: 'robot', label: 'AI Advisor', route: '/ai-advisor', desc: 'Ask anything about fishing', comingSoon: false, isPro: true },
      { icon: 'lightbulb', label: 'Fish Tips', route: '/fish-tips', desc: 'Species tips & bite times', comingSoon: false, isPro: false },
      { icon: 'calendar-month', label: 'Fishing Calendar', route: '/fishing-calendar', desc: 'Moon, tides & scores', comingSoon: false, isPro: false },
      { icon: 'food-drumstick', label: 'Bait Guide', route: '/bait-guide', desc: '30+ baits & bait match', comingSoon: false, isPro: false },
      { icon: 'link-variant', label: 'Knot Library', route: '/knots', desc: '20 essential knots', comingSoon: false, isPro: false },
      { icon: 'weather-partly-cloudy', label: 'Weather & Tides', route: '/weather-detail', desc: 'Full conditions dashboard', comingSoon: false, isPro: false },
      { icon: 'camera', label: 'Fish Identifier', route: '/identifier', desc: 'Photo ID tool', comingSoon: false, isPro: false },
      { icon: 'hook', label: 'Rig Builder', route: '/rig-builder', desc: '15 rig tutorials', comingSoon: false, isPro: false },
      { icon: 'water', label: 'Water Conditions', route: '/water-conditions', desc: 'Temp, clarity & levels', comingSoon: false, isPro: false },
      { icon: 'store', label: 'Tackle Shops', route: '/tackle-shops', desc: 'Find local tackle shops', comingSoon: false, isPro: false },
      { icon: 'shopping', label: 'Marketplace', route: '/marketplace', desc: 'Gear deals & fishing kit', comingSoon: false, isPro: false },
      { icon: 'account-tie', label: 'Fishing Guides', route: '/fishing-guides', desc: 'Hire a professional guide', comingSoon: false, isPro: false },
      { icon: 'target', label: 'Casting Calculator', route: '/casting-calculator', desc: 'Estimate casting distance', comingSoon: false, isPro: false },
      { icon: 'moon-waxing-crescent', label: 'Moon Calendar', route: '/moon-calendar', desc: 'Lunar fishing guide', comingSoon: false, isPro: true },
    ],
  },
  {
    section: 'RULES',
    items: [
      { icon: 'file-document', label: 'Licence & Regulations', route: '/licence-checker', desc: 'Licence, seasons & sizes', comingSoon: false, isPro: false },
      { icon: 'ruler', label: 'Size Limits', route: '/licence-checker', desc: 'Legal size checker', comingSoon: false, isPro: false },
      { icon: 'calendar-remove', label: 'Closed Seasons', route: '/licence-checker', desc: 'When you can fish', comingSoon: false, isPro: false },
      { icon: 'shield-check', label: 'Safety & Emergency', route: '/safety', desc: 'First aid, contacts & water safety', comingSoon: false, isPro: false },
    ],
  },
  {
    section: 'COMMUNITY',
    items: [
      { icon: 'account-group', label: 'Friends', route: '/friends', desc: 'Find and connect with other anglers', comingSoon: false, isPro: false },
      { icon: 'account-group', label: 'Community Feed', route: '/community', desc: 'See what others are catching', comingSoon: false, isPro: false },
      { icon: 'podium', label: 'Leaderboards', route: '/leaderboards', desc: 'Top anglers this week', comingSoon: false, isPro: false },
      { icon: 'account-multiple', label: 'Fishing Clubs', route: '/clubs', desc: 'Join and create clubs', comingSoon: true, isPro: false },
      { icon: 'medal', label: 'Challenges', route: '/challenges', desc: 'Weekly & monthly goals', comingSoon: false, isPro: false },
      { icon: 'trophy-outline', label: 'Competitions', route: '/competitions', desc: 'Local & virtual competitions', comingSoon: true, isPro: false },
      { icon: 'shopping', label: 'Gear Marketplace', route: '/marketplace', desc: 'Shop deals with the community', comingSoon: false, isPro: false },
      { icon: 'account-tie', label: 'Find a Guide', route: '/fishing-guides', desc: 'Connect with professional guides', comingSoon: false, isPro: false },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      { icon: 'crown', label: 'Upgrade to Pro', route: '/pro', desc: 'Unlock all features', comingSoon: false, isPro: false },
      { icon: 'cog', label: 'Settings', route: '/settings', desc: 'Preferences & account', comingSoon: false, isPro: false },
      { icon: 'bell', label: 'Notifications', route: '/notifications', desc: 'Alert preferences', comingSoon: false, isPro: false },
      { icon: 'help-circle', label: 'Help & Feedback', route: null as string | null, desc: '', comingSoon: false, isPro: false },
      { icon: 'star', label: 'Rate the App', route: null as string | null, desc: '', comingSoon: false, isPro: false },
    ],
  },
];

export default function MoreScreen() {
  const { user, logout } = useAuthStore();
  const { getStats } = useCatchStore();
  const router = useRouter();
  const stats = getStats();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const xpProgress = user ? (user.xp % 1000) / 1000 : 0;
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AN';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Profile Header ── */}
        <LinearGradient colors={['#0A1E1A', '#050A12']} style={styles.profileGradient}>
          {/* Avatar */}
          <LinearGradient
            colors={['#00D4AA', '#00A882']}
            style={styles.avatarRing}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </LinearGradient>

          <Text style={styles.userName}>{user?.name || 'Angler'}</Text>
          <Text style={styles.userHandle}>@{(user?.email?.split('@')[0] || 'angler').toLowerCase()}</Text>

          {/* XP bar */}
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBar}>
              <LinearGradient
                colors={['#00D4AA', '#2DD4FF']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.xpFill, { width: `${xpProgress * 100}%` as any }]}
              />
            </View>
            <Text style={styles.xpBarPct}>{Math.round(xpProgress * 100)}%</Text>
          </View>
          <Text style={styles.xpToNext}>to Level {(user?.level || 1) + 1}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { val: stats.total.toString(), label: 'Catches' },
              { val: Object.keys(stats.speciesCounts).length.toString(), label: 'Species' },
              { val: `${user?.streak || 0}d`, label: 'Streak' },
              { val: `${user?.level || 1}`, label: 'Level' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={styles.statsDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.val}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map((section, sectionIndex) => {
          const sectionIconBg = 'rgba(255,255,255,0.06)';
          return (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                    item.comingSoon && styles.menuItemDimmed,
                  ]}
                  onPress={() => {
                    if (item.comingSoon) {
                      Alert.alert('Coming Soon', 'This feature is coming in a future update!');
                      return;
                    }
                    if (item.route) {
                      router.push(item.route as any);
                    } else if (item.label === 'Rate the App') {
                      Alert.alert('Rate CAST', 'Thank you for using CAST! A rating on the App Store means the world to us.');
                    } else if (item.label === 'Help & Feedback') {
                      Alert.alert('Coming Soon', 'This feature is coming in a future update!');
                    }
                  }}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: sectionIconBg }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, item.comingSoon && styles.menuLabelDimmed]}>{item.label}</Text>
                    {item.desc ? <Text style={styles.menuDesc}>{item.desc}</Text> : null}
                  </View>
                  {item.isPro && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                  {item.comingSoon ? (
                    <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textTertiary} />
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          );
        })}

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOut} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CAST v1.0.0 • Made for Anglers Worldwide</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Profile Header ──
  profileGradient: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarRing: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22, fontWeight: '900', color: '#00D4AA',
  },
  userName: {
    fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 3,
  },
  userHandle: {
    fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md,
  },

  // XP bar
  xpBarContainer: {
    width: '78%', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  xpBar: {
    flex: 1, height: 6, backgroundColor: colors.surface2,
    borderRadius: 3, overflow: 'hidden',
  },
  xpFill: {
    height: '100%', backgroundColor: '#00D4AA', borderRadius: 3,
  },
  xpBarPct: {
    fontSize: 11, fontWeight: '700', color: '#00D4AA',
  },
  xpToNext: {
    fontSize: 10, color: colors.textTertiary, marginBottom: spacing.lg,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#00D4AA' },
  statLabel: { fontSize: 10, color: colors.textSecondary },
  statsDivider: { width: 1, height: 28, backgroundColor: colors.border, alignSelf: 'center' },

  // ── Section ──
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.md,
    minHeight: 52,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemDimmed: { opacity: 0.55 },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  menuLabelDimmed: { color: colors.textSecondary },
  menuDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  proBadge: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderRadius: radius.sm,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)',
    paddingHorizontal: 6, paddingVertical: 2,
  },
  proBadgeText: { fontSize: 9, fontWeight: '900', color: '#F59E0B', letterSpacing: 0.5 },

  // ── Sign Out ──
  signOut: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: colors.danger },
  version: {
    fontSize: 10, color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginBottom: spacing.md,
  },
});
