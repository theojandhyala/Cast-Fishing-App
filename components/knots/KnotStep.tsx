import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/theme';

interface KnotStepProps {
  step: { instruction: string; tip?: string };
  number: number;
  isActive?: boolean;
}

export function KnotStep({ step, number, isActive }: KnotStepProps) {
  return (
    <View style={[styles.container, isActive && styles.active]}>
      <View style={[styles.number, isActive && styles.numberActive]}>
        <Text style={[styles.numberText, isActive && styles.numberTextActive]}>{number}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.instruction, isActive && styles.instructionActive]}>
          {step.instruction}
        </Text>
        {step.tip && (
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons name="lightbulb" size={14} color={colors.secondary} />
            <Text style={styles.tip}>{step.tip}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderColor: colors.primary + '44',
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  numberActive: {
    backgroundColor: colors.primary,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  numberTextActive: {
    color: '#0A0E1A',
  },
  content: {
    flex: 1,
  },
  instruction: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  instructionActive: {
    color: colors.textPrimary,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  tip: {
    flex: 1,
    fontSize: 13,
    color: colors.secondary,
    lineHeight: 18,
  },
});
