import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { SocialAvatar } from '../../components/social/SocialAvatar';
import { SocialFeedCard } from '../../components/social/SocialFeedCard';
import { ReactionType, SOCIAL_USERS_BY_ID, SocialCatchPost } from '../../data/socialData';
import { Friend, useFriendsStore } from '../../store/friendsStore';
import { HeadToHead, useHeadToHeadStore } from '../../store/headToHeadStore';
import { colors, radius, spacing } from '../../constants/theme';

type SocialTab = 'feed' | 'friends' | 'duels';

function FriendCard({ friend, onChallenge }: { friend: Friend; onChallenge: (friend: Friend) => void }) {
  return (
    <View style={styles.friendCard}>
      <SocialAvatar name={friend.name} color={friend.avatarColor} isOnline={friend.isOnline} />
      <View style={styles.friendBody}>
        <View style={styles.inline}><Text style={styles.friendName}>{friend.name}</Text></View>
        <Text style={styles.friendMeta}>{friend.countryCode} · Level {friend.level} · {friend.lastActive}</Text>
        <Text style={styles.friendStat}>{friend.catchCount} catches · {friend.streak} day streak</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Challenge ${friend.name}`} onPress={() => onChallenge(friend)} style={styles.challengeButton}>
        <Icon name="sword-cross" size={18} color={colors.background} />
      </Pressable>
    </View>
  );
}

function DuelCard({ duel, onAccept, onDecline }: { duel: HeadToHead; onAccept: () => void; onDecline: () => void }) {
  const yourProgress = Math.min(100, (duel.yourScore / duel.target) * 100);
  const theirProgress = Math.min(100, (duel.opponentScore / duel.target) * 100);
  const days = Math.max(0, Math.ceil((new Date(duel.endsAt).getTime() - Date.now()) / 86_400_000));
  return (
    <View style={styles.duelCard}>
      <View style={styles.duelHeader}>
        <View><Text style={styles.duelKicker}>{duel.status === 'incoming' ? 'CHALLENGE RECEIVED' : duel.status === 'outgoing' ? 'INVITE SENT' : `${days}D LEFT`}</Text><Text style={styles.duelTitle}>{duel.title}</Text></View>
      </View>
      <View style={styles.duelPeople}>
        <View style={styles.duelPerson}><View style={[styles.duelAvatar, { backgroundColor: colors.primary }]}><Text style={styles.duelInitial}>Y</Text></View><Text style={styles.duelName}>You</Text><Text style={styles.duelScore}>{duel.yourScore}</Text></View>
        <View style={styles.versus}><Text style={styles.versusText}>VS</Text><Text style={styles.targetText}>first to {duel.target}</Text></View>
        <View style={[styles.duelPerson, { alignItems: 'flex-end' }]}><View style={[styles.duelAvatar, { backgroundColor: duel.opponentColor }]}><Text style={styles.duelInitial}>{duel.opponentName.charAt(0)}</Text></View><Text style={styles.duelName} numberOfLines={1}>{duel.opponentName}</Text><Text style={styles.duelScore}>{duel.opponentScore}</Text></View>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressMine, { width: `${yourProgress}%` }]} /><View style={[styles.progressTheirs, { width: `${theirProgress}%` }]} /></View>
      {duel.status === 'incoming' ? <View style={styles.duelActions}><Pressable accessibilityRole="button" accessibilityLabel={`Accept challenge from ${duel.opponentName}`} onPress={onAccept} style={styles.accept}><Text style={styles.acceptText}>Accept</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Pass on challenge from ${duel.opponentName}`} onPress={onDecline} style={styles.decline}><Text style={styles.declineText}>Pass</Text></Pressable></View> : null}
    </View>
  );
}

export default function SocialScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<SocialTab>('feed');
  const feed = useFriendsStore((state) => state.feed);
  const friends = useFriendsStore((state) => state.friends);
  const reactions = useFriendsStore((state) => state.reactionsByPost);
  const reactToCatch = useFriendsStore((state) => state.reactToCatch);
  const hydrate = useFriendsStore((state) => state.hydrate);
  const duels = useHeadToHeadStore((state) => state.duels);
  const challengeFriend = useHeadToHeadStore((state) => state.challengeFriend);
  const acceptDuel = useHeadToHeadStore((state) => state.acceptDuel);
  const declineDuel = useHeadToHeadStore((state) => state.declineDuel);

  useEffect(() => { void hydrate(); }, [hydrate]);
  const incoming = useMemo(() => duels.filter((duel) => duel.status === 'incoming').length, [duels]);
  const challenge = useCallback((friend: Friend) => { challengeFriend(friend); setTab('duels'); }, [challengeFriend]);
  const renderPost = useCallback(({ item }: { item: SocialCatchPost }) => {
    const user = SOCIAL_USERS_BY_ID.get(item.userId);
    return user ? <SocialFeedCard post={item} user={user} selectedReaction={reactions[item.id]} onReact={(reaction: ReactionType) => reactToCatch(item.id, reaction)} /> : null;
  }, [reactToCatch, reactions]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>CAST COMMUNITY</Text><Text style={styles.title}>Your circle</Text><Text style={styles.subtitle}>Catches, friends and friendly competition.</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Manage friends" onPress={() => router.push('/friends')} style={styles.peopleButton}><Icon name="account-plus-outline" size={21} color={colors.textPrimary} /></Pressable>
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['feed', 'friends', 'duels'] as SocialTab[]).map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}><Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item === 'feed' ? 'Activity' : item === 'friends' ? `Friends ${friends.length}` : 'Head-to-head'}</Text>{item === 'duels' && incoming > 0 ? <View style={styles.count}><Text style={styles.countText}>{incoming}</Text></View> : null}</Pressable>)}
      </View>

      {tab === 'feed' ? <FlatList data={feed} renderItem={renderPost} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} initialNumToRender={4} windowSize={5} ListEmptyComponent={<EmptySocial icon="image-outline" title="No activity yet" body="Catches shared by real friends will appear here." action="Add friends" onPress={() => router.push('/friends')} />} /> : null}
      {tab === 'friends' ? <FlatList data={friends} keyExtractor={(item) => item.id} renderItem={({ item }) => <FriendCard friend={item} onChallenge={challenge} />} contentContainerStyle={styles.list} ListHeaderComponent={<Pressable accessibilityRole="button" onPress={() => router.push('/friends')} style={styles.manageRow}><Text style={styles.manageText}>Add anglers and view requests</Text><Icon name="arrow-right" size={18} color={colors.primary} /></Pressable>} ListEmptyComponent={<EmptySocial icon="account-group-outline" title="No friends yet" body="Add a real angler before starting a head-to-head." action="Find friends" onPress={() => router.push('/friends')} />} /> : null}
      {tab === 'duels' ? <FlatList data={duels} keyExtractor={(item) => item.id} renderItem={({ item }) => <DuelCard duel={item} onAccept={() => acceptDuel(item.id)} onDecline={() => declineDuel(item.id)} />} contentContainerStyle={styles.list} ListHeaderComponent={<Pressable accessibilityRole="button" onPress={() => setTab('friends')} style={styles.manageRow}><Text style={styles.manageText}>Start a new head-to-head</Text><Icon name="plus" size={18} color={colors.primary} /></Pressable>} ListEmptyComponent={<EmptySocial icon="sword-cross" title="No head-to-heads" body="Challenge a friend to first-to-five once they join your circle." action="View friends" onPress={() => setTab('friends')} />} /> : null}
    </SafeAreaView>
  );
}

function EmptySocial({ icon, title, body, action, onPress }: { icon: string; title: string; body: string; action: string; onPress: () => void }) {
  return <View style={styles.emptyState}><Icon name={icon} size={34} color={colors.textTertiary} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text><Pressable onPress={onPress} style={styles.emptyButton}><Text style={styles.emptyButtonText}>{action}</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.textPrimary, fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -1.1, marginTop: 5 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  peopleButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { minHeight: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: colors.textPrimary },
  count: { minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  countText: { color: colors.background, fontSize: 9, fontWeight: '900' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 110, paddingTop: spacing.sm },
  manageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  manageText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  friendCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  friendBody: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  friendName: { color: colors.textPrimary, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  friendMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  friendStat: { color: colors.textSecondary, fontSize: 11, marginTop: 5 },
  emptyState: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, gap: spacing.sm },
  emptyTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  emptyBody: { color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },
  emptyButton: { marginTop: spacing.sm, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  emptyButtonText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  challengeButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  duelCard: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  duelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  duelKicker: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  duelTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '800', marginTop: 3 },
  duelPeople: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  duelPerson: { flex: 1 },
  duelAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  duelInitial: { color: colors.background, fontWeight: '900' },
  duelName: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 5, maxWidth: 110 },
  duelScore: { color: colors.textPrimary, fontSize: 28, fontWeight: '900', marginTop: 2 },
  versus: { alignItems: 'center' },
  versusText: { color: colors.textTertiary, fontSize: 11, fontWeight: '900' },
  targetText: { color: colors.textTertiary, fontSize: 9, marginTop: 3 },
  progressTrack: { height: 5, flexDirection: 'row', backgroundColor: colors.surface2, overflow: 'hidden', marginTop: 12 },
  progressMine: { height: '100%', backgroundColor: colors.primary },
  progressTheirs: { height: '100%', backgroundColor: colors.accentBlue },
  duelActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  accept: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: radius.sm },
  acceptText: { color: colors.background, fontSize: 12, fontWeight: '800' },
  decline: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, paddingVertical: 9, borderRadius: radius.sm },
  declineText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
});
