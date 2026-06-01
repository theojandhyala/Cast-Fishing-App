import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface CastBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function CastBadge({ label, variant = 'primary', size = 'md' }: CastBadgeProps) {
  const variantColors = {
    primary: { bg: 'rgba(0,212,170,0.15)', text: colors.primary },
    secondary: { bg: 'rgba(245,158,11,0.15)', text: colors.secondary },
    success: { bg: 'rgba(16,185,129,0.15)', text: colors.success },
    warning: { bg: 'rgba(245,158,11,0.15)', text: colors.warning },
    danger: { bg: 'rgba(239,68,68,0.15)', text: colors.danger },
    neutral: { bg: colors.surface2, text: colors.textSecondary },
  };

  const { bg, text } = variantColors[variant];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, { color: text }, isSmall && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeSm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
