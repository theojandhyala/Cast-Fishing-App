import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

const WINDOW_QUALITY = [
  { time: '04:00', label: '4am', quality: 'good' },
  { time: '06:00', label: '6am', quality: 'best' },
  { time: '08:00', label: '8am', quality: 'good' },
  { time: '10:00', label: '10am', quality: 'poor' },
  { time: '12:00', label: '12pm', quality: 'poor' },
  { time: '14:00', label: '2pm', quality: 'poor' },
  { time: '16:00', label: '4pm', quality: 'good' },
  { time: '18:00', label: '6pm', quality: 'best' },
  { time: '20:00', label: '8pm', quality: 'good' },
  { time: '22:00', label: '10pm', quality: 'poor' },
];

const qualityConfig = {
  best: { color: colors.primary, label: 'Peak', height: 40 },
  good: { color: colors.success, label: 'Good', height: 28 },
  poor: { color: colors.surface2, label: 'Slow', height: 14 },
};

export function FishingWindows() {
  const now = new Date();
  const currentHour = now.getHours();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feeding Windows</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Peak</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Good</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.surface2 }]} />
            <Text style={styles.legendText}>Slow</Text>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chart}>
          {WINDOW_QUALITY.map((w) => {
            const config = qualityConfig[w.quality as keyof typeof qualityConfig];
            const hour = parseInt(w.time.split(':')[0]);
            const isCurrent = Math.abs(hour - currentHour) <= 1;
            return (
              <View key={w.time} style={styles.bar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      { height: config.height, backgroundColor: config.color },
                      isCurrent && styles.barActive,
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, isCurrent && { color: colors.primary }]}>{w.label}</Text>
                {isCurrent && <View style={styles.nowIndicator} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bar: {
    alignItems: 'center',
    position: 'relative',
  },
  barContainer: {
    height: 44,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  barFill: {
    width: 24,
    borderRadius: 4,
  },
  barActive: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  nowIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
