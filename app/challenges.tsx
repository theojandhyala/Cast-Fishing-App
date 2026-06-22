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
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { WEEKLY_CHALLENGES, MONTHLY_CHALLENGES, SPECIAL_CHALLENGES, PAST_CHALLENGES } from '../data/challengesData';
import { colors, radius, spacing, elevation } from '../constants/theme';

const CHALLENGE_ICONS: Record<string, string> = {
  wc1: 'fish',
  wc2: 'weather-sunset',
  wc3: 'map-marker',
  mc1: 'trophy',
  sc1: 'fish',
  sc2: 'snowflake',
  sc3: 'weather-sunny',
  past1: 'bug',
  past2: 'waves',
  past3: 'scale-balance',
};

// ─── Friends Progress Data ────────────────────────────────────────────────────

const FRIEND_PROGRESS = [
  {
    id: 'fp1',
    name: 'Jake',
    color: '#F97316',
    challenge: '3 Catches This Week',
    progress: 2,
    target: 3,
    level: 8,
    complete: false,
  },
  {
    id: 'fp2',
    name: 'Tom',
    color: '#8B5CF6',
    challenge: '3 Catches This Week',
    progress: 3,
    target: 3,
    level: 12,
    complete: true,
  },
  {
    id: 'fp3',
    name: 'Emma',
    color: '#EC4899',
    challenge: '3 Catches This Week',
    progress: 1,
    target: 3,
    level: 5,
    complete: false,
  },
];

function FriendProgressCard({ friend }: { friend: typeof FRIEND_PROGRESS[0] }) {
  const initials = friend.name.slice(0, 2).toUpperCase();
  const pct = Math.min(friend.progress / friend.target, 1) * 100;

  return (
    <View style={styles.friendCard}>
      <LinearGradient
        colors={[friend.color + 'CC', friend.color + '66']}
        style={styles.friendAvatar}
      >
        <Text style={styles.friendInitials}>{initials}</Text>
      </LinearGradient>
      <Text style={styles.friendName}>{friend.name}</Text>
      <Text style={styles.friendChallenge} numberOfLines={2}>{friend.challenge}</Text>

      {friend.complete ? (
        <View style={styles.friendCompleteChip}>
          <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
          <Text style={styles.friendCompleteText}>Done!</Text>
        </View>
      ) : (
        <>
          <View style={styles.friendProgressTrack}>
            <View style={[styles.friendProgressFill, { width: `${pct}%` as any, backgroundColor: friend.color }]} />
          </View>
          <Text style={styles.friendProgressLabel}>{friend.progress}/{friend.target}</Text>
        </>
      )}

      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>Lv {friend.level}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChallengesScreen() {
  const allWeeklyComplete = WEEKLY_CHALLENGES.every(c => c.completed);
  const streakBonus = 500;

  const handleFriendChallenge = () => {
    Alert.alert('Coming Soon', 'Friend challenges launching with multiplayer update!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* XP Banner */}
        <View style={styles.bannerWrapper}>
          <LinearGradient
            colors={['rgba(0,212,170,0.18)', 'rgba(0,212,170,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.xpBanner}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.primary} />
            <Text style={styles.xpBannerText}>This week you can earn up to <Text style={styles.xpBannerHighlight}>2,400 XP</Text> from challenges</Text>
          </LinearGradient>
        </View>

        {/* Weekly */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Weekly Challenges</Text>
              <Text style={styles.sectionSub}>Resets Monday</Text>
            </View>
            <TouchableOpacity style={styles.friendChallengeBtn} onPress={handleFriendChallenge} activeOpacity={0.8}>
              <MaterialCommunityIcons name="sword-cross" size={13} color={colors.primary} />
              <Text style={styles.friendChallengeBtnText}>Challenge</Text>
            </TouchableOpacity>
          </View>
          {allWeeklyComplete && (
            <View style={styles.streakBonusCard}>
              <MaterialCommunityIcons name="fire" size={20} color={colors.secondary} />
              <Text style={styles.streakBonusText}>All 3 completed — +{streakBonus} XP Streak Bonus!</Text>
            </View>
          )}
          {WEEKLY_CHALLENGES.map(c => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </View>

        {/* Friends' Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Friends' Progress</Text>
              <Text style={styles.sectionSub}>This week</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsScroll}
          >
            {FRIEND_PROGRESS.map(f => (
              <FriendProgressCard key={f.id} friend={f} />
            ))}
          </ScrollView>
        </View>

        {/* Monthly */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Challenge</Text>
            <Text style={styles.sectionSub}>Ends 30 Jun</Text>
          </View>
          {MONTHLY_CHALLENGES.map(c => (
            <ChallengeCard key={c.id} challenge={c} featured />
          ))}
        </View>

        {/* Special */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Challenges</Text>
          {SPECIAL_CHALLENGES.map(c => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge History</Text>
          <View style={styles.card}>
            {PAST_CHALLENGES.map((c, i) => (
              <View key={c.id} style={[styles.historyRow, i < PAST_CHALLENGES.length - 1 && styles.historyBorder]}>
                <MaterialCommunityIcons name={(CHALLENGE_ICONS[c.id] || 'trophy') as any} size={24} color={colors.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{c.title}</Text>
                  <Text style={styles.historySub}>Completed {new Date(c.completedAt).toLocaleDateString('en-GB')}</Text>
                </View>
                <View style={styles.xpEarned}>
                  <Text style={styles.xpEarnedText}>+{c.xpEarned} XP</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, featured }: { challenge: (typeof WEEKLY_CHALLENGES)[0]; featured?: boolean }) {
  const progress = Math.min(challenge.progress / challenge.target, 1);
  const pct = Math.round(progress * 100);
  const isClaimable = !challenge.completed && pct === 100;

  return (
    <View style={[styles.challengeCard, featured && styles.challengeFeatured, challenge.completed && styles.challengeCompleted]}>
      <View style={styles.challengeTop}>
        <MaterialCommunityIcons name={(CHALLENGE_ICONS[challenge.id] || 'trophy') as any} size={28} color={colors.secondary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>
        </View>
        {challenge.completed ? (
          <View style={styles.completedBadge}>
            <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
          </View>
        ) : (
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{challenge.xpReward} XP</Text>
          </View>
        )}
      </View>
      {challenge.target > 1 && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }, challenge.completed && styles.progressFillComplete]} />
          </View>
          <Text style={styles.progressText}>{challenge.progress} / {challenge.target}</Text>
        </View>
      )}
      {!challenge.completed && challenge.target === 1 && (
        <View style={styles.incompleteRow}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.incompleteText}>Not started • Expires {challenge.expiresAt}</Text>
        </View>
      )}
      {challenge.completed && (
        <View style={styles.completedRow}>
          <MaterialCommunityIcons name="check" size={12} color={colors.success} />
          <Text style={styles.completedText}>Challenge complete! +{challenge.xpReward} XP earned</Text>
        </View>
      )}
      {isClaimable && (
        <TouchableOpacity
          style={styles.claimButton}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Claimed!', `+${challenge.xpReward} XP added to your profile.`)}
        >
          <MaterialCommunityIcons name="gift-outline" size={15} color={colors.background} />
          <Text style={styles.claimButtonText}>CLAIM {challenge.xpReward} XP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  sectionSub: { fontSize: 12, color: colors.textSecondary },

  // XP Banner
  bannerWrapper: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  xpBannerText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  xpBannerHighlight: { color: colors.primary, fontWeight: '700' },

  // Friend challenge button
  friendChallengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  friendChallengeBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  // Streak bonus
  streakBonusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', padding: spacing.md, marginBottom: spacing.sm },
  streakBonusText: { fontSize: 13, color: colors.secondary, fontWeight: '600', flex: 1 },

  // Challenge card
  challengeCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  challengeFeatured: { borderColor: colors.primary + '44', backgroundColor: 'rgba(0,212,170,0.04)' },
  challengeCompleted: { borderColor: colors.success + '44', backgroundColor: 'rgba(16,185,129,0.04)' },
  challengeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  challengeTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  challengeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  completedBadge: {},
  xpBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  xpBadgeText: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressBar: { flex: 1, height: 8, backgroundColor: '#121C2D', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  progressFillComplete: { backgroundColor: colors.success },
  progressText: { fontSize: 12, color: colors.textSecondary, minWidth: 40, textAlign: 'right' },
  incompleteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  incompleteText: { fontSize: 11, color: colors.textSecondary },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { fontSize: 11, color: colors.success },

  // Claim button
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 10,
    marginTop: spacing.xs,
    ...elevation.glow,
  },
  claimButtonText: { fontSize: 13, fontWeight: '800', color: colors.background, letterSpacing: 1 },

  // History
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  historyTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  historySub: { fontSize: 12, color: colors.textSecondary },
  xpEarned: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  xpEarnedText: { fontSize: 12, fontWeight: '700', color: colors.success },

  // Friends progress
  friendsScroll: { paddingRight: spacing.sm, gap: spacing.sm, flexDirection: 'row' },
  friendCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    width: 130,
    alignItems: 'center',
    gap: 6,
    ...elevation.raised,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  friendName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  friendChallenge: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  friendProgressTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  friendProgressFill: { height: 6, borderRadius: 3 },
  friendProgressLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  friendCompleteChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  friendCompleteText: { fontSize: 11, fontWeight: '700', color: colors.success },
  levelBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  levelText: { fontSize: 11, fontWeight: '700', color: colors.secondary },
});
