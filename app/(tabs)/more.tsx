import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { colors, spacing, radius } from '../../constants/theme';

const ACHIEVEMENTS = [
  { icon: 'fish', name: 'First Blood', progress: 1, total: 1 },
  { icon: 'trophy', name: 'Bag Limit', progress: 10, total: 10 },
  { icon: 'star', name: 'Specimen Hunter', progress: 3, total: 10 },
  { icon: 'fire', name: 'On the Water', progress: 3, total: 7 },
  { icon: 'medal', name: 'Trophy Haul', progress: 0, total: 1 },
];

const MENU_SECTIONS = [
  {
    title: 'MY FISHING',
    items: [
      { icon: 'calendar-month', label: 'Fishing Calendar', route: '/fishing-calendar' },
      { icon: 'trophy', label: 'Personal Records', route: '/records' },
      { icon: 'robot-outline', label: 'AI Advisor', route: '/ai-advisor' },
      { icon: 'chart-line', label: 'Conditions & Intel', route: '/conditions' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { icon: 'crown', label: 'Manage Subscription', route: '/pro' },
      { icon: 'cog', label: 'Settings', route: '/settings' },
      { icon: 'help-circle-outline', label: 'Help & Support', route: null as string | null },
    ],
  },
];

export default function MoreScreen() {
  const { user, logout } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const router = useRouter();
  const stats = getStats();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AN';

  const speciesCount = Object.keys(stats.speciesCounts ?? {}).length;

  const catchStreak = React.useMemo(() => {
    if (!catches.length) return 0;
    const days = new Set(catches.map((c) => new Date(c.date).toDateString()));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) streak++;
      else break;
    }
    return streak;
  }, [catches]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarInitials}>{initials}</Text>
            </View>
          </View>
          <View style={s.profileInfo}>
            <View style={s.profileNameRow}>
              <Text style={s.profileName}>{user?.name || 'Angler'}</Text>
              {user?.isPro && (
                <View style={s.proBadge}>
                  <Text style={s.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={s.profileEmail}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => router.push('/profile' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Dashboard */}
        <View style={s.statsSection}>
          <View style={s.statsGrid}>
            {[
              { icon: 'fish', value: String(stats.total), label: 'Total Catches', color: colors.primary },
              { icon: 'leaf', value: String(speciesCount), label: 'Species', color: colors.secondary },
              { icon: 'clock-outline', value: '—', label: 'Hours Fished', color: colors.accent },
              { icon: 'fire', value: `${catchStreak}d`, label: 'Day Streak', color: colors.accent },
            ].map((item) => (
              <View key={item.label} style={s.statCard}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                <Text style={[s.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={s.sectionWrap}>
          <Text style={s.sectionHeader}>ACHIEVEMENTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.achievementsScroll}
          >
            {ACHIEVEMENTS.map((ach) => {
              const pct = Math.min(1, ach.progress / ach.total);
              const done = pct >= 1;
              return (
                <View key={ach.name} style={s.achievementCard}>
                  <View style={[s.achievementIconCircle, done && s.achievementIconDone]}>
                    <MaterialCommunityIcons
                      name={ach.icon as any}
                      size={22}
                      color={done ? colors.bg : colors.primary}
                    />
                  </View>
                  <Text style={s.achievementName} numberOfLines={2}>{ach.name}</Text>
                  {!done && (
                    <View style={s.achievementProgressTrack}>
                      <View style={[s.achievementProgressFill, { width: `${pct * 100}%` as any }]} />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={s.sectionWrap}>
            <Text style={s.sectionHeader}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.menuRow, i > 0 && s.menuRowBorder]}
                  onPress={() => {
                    if (item.route) router.push(item.route as any);
                    else Alert.alert('Coming Soon', 'This feature is coming soon!');
                  }}
                  activeOpacity={0.75}
                >
                  <View style={s.menuIconWrap}>
                    <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.textSecondary} />
                  </View>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={s.signOut}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 14,
  },
  avatarWrap: {},
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  profileInfo: { flex: 1 },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  proBadge: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderMid,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Stats
  statsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  sectionWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Achievements
  achievementsScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  achievementCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  achievementIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconDone: {
    backgroundColor: colors.primary,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  achievementProgressTrack: {
    height: 4,
    backgroundColor: colors.surface3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },

  // Menu
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    gap: 14,
  },
  menuRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Sign out
  signOut: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
});
