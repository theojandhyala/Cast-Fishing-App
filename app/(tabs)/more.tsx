import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { colors, radius, spacing } from '../../constants/theme';

const MENU_SECTIONS = [
  {
    section: 'MY FISHING',
    items: [
      { icon: 'account-circle', label: 'My Profile', route: '/profile', color: colors.primary, desc: 'XP, level & badges' },
      { icon: 'trophy', label: 'My Records', route: '/records', color: colors.secondary, desc: 'PBs vs UK records' },
      { icon: 'toolbox', label: 'My Gear', route: '/gear-tracker', color: '#60A5FA', desc: 'Tackle & kit tracker' },
      { icon: 'calendar-clock', label: 'Trip Planner', route: '/trip-planner', color: '#10B981', desc: 'Plan your sessions' },
    ],
  },
  {
    section: 'TOOLS',
    items: [
      { icon: 'robot', label: 'AI Advisor', route: '/ai-advisor', color: colors.primary, desc: 'Ask anything about fishing' },
      { icon: 'calendar-month', label: 'Fishing Calendar', route: '/fishing-calendar', color: '#A78BFA', desc: 'Moon, tides & scores' },
      { icon: 'food-drumstick', label: 'Bait Guide', route: '/bait-guide', color: '#10B981', desc: '30+ baits & bait match' },
      { icon: 'rope', label: 'Knot Library', route: '/knots', color: colors.primary, desc: '20 essential knots' },
      { icon: 'weather-partly-cloudy', label: 'Weather & Tides', route: '/weather-detail', color: '#60A5FA', desc: 'Full conditions dashboard' },
      { icon: 'camera', label: 'Fish Identifier', route: '/identifier', color: colors.secondary, desc: 'Photo ID tool' },
      { icon: 'hook', label: 'Rig Builder', route: '/rig-builder', color: '#10B981', desc: '15 rig tutorials' },
      { icon: 'water', label: 'Water Conditions', route: '/water-conditions', color: '#3B82F6', desc: 'Temp, clarity & levels' },
      { icon: 'store', label: 'Tackle Shops', route: '/tackle-shops', color: '#F59E0B', desc: 'Find local tackle shops' },
    ],
  },
  {
    section: 'RULES',
    items: [
      { icon: 'file-document', label: 'Licence & Regulations', route: '/licence-checker', color: colors.danger, desc: 'Licence, seasons & sizes' },
      { icon: 'ruler', label: 'Size Limits', route: '/licence-checker', color: colors.warning, desc: 'Legal size checker' },
      { icon: 'calendar-remove', label: 'Closed Seasons', route: '/licence-checker', color: '#EF4444', desc: 'When you can fish' },
    ],
  },
  {
    section: 'COMMUNITY',
    items: [
      { icon: 'account-group', label: 'Community Feed', route: '/community', color: '#60A5FA', desc: 'See what others are catching' },
      { icon: 'podium', label: 'Leaderboards', route: '/leaderboards', color: colors.secondary, desc: 'Top anglers this week' },
      { icon: 'account-multiple', label: 'Fishing Clubs', route: '/clubs', color: '#8B5CF6', desc: 'Join and create clubs' },
      { icon: 'medal', label: 'Challenges', route: '/challenges', color: '#F97316', desc: 'Weekly & monthly goals' },
      { icon: 'trophy-outline', label: 'Competitions', route: '/competitions', color: '#EC4899', desc: 'Local & virtual competitions' },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      { icon: 'crown', label: 'Upgrade to Pro', route: '/pro', color: colors.secondary, desc: 'Unlock all features' },
      { icon: 'cog', label: 'Settings', route: '/settings', color: colors.textSecondary, desc: 'Preferences & account' },
      { icon: 'bell', label: 'Notifications', route: '/notifications', color: '#8B5CF6', desc: 'Alert preferences' },
      { icon: 'help-circle', label: 'Help & Feedback', route: null, color: colors.textSecondary, desc: '' },
      { icon: 'star', label: 'Rate the App', route: null, color: colors.secondary, desc: '' },
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient
          colors={['rgba(0,212,170,0.1)', 'transparent']}
          style={styles.profileGradient}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🎣</Text>
            </View>
            {user?.isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'Angler'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="fish" size={12} color={colors.primary} />
              <Text style={styles.levelText}>Level {user?.level || 1}</Text>
            </View>
            <Text style={styles.xpLabel}>{user?.xp || 0} XP</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.xpBarLabel}>{Math.round(xpProgress * 100)}% to Level {(user?.level || 1) + 1}</Text>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatItem label="Catches" value={stats.total.toString()} icon="fish" />
          <StatItem label="Species" value={Object.keys(stats.speciesCounts).length.toString()} icon="book" />
          <StatItem label="Best (kg)" value={stats.heaviest ? stats.heaviest.weight.toString() : '-'} icon="trophy" />
          <StatItem label="Streak" value={`${user?.streak || 0}d`} icon="fire" />
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <View style={styles.achievementsRow}>
            {[
              { emoji: '🎣', title: 'First Cast', unlocked: stats.total >= 1 },
              { emoji: '🐟', title: '10 Catches', unlocked: stats.total >= 10 },
              { emoji: '🏆', title: '5kg Fish', unlocked: (stats.heaviest?.weight || 0) >= 5 },
              { emoji: '🔥', title: '7 Day Streak', unlocked: (user?.streak || 0) >= 7 },
              { emoji: '🌟', title: '5 Species', unlocked: Object.keys(stats.speciesCounts).length >= 5 },
            ].map((a) => (
              <View key={a.title} style={[styles.achievement, !a.unlocked && styles.achievementLocked]}>
                <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                <Text style={styles.achievementTitle}>{a.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route as any);
                    } else if (item.label === 'Rate the App') {
                      Alert.alert('Rate CAST', 'Thank you for using CAST! A rating on the App Store means the world to us. ⭐⭐⭐⭐⭐');
                    } else if (item.label === 'Settings' || item.label === 'Help & Feedback' || item.label === 'Fishing Clubs') {
                      Alert.alert('Coming Soon', 'This feature is coming in a future update!');
                    } else if (item.label === 'My Profile') {
                      Alert.alert('Your Profile', `Level ${user?.level || 1} Angler\n${user?.xp || 0} XP\n${stats.total} catches logged\n${Object.keys(stats.speciesCounts).length} species caught`);
                    }
                  }}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.desc ? <Text style={styles.menuDesc}>{item.desc}</Text> : null}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CAST v1.0.0 • Made for UK Anglers 🇬🇧</Text>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon as any} size={16} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '44',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  proBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A0E1A',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  xpLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  xpBarContainer: {
    width: '80%',
    alignItems: 'center',
    gap: 4,
  },
  xpBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  xpBarLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  achievementsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievement: {
    alignItems: 'center',
    gap: 4,
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
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
    padding: spacing.md,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  menuDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  version: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
