import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation } from '../hooks/useLocation';
import { useWeather } from '../hooks/useWeather';
import { colors, radius, spacing } from '../constants/theme';

const SOLUNAR_WINDOWS = [
  { time: '05:30', duration: '1h 40m', quality: 'major', label: 'Major Feeding' },
  { time: '11:45', duration: '45m', quality: 'minor', label: 'Minor Feeding' },
  { time: '18:00', duration: '1h 50m', quality: 'major', label: 'Major Feeding' },
  { time: '23:15', duration: '40m', quality: 'minor', label: 'Minor Feeding' },
];

const FORECAST = [
  { day: 'Today', icon: '⛅', high: 14, low: 8, wind: 12, pressure: 1016, score: 7 },
  { day: 'Tomorrow', icon: '🌧️', high: 12, low: 7, wind: 18, pressure: 1009, score: 5 },
  { day: 'Wed', icon: '🌦️', high: 11, low: 6, wind: 22, pressure: 1004, score: 4 },
  { day: 'Thu', icon: '🌤️', high: 15, low: 9, wind: 8, pressure: 1020, score: 8 },
  { day: 'Fri', icon: '☀️', high: 17, low: 10, wind: 6, pressure: 1024, score: 9 },
  { day: 'Sat', icon: '🌤️', high: 16, low: 9, wind: 10, pressure: 1019, score: 8 },
  { day: 'Sun', icon: '⛅', high: 14, low: 8, wind: 14, pressure: 1013, score: 6 },
];

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function degreesToDirection(deg: number) {
  return WIND_DIRECTIONS[Math.round(deg / 45) % 8];
}

export default function ConditionsScreen() {
  const { location } = useLocation();
  const { weather } = useWeather(location?.latitude, location?.longitude);

  const displayWeather = weather || {
    temp: 14,
    wind: 12,
    windDirection: 225,
    pressure: 1016,
    pressureTrend: 'rising' as const,
    moonPhase: 'Waxing Crescent',
    moonEmoji: '🌒',
    humidity: 72,
    fishingScore: 7,
    city: 'London',
    feelsLike: 12,
    description: 'Partly Cloudy',
    icon: '⛅',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Location header */}
      <LinearGradient
        colors={['rgba(0,212,170,0.12)', 'transparent']}
        style={styles.header}
      >
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
          <Text style={styles.location}>{displayWeather.city}</Text>
        </View>
        <Text style={styles.headerTitle}>Tides & Conditions</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </LinearGradient>

      {/* Pressure gauge */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Barometric Pressure</Text>
        <View style={styles.pressureCard}>
          <View style={styles.pressureGauge}>
            <Text style={styles.pressureValue}>{displayWeather.pressure}</Text>
            <Text style={styles.pressureUnit}>mb</Text>
          </View>
          <View style={styles.pressureInfo}>
            <View style={[styles.trendRow, {
              backgroundColor: displayWeather.pressureTrend === 'rising'
                ? 'rgba(16,185,129,0.1)' : displayWeather.pressureTrend === 'falling'
                ? 'rgba(245,158,11,0.1)' : 'rgba(156,163,175,0.1)'
            }]}>
              <MaterialCommunityIcons
                name={displayWeather.pressureTrend === 'rising' ? 'trending-up' : displayWeather.pressureTrend === 'falling' ? 'trending-down' : 'trending-neutral'}
                size={20}
                color={displayWeather.pressureTrend === 'rising' ? colors.success : displayWeather.pressureTrend === 'falling' ? colors.warning : colors.textSecondary}
              />
              <Text style={[styles.trendText, {
                color: displayWeather.pressureTrend === 'rising' ? colors.success : displayWeather.pressureTrend === 'falling' ? colors.warning : colors.textSecondary
              }]}>
                {displayWeather.pressureTrend.charAt(0).toUpperCase() + displayWeather.pressureTrend.slice(1)}
              </Text>
            </View>
            <Text style={styles.pressureNote}>
              {displayWeather.pressureTrend === 'rising'
                ? 'Rising pressure = Good fishing conditions ahead'
                : displayWeather.pressureTrend === 'falling'
                ? 'Fish may feed actively before the drop'
                : 'Stable conditions — predictable fishing'}
            </Text>
          </View>
        </View>
      </View>

      {/* Moon phase */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moon Phase</Text>
        <View style={styles.moonCard}>
          <Text style={styles.moonEmoji}>{displayWeather.moonEmoji}</Text>
          <View style={styles.moonInfo}>
            <Text style={styles.moonPhase}>{displayWeather.moonPhase}</Text>
            <Text style={styles.moonNote}>
              {displayWeather.moonPhase === 'Full Moon'
                ? 'Full moon nights can be exceptional for night fishing'
                : displayWeather.moonPhase === 'New Moon'
                ? 'Dark nights concentrate fish on bottom structures'
                : 'Moderate tidal influence on feeding patterns'}
            </Text>
          </View>
        </View>
      </View>

      {/* Wind */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wind</Text>
        <View style={styles.windCard}>
          <View style={styles.windMain}>
            <Text style={styles.windSpeed}>{displayWeather.wind}</Text>
            <Text style={styles.windUnit}>km/h</Text>
          </View>
          <View style={styles.windCompass}>
            <Text style={styles.windDirection}>{degreesToDirection(displayWeather.windDirection)}</Text>
            <MaterialCommunityIcons
              name="navigation"
              size={28}
              color={colors.primary}
              style={{ transform: [{ rotate: `${displayWeather.windDirection}deg` }] }}
            />
          </View>
          <Text style={styles.windNote}>
            {displayWeather.wind < 10 ? 'Calm — ideal conditions' :
             displayWeather.wind < 20 ? 'Light — good conditions' :
             displayWeather.wind < 30 ? 'Moderate — manageable' :
             'Strong — challenging, fish sheltered areas'}
          </Text>
        </View>
      </View>

      {/* Solunar windows */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Solunar Feeding Windows</Text>
        <Text style={styles.solunarNote}>Based on moon and sun positions for today</Text>
        {SOLUNAR_WINDOWS.map((w) => (
          <View key={w.time} style={[styles.windowCard, w.quality === 'major' && styles.windowCardMajor]}>
            <View style={[styles.windowDot, { backgroundColor: w.quality === 'major' ? colors.primary : colors.secondary }]} />
            <View style={styles.windowInfo}>
              <Text style={styles.windowTime}>{w.time}</Text>
              <Text style={styles.windowLabel}>{w.label}</Text>
            </View>
            <View style={styles.windowRight}>
              <Text style={styles.windowDuration}>{w.duration}</Text>
              <View style={[styles.windowBadge, w.quality === 'major' && styles.windowBadgeMajor]}>
                <Text style={[styles.windowBadgeText, w.quality === 'major' && { color: colors.primary }]}>
                  {w.quality.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 7-day forecast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7-Day Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.forecastRow}>
            {FORECAST.map((day) => {
              const scoreColor = day.score >= 7 ? colors.success : day.score >= 5 ? colors.secondary : colors.danger;
              return (
                <View key={day.day} style={styles.forecastCard}>
                  <Text style={styles.forecastDay}>{day.day}</Text>
                  <Text style={styles.forecastIcon}>{day.icon}</Text>
                  <Text style={styles.forecastHigh}>{day.high}°</Text>
                  <Text style={styles.forecastLow}>{day.low}°</Text>
                  <View style={[styles.forecastScore, { backgroundColor: scoreColor + '22' }]}>
                    <Text style={[styles.forecastScoreText, { color: scoreColor }]}>{day.score}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <Text style={styles.forecastNote}>Score = fishing conditions (1-10)</Text>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  pressureCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressureGauge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pressureValue: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pressureUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  pressureInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressureNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  moonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moonEmoji: {
    fontSize: 48,
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  moonNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  windCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  windMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  windSpeed: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  windUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  windCompass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  windDirection: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  windNote: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  solunarNote: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  windowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  windowCardMajor: {
    borderColor: 'rgba(0,212,170,0.3)',
    backgroundColor: 'rgba(0,212,170,0.06)',
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  windowInfo: {
    flex: 1,
  },
  windowTime: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  windowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  windowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  windowDuration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  windowBadge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  windowBadgeMajor: {
    backgroundColor: 'rgba(0,212,170,0.15)',
  },
  windowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  forecastCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: 76,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  forecastDay: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  forecastIcon: {
    fontSize: 22,
  },
  forecastHigh: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  forecastLow: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  forecastScore: {
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  forecastScoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  forecastNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
