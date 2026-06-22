import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { SocialAvatar } from '../components/social/SocialAvatar';
import { Friend, FriendRequest, useFriendsStore } from '../store/friendsStore';
import { colors, radius, spacing, typography } from '../constants/theme';

type FriendsTab = 'friends' | 'discover' | 'requests';

function DemoBadge() {
  return <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View>;
}

function FriendRow({ friend, onRemove }: { friend: Friend; onRemove: (friend: Friend) => void }) {
  return (
    <View style={styles.card}>
      <SocialAvatar name={friend.name} color={friend.avatarColor} isOnline={friend.isOnline} />
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{friend.name}</Text>
          {friend.isDemo ? <DemoBadge /> : null}
          <Text style={styles.country}>{friend.countryCode}</Text>
        </View>
        <Text style={styles.handle}>{friend.handle ?? `Level ${friend.level}`} · {friend.lastActive}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>{friend.catchCount} catches</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.stat}>{friend.streak}d streak</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.stat} numberOfLines={1}>{friend.topSpecies}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${friend.name}`} hitSlop={8} onPress={() => onRemove(friend)} style={styles.iconAction}>
        <Icon name="dots-horizontal" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

function DiscoverRow({ friend, onAdd }: { friend: Friend; onAdd: (friend: Friend) => void }) {
  return (
    <View style={styles.card}>
      <SocialAvatar name={friend.name} color={friend.avatarColor} isOnline={friend.isOnline} />
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{friend.name}</Text>
          {friend.isDemo ? <DemoBadge /> : null}
          <Text style={styles.country}>{friend.countryCode}</Text>
        </View>
        <Text style={styles.handle}>{friend.handle} · {friend.mutualFriends} mutual</Text>
        <Text style={styles.stat}>Level {friend.level} · {friend.topSpecies}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Add ${friend.name} as a friend`} onPress={() => onAdd(friend)} style={styles.addButton}>
        <Icon name="account-plus-outline" size={19} color={colors.background} />
      </Pressable>
    </View>
  );
}

function RequestRow({ request, onAccept, onDecline }: { request: FriendRequest; onAccept: () => void; onDecline: () => void }) {
  const outgoing = request.type === 'outgoing';
  return (
    <View style={styles.card}>
      <SocialAvatar name={request.fromName} color={request.avatarColor} />
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{request.fromName}</Text>
          {request.isDemo ? <DemoBadge /> : null}
          <Text style={styles.country}>{request.countryCode}</Text>
        </View>
        <Text style={styles.handle}>{outgoing ? 'Request sent' : 'Wants to connect'} · {request.sentAt}</Text>
        {!outgoing ? (
          <View style={styles.requestActions}>
            <Pressable accessibilityRole="button" onPress={onAccept} style={styles.acceptButton}><Text style={styles.acceptText}>Accept</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={onDecline} style={styles.declineButton}><Text style={styles.declineText}>Decline</Text></Pressable>
          </View>
        ) : null}
      </View>
      {outgoing ? <Text style={styles.pending}>PENDING</Text> : null}
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<FriendsTab>('friends');
  const friends = useFriendsStore((state) => state.friends);
  const requests = useFriendsStore((state) => state.requests);
  const suggested = useFriendsStore((state) => state.suggestedAnglers);
  const hydrate = useFriendsStore((state) => state.hydrate);
  const removeFriend = useFriendsStore((state) => state.removeFriend);
  const acceptRequest = useFriendsStore((state) => state.acceptRequest);
  const declineRequest = useFriendsStore((state) => state.declineRequest);
  const sendRequest = useFriendsStore((state) => state.sendRequest);

  useEffect(() => { void hydrate(); }, [hydrate]);

  const incomingCount = useMemo(() => requests.filter((request) => request.type === 'incoming').length, [requests]);
  const confirmRemove = useCallback((friend: Friend) => {
    Alert.alert('Remove friend?', `${friend.name} will no longer see your friend-only sessions.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFriend(friend.id) },
    ]);
  }, [removeFriend]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.headerButton}>
          <Icon name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.title}>Fishing friends</Text>
          <Text style={styles.subtitle}>{friends.length} in your circle</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open community" hitSlop={10} onPress={() => router.push('/community')} style={styles.headerButton}>
          <Icon name="earth" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <View style={styles.notice}><Text style={styles.noticeText}>Profiles marked DEMO are fictional and included to preview social features.</Text></View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['friends', 'discover', 'requests'] as FriendsTab[]).map((item) => (
          <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item === 'friends' ? 'Friends' : item === 'discover' ? 'Discover' : 'Requests'}</Text>
            {item === 'requests' && incomingCount ? <View style={styles.countBadge}><Text style={styles.countText}>{incomingCount}</Text></View> : null}
          </Pressable>
        ))}
      </View>

      {tab === 'friends' ? (
        <FlatList data={friends} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <FriendRow friend={item} onRemove={confirmRemove} />} />
      ) : tab === 'discover' ? (
        <FlatList data={suggested} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <DiscoverRow friend={item} onAdd={sendRequest} />} ListEmptyComponent={<Text style={styles.empty}>You’re all caught up.</Text>} />
      ) : (
        <FlatList data={requests} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <RequestRow request={item} onAccept={() => acceptRequest(item.id)} onDecline={() => declineRequest(item.id)} />} ListEmptyComponent={<Text style={styles.empty}>No pending requests.</Text>} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleBlock: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 1 },
  notice: { marginHorizontal: spacing.lg, padding: spacing.sm, backgroundColor: 'rgba(45,212,255,0.07)', borderRadius: radius.md },
  noticeText: { color: colors.accentBlue, fontSize: 11, lineHeight: 16 },
  tabs: { flexDirection: 'row', margin: spacing.lg, marginBottom: spacing.sm, padding: 4, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: radius.md },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: colors.background },
  countBadge: { minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
  countText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  cardBody: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  country: { color: colors.textSecondary, fontSize: 11 },
  handle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  stat: { color: colors.textSecondary, fontSize: 11, flexShrink: 1 },
  separator: { color: colors.textTertiary },
  demoBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: radius.full, backgroundColor: 'rgba(45,212,255,0.12)' },
  demoText: { color: colors.accentBlue, fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },
  iconAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  requestActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  acceptButton: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm, backgroundColor: colors.primary },
  acceptText: { color: colors.background, fontSize: 12, fontWeight: '800' },
  declineButton: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.borderStrong },
  declineText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  pending: { color: colors.secondary, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl },
});
