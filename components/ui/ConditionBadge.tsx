import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface ConditionBadgeProps {
  label: string;
  value: string;
  icon?: string;
}

export function ConditionBadge({ label, value, icon }: ConditionBadgeProps) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 18,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
