import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFriendsStore, Friend, FriendRequest } from '../store/friendsStore';
import { colors, radius, spacing, elevation, typography } from '../constants/theme';

type Tab = 'friends' | 'find' | 'requests';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Avatar({ name, color, size = 48, isOnline }: { name: string; color: string; size?: number; isOnline?: boolean }) {
  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <LinearGradient
        colors={[color, color + 'AA']}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.avatarInitials, { fontSize: size * 0.33 }]}>{getInitials(name)}</Text>
      </LinearGradient>
      {isOnline && (
        <View style={[styles.onlineDot, { width: 12, height: 12, borderRadius: 6, bottom: 0, right: 0 }]} />
      )}
    </View>
  );
}

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: (id: string) => void }) {
  return (
    <View style={styles.card}>
      <Avatar name={friend.name} color={friend.avatarColor} size={52} isOnline={friend.isOnline} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <View style={styles.rowBetween}>
          <Text style={styles.friendName}>{friend.name}</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() =>
              Alert.alert('Remove Friend', `Remove ${friend.name} from your friends?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onRemove(friend.id) },
              ])
            }
          >
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.rowWrap}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Level {friend.level}</Text>
          </View>
          <Text style={styles.catchSub}>
            {friend.catchCount} catches · top: {friend.topSpecies}
          </Text>
        </View>

        <View style={styles.microStats}>
          <MaterialCommunityIcons name="fire" size={13} color="#F97316" />
          <Text style={styles.microStatText}>{friend.streak}d</Text>
          <MaterialCommunityIcons name="fish" size={13} color={colors.primary} style={{ marginLeft: 8 }} />
          <Text style={styles.microStatText}>{friend.catchCount}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Coming soon')}
          >
            <Text style={styles.actionBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnGhost]}
            onPress={() => Alert.alert('Coming soon')}
          >
            <MaterialCommunityIcons name="message-outline" size={13} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SuggestedCard({ angler, onSend, sent }: { angler: Friend; onSend: () => void; sent: boolean }) {
  return (
    <View style={styles.card}>
      <Avatar name={angler.name} color={angler.avatarColor} size={52} isOnline={angler.isOnline} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.friendName}>{angler.name}</Text>
        <View style={styles.rowWrap}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Level {angler.level}</Text>
          </View>
          <Text style={styles.catchSub}>{angler.catchCount} catches</Text>
        </View>
        <Text style={styles.speciesSub}>Top: {angler.topSpecies}</Text>
        {angler.mutualFriends > 0 && (
          <Text style={styles.mutualText}>{angler.mutualFriends} mutual friend{angler.mutualFriends > 1 ? 's' : ''}</Text>
        )}
        <TouchableOpacity
          style={[styles.addBtn, sent && styles.addBtnSent]}
          onPress={sent ? undefined : onSend}
          activeOpacity={sent ? 1 : 0.8}
        >
          {sent ? (
            <>
              <MaterialCommunityIcons name="check" size={14} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>Requested</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="account-plus" size={14} color="#0A0E1A" />
              <Text style={styles.addBtnText}>Add Friend</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RequestCard({
  req,
  onAccept,
  onDecline,
}: {
  req: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  if (req.type === 'outgoing') {
    return (
      <View style={styles.card}>
        <Avatar name={req.fromName} color={req.avatarColor} size={48} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.friendName}>{req.fromName}</Text>
          <Text style={styles.catchSub}>Sent {req.sentAt}</Text>
        </View>
        <View style={styles.pendingChip}>
          <Text style={styles.pendingChipText}>Pending</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Avatar name={req.fromName} color={req.avatarColor} size={48} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.friendName}>{req.fromName}</Text>
        <View style={styles.rowWrap}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Level {req.fromLevel}</Text>
          </View>
          <Text style={styles.catchSub}>{req.fromCatchCount} catches</Text>
        </View>
        <Text style={styles.sentAt}>{req.sentAt}</Text>
        <View style={styles.reqActions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const { friends, requests, suggestedAnglers, removeFriend, acceptRequest, declineRequest, sendRequest } =
    useFriendsStore();
  const [tab, setTab] = useState<Tab>('friends');
  const [sentIds, setSentIds] = useState<string[]>([]);

  const incomingCount = requests.filter((r) => r.type === 'incoming').length;

  const handleSend = (angler: Friend) => {
    setSentIds((prev) => [...prev, angler.id]);
    sendRequest(angler);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(0,212,170,0.12)', 'transparent']}
        style={styles.headerGrad}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity hitSlop={10} onPress={() => Alert.alert('Coming soon')}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['friends', 'find', 'requests'] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = { friends: 'My Friends', find: 'Find Anglers', requests: 'Requests' };
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{labels[t]}</Text>
                {t === 'requests' && incomingCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{incomingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Content */}
      {tab === 'friends' && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-group-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptySub}>Find anglers to connect with</Text>
            </View>
          }
          renderItem={({ item }) => (
            <FriendCard friend={item} onRemove={removeFriend} />
          )}
        />
      )}

      {tab === 'find' && (
        <FlatList
          data={suggestedAnglers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No suggestions</Text>
              <Text style={styles.emptySub}>Check back later for new anglers near you</Text>
            </View>
          }
          renderItem={({ item }) => (
            <SuggestedCard
              angler={item}
              onSend={() => handleSend(item)}
              sent={sentIds.includes(item.id)}
            />
          )}
        />
      )}

      {tab === 'requests' && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-clock-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No requests</Text>
              <Text style={styles.emptySub}>Friend requests will appear here</Text>
            </View>
          }
          renderItem={({ item }) => (
            <RequestCard
              req={item}
              onAccept={() => acceptRequest(item.id)}
              onDecline={() => declineRequest(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerGrad: { paddingBottom: spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: { ...typography.h3 },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 5,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#0A0E1A' },

  badge: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  listContent: { padding: spacing.lg, gap: spacing.sm },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },

  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute',
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: colors.surface,
  },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap', marginTop: 3 },

  friendName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  levelPill: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  levelPillText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  catchSub: { fontSize: 12, color: colors.textSecondary },
  speciesSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  mutualText: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },

  microStats: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  microStatText: { fontSize: 12, color: colors.textSecondary, marginLeft: 3 },

  actionRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  actionBtnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#0A0E1A' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  addBtnSent: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: '#0A0E1A' },

  sentAt: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },

  reqActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  acceptBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  acceptBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  declineBtn: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  declineBtnText: { fontSize: 12, fontWeight: '700', color: colors.danger },

  pendingChip: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    alignSelf: 'center',
  },
  pendingChipText: { fontSize: 11, fontWeight: '700', color: colors.secondary },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});
