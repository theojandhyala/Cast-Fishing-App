import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../../hooks/useWeather';
import { colors, radius, spacing } from '../../constants/theme';

interface ConditionsWidgetProps {
  weather: WeatherData;
  loading?: boolean;
}

export function ConditionsWidget({ weather, loading }: ConditionsWidgetProps) {
  if (loading) {
    return (
      <View style={styles.skeleton}>
        <Text style={styles.loadingText}>Loading conditions...</Text>
      </View>
    );
  }

  const scoreColor = weather.fishingScore >= 7 ? colors.success : weather.fishingScore >= 5 ? colors.secondary : colors.danger;

  return (
    <LinearGradient
      colors={['rgba(0,212,170,0.12)', 'rgba(0,212,170,0.04)']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.city}>{weather.city}</Text>
          <Text style={styles.description}>{weather.description}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: scoreColor }]}>{weather.fishingScore}</Text>
          <Text style={styles.scoreLabel}>/10</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <CondBox icon="thermometer" label="Temp" value={`${weather.temp}°C`} />
        <CondBox icon="weather-windy" label="Wind" value={`${weather.wind}km/h`} />
        <CondBox icon="gauge" label="Pressure" value={`${weather.pressure}mb`} />
        <CondBox icon={weather.moonEmoji ? 'moon-full' : 'moon-waxing-crescent'} label="Moon" value={weather.moonEmoji} emoji />
      </View>

      <View style={styles.trend}>
        <MaterialCommunityIcons
          name={weather.pressureTrend === 'rising' ? 'trending-up' : weather.pressureTrend === 'falling' ? 'trending-down' : 'trending-neutral'}
          size={16}
          color={weather.pressureTrend === 'rising' ? colors.success : weather.pressureTrend === 'falling' ? colors.warning : colors.textSecondary}
        />
        <Text style={styles.trendText}>
          Pressure {weather.pressureTrend} — {weather.pressureTrend === 'rising' ? 'Good feeding conditions' : weather.pressureTrend === 'falling' ? 'Fish may feed before drop' : 'Stable conditions'}
        </Text>
      </View>
    </LinearGradient>
  );
}

function CondBox({ icon, label, value, emoji }: { icon: string; label: string; value: string; emoji?: boolean }) {
  return (
    <View style={styles.condBox}>
      {emoji ? (
        <Text style={styles.moonEmoji}>{value}</Text>
      ) : (
        <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
      )}
      <Text style={styles.condValue}>{emoji ? '' : value}</Text>
      <Text style={styles.condLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  skeleton: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  city: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  condBox: {
    alignItems: 'center',
    flex: 1,
  },
  condValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  condLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moonEmoji: {
    fontSize: 20,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  trendText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
});
