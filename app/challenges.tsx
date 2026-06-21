import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { WEEKLY_CHALLENGES, MONTHLY_CHALLENGES, SPECIAL_CHALLENGES, PAST_CHALLENGES } from '../data/challengesData';
import { colors, radius, spacing } from '../constants/theme';

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

export default function ChallengesScreen() {
  const allWeeklyComplete = WEEKLY_CHALLENGES.every(c => c.completed);
  const streakBonus = 500;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Weekly */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Challenges</Text>
            <Text style={styles.sectionSub}>Resets Monday</Text>
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

function ChallengeCard({ challenge, featured }: { challenge: (typeof WEEKLY_CHALLENGES)[0]; featured?: boolean }) {
  const progress = Math.min(challenge.progress / challenge.target, 1);
  const pct = Math.round(progress * 100);

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
            <View style={[styles.progressFill, { width: `${pct}%` }, challenge.completed && styles.progressFillComplete]} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  sectionSub: { fontSize: 12, color: colors.textSecondary },
  streakBonusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', padding: spacing.md, marginBottom: spacing.sm },
  streakBonusText: { fontSize: 13, color: colors.secondary, fontWeight: '600', flex: 1 },
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
  progressBar: { flex: 1, height: 8, backgroundColor: colors.surface2, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  progressFillComplete: { backgroundColor: colors.success },
  progressText: { fontSize: 12, color: colors.textSecondary, minWidth: 40, textAlign: 'right' },
  incompleteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  incompleteText: { fontSize: 11, color: colors.textSecondary },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { fontSize: 11, color: colors.success },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  historyTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  historySub: { fontSize: 12, color: colors.textSecondary },
  xpEarned: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  xpEarnedText: { fontSize: 12, fontWeight: '700', color: colors.success },
});
