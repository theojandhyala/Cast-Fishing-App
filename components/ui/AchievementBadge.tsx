import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../constants/theme';

interface AchievementBadgeProps {
  emoji: string;
  title: string;
  subtitle?: string;
  unlocked?: boolean;
}

export function AchievementBadge({ emoji, title, subtitle, unlocked = true }: AchievementBadgeProps) {
  return (
    <View style={[styles.container, !unlocked && styles.locked]}>
      <LinearGradient
        colors={unlocked ? ['#00D4AA22', '#00D4AA11'] : ['#1F293788', '#1F293744']}
        style={styles.iconContainer}
      >
        <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{emoji}</Text>
      </LinearGradient>
      <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  emoji: {
    fontSize: 26,
  },
  emojiLocked: {
    opacity: 0.4,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  lockedText: {
    color: colors.textSecondary,
  },
});
