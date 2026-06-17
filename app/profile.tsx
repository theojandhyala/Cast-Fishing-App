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
  { icon: 'fish', label: 'First Catch', color: colors.primary },
  { icon: 'star', label: 'Top Angler', color: colors.secondary },
  { icon: 'trophy', label: 'PB Chaser', color: '#F472B6' },
  { icon: 'medal', label: 'Species Pro', color: '#60A5FA' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const { achievements } = useAchievementStore();
  const stats = getStats();

  const displayName = user?.name || 'Angler';
  const heaviest = stats.heaviest;
  const longestCatch = catches.reduce<typeof catches[0] | null>((best, c) => {
    if (!best) return c;
    return (c.length || 0) > (best.length || 0) ? c : best;
  }, null);

  const unlockedAchievements = achievements?.filter(a => a.unlocked) ?? [];
  const displayBadges = unlockedAchievements.length > 0
    ? unlockedAchievements.slice(0, 4).map((a, i) => ({ ...BADGE_DEFS[i % BADGE_DEFS.length], label: a.title || BADGE_DEFS[i % BADGE_DEFS.length].label }))
    : BADGE_DEFS;
  const extraCount = Math.max(0, unlockedAchievements.length - 4);

  const sessions = (user as any)?.sessions ?? 28;
  const totalCatches = stats.total || 0;
  const speciesCount = Object.keys(stats.speciesCounts || {}).length || 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero profile header */}
        <LinearGradient colors={['#0D1E2E', '#0A0E1A']} style={s.heroGrad}>
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
          <Text style={s.heroBio}>Passionate angler · Catch log active</Text>
          <TouchableOpacity style={s.editPill}>
            <Text style={s.editPillText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { val: sessions, label: 'Sessions' },
            { val: totalCatches, label: 'Catches' },
            { val: speciesCount, label: 'Species' },
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

        {/* Biggest Catch */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Text style={s.sectionTitle}>Biggest Catch</Text>
          </View>
          <View style={s.bigCard}>
            <LinearGradient colors={['#0D2416', '#060E0A']} style={s.bigPhoto}>
              <MaterialCommunityIcons name="fish" size={36} color="rgba(0,212,170,0.3)" />
            </LinearGradient>
            <View style={s.bigInfo}>
              <Text style={s.bigSpecies}>{heaviest?.species || 'Common Carp'}</Text>
              <Text style={s.bigWeight}>{heaviest ? `${heaviest.weight} kg` : '12.4 kg'}</Text>
              <Text style={s.bigLoc}>{heaviest?.location || 'Pine Lake'}</Text>
              <View style={s.pbPill}>
                <Text style={s.pbPillText}>PB</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Bests */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Text style={s.sectionTitle}>Personal Bests</Text>
          </View>
          <View style={s.pbRow}>
            <View style={s.pbCard}>
              <MaterialCommunityIcons name="weight" size={16} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={s.pbVal}>{heaviest ? `${heaviest.weight} kg` : '12.4 kg'}</Text>
              <Text style={s.pbType}>Heaviest Fish</Text>
              <Text style={s.pbSp}>{heaviest?.species || 'Common Carp'}</Text>
            </View>
            <View style={s.pbCard}>
              <MaterialCommunityIcons name="ruler" size={16} color={colors.accentBlue} style={{ marginBottom: 8 }} />
              <Text style={[s.pbVal, { color: colors.accentBlue }]}>{longestCatch?.length ? `${longestCatch.length} cm` : '88 cm'}</Text>
              <Text style={s.pbType}>Longest Fish</Text>
              <Text style={s.pbSp}>{longestCatch?.species || 'Northern Pike'}</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionBar} />
            <Text style={s.sectionTitle}>Badges</Text>
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
            {extraCount > 0 && (
              <View style={s.badgeItem}>
                <View style={[s.badgeCircle, s.badgeExtra]}>
                  <Text style={s.badgeExtraText}>+{extraCount}</Text>
                </View>
                <Text style={s.badgeLabel}>More</Text>
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

  heroGrad: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 28 },
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
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroName: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.7, marginBottom: 4 },
  heroBio: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
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
    paddingVertical: spacing.lg,
    ...elevation.raised,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1 },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  statDiv: { width: 1, height: 40, backgroundColor: colors.border },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionBar: { width: 3, height: 16, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },

  bigCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)', overflow: 'hidden',
    ...elevation.raised,
  },
  bigPhoto: { width: 100, height: 90, alignItems: 'center', justifyContent: 'center' },
  bigInfo: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: 12, position: 'relative' },
  bigSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  bigWeight: { fontSize: 24, fontWeight: '900', color: colors.primary, letterSpacing: -0.8, marginBottom: 2 },
  bigLoc: { fontSize: 11, color: colors.textSecondary },
  pbPill: {
    position: 'absolute', top: 10, right: 12,
    backgroundColor: colors.secondary, borderRadius: radius.xs,
    paddingHorizontal: 7, paddingVertical: 3,
    shadowColor: colors.secondary, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
  },
  pbPillText: { fontSize: 9, fontWeight: '900', color: '#0A0E1A', letterSpacing: 0.5 },

  pbRow: { flexDirection: 'row', gap: 12 },
  pbCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, ...elevation.raised,
  },
  pbVal: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: -0.5, marginBottom: 2 },
  pbType: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  pbSp: { fontSize: 11, color: colors.textTertiary },

  badgeRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  badgeItem: { alignItems: 'center', gap: 6, width: 64 },
  badgeCircle: {
    width: 56, height: 56, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  badgeExtra: { backgroundColor: colors.surface, borderColor: colors.border },
  badgeExtraText: { fontSize: 14, fontWeight: '800', color: colors.textSecondary },
  badgeLabel: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
});
