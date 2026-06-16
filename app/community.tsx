import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COMMUNITY_POSTS, LEADERBOARD_DATA, TOP_SPOTS_WEEK, CommunityPost } from '../data/communityData';
import { colors, spacing, radius, typography, fonts } from '../constants/theme';

function timeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [tab, setTab] = useState<'feed' | 'leaderboard' | 'spots'>('feed');
  const [liking, setLiking] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const nearbyPosts = posts.filter(p => p.isNearby);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => Alert.alert('Report', 'Thank you for helping keep our waters clean. Your report has been submitted to the EA.', [{ text: 'OK' }])}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={22} color={colors.warning} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tabs}>
        {(['feed', 'leaderboard', 'spots'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <MaterialCommunityIcons
              name={t === 'feed' ? 'image-multiple-outline' : t === 'leaderboard' ? 'trophy-outline' : 'map-marker-radius-outline'}
              size={15}
              color={tab === t ? '#0A0E1A' : colors.textSecondary}
            />
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'feed' ? 'Feed' : t === 'leaderboard' ? 'Leaders' : 'Hot Spots'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'feed' && (
          <View>
            {/* Nearby section */}
            {nearbyPosts.length > 0 && (
              <View style={styles.nearbySection}>
                <Text style={styles.nearbyTitle}>Caught Near You</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {nearbyPosts.map(post => (
                    <View key={post.id + 'nearby'} style={styles.nearbyCard}>
                      <MaterialCommunityIcons name="fish" size={28} color={colors.primary} style={{ marginBottom: 4 }} />
                      <Text style={styles.nearbyUser}>{post.username}</Text>
                      <Text style={styles.nearbySpecies}>{post.species}</Text>
                      <Text style={styles.nearbyWeight}>{post.weightDisplay}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Posts feed */}
            <View style={styles.feedList}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
              ))}
            </View>
          </View>
        )}

        {tab === 'leaderboard' && (
          <View style={styles.leaderContent}>
            <Text style={styles.leaderTitle}>This Week's Top Anglers</Text>
            {LEADERBOARD_DATA.map(entry => (
              <View key={entry.rank} style={[styles.leaderCard, entry.rank === 1 && styles.leaderCardGold]}>
                {entry.rank <= 3 ? (
                  <MaterialCommunityIcons
                    name="medal"
                    size={entry.rank === 1 ? 26 : 22}
                    color={entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#C0C0C0' : '#B08D57'}
                    style={{ width: 36, textAlign: 'center' }}
                  />
                ) : (
                  <Text style={styles.leaderRank}>#{entry.rank}</Text>
                )}
                <View style={styles.leaderAvatar}>
                  <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaderUsername}>{entry.username}</Text>
                  <Text style={styles.leaderBigFish}>Best: {entry.biggestFish}</Text>
                </View>
                <View style={styles.leaderCatches}>
                  <Text style={styles.leaderCatchNum}>{entry.catches}</Text>
                  <Text style={styles.leaderCatchLabel}>catches</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'spots' && (
          <View style={styles.spotsContent}>
            <Text style={styles.spotsTitle}>Hot Spots This Week</Text>
            <Text style={styles.spotsSubTitle}>Based on community catches in the last 7 days</Text>
            {TOP_SPOTS_WEEK.map((spot, i) => (
              <View key={i} style={styles.spotCard}>
                <View style={styles.spotRankBadge}>
                  <Text style={styles.spotRankText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spotName}>{spot.name}</Text>
                  <Text style={styles.spotSpecies}>Main species: {spot.species}</Text>
                </View>
                <View style={styles.spotCatchBubble}>
                  <Text style={styles.spotCatchNum}>{spot.catches}</Text>
                  <Text style={styles.spotCatchLabel}>catches</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.pollutionBtn}
              onPress={() => Alert.alert('Report Pollution', 'Thank you for caring about our waterways. Your report has been submitted to the Environment Agency.\n\nFor urgent pollution incidents, call the EA hotline: 0800 80 70 60', [{ text: 'OK' }])}
            >
              <MaterialCommunityIcons name="alert" size={20} color={colors.warning} />
              <Text style={styles.pollutionBtnText}>Report Pollution / Invasive Species</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PostCard({ post, onLike }: { post: CommunityPost; onLike: () => void }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <MaterialCommunityIcons name="account-circle" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postUsername}>{post.username}</Text>
          <Text style={styles.postTime}>{timeAgo(post.timestamp)}</Text>
        </View>
        <View style={styles.postSpeciesBadge}>
          <Text style={styles.postSpeciesText}>{post.species}</Text>
        </View>
      </View>

      <View style={styles.postPhotoArea}>
        <MaterialCommunityIcons name="fish" size={64} color={colors.textTertiary} />
        <View style={styles.postWeightBadge}>
          <Text style={styles.postWeight}>{post.weightDisplay}</Text>
        </View>
      </View>

      <View style={styles.postBody}>
        <Text style={styles.postDescription}>{post.description}</Text>
        <View style={styles.postMeta}>
          <MaterialCommunityIcons name="map-marker" size={13} color={colors.textSecondary} />
          <Text style={styles.postLocation}>{post.location}</Text>
          <MaterialCommunityIcons name="hook" size={13} color={colors.textSecondary} />
          <Text style={styles.postBait}>{post.bait}</Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.likeBtn} onPress={onLike}>
          <MaterialCommunityIcons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.liked ? colors.danger : colors.textSecondary}
          />
          <Text style={[styles.likeCount, post.liked && { color: colors.danger }]}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Share', 'Sharing coming soon!')}>
          <MaterialCommunityIcons name="share-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  reportBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', gap: 4, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  activeTabText: { color: '#0A0E1A' },
  nearbySection: { paddingLeft: spacing.lg, marginBottom: spacing.md },
  nearbyTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  nearbyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginRight: spacing.sm, alignItems: 'center', minWidth: 90, borderWidth: 1, borderColor: colors.border },
  nearbyUser: { fontSize: 10, color: colors.textSecondary },
  nearbySpecies: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  nearbyWeight: { fontSize: 11, color: colors.primary },
  feedList: { paddingHorizontal: spacing.lg },
  postCard: { backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  postAvatar: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: 'rgba(0,212,170,0.15)', alignItems: 'center', justifyContent: 'center' },
  postUsername: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  postTime: { fontSize: 12, color: colors.textSecondary },
  postSpeciesBadge: { backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  postSpeciesText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  postPhotoArea: { height: 160, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  postWeightBadge: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  postWeight: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.primary },
  postBody: { padding: spacing.md },
  postDescription: { fontSize: 14, color: colors.textPrimary, lineHeight: 20, marginBottom: spacing.xs },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  postLocation: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  postBait: { fontSize: 12, color: colors.textSecondary },
  postActions: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shareText: { fontSize: 14, color: colors.textSecondary },
  leaderContent: { paddingHorizontal: spacing.lg },
  leaderTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.sm },
  leaderCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  leaderCardGold: { backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' },
  leaderRank: { fontFamily: fonts.monoBold, fontSize: 16, color: colors.textSecondary, width: 36, textAlign: 'center' },
  leaderAvatar: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: 'rgba(0,212,170,0.12)', alignItems: 'center', justifyContent: 'center' },
  leaderUsername: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  leaderBigFish: { fontSize: 12, color: colors.textSecondary },
  leaderCatches: { alignItems: 'center' },
  leaderCatchNum: { fontFamily: fonts.monoBold, fontSize: 22, color: colors.primary },
  leaderCatchLabel: { fontSize: 10, color: colors.textSecondary },
  spotsContent: { paddingHorizontal: spacing.lg },
  spotsTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, marginTop: spacing.sm },
  spotsSubTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  spotCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  spotRankBadge: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: 'rgba(0,212,170,0.12)', alignItems: 'center', justifyContent: 'center' },
  spotRankText: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.primary },
  spotName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  spotSpecies: { fontSize: 12, color: colors.textSecondary },
  spotCatchBubble: { alignItems: 'center', backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.md, padding: spacing.sm },
  spotCatchNum: { fontFamily: fonts.monoBold, fontSize: 18, color: colors.primary },
  spotCatchLabel: { fontSize: 10, color: colors.textSecondary },
  pollutionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  pollutionBtnText: { fontSize: 14, fontWeight: '600', color: colors.warning },
});
