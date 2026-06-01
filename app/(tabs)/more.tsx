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

const menuItems = [
  {
    section: 'Fishing Tools',
    items: [
      { icon: 'rope', label: 'Knot Library', route: '/knots', color: colors.primary },
      { icon: 'waves', label: 'Tides & Conditions', route: '/conditions', color: '#60A5FA' },
      { icon: 'camera', label: 'Fish Identifier', route: '/identifier', color: colors.secondary },
    ],
  },
  {
    section: 'Account',
    items: [
      { icon: 'crown', label: 'Upgrade to Pro', route: '/pro', color: colors.secondary },
      { icon: 'cog', label: 'Settings', route: null, color: colors.textSecondary },
      { icon: 'help-circle', label: 'Help & Support', route: null, color: colors.textSecondary },
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
            <Text style={styles.xpText}>{user?.xp || 0} XP</Text>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatItem label="Catches" value={stats.total.toString()} icon="fish" />
          <StatItem label="Species" value={Object.keys(stats.speciesCounts).length.toString()} icon="book" />
          <StatItem label="Best (kg)" value={stats.heaviest ? stats.heaviest.weight.toString() : '-'} icon="trophy" />
        </View>

        {/* Menu */}
        {menuItems.map((section) => (
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
                    } else {
                      Alert.alert('Coming Soon', 'This feature is coming in a future update!');
                    }
                  }}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsCard}>
            <View style={styles.achievementsRow}>
              {[
                { emoji: '🎣', title: 'First Cast', unlocked: stats.total >= 1 },
                { emoji: '🐟', title: '10 Catches', unlocked: stats.total >= 10 },
                { emoji: '🏆', title: '5kg Fish', unlocked: (stats.heaviest?.weight || 0) >= 5 },
                { emoji: '🔥', title: '7 Day Streak', unlocked: (user?.streak || 0) >= 7 },
              ].map((a) => (
                <View key={a.title} style={[styles.achievement, !a.unlocked && styles.achievementLocked]}>
                  <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                  <Text style={styles.achievementTitle}>{a.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

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
  xpText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
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
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  achievementsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    opacity: 0.4,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
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
