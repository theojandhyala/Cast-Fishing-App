import React, { memo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { ReactionType, SocialCatchPost, SocialUser } from '../../data/socialData';
import { ReactionBar } from './ReactionBar';
import { SocialAvatar } from './SocialAvatar';
import { FishSpeciesPhoto } from '../fish/FishSpeciesPhoto';

interface SocialFeedCardProps {
  post: SocialCatchPost;
  user: SocialUser;
  selectedReaction?: ReactionType;
  onReact: (type: ReactionType) => void;
}

const relativeTime = (iso: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1_440)}d`;
};

export const SocialFeedCard = memo(function SocialFeedCard({
  post,
  user,
  selectedReaction,
  onReact,
}: SocialFeedCardProps) {
  const share = () => Share.share({
    title: `${post.species} catch on CAST`,
    message: `${user.name} landed a ${post.weightDisplay} ${post.species} at ${post.location}. Shared from the CAST demo community.`,
  });

  return (
    <View style={styles.card} accessible={false}>
      <View style={styles.header}>
        <SocialAvatar name={user.name} color={user.avatarColor} isOnline={user.isOnline} />
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
            <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View>
          </View>
          <Text style={styles.meta}>{user.countryCode} · {relativeTime(post.caughtAt)} ago</Text>
        </View>
        <View style={styles.rarityBadge}><Text style={styles.rarityText}>{post.rarity}</Text></View>
      </View>

      <View style={styles.hero} accessibilityLabel={`${post.weightDisplay} ${post.species}`}>
        <FishSpeciesPhoto species={post.species} style={styles.speciesPhoto} />
        <View style={styles.referenceLabel}><Text style={styles.referenceText}>SPECIES REFERENCE</Text></View>
        <View style={styles.weightBadge}><Text style={styles.weight}>{post.weightDisplay}</Text></View>
      </View>

      <View style={styles.body}>
        <Text style={styles.species}>{post.species}</Text>
        <Text style={styles.caption}>{post.caption}</Text>
        <View style={styles.details}>
          <Icon name="map-marker-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>{post.location}</Text>
          <Icon name="hook" size={15} color={colors.textSecondary} />
          <Text style={styles.baitText} numberOfLines={1}>{post.bait}</Text>
        </View>
        <View style={styles.actions}>
          <ReactionBar counts={post.reactions} selected={selectedReaction} onSelect={onReact} />
          <Pressable accessibilityRole="button" accessibilityLabel="Share catch" hitSlop={8} onPress={share} style={styles.share}>
            <Icon name="share-variant-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  identity: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  demoBadge: { backgroundColor: 'rgba(45,212,255,0.12)', borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(45,212,255,0.3)' },
  demoText: { color: colors.accentBlue, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  rarityBadge: { backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  rarityText: { color: colors.secondary, fontSize: 10, fontWeight: '800' },
  hero: { height: 174, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  speciesPhoto: { width: '100%', height: '100%' },
  referenceLabel: { position: 'absolute', left: spacing.md, bottom: spacing.md, backgroundColor: 'rgba(13,15,14,0.82)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.xs },
  referenceText: { color: colors.textSecondary, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  weightBadge: { position: 'absolute', right: spacing.md, bottom: spacing.md, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 5, backgroundColor: 'rgba(10,14,26,0.88)' },
  weight: { color: colors.primary, fontFamily: fonts.monoBold, fontSize: 15 },
  body: { padding: spacing.md },
  species: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  caption: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, marginTop: spacing.xs },
  details: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  detailText: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  baitText: { color: colors.textSecondary, fontSize: 12, maxWidth: '35%' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.md },
  share: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
});
