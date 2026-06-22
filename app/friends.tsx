import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFriendsStore, Friend, FriendRequest } from '../store/friendsStore';
import { DEMO_FRIEND_USERS } from '../store/socialStore';
import { useUserStore } from '../store/userStore';
import { colors, radius, spacing, elevation, typography } from '../constants/theme';

type Tab = 'friends' | 'requests' | 'find';
type RegionFilter = 'All' | 'UK' | 'Europe' | 'USA' | 'Asia' | 'Oceania';

const EXTRA_DEMO_USERS = [
  { userId: 'highland_rob', username: 'HighlandRob', displayName: 'Rob MacDonald', avatarColor: '#059669', location: 'Scotland', region: 'UK' as RegionFilter, specialty: 'Wild Brown Trout', level: 9 },
  { userId: 'connemara_claire', username: 'ConnemClaire', displayName: 'Claire O\'Brien', avatarColor: '#7C3AED', location: 'County Galway, Ireland', region: 'Europe' as RegionFilter, specialty: 'Sea Trout & Pike', level: 6 },
  { userId: 'seine_pierre', username: 'Pierre_Seine', displayName: 'Pierre Leblanc', avatarColor: '#2563EB', location: 'Île-de-France, France', region: 'Europe' as RegionFilter, specialty: 'Carp & Zander', level: 11 },
  { userId: 'rhein_hans', username: 'RheinHans', displayName: 'Hans Müller', avatarColor: '#DC2626', location: 'Bavaria, Germany', region: 'Europe' as RegionFilter, specialty: 'Barbel & Asp', level: 14 },
  { userId: 'oregon_wade', username: 'Oregon_Wade', displayName: 'Wade Thompson', avatarColor: '#D97706', location: 'Oregon, USA', region: 'USA' as RegionFilter, specialty: 'Steelhead & Salmon', level: 17 },
  { userId: 'snook_mia', username: 'SnookMia', displayName: 'Mia Rivera', avatarColor: '#DB2777', location: 'Florida, USA', region: 'USA' as RegionFilter, specialty: 'Snook & Redfish', level: 8 },
  { userId: 'tassie_angus', username: 'TassieAngus', displayName: 'Angus Blake', avatarColor: '#0891B2', location: 'Tasmania, Australia', region: 'Oceania' as RegionFilter, specialty: 'Sea-run Trout', level: 12 },
  { userId: 'mahseer_raj', username: 'Mahseer_Raj', displayName: 'Raj Krishnan', avatarColor: '#65A30D', location: 'Karnataka, India', region: 'Asia' as RegionFilter, specialty: 'Mahseer & Snakehead', level: 15 },
];

const REGION_MAP: Record<string, RegionFilter> = {
  'UK': 'UK',
  'Scotland': 'UK',
  'Cornwall, UK': 'UK',
  'Norway': 'Europe',
  'Netherlands': 'Europe',
  'New Zealand': 'Oceania',
  'Queensland, AU': 'Oceania',
  'Texas, US': 'USA',
};

const CURRENTLY_FISHING = [
  { id: 'f1', name: 'Jake Morrison', color: '#F97316', spot: 'Redmire Pool' },
  { id: 'f3', name: 'Tom Fisher', color: '#8B5CF6', spot: 'River Severn' },
];

const RECENT_FRIEND_CATCHES = [
  { id: 'rc1', name: 'Jake Morrison', color: '#F97316', species: 'Common Carp', weight: 12.4, location: 'Redmire Pool', ago: '1h ago', rarity: 'epic' },
  { id: 'rc2', name: 'Tom Fisher', color: '#8B5CF6', species: 'Pike', weight: 8.2, location: 'River Severn', ago: '4h ago', rarity: 'rare' },
  { id: 'rc3', name: 'Emma Clarke', color: '#EC4899', species: 'Perch', weight: 1.8, location: 'Grafham Water', ago: '6h ago', rarity: 'uncommon' },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#8B95A7', uncommon: '#4ADE80', rare: '#3B82F6', epic: '#A855F7', legendary: '#F59E0B',
};

function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.pulseRing, { transform: [{ scale }] }]} />
  );
}

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
            <Icon name="dots-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.rowWrap}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Level {friend.level}</Text>
          </View>
          <Text style={styles.catchSub}>
            {friend.catchCount} catches · {friend.topSpecies}
          </Text>
        </View>

        <View style={styles.microStats}>
          <Icon name="fire" size={13} color="#F97316" />
          <Text style={styles.microStatText}>{friend.streak}d streak</Text>
          <Icon name="fish" size={13} color={colors.primary} style={{ marginLeft: 8 }} />
          <Text style={styles.microStatText}>{friend.lastActive}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Coming soon', 'Profile view coming soon!')}
          >
            <Text style={styles.actionBtnText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnGhost]}
            onPress={() => Alert.alert('Coming soon', 'Messaging coming soon!')}
          >
            <Icon name="message-outline" size={13} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface DemoUser {
  userId: string;
  username: string;
  displayName: string;
  avatarColor: string;
  location: string;
  specialty: string;
}

function FindPeopleCard({ user, onSend, sent }: { user: DemoUser; onSend: () => void; sent: boolean }) {
  return (
    <View style={styles.card}>
      <Avatar name={user.displayName} color={user.avatarColor} size={52} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.friendName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.rowWrap}>
          <Icon name="map-marker" size={12} color={colors.textTertiary} />
          <Text style={styles.catchSub}>{user.location}</Text>
        </View>
        <View style={styles.rowWrap}>
          <Icon name="fish" size={12} color={colors.primary} />
          <Text style={styles.catchSub}>{user.specialty}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, sent && styles.addBtnSent]}
          onPress={sent ? undefined : onSend}
          activeOpacity={sent ? 1 : 0.8}
        >
          {sent ? (
            <>
              <Icon name="check" size={14} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>Request Sent</Text>
            </>
          ) : (
            <>
              <Icon name="account-plus" size={14} color="#0A0E1A" />
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
            <Icon name="check" size={14} color="#fff" />
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
  const { friends, requests, removeFriend, acceptRequest, declineRequest } = useFriendsStore();
  const profile = useUserStore((s) => s.profile);
  const [tab, setTab] = useState<Tab>('friends');
  const [search, setSearch] = useState('');
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');

  const incomingCount = requests.filter((r) => r.type === 'incoming').length;

  const filteredFriends = friends.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  const allDemoUsers = [
    ...DEMO_FRIEND_USERS.map((u) => ({ ...u, region: (REGION_MAP[u.location] ?? 'Other') as RegionFilter, level: 8 })),
    ...EXTRA_DEMO_USERS,
  ];

  const filteredDemoUsers = allDemoUsers.filter((u) => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.displayName.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'All' || u.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const handleSend = (user: DemoUser) => {
    setSentIds((prev) => [...prev, user.userId]);
    Alert.alert('Friend Request Sent', `Friend request sent to @${user.username}`);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'friends', label: 'Friends' },
    { key: 'requests', label: 'Requests' },
    { key: 'find', label: 'Find People' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(0,212,170,0.12)', 'transparent']}
        style={styles.headerGrad}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Icon name="chevron-left" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity hitSlop={10} onPress={() => router.push('/feed' as any)}>
            <Icon name="newspaper-variant-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map(({ key, label }) => {
            const active = tab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
                {key === 'requests' && incomingCount > 0 && (
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Currently Fishing */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLive}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>Currently Fishing</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fishingNowScroll}>
            {CURRENTLY_FISHING.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.fishingNowCard}
                onPress={() => Alert.alert('Join Session', 'Live session joining coming soon!')}
                activeOpacity={0.8}
              >
                <View style={{ position: 'relative', alignItems: 'center' }}>
                  <LinearGradient colors={[f.color, f.color + '88']} style={styles.fishingNowAvatar}>
                    <Text style={styles.fishingNowInitials}>{getInitials(f.name)}</Text>
                  </LinearGradient>
                  <PulsingDot />
                  <View style={styles.fishingNowOnline} />
                </View>
                <Text style={styles.fishingNowName} numberOfLines={1}>{f.name.split(' ')[0]}</Text>
                <View style={styles.fishingNowSpot}>
                  <Icon name="map-marker" size={9} color={colors.primary} />
                  <Text style={styles.fishingNowSpotText} numberOfLines={1}>{f.spot}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.fishingNowCard, styles.fishingNowEmpty]}
              onPress={() => setTab('find')}
            >
              <View style={styles.fishingNowAddCircle}>
                <Icon name="account-plus" size={20} color={colors.primary} />
              </View>
              <Text style={styles.fishingNowName}>Add More</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Recent Catches from Friends */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Catches</Text>
            <TouchableOpacity onPress={() => router.push('/feed' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {RECENT_FRIEND_CATCHES.map((c) => (
            <View key={c.id} style={styles.catchFeedCard}>
              <LinearGradient colors={[c.color, c.color + '88']} style={styles.catchFeedAvatar}>
                <Text style={styles.catchFeedInitials}>{getInitials(c.name)}</Text>
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.catchFeedName}>{c.name}</Text>
                  <Text style={styles.catchFeedAgo}>{c.ago}</Text>
                </View>
                <Text style={styles.catchFeedSpecies}>
                  caught a <Text style={[styles.catchFeedBold, { color: RARITY_COLORS[c.rarity] }]}>{c.species}</Text>
                  {' · '}{c.weight}kg
                </Text>
                <View style={styles.catchFeedMeta}>
                  <Icon name="map-marker" size={11} color={colors.textTertiary} />
                  <Text style={styles.catchFeedLocation}>{c.location}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.reactBtn} onPress={() => Alert.alert('👍', `You reacted to ${c.name}'s catch!`)}>
                <Icon name="thumb-up-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Friends List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Friends ({filteredFriends.length})</Text>
          </View>
          {filteredFriends.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="account-group-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>{search ? 'No matches' : 'No friends yet'}</Text>
              <Text style={styles.emptySub}>{search ? 'Try a different search' : 'Find anglers to connect with'}</Text>
              {!search && (
                <TouchableOpacity style={styles.findBtn} onPress={() => setTab('find')}>
                  <Icon name="account-search" size={16} color="#0A0E1A" />
                  <Text style={styles.findBtnText}>Find People</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
              {filteredFriends.map((item) => (
                <FriendCard key={item.id} friend={item} onRemove={removeFriend} />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {tab === 'requests' && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="account-clock-outline" size={48} color={colors.textTertiary} />
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
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      {tab === 'find' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Region filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionScroll}>
            {(['All', 'UK', 'Europe', 'USA', 'Asia', 'Oceania'] as RegionFilter[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.regionChip, regionFilter === r && styles.regionChipActive]}
                onPress={() => setRegionFilter(r)}
              >
                <Text style={[styles.regionChipText, regionFilter === r && styles.regionChipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredDemoUsers.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="account-search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySub}>Try a different filter or search</Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
              {filteredDemoUsers.map((item) => (
                <FindPeopleCard
                  key={item.userId}
                  user={item}
                  onSend={() => handleSend(item)}
                  sent={sentIds.includes(item.userId)}
                />
              ))}
            </View>
          )}

          {/* Invite Card */}
          <View style={styles.inviteCard}>
            <LinearGradient colors={['rgba(0,212,170,0.15)', 'rgba(0,212,170,0.05)']} style={styles.inviteGrad}>
              <Icon name="qrcode" size={32} color={colors.primary} />
              <Text style={styles.inviteTitle}>Share your CAST ID</Text>
              <View style={styles.inviteHandle}>
                <Text style={styles.inviteAt}>@</Text>
                <Text style={styles.inviteUsername}>{profile?.username ?? 'CastAngler'}</Text>
              </View>
              <Text style={styles.inviteSub}>Let other anglers find and add you</Text>
              <View style={styles.inviteBtns}>
                <TouchableOpacity style={styles.inviteBtn} onPress={() => Alert.alert('Copied!', 'Your CAST profile link has been copied to clipboard.')}>
                  <Icon name="content-copy" size={14} color={colors.primary} />
                  <Text style={styles.inviteBtnText}>Copy Link</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.inviteBtn, styles.inviteBtnPrimary]} onPress={() => Alert.alert('Share', 'Share sheet coming soon!')}>
                  <Icon name="share-variant" size={14} color="#0A0E1A" />
                  <Text style={[styles.inviteBtnText, { color: '#0A0E1A' }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
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

  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

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
  username: { fontSize: 12, color: colors.textTertiary, marginTop: 1 },
  levelPill: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  levelPillText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  catchSub: { fontSize: 12, color: colors.textSecondary },

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    marginTop: spacing.sm,
  },
  findBtnText: { fontSize: 13, fontWeight: '700', color: '#0A0E1A' },

  // Currently Fishing
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  sectionLive: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  fishingNowScroll: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.sm },
  fishingNowCard: {
    alignItems: 'center', width: 72,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
  },
  fishingNowEmpty: { borderStyle: 'dashed', borderColor: colors.primary },
  fishingNowAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  fishingNowInitials: { fontSize: 15, fontWeight: '700', color: '#fff' },
  fishingNowOnline: {
    position: 'absolute', bottom: 4, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: colors.surface,
  },
  pulseRing: {
    position: 'absolute', bottom: 2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: 'rgba(34,197,94,0.3)',
  },
  fishingNowAddCircle: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  fishingNowName: { fontSize: 11, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  fishingNowSpot: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  fishingNowSpotText: { fontSize: 9, color: colors.primary, flex: 1, textAlign: 'center' },

  // Recent Catches
  catchFeedCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  catchFeedAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  catchFeedInitials: { fontSize: 13, fontWeight: '700', color: '#fff' },
  catchFeedName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  catchFeedAgo: { fontSize: 11, color: colors.textTertiary },
  catchFeedSpecies: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  catchFeedBold: { fontWeight: '700' },
  catchFeedMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  catchFeedLocation: { fontSize: 11, color: colors.textTertiary },
  reactBtn: { padding: 8 },

  // Region filter
  regionScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm },
  regionChip: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  regionChipActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  regionChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  regionChipTextActive: { color: colors.primary },

  // Invite card
  inviteCard: { margin: spacing.lg, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)' },
  inviteGrad: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  inviteTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  inviteHandle: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  inviteAt: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
  inviteUsername: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  inviteSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  inviteBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: colors.primary,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  inviteBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  inviteBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
