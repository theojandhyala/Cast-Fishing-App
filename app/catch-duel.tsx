import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { colors, radius, spacing, elevation, typography } from '../constants/theme';

// ─── Demo Data ────────────────────────────────────────────────────────────────

type DuelType = 'Most Fish' | 'Biggest Catch' | 'Total Weight' | 'Most Species';
type DuelStatus = 'WINNING' | 'LOSING' | 'TIED';

interface ActiveDuel {
  id: string;
  opponent: string;
  opponentColor: string;
  type: DuelType;
  timeLeft: string;
  myScore: number;
  opponentScore: number;
  unit: string;
  status: DuelStatus;
  myBreakdown: string[];
  opponentBreakdown: string[];
}

interface PastDuel {
  id: string;
  opponent: string;
  opponentColor: string;
  type: DuelType;
  myScore: number;
  opponentScore: number;
  unit: string;
  result: 'WON' | 'LOST' | 'TIED';
  date: string;
}

const ACTIVE_DUELS: ActiveDuel[] = [
  {
    id: 'ad1',
    opponent: 'Jake Morrison',
    opponentColor: '#F97316',
    type: 'Biggest Catch',
    timeLeft: '3d 14h left',
    myScore: 8.2,
    opponentScore: 12.4,
    unit: 'kg',
    status: 'LOSING',
    myBreakdown: ['Sea Bass 4.1 kg', 'Cod 2.3 kg', 'Perch 1.8 kg'],
    opponentBreakdown: ['Tuna 8.7 kg', 'Grouper 3.7 kg'],
  },
  {
    id: 'ad2',
    opponent: 'Emma Clarke',
    opponentColor: '#EC4899',
    type: 'Most Fish',
    timeLeft: '1d 6h left',
    myScore: 7,
    opponentScore: 5,
    unit: 'fish',
    status: 'WINNING',
    myBreakdown: ['3× Bass', '2× Perch', '1× Pike', '1× Trout'],
    opponentBreakdown: ['3× Carp', '2× Bream'],
  },
];

const PAST_DUELS: PastDuel[] = [
  {
    id: 'pd1',
    opponent: 'Tom Fisher',
    opponentColor: '#8B5CF6',
    type: 'Total Weight',
    myScore: 28.4,
    opponentScore: 21.1,
    unit: 'kg',
    result: 'WON',
    date: '12 Jun 2026',
  },
  {
    id: 'pd2',
    opponent: 'Jake Morrison',
    opponentColor: '#F97316',
    type: 'Most Species',
    myScore: 4,
    opponentScore: 6,
    unit: 'species',
    result: 'LOST',
    date: '5 Jun 2026',
  },
  {
    id: 'pd3',
    opponent: 'Emma Clarke',
    opponentColor: '#EC4899',
    type: 'Most Fish',
    myScore: 8,
    opponentScore: 8,
    unit: 'fish',
    result: 'TIED',
    date: '28 May 2026',
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DuelStatus, { label: string; color: string; bg: string }> = {
  WINNING: { label: 'WINNING', color: colors.primary, bg: 'rgba(0,212,170,0.15)' },
  LOSING:  { label: 'LOSING',  color: colors.danger,  bg: 'rgba(239,68,68,0.15)' },
  TIED:    { label: 'TIED',    color: colors.secondary, bg: 'rgba(245,158,11,0.15)' },
};

const RESULT_CONFIG: Record<PastDuel['result'], { label: string; color: string; bg: string }> = {
  WON:  { label: 'WON',  color: colors.primary,   bg: 'rgba(0,212,170,0.15)' },
  LOST: { label: 'LOST', color: colors.danger,     bg: 'rgba(239,68,68,0.15)' },
  TIED: { label: 'TIED', color: colors.secondary,  bg: 'rgba(245,158,11,0.15)' },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <LinearGradient
      colors={[color + 'CC', color + '66']}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </LinearGradient>
  );
}

// ─── Active Duel Card ─────────────────────────────────────────────────────────

function ActiveDuelCard({ duel }: { duel: ActiveDuel }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[duel.status];
  const total = duel.myScore + duel.opponentScore;
  const myPct = total === 0 ? 50 : (duel.myScore / total) * 100;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(e => !e)}
      style={styles.duelCard}
    >
      {/* Top row: avatars + type */}
      <View style={styles.duelTop}>
        {/* You */}
        <View style={styles.duelSide}>
          <Avatar name="You" color={colors.primary} size={46} />
          <Text style={styles.duelName}>You</Text>
          <Text style={styles.duelScore}>
            {duel.myScore} <Text style={styles.duelUnit}>{duel.unit}</Text>
          </Text>
        </View>

        {/* Center */}
        <View style={styles.duelCenter}>
          <Text style={styles.vsText}>VS</Text>
          <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Opponent */}
        <View style={styles.duelSide}>
          <Avatar name={duel.opponent} color={duel.opponentColor} size={46} />
          <Text style={styles.duelName}>{duel.opponent.split(' ')[0]}</Text>
          <Text style={styles.duelScore}>
            {duel.opponentScore} <Text style={styles.duelUnit}>{duel.unit}</Text>
          </Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={styles.duelMeta}>
        <View style={styles.metaItem}>
          <Icon name="sword-cross" size={13} color={colors.secondary} />
          <Text style={styles.metaText}>{duel.type}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="clock-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.metaText}>{duel.timeLeft}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressMine, { width: `${myPct}%` }]} />
        </View>
      </View>
      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, { color: colors.primary }]}>You {Math.round(myPct)}%</Text>
        <Text style={[styles.progressLabel, { color: duel.opponentColor }]}>{duel.opponent.split(' ')[0]} {Math.round(100 - myPct)}%</Text>
      </View>

      {/* Expanded breakdown */}
      {expanded && (
        <View style={styles.breakdown}>
          <View style={styles.breakdownSide}>
            {duel.myBreakdown.map((item, i) => (
              <View key={i} style={styles.breakdownItem}>
                <Icon name="fish" size={12} color={colors.primary} />
                <Text style={styles.breakdownText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownSide}>
            {duel.opponentBreakdown.map((item, i) => (
              <View key={i} style={styles.breakdownItem}>
                <Icon name="fish" size={12} color={duel.opponentColor} />
                <Text style={styles.breakdownText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.expandHint}>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Past Duel Card ───────────────────────────────────────────────────────────

function PastDuelCard({ duel }: { duel: PastDuel }) {
  const result = RESULT_CONFIG[duel.result];
  return (
    <View style={styles.pastCard}>
      <Avatar name={duel.opponent} color={duel.opponentColor} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={styles.pastOpponent}>{duel.opponent}</Text>
        <Text style={styles.pastMeta}>{duel.type} · {duel.date}</Text>
        <Text style={styles.pastScore}>
          You: {duel.myScore} {duel.unit} vs {duel.opponentScore} {duel.unit}
        </Text>
      </View>
      <View style={[styles.resultChip, { backgroundColor: result.bg }]}>
        <Text style={[styles.resultText, { color: result.color }]}>{result.label}</Text>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyActive({ onChallenge }: { onChallenge: () => void }) {
  return (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['rgba(0,212,170,0.12)', 'rgba(0,212,170,0.04)']}
        style={styles.emptyGradient}
      >
        <Icon name="sword-cross" size={48} color={colors.primary} />
        <Text style={styles.emptyTitle}>No Active Duels</Text>
        <Text style={styles.emptyDesc}>Challenge a friend to a fishing competition and prove who's the better angler!</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={onChallenge} activeOpacity={0.8}>
          <Icon name="sword-cross" size={16} color={colors.background} />
          <Text style={styles.ctaText}>Challenge a Friend</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CatchDuelScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const handleChallenge = () => {
    Alert.alert(
      'Choose Your Duel Type',
      'Full challenge creation flow coming soon!\n\nAvailable duel types:\n• Most Fish\n• Biggest Catch\n• Total Weight\n• Most Species',
      [{ text: 'Got it', style: 'default' }],
    );
  };

  const handleFriendChallenge = () => {
    Alert.alert('Challenge Sent!', 'Your friend will receive a notification to accept your duel.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catch Duels</Text>
        <TouchableOpacity onPress={handleChallenge} style={styles.challengeButton} activeOpacity={0.8}>
          <Icon name="sword-cross" size={15} color={colors.primary} />
          <Text style={styles.challengeButtonText}>Challenge</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({ACTIVE_DUELS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({PAST_DUELS.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'active' ? (
          <>
            {ACTIVE_DUELS.length === 0 ? (
              <EmptyActive onChallenge={handleFriendChallenge} />
            ) : (
              <>
                {ACTIVE_DUELS.map(duel => (
                  <ActiveDuelCard key={duel.id} duel={duel} />
                ))}
                <TouchableOpacity style={styles.secondaryCta} onPress={handleFriendChallenge} activeOpacity={0.8}>
                  <Icon name="plus" size={16} color={colors.primary} />
                  <Text style={styles.secondaryCtaText}>Start Another Duel</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.historySectionLabel}>Past Duels</Text>
            {PAST_DUELS.map(duel => (
              <PastDuelCard key={duel.id} duel={duel} />
            ))}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h3, flex: 1, marginLeft: spacing.sm },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  challengeButtonText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.background },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  // Active duel card
  duelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...elevation.card,
  },
  duelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  duelSide: { alignItems: 'center', gap: 4, width: 80 },
  duelName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  duelScore: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  duelUnit: { fontSize: 11, color: colors.textSecondary, fontWeight: '400' },
  duelCenter: { alignItems: 'center', gap: spacing.sm },
  vsText: { fontSize: 18, fontWeight: '800', color: colors.textSecondary, letterSpacing: 2 },
  statusChip: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },

  // Meta row
  duelMeta: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },

  // Progress
  progressBarRow: { marginBottom: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(239,68,68,0.35)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressMine: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  progressLabel: { fontSize: 11, fontWeight: '600' },

  // Breakdown
  breakdown: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  breakdownSide: { flex: 1, gap: 4 },
  breakdownDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breakdownText: { fontSize: 12, color: colors.textSecondary },

  expandHint: { alignItems: 'center', marginTop: spacing.xs },

  // Secondary CTA
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginBottom: spacing.md,
  },
  secondaryCtaText: { fontSize: 15, fontWeight: '600', color: colors.primary },

  // Empty state
  emptyState: { marginTop: spacing.xl },
  emptyGradient: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTitle: { ...typography.h3, marginTop: spacing.sm },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: colors.background },

  // History
  historySectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  pastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.raised,
  },
  pastOpponent: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  pastMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  pastScore: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  resultChip: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  resultText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  // Avatar
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '700' },
});
