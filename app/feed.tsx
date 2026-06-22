import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { useSocialStore, FriendActivity, DEMO_FRIEND_USERS } from '../store/socialStore';
import { colors, radius, spacing, elevation, typography } from '../constants/theme';

const MY_USER_ID = 'me';

// ─── Comment types ────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  authorName: string;
  authorColor: string;
  text: string;
  ago: string;
}

// ─── Demo comments keyed by activity ID ──────────────────────────────────────

const DEMO_COMMENTS: Record<string, Comment[]> = {
  da1: [
    { id: 'c1a', authorName: 'CastAngler_UK', authorColor: '#3B82F6', text: 'Absolute unit! What bait?', ago: '45m ago' },
    { id: 'c1b', authorName: 'TroutMaster', authorColor: '#10B981', text: "That's a new spot PB surely?", ago: '30m ago' },
    { id: 'c1c', authorName: 'PikePete', authorColor: '#8B5CF6', text: 'Legend 🎣', ago: '12m ago' },
  ],
  da3: [
    { id: 'c3a', authorName: 'SalmonSue', authorColor: '#F59E0B', text: 'What a fish! River or lake?', ago: '22h ago' },
    { id: 'c3b', authorName: 'CastAngler_UK', authorColor: '#3B82F6', text: 'Top catch mate', ago: '20h ago' },
  ],
  da2: [
    { id: 'c2a', authorName: 'TroutMaster', authorColor: '#10B981', text: 'Have a good one!', ago: '2h ago' },
    { id: 'c2b', authorName: 'PikePete', authorColor: '#8B5CF6', text: 'Good luck out there', ago: '1h ago' },
  ],
};

// ─── Rarity ──────────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// ─── Time formatting ──────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Action text ─────────────────────────────────────────────────────────────

function actionText(activity: FriendActivity): string {
  switch (activity.type) {
    case 'catch':
      return `caught a ${activity.weightKg?.toFixed(1)}kg ${activity.species}${activity.rarity ? ` · ${RARITY_LABELS[activity.rarity] ?? activity.rarity}` : ''}`;
    case 'pb':
      return `set a new PB! ${activity.weightKg?.toFixed(1)}kg ${activity.species}`;
    case 'level_up':
      return `levelled up to Level ${activity.level}!`;
    case 'badge':
      return `earned the "${activity.badgeName}" badge`;
    case 'session_start':
      return 'started a fishing session';
    case 'session_end':
      return 'ended their session';
    default:
      return 'had an activity';
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ displayName, avatarColor, size = 44 }: { displayName: string; avatarColor: string; size?: number }) {
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <LinearGradient
      colors={[avatarColor, avatarColor + '99']}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </LinearGradient>
  );
}

// ─── Reaction Button ─────────────────────────────────────────────────────────

const REACTIONS = [
  { type: 'NICE', icon: 'fish', label: 'NICE!' },
  { type: 'BEAST', icon: 'fire', label: 'BEAST!' },
  { type: 'PB', icon: 'trophy-outline', label: 'PB?' },
  { type: 'SICK', icon: 'lightning-bolt', label: 'SICK!' },
];

function ReactionRow({ activity }: { activity: FriendActivity }) {
  const { addReaction, removeReaction } = useSocialStore();

  return (
    <View style={styles.reactionRow}>
      {REACTIONS.map((r) => {
        const reacted = (activity.reactions[r.type] ?? []).includes(MY_USER_ID);
        const count = (activity.reactions[r.type] ?? []).length;
        return (
          <TouchableOpacity
            key={r.type}
            style={[styles.reactionBtn, reacted && styles.reactionBtnActive]}
            onPress={() =>
              reacted
                ? removeReaction(activity.id, r.type, MY_USER_ID)
                : addReaction(activity.id, r.type, MY_USER_ID)
            }
            activeOpacity={0.7}
          >
            <Icon name={r.icon} size={13} color={reacted ? colors.primary : colors.textSecondary} />
            <Text style={[styles.reactionLabel, reacted && styles.reactionLabelActive]}>{r.label}</Text>
            {count > 0 && (
              <View style={[styles.reactionCount, reacted && styles.reactionCountActive]}>
                <Text style={[styles.reactionCountText, reacted && styles.reactionCountTextActive]}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({ comment }: { comment: Comment }) {
  const initials = comment.authorName
    .split('_')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={styles.commentItem}>
      <View style={[styles.commentAvatar, { backgroundColor: comment.authorColor + '33', borderColor: comment.authorColor + '55' }]}>
        <Text style={[styles.commentAvatarText, { color: comment.authorColor }]}>{initials}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
          <Text style={styles.commentAgo}>{comment.ago}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
    </View>
  );
}

// ─── Comments Section ─────────────────────────────────────────────────────────

const MAX_PREVIEW = 3;

function CommentsSection({
  activityId,
  comments,
  onAddComment,
}: {
  activityId: string;
  comments: Comment[];
  onAddComment: (activityId: string, text: string) => void;
}) {
  const [inputText, setInputText] = useState('');
  const [showAll, setShowAll] = useState(false);

  const visibleComments = showAll ? comments : comments.slice(0, MAX_PREVIEW);
  const hiddenCount = comments.length - MAX_PREVIEW;

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddComment(activityId, trimmed);
    setInputText('');
  };

  return (
    <View style={styles.commentsSection}>
      {/* Divider */}
      <View style={styles.commentsDivider} />

      {/* Comment list */}
      {visibleComments.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}

      {/* Show more */}
      {!showAll && hiddenCount > 0 && (
        <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showMoreBtn}>
          <Text style={styles.showMoreText}>Show {hiddenCount} more comment{hiddenCount > 1 ? 's' : ''}</Text>
        </TouchableOpacity>
      )}

      {/* Input row */}
      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment…"
          placeholderTextColor={colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.7}
        >
          <Text style={[styles.sendBtnText, !inputText.trim() && styles.sendBtnTextDisabled]}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({
  activity,
  comments,
  onAddComment,
}: {
  activity: FriendActivity;
  comments: Comment[];
  onAddComment: (activityId: string, text: string) => void;
}) {
  const isLegendary = activity.rarity === 'legendary';
  const isPb = activity.type === 'pb';
  const isLevelUp = activity.type === 'level_up';
  const isBadge = activity.type === 'badge';

  const [commentsExpanded, setCommentsExpanded] = useState(false);

  return (
    <View style={[styles.card, isLegendary && styles.cardLegendary]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Avatar displayName={activity.displayName} avatarColor={activity.avatarColor} />
        <View style={styles.cardHeaderText}>
          <View style={styles.headerRow}>
            <Text style={styles.displayName}>{activity.displayName}</Text>
            <Text style={styles.timeAgo}>{timeAgo(activity.timestamp)}</Text>
          </View>
          <Text style={styles.actionTextEl} numberOfLines={2}>{actionText(activity)}</Text>
        </View>
      </View>

      {/* Special pill for legendary/pb/levelup/badge */}
      {(isLegendary || isPb || isLevelUp || isBadge) && (
        <View style={styles.specialPillRow}>
          {isLegendary && (
            <View style={[styles.specialPill, { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)' }]}>
              <Icon name="crown" size={12} color="#F59E0B" />
              <Text style={[styles.specialPillText, { color: '#F59E0B' }]}>LEGENDARY CATCH</Text>
            </View>
          )}
          {isPb && !isLegendary && (
            <View style={[styles.specialPill, { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)' }]}>
              <Icon name="trophy" size={12} color="#8B5CF6" />
              <Text style={[styles.specialPillText, { color: '#8B5CF6' }]}>PERSONAL BEST</Text>
            </View>
          )}
          {isLevelUp && (
            <View style={[styles.specialPill, { backgroundColor: 'rgba(0,212,170,0.12)', borderColor: 'rgba(0,212,170,0.3)' }]}>
              <Icon name="arrow-up-circle" size={12} color={colors.primary} />
              <Text style={[styles.specialPillText, { color: colors.primary }]}>LEVEL UP</Text>
            </View>
          )}
          {isBadge && (
            <View style={[styles.specialPill, { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }]}>
              <Icon name="shield-star" size={12} color="#F59E0B" />
              <Text style={[styles.specialPillText, { color: '#F59E0B' }]}>NEW BADGE</Text>
            </View>
          )}
        </View>
      )}

      {/* Rarity badge for catches */}
      {activity.type === 'catch' && activity.rarity && (
        <View style={styles.rarityRow}>
          <View style={[
            styles.rarityBadge,
            {
              backgroundColor: (RARITY_COLORS[activity.rarity] ?? '#9CA3AF') + '22',
              borderColor: (RARITY_COLORS[activity.rarity] ?? '#9CA3AF') + '55',
            },
          ]}>
            <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[activity.rarity] ?? '#9CA3AF' }]} />
            <Text style={[styles.rarityText, { color: RARITY_COLORS[activity.rarity] ?? '#9CA3AF' }]}>
              {RARITY_LABELS[activity.rarity] ?? activity.rarity}
            </Text>
          </View>
          {activity.weightKg != null && (
            <View style={styles.weightChip}>
              <Icon name="weight" size={11} color={colors.textSecondary} />
              <Text style={styles.weightText}>{activity.weightKg.toFixed(2)} kg</Text>
            </View>
          )}
        </View>
      )}

      {/* Location chip */}
      {activity.location && (
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={13} color={colors.textTertiary} />
          <Text style={styles.locationText} numberOfLines={1}>{activity.location}</Text>
        </View>
      )}

      {/* Reactions */}
      <ReactionRow activity={activity} />

      {/* Comment toggle row */}
      <View style={styles.commentToggleRow}>
        <TouchableOpacity
          style={[styles.commentToggleBtn, commentsExpanded && styles.commentToggleBtnActive]}
          onPress={() => setCommentsExpanded((v) => !v)}
          activeOpacity={0.7}
        >
          <Icon name="comment-outline" size={13} color={commentsExpanded ? colors.primary : colors.textSecondary} />
          <Text style={[styles.commentToggleLabel, commentsExpanded && styles.commentToggleLabelActive]}>
            Comment
          </Text>
        </TouchableOpacity>

        {comments.length > 0 && (
          <TouchableOpacity
            style={styles.commentCountBtn}
            onPress={() => setCommentsExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Icon name="comment-multiple-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.commentCountText}>{comments.length} comment{comments.length !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Expanded comments section */}
      {commentsExpanded && (
        <CommentsSection
          activityId={activity.id}
          comments={comments}
          onAddComment={onAddComment}
        />
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.empty}>
      <Icon name="account-group-outline" size={56} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>Your feed is empty</Text>
      <Text style={styles.emptySub}>Add friends to see their catches and activities</Text>
      <TouchableOpacity
        style={styles.findFriendsBtn}
        onPress={() => router.push('/friends' as any)}
        activeOpacity={0.8}
      >
        <Icon name="account-plus" size={16} color="#0A0E1A" />
        <Text style={styles.findFriendsBtnText}>Find Friends</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const router = useRouter();
  const { feed, seedDemoFriends, load } = useSocialStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // comments map: activityId -> Comment[]
  const [commentsMap, setCommentsMap] = useState<Map<string, Comment[]>>(() => {
    const m = new Map<string, Comment[]>();
    Object.entries(DEMO_COMMENTS).forEach(([id, cs]) => m.set(id, cs));
    return m;
  });

  const getComments = useCallback((activityId: string): Comment[] => {
    return commentsMap.get(activityId) ?? [];
  }, [commentsMap]);

  const handleAddComment = useCallback((activityId: string, text: string) => {
    const newComment: Comment = {
      id: `c_${activityId}_${Date.now()}`,
      authorName: 'Me',
      authorColor: colors.primary,
      text,
      ago: 'Just now',
    };
    setCommentsMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(activityId) ?? [];
      next.set(activityId, [...existing, newComment]);
      return next;
    });
  }, []);

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    seedDemoFriends();
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const friendCount = DEMO_FRIEND_USERS.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(0,212,170,0.1)', 'transparent']}
        style={styles.headerGrad}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Icon name="chevron-left" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>FEED</Text>
            <View style={styles.friendsChip}>
              <Icon name="account-group" size={13} color={colors.primary} />
              <Text style={styles.friendsChipText}>{friendCount} friends</Text>
            </View>
          </View>
          <TouchableOpacity
            hitSlop={10}
            onPress={() => router.push('/friends' as any)}
          >
            <Icon name="account-plus-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            comments={getComments(item.id)}
            onAddComment={handleAddComment}
          />
        )}
        contentContainerStyle={[styles.listContent, feed.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerGrad: { paddingBottom: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerCenter: { alignItems: 'center', gap: 4 },
  headerTitle: { ...typography.h3, letterSpacing: 2 },
  friendsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
  },
  friendsChipText: { fontSize: 11, fontWeight: '700', color: colors.primary },

  listContent: { padding: spacing.lg, paddingTop: spacing.sm },
  listContentEmpty: { flex: 1, justifyContent: 'center' },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },
  cardLegendary: {
    borderColor: 'rgba(245,158,11,0.35)',
    backgroundColor: '#121a0e',
  },

  cardHeader: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  cardHeaderText: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  displayName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  timeAgo: { fontSize: 11, color: colors.textTertiary },
  actionTextEl: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontWeight: '800', color: '#fff' },

  specialPillRow: { marginBottom: spacing.sm },
  specialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  specialPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

  rarityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
  },
  rarityDot: { width: 6, height: 6, borderRadius: 3 },
  rarityText: { fontSize: 11, fontWeight: '700' },
  weightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weightText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  locationText: { fontSize: 12, color: colors.textTertiary, flex: 1 },

  reactionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionBtnActive: {
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderColor: 'rgba(0,212,170,0.35)',
  },
  reactionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  reactionLabelActive: { color: colors.primary },
  reactionCount: {
    backgroundColor: colors.border,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  reactionCountActive: { backgroundColor: 'rgba(0,212,170,0.2)' },
  reactionCountText: { fontSize: 9, fontWeight: '800', color: colors.textSecondary },
  reactionCountTextActive: { color: colors.primary },

  // Comment toggle
  commentToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  commentToggleBtnActive: {
    borderColor: 'rgba(0,212,170,0.35)',
    backgroundColor: 'rgba(0,212,170,0.07)',
  },
  commentToggleLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  commentToggleLabelActive: { color: colors.primary },
  commentCountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCountText: { fontSize: 12, color: colors.textTertiary },

  // Comments section
  commentsSection: { marginTop: spacing.sm },
  commentsDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  commentItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  commentAvatarText: { fontSize: 8, fontWeight: '800' },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  commentAuthor: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
  commentAgo: { fontSize: 10, color: colors.textTertiary },
  commentText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  showMoreBtn: { marginBottom: 8 },
  showMoreText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtnText: { fontSize: 12, fontWeight: '700', color: '#0A0E1A' },
  sendBtnTextDisabled: { color: colors.textTertiary },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  findFriendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  findFriendsBtnText: { fontSize: 14, fontWeight: '700', color: '#0A0E1A' },
});
