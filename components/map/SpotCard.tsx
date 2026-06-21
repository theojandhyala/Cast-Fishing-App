import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Icon as MaterialCommunityIcons } from '../ui/Icon';
import { useRouter } from 'expo-router';
import { WorldSpot } from '../../data/worldSpots';
import { colors, radius, spacing, typography, fonts, elevation } from '../../constants/theme';
import { CastButton } from '../ui/CastButton';
import { useSessionStore } from '../../store/sessionStore';
import { useLocationStore } from '../../store/locationStore';

interface SpotCardProps {
  spot: WorldSpot;
  onClose: () => void;
  onNavigate?: () => void;
}

const typeIcons: Record<string, string> = {
  river: 'waves',
  lake: 'water',
  sea: 'anchor',
  reservoir: 'water-pump',
  private: 'lock',
};

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export function SpotCard({ spot, onClose, onNavigate }: SpotCardProps) {
  const router = useRouter();
  const { activeSession, startSession } = useSessionStore();
  const { setLocation } = useLocationStore();

  const handleStartSession = () => {
    if (activeSession) {
      Alert.alert(
        'Session in progress',
        `You already have an active session at ${activeSession.spotName}. End it before starting a new one.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setLocation({ name: spot.name, query: spot.name });
    startSession(spot.name, { spotQuery: spot.name, latitude: spot.latitude, longitude: spot.longitude });
    onClose();
    router.push('/session');
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name={typeIcons[spot.type] as any} size={18} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{spot.name}</Text>
            <Text style={styles.type}>{spot.country.toUpperCase()} · {spot.type.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="star" size={13} color={colors.secondary} />
          <Text style={styles.metaText}>{spot.rating.toFixed(1)}/5</Text>
        </View>
        <View style={[styles.badge, { borderColor: difficultyColors[spot.difficulty] }]}>
          <Text style={[styles.badgeText, { color: difficultyColors[spot.difficulty] }]}>
            {spot.difficulty.toUpperCase()}
          </Text>
        </View>
        {spot.permitRequired && (
          <View style={[styles.badge, { borderColor: colors.danger }]}>
            <Text style={[styles.badgeText, { color: colors.danger }]}>PERMIT REQUIRED</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={3}>{spot.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Species</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {spot.species.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Bait</Text>
        <Text style={styles.detail}>{spot.bestBait.join(' · ')}</Text>
      </View>

      <View style={styles.tipContainer}>
        <MaterialCommunityIcons name="lightbulb-outline" size={14} color={colors.secondary} />
        <Text style={styles.tip}>{spot.tips}</Text>
      </View>

      {/* Reviews */}
      {spot.reviews && spot.reviews.length > 0 && (() => {
        const avgRating = spot.reviews.reduce((s, r) => s + r.rating, 0) / spot.reviews.length;
        const latest = spot.reviews[0];
        return (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsRating}>
                <MaterialCommunityIcons name="star" size={13} color={colors.secondary} />
                <Text style={styles.reviewsAvg}>{avgRating.toFixed(1)}</Text>
                <Text style={styles.reviewsCount}>({spot.reviews.length})</Text>
              </View>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => Alert.alert('Write a Review', 'Review submission coming soon! Stay tuned for this feature.', [{ text: 'OK' }])}
              >
                <Text style={styles.writeReviewText}>WRITE A REVIEW</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.latestReview}>
              <Text style={styles.reviewAuthor}>"{latest.comment}"</Text>
              <Text style={styles.reviewMeta}>— {latest.author.toUpperCase()} · {latest.rating}/5</Text>
            </View>
          </View>
        );
      })()}

      <CastButton title="Start Session" onPress={handleStartSession} fullWidth size="lg" style={{ marginTop: spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    ...elevation.card,
  },
  handle: {
    width: 32,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.raised,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.h3,
  },
  type: {
    ...typography.caption,
    marginTop: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    ...typography.mono,
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bodySemi,
    letterSpacing: 0.6,
  },
  description: {
    ...typography.bodySmall,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  chipText: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fonts.bodySemi,
  },
  detail: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  tip: {
    flex: 1,
    fontSize: 13,
    color: colors.secondary,
    lineHeight: 19,
  },
  reviewsSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewsRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsAvg: {
    ...typography.mono,
    fontSize: 15,
    fontFamily: fonts.monoBold,
  },
  reviewsCount: {
    ...typography.caption,
    textTransform: 'none',
  },
  writeReviewBtn: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  writeReviewText: {
    fontSize: 10,
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    letterSpacing: 0.6,
  },
  latestReview: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 4,
  },
  reviewAuthor: {
    fontSize: 13,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  reviewMeta: {
    ...typography.caption,
    textTransform: 'none',
  },
});
