import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { useAchievementStore } from '../store/achievementStore';
import { colors, radius, spacing, elevation } from '../constants/theme';

const BADGE_DEFS = [
  { icon: 'hook', label: 'First Cast', color: colors.primary },
  { icon: 'star', label: 'Top Angler', color: colors.secondary },
  { icon: 'trophy', label: 'PB Chaser', color: '#F472B6' },
  { icon: 'medal', label: 'Species Pro', color: '#60A5FA' },
  { icon: 'fire', label: '7 Day Streak', color: '#F97316' },
  { icon: 'crown', label: 'Legend', color: '#A78BFA' },
];

const LEVEL_TITLES = [
  'Beginner', 'Novice', 'Apprentice', 'Angler', 'Experienced',
  'Expert', 'Master', 'Elite', 'Legend', 'Champion',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const { achievements } = useAchievementStore();
  const stats = getStats();

  const displayName = user?.name || 'Angler';
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const xpInLevel = xp % 1000;
  const xpProgress = xpInLevel / 1000;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const heaviest = stats.heaviest;
  const longestCatch = catches.reduce<typeof catches[0] | null>((best, c) => {
    if (!best) return c;
    return (c.length || 0) > (best.length || 0) ? c : best;
  }, null);

  const totalWeight = catches.reduce((sum, c) => sum + (c.weight || 0), 0);
  const speciesCounts = stats.speciesCounts || {};
  const speciesCount = Object.keys(speciesCounts).length;
  const topSpecies = Object.entries(speciesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const unlockedAchievements = achievements?.filter(a => a.unlocked) ?? [];
  const displayBadges = unlockedAchievements.length > 0
    ? unlockedAchievements.slice(0, 6).map((a, i) => ({
        ...BADGE_DEFS[i % BADGE_DEFS.length],
        label: a.title || BADGE_DEFS[i % BADGE_DEFS.length].label,
      }))
    : BADGE_DEFS.slice(0, catches.length > 0 ? 2 : 0);

  const recentCatches = catches.slice(0, 3);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero */}
        <LinearGradient colors={['#0D1E2E', '#0A0E1A']} style={s.hero}>
          <View style={s.heroTop}>
            <View style={s.avatarWrap}>
              <LinearGradient colors={['rgba(0,212,170,0.25)', 'rgba(0,212,170,0.05)']} style={s.avatarGrad}>
                <MaterialCommunityIcons name="account" size={40} color={colors.primary} />
              </LinearGradient>
              <View style={s.avatarRing} />
            </View>
            <TouchableOpacity onPress={() => router.push('/settings' as any)} style={s.gearBtn}>
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={s.heroName}>{displayName}</Text>
          <View style={s.levelRow}>
            <View style={s.levelPill}>
              <MaterialCommunityIcons name="shield-star" size={13} color={colors.primary} />
              <Text style={s.levelPillText}>Level {level} · {levelTitle}</Text>
            </View>
            {user?.streak ? (
              <View style={s.streakPill}>
                <MaterialCommunityIcons name="fire" size={13} color="#F97316" />
                <Text style={s.streakPillText}>{user.streak}d streak</Text>
              </View>
            ) : null}
          </View>

          {/* XP bar */}
          <View style={s.xpBlock}>
            <View style={s.xpLabelRow}>
              <Text style={s.xpLabel}>{xpInLevel} / 1000 XP</Text>
              <Text style={s.xpNext}>Level {level + 1} in {1000 - xpInLevel} XP</Text>
            </View>
            <View style={s.xpBar}>
              <View style={[s.xpFill, { width: `${xpProgress * 100}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={s.editPill}>
            <Text style={s.editPillText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick stats */}
        <View style={s.statsRow}>
          {[
            { val: String(catches.length), label: 'Catches' },
            { val: String(speciesCount), label: 'Species' },
            { val: totalWeight > 0 ? `${totalWeight.toFixed(0)}kg` : '0', label: 'Total Weight' },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={s.statDiv} />}
              <View style={s.statItem}>
                <Text style={s.statVal}>{item.val}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Personal bests */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Text style={s.sectionTitle}>Personal Bests</Text>
          </View>
          <View style={s.pbRow}>
            <View style={s.pbCard}>
              <MaterialCommunityIcons name="weight" size={18} color={colors.primary} />
              <Text style={s.pbVal}>{heaviest ? `${heaviest.weight} kg` : '—'}</Text>
              <Text style={s.pbType}>Heaviest</Text>
              <Text style={s.pbSp} numberOfLines={1}>{heaviest?.species || 'None logged'}</Text>
            </View>
            <View style={s.pbCard}>
              <MaterialCommunityIcons name="ruler" size={18} color={colors.accentBlue} />
              <Text style={[s.pbVal, { color: colors.accentBlue }]}>{longestCatch?.length ? `${longestCatch.length} cm` : '—'}</Text>
              <Text style={s.pbType}>Longest</Text>
              <Text style={s.pbSp} numberOfLines={1}>{longestCatch?.species || 'None logged'}</Text>
            </View>
            <View style={s.pbCard}>
              <MaterialCommunityIcons name="fire" size={18} color={colors.secondary} />
              <Text style={[s.pbVal, { color: colors.secondary }]}>{user?.streak || 0}d</Text>
              <Text style={s.pbType}>Streak</Text>
              <Text style={s.pbSp}>Days active</Text>
            </View>
          </View>
        </View>

        {/* Species breakdown */}
        {topSpecies.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Top Species</Text>
            </View>
            <View style={s.speciesCard}>
              {topSpecies.map(([species, count], i) => {
                const pct = (count / topSpecies[0][1]) * 100;
                return (
                  <View key={species} style={[s.speciesRow, i < topSpecies.length - 1 && s.speciesRowBorder]}>
                    <Text style={s.speciesName} numberOfLines={1}>{species}</Text>
                    <View style={s.speciesBarWrap}>
                      <View style={[s.speciesBar, { width: `${pct}%` }]} />
                    </View>
                    <Text style={s.speciesCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent catches */}
        {recentCatches.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Recent Catches</Text>
            </View>
            <View style={s.recentCard}>
              {recentCatches.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.recentRow, i < recentCatches.length - 1 && s.recentRowBorder]}
                  onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                >
                  <View style={s.recentIcon}>
                    <MaterialCommunityIcons name="fish" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.recentSpecies}>{c.species}</Text>
                    <Text style={s.recentMeta}>{c.location || 'Unknown'} · {c.weight ? `${c.weight} kg` : 'No weight'}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Badges */}
        {displayBadges.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Badges Earned</Text>
            </View>
            <View style={s.badgeRow}>
              {displayBadges.map((b, i) => (
                <View key={i} style={s.badgeItem}>
                  <LinearGradient colors={[b.color + '28', b.color + '08']} style={s.badgeCircle}>
                    <MaterialCommunityIcons name={b.icon as any} size={22} color={b.color} />
                  </LinearGradient>
                  <Text style={s.badgeLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty nudge */}
        {catches.length === 0 && (
          <View style={s.nudge}>
            <MaterialCommunityIcons name="fish" size={32} color={colors.primary} />
            <Text style={s.nudgeTitle}>Start building your story</Text>
            <Text style={s.nudgeSub}>Log catches to unlock stats, species breakdown, personal bests and badges.</Text>
            <TouchableOpacity style={s.nudgeBtn} onPress={() => router.push('/add-catch' as any)}>
              <Text style={s.nudgeBtnText}>Log Your First Catch</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatarGrad: {
    width: 72, height: 72, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute', top: -2, left: -2, right: -2, bottom: -2,
    borderRadius: radius.full, borderWidth: 2, borderColor: 'rgba(0,212,170,0.4)',
  },
  gearBtn: {
    width: 44, height: 44, borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroName: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.7, marginBottom: 10 },

  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,212,170,0.12)', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  levelPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(249,115,22,0.12)', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  streakPillText: { fontSize: 12, fontWeight: '700', color: '#F97316' },

  xpBlock: { marginBottom: 18 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  xpLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  xpNext: { fontSize: 11, color: colors.textTertiary },
  xpBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

  editPill: {
    alignSelf: 'flex-start', borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.4)',
    paddingHorizontal: 16, paddingVertical: 7,
  },
  editPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginVertical: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.lg, ...elevation.raised,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.8 },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  statDiv: { width: 1, height: 36, backgroundColor: colors.border },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionBar: { width: 3, height: 16, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },

  pbRow: { flexDirection: 'row', gap: 10 },
  pbCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center', gap: 4, ...elevation.raised,
  },
  pbVal: { fontSize: 18, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  pbType: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  pbSp: { fontSize: 10, color: colors.textTertiary, textAlign: 'center' },

  speciesCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...elevation.raised,
  },
  speciesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  speciesRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  speciesName: { width: 110, fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  speciesBarWrap: {
    flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
  },
  speciesBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  speciesCount: { width: 28, fontSize: 13, fontWeight: '800', color: colors.primary, textAlign: 'right' },

  recentCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...elevation.raised,
  },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.md, paddingVertical: 13,
  },
  recentRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  recentIcon: {
    width: 38, height: 38, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  recentSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  recentMeta: { fontSize: 11, color: colors.textSecondary },

  badgeRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  badgeItem: { alignItems: 'center', gap: 6, width: 64 },
  badgeCircle: {
    width: 56, height: 56, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeLabel: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },

  nudge: {
    alignItems: 'center', gap: 10,
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    backgroundColor: 'rgba(0,212,170,0.05)',
    borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(0,212,170,0.15)',
    padding: spacing.xl,
  },
  nudgeTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  nudgeSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  nudgeBtn: {
    marginTop: 4, borderRadius: radius.full,
    backgroundColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  nudgeBtnText: { fontSize: 14, fontWeight: '700', color: colors.background },
});
