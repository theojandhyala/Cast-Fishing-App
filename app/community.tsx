import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { SocialFeedCard } from '../components/social/SocialFeedCard';
import { SOCIAL_USERS_BY_ID, ReactionType, SocialCatchPost } from '../data/socialData';
import { useFriendsStore } from '../store/friendsStore';
import { colors, radius, spacing, typography } from '../constants/theme';

type CommunityTab = 'world' | 'friends' | 'live';

const TAB_LABELS: Record<CommunityTab, string> = {
  world: 'World feed',
  friends: 'Friends',
  live: 'Live now',
};

export default function CommunityScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<CommunityTab>('world');
  const feed = useFriendsStore((state) => state.feed);
  const friends = useFriendsStore((state) => state.friends);
  const sessionPins = useFriendsStore((state) => state.sessionPins);
  const reactions = useFriendsStore((state) => state.reactionsByPost);
  const reactToCatch = useFriendsStore((state) => state.reactToCatch);
  const hydrate = useFriendsStore((state) => state.hydrate);

  useEffect(() => { void hydrate(); }, [hydrate]);

  const friendIds = useMemo(() => new Set(friends.map((friend) => friend.id)), [friends]);
  const visibleFeed = useMemo(
    () => tab === 'friends' ? feed.filter((post) => friendIds.has(post.userId)) : feed,
    [feed, friendIds, tab],
  );
  const activePins = useMemo(() => {
    const now = Date.now();
    return sessionPins.filter((pin) => friendIds.has(pin.friendId) && new Date(pin.expiresAt).getTime() > now);
  }, [friendIds, sessionPins]);

  const renderPost = useCallback(({ item }: { item: SocialCatchPost }) => {
    const user = SOCIAL_USERS_BY_ID.get(item.userId);
    if (!user) return null;
    return (
      <SocialFeedCard
        post={item}
        user={user}
        selectedReaction={reactions[item.id]}
        onReact={(reaction: ReactionType) => reactToCatch(item.id, reaction)}
      />
    );
  }, [reactToCatch, reactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['rgba(0,212,170,0.12)', 'transparent']} style={styles.headerGradient}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <Icon name="chevron-left" size={27} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Anglers across the water</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open friends" hitSlop={10} onPress={() => router.push('/friends')} style={styles.iconButton}>
            <Icon name="account-group-outline" size={23} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.demoNotice}>
          <Icon name="information-outline" size={16} color={colors.accentBlue} />
          <Text style={styles.demoNoticeText}>Fictional demo profiles and catches — explore safely.</Text>
        </View>
        <View style={styles.tabs} accessibilityRole="tablist">
          {(Object.keys(TAB_LABELS) as CommunityTab[]).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === item }}
              onPress={() => setTab(item)}
              style={[styles.tab, tab === item && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{TAB_LABELS[item]}</Text>
              {item === 'live' && activePins.length > 0 ? (
                <View style={styles.liveCount}><Text style={styles.liveCountText}>{activePins.length}</Text></View>
              ) : null}
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {tab === 'live' ? (
        <FlatList
          data={activePins}
          keyExtractor={(pin) => pin.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.liveDot} />
              <View style={styles.sessionBody}>
                <View style={styles.sessionTitleRow}>
                  <Text style={styles.sessionName}>{item.friendName}</Text>
                  <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO</Text></View>
                </View>
                <Text style={styles.sessionLocation}>{item.locationLabel}</Text>
                <Text style={styles.sessionTarget}>Targeting {item.targetSpecies.join(' · ')}</Text>
              </View>
              <Icon name="map-marker-radius-outline" size={25} color={colors.primary} />
            </View>
          )}
          ListHeaderComponent={<Text style={styles.sectionHeading}>Friends fishing now</Text>}
        />
      ) : (
        <FlatList
          data={visibleFeed}
          renderItem={renderPost}
          keyExtractor={(post) => post.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          windowSize={5}
          removeClippedSubviews
          ListHeaderComponent={<Text style={styles.sectionHeading}>{tab === 'friends' ? 'Your circle' : 'Fresh from around the world'}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGradient: { paddingBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 1 },
  demoNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: 'rgba(45,212,255,0.07)' },
  demoNoticeText: { flex: 1, color: colors.accentBlue, fontSize: 11 },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, padding: 4, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, minHeight: 38, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: colors.background },
  liveCount: { minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
  liveCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeading: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginVertical: spacing.md },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  liveDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.success, shadowColor: colors.success, shadowOpacity: 0.8, shadowRadius: 6 },
  sessionBody: { flex: 1 },
  sessionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sessionName: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  sessionLocation: { color: colors.primary, fontSize: 13, marginTop: 2 },
  sessionTarget: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  demoBadge: { backgroundColor: 'rgba(45,212,255,0.12)', borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  demoBadgeText: { color: colors.accentBlue, fontSize: 8, fontWeight: '900' },
});
