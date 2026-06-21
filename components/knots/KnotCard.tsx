import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon as MaterialCommunityIcons } from '../ui/Icon';
import { Knot } from '../../data/knots';
import { colors, radius, spacing } from '../../constants/theme';

interface KnotCardProps {
  knot: Knot;
  onPress: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
}

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export function KnotCard({ knot, onPress, bookmarked, onBookmark }: KnotCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{knot.emoji}</Text>
        </View>
        <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <MaterialCommunityIcons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={bookmarked ? colors.secondary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.name}>{knot.name}</Text>
      <Text style={styles.useCase} numberOfLines={2}>{knot.useCase}</Text>
      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: difficultyColors[knot.difficulty] + '22' }]}>
          <Text style={[styles.badgeText, { color: difficultyColors[knot.difficulty] }]}>
            {knot.difficulty}
          </Text>
        </View>
        <View style={styles.strength}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i < knot.strengthRating ? colors.primary : colors.surface2 },
              ]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    margin: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  useCase: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  strength: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
