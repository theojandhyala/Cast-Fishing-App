import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WorldSpot } from '../../data/worldSpots';
import { colors, radius, spacing } from '../../constants/theme';

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
  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name={typeIcons[spot.type] as any} size={20} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{spot.name}</Text>
            <Text style={styles.type}>{spot.country} · {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
          <Text style={styles.metaText}>{spot.rating}/5</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: difficultyColors[spot.difficulty] + '22' }]}>
          <Text style={[styles.badgeText, { color: difficultyColors[spot.difficulty] }]}>
            {spot.difficulty}
          </Text>
        </View>
        {spot.permitRequired && (
          <View style={[styles.badge, { backgroundColor: colors.danger + '22' }]}>
            <Text style={[styles.badgeText, { color: colors.danger }]}>Permit Required</Text>
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
        <Text style={styles.detail}>{spot.bestBait.join(', ')}</Text>
      </View>

      <View style={styles.tipContainer}>
        <MaterialCommunityIcons name="lightbulb" size={14} color={colors.secondary} />
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
                <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
                <Text style={styles.reviewsAvg}>{avgRating.toFixed(1)}</Text>
                <Text style={styles.reviewsCount}>({spot.reviews.length} reviews)</Text>
              </View>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => Alert.alert('Write a Review', 'Review submission coming soon! Stay tuned for this feature.', [{ text: 'OK' }])}
              >
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.latestReview}>
              <Text style={styles.reviewAuthor}>"{latest.comment}"</Text>
              <Text style={styles.reviewMeta}>— {latest.author} · {'⭐'.repeat(latest.rating)}</Text>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
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
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  type: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
    fontSize: 13,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    borderRadius: radius.full,
  },
  chipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  detail: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: radius.md,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewsCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  writeReviewBtn: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  writeReviewText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  latestReview: {
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    fontSize: 11,
    color: colors.textSecondary,
  },
});
