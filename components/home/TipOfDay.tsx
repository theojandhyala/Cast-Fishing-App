import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../ui/Icon';
import { getTipOfDay } from '../../data/tipOfDay';
import { colors, radius, spacing } from '../../constants/theme';

export function TipOfDay() {
  const tip = getTipOfDay();

  return (
    <LinearGradient
      colors={['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.04)']}
      style={styles.container}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="lightbulb" size={16} color={colors.secondary} />
        <Text style={styles.headerText}>TIP OF THE DAY</Text>
        <View style={styles.category}>
          <Text style={styles.categoryText}>{tip.category}</Text>
        </View>
      </View>
      <Text style={styles.tip}>{tip.tip}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1,
    flex: 1,
  },
  category: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  tip: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
