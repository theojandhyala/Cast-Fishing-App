import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { useAchievementStore } from '../store/achievementStore';
import { colors, radius, spacing, elevation } from '../constants/theme';

const BADGE_ICONS = [
  { name: 'fish', color: colors.secondary },
  { name: 'star', color: colors.secondary },
  { name: 'trophy', color: colors.secondary },
  { name: 'medal', color: colors.secondary },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const { achievements } = useAchievementStore();
  const stats = getStats();

  const displayName = user?.name || 'Angler';
  const bio = 'Passionate about fishing';

  const heaviest = stats.heaviest;
  const longestCatch = catches.reduce<typeof catches[0] | null>((best, c) => {
    if (!best) return c;
    return (c.length || 0) > (best.length || 0) ? c : best;
  }, null);

  const unlockedAchievements = achievements?.filter(a => a.unlocked) ?? [];
  const displayBadges = unlockedAchievements.slice(0, 4);
  const extraBadgeCount = Math.max(0, unlockedAchievements.length - 4);

  const sessions = (user as any)?.sessions ?? 28;
  const totalCatches = stats.total || 156;
  const speciesCount = Object.keys(stats.speciesCounts || {}).length || 23;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Profile header card */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <MaterialCommunityIcons name="account" size={36} color={colors.primary} />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{displayName}</Text>
            <Text style={s.profileBio}>{bio}</Text>
            <TouchableOpacity>
              <Text style={s.editLink}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={s.gearBtn}>
            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{sessions}</Text>
            <Text style={s.statLabel}>Sessions</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{totalCatches}</Text>
            <Text style={s.statLabel}>Catches</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{speciesCount}</Text>
            <Text style={s.statLabel}>Species</Text>
          </View>
        </View>

        {/* Biggest Catch */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Biggest Catch</Text>
          {heaviest ? (
            <View style={s.biggestCard}>
              <View style={s.biggestPhoto}>
                <MaterialCommunityIcons name="fish" size={32} color="rgba(0,212,170,0.4)" />
              </View>
              <View style={s.biggestInfo}>
                <Text style={s.biggestSpecies}>{heaviest.species}</Text>
                <Text style={s.biggestWeight}>{heaviest.weight} kg</Text>
                <Text style={s.biggestLocation}>{heaviest.location || 'Pine Lake'}</Text>
              </View>
            </View>
          ) : (
            <View style={s.biggestCard}>
              <View style={s.biggestPhoto}>
                <MaterialCommunityIcons name="fish" size={32} color="rgba(0,212,170,0.3)" />
              </View>
              <View style={s.biggestInfo}>
                <Text style={s.biggestSpecies}>Common Carp</Text>
                <Text style={s.biggestWeight}>12.4 kg</Text>
                <Text style={s.biggestLocation}>Pine Lake</Text>
              </View>
            </View>
          )}
        </View>

        {/* Personal Bests */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Personal Bests</Text>
          <View style={s.pbRow}>
            <View style={s.pbCard}>
              <Text style={s.pbLabel}>Heaviest Fish</Text>
              <Text style={s.pbValue}>{heaviest ? `${heaviest.weight} kg` : '12.4 kg'}</Text>
              <Text style={s.pbSpecies}>{heaviest?.species || 'Common Carp'}</Text>
            </View>
            <View style={s.pbCard}>
              <Text style={s.pbLabel}>Longest Fish</Text>
              <Text style={s.pbValue}>{longestCatch?.length ? `${longestCatch.length} cm` : '88 cm'}</Text>
              <Text style={s.pbSpecies}>{longestCatch?.species || 'Northern Pike'}</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Badges</Text>
          <View style={s.badgesRow}>
            {displayBadges.length > 0 ? displayBadges.map((a, i) => (
              <View key={a.id} style={s.badgeCircle}>
                <MaterialCommunityIcons name={BADGE_ICONS[i % BADGE_ICONS.length].name as any} size={22} color={colors.secondary} />
              </View>
            )) : BADGE_ICONS.map((b, i) => (
              <View key={i} style={s.badgeCircle}>
                <MaterialCommunityIcons name={b.name as any} size={22} color={colors.secondary} />
              </View>
            ))}
            {extraBadgeCount > 0 && (
              <View style={[s.badgeCircle, s.badgeExtra]}>
                <Text style={s.badgeExtraText}>+{extraBadgeCount}</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },
  avatarCircle: {
    width: 56, height: 56, borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(0,212,170,0.3)',
    marginRight: spacing.md,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  profileBio: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  editLink: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  gearBtn: { padding: 4 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    paddingVertical: spacing.md + 4,
    borderBottomWidth: 1, borderTopWidth: 1, borderColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 36, backgroundColor: colors.border },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },

  biggestCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    ...elevation.raised,
  },
  biggestPhoto: {
    width: 100, height: 80,
    backgroundColor: '#1a2a1a', alignItems: 'center', justifyContent: 'center',
  },
  biggestInfo: { flex: 1, paddingHorizontal: spacing.md },
  biggestSpecies: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  biggestWeight: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: 2 },
  biggestLocation: { fontSize: 12, color: colors.textSecondary },

  pbRow: { flexDirection: 'row', gap: 12 },
  pbCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    ...elevation.raised,
  },
  pbLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 8 },
  pbValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  pbSpecies: { fontSize: 11, color: colors.textSecondary },

  badgesRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  badgeCircle: {
    width: 52, height: 52, borderRadius: radius.full,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  badgeExtra: { backgroundColor: colors.surface2, borderColor: colors.border },
  badgeExtraText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
});
