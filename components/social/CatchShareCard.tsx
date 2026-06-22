import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../ui/Icon';
import { useSocialStore } from '../../store/socialStore';
import { colors, radius, spacing, elevation, typography } from '../../constants/theme';

export interface CatchShareData {
  species: string;
  weightKg?: number;
  lengthCm?: number;
  location?: string;
  date?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  userDisplayName: string;
  username: string;
  avatarColor?: string;
  photoUri?: string | null;
}

interface Props {
  data: CatchShareData;
  onDismiss?: () => void;
}

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function CatchShareCard({ data, onDismiss }: Props) {
  const { postActivity } = useSocialStore();
  const rarityColor = data.rarity ? (RARITY_COLORS[data.rarity] ?? colors.primary) : colors.primary;
  const avatarColor = data.avatarColor ?? '#00D4AA';

  const dateStr = data.date
    ? new Date(data.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const handleShare = () => {
    postActivity({
      username: data.username,
      displayName: data.userDisplayName,
      avatarUri: null,
      avatarColor,
      type: 'catch',
      species: data.species,
      weightKg: data.weightKg,
      rarity: data.rarity,
      location: data.location,
      photoUri: data.photoUri ?? null,
    });
    onDismiss?.();
  };

  return (
    <View style={styles.wrapper}>
      {/* Card */}
      <View style={styles.card}>
        {/* Header gradient */}
        <LinearGradient
          colors={['#00D4AA', '#0099AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeader}
        >
          {/* CAST logo watermark */}
          <View style={styles.castBrand}>
            <Icon name="fish" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.castBrandText}>CAST</Text>
          </View>

          {/* Species + rarity */}
          <Text style={styles.speciesName}>{data.species}</Text>
          {data.rarity && (
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '33', borderColor: rarityColor + '88' }]}>
              <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {RARITY_LABELS[data.rarity]}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats section */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            {data.weightKg != null && (
              <View style={styles.statItem}>
                <Icon name="weight" size={18} color={colors.primary} />
                <Text style={styles.statValue}>{data.weightKg.toFixed(2)}</Text>
                <Text style={styles.statUnit}>kg</Text>
              </View>
            )}
            {data.lengthCm != null && (
              <View style={styles.statItem}>
                <Icon name="ruler" size={18} color={colors.primary} />
                <Text style={styles.statValue}>{data.lengthCm}</Text>
                <Text style={styles.statUnit}>cm</Text>
              </View>
            )}
            {data.weightKg == null && data.lengthCm == null && (
              <View style={styles.statItem}>
                <Icon name="fish" size={18} color={colors.primary} />
                <Text style={styles.statValue}>Catch</Text>
                <Text style={styles.statUnit}>logged</Text>
              </View>
            )}
          </View>

          {/* Location + date */}
          {data.location && (
            <View style={styles.metaRow}>
              <Icon name="map-marker" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>{data.location}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Icon name="clock-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{dateStr}</Text>
          </View>
        </View>

        {/* Footer — user + cast watermark */}
        <View style={styles.cardFooter}>
          <LinearGradient
            colors={[avatarColor, avatarColor + '99']}
            style={styles.footerAvatar}
          >
            <Text style={styles.footerAvatarText}>{getInitials(data.userDisplayName)}</Text>
          </LinearGradient>
          <View style={styles.footerUserInfo}>
            <Text style={styles.footerDisplayName}>{data.userDisplayName}</Text>
            <Text style={styles.footerUsername}>@{data.username}</Text>
          </View>
          <View style={styles.castWatermark}>
            <Icon name="fish" size={10} color={colors.primary} />
            <Text style={styles.castWatermarkText}>CAST</Text>
          </View>
        </View>
      </View>

      {/* Share button */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
        <Icon name="share-variant" size={18} color="#0A0E1A" />
        <Text style={styles.shareBtnText}>Share to Feed</Text>
      </TouchableOpacity>

      {onDismiss && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.card,
  },

  cardHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    minHeight: 140,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  castBrand: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  castBrandText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },

  speciesName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  rarityDot: { width: 6, height: 6, borderRadius: 3 },
  rarityText: { fontSize: 11, fontWeight: '700' },

  statsSection: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  statUnit: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAvatarText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  footerUserInfo: { flex: 1 },
  footerDisplayName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  footerUsername: { fontSize: 11, color: colors.textSecondary },
  castWatermark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.7,
  },
  castWatermarkText: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 1.5 },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: '#0A0E1A' },

  cancelBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelBtnText: { fontSize: 14, color: colors.textSecondary },
});
