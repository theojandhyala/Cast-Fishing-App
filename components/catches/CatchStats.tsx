import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CatchStats as Stats } from '../../store/catchStore';
import { colors, radius, spacing } from '../../constants/theme';

interface CatchStatsProps {
  stats: Stats;
}

export function CatchStats({ stats }: CatchStatsProps) {
  const topSpecies = Object.entries(stats.speciesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)[0];

  return (
    <View style={styles.row}>
      <StatBox icon="fish" label="Total" value={stats.total.toString()} />
      <StatBox icon="calendar-week" label="This Week" value={stats.thisWeek.toString()} />
      <StatBox icon="calendar-month" label="This Month" value={stats.thisMonth.toString()} />
      <StatBox
        icon="trophy"
        label="Best"
        value={stats.heaviest ? `${stats.heaviest.weight}kg` : '-'}
        highlight
      />
    </View>
  );
}

function StatBox({ icon, label, value, highlight }: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.box, highlight && styles.boxHighlight]}>
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={highlight ? colors.secondary : colors.primary}
      />
      <Text style={[styles.value, highlight && { color: colors.secondary }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  boxHighlight: {
    borderColor: colors.secondary + '44',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
    textAlign: 'center',
  },
});
