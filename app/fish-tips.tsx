import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getMoonPhase } from '../data/fishingTimes';
import { colors, radius, spacing, elevation } from '../constants/theme';

const PERIODS = ['Today', 'Tomorrow', 'This Week'];

const MOON_PHASE_ICONS: Record<string, string> = {
  'New Moon': 'moon-new',
  'Waxing Crescent': 'moon-waxing-crescent',
  'First Quarter': 'moon-first-quarter',
  'Waxing Gibbous': 'moon-waxing-gibbous',
  'Full Moon': 'moon-full',
  'Waning Gibbous': 'moon-waning-gibbous',
  'Last Quarter': 'moon-last-quarter',
  'Waning Crescent': 'moon-waning-crescent',
};

// Simple tide curve approximation (normalized heights spanning 24h)
const TIDE_POINTS = [
  0.5, 0.62, 0.74, 0.85, 0.93, 0.98, 0.97, 0.9, 0.78, 0.64, 0.5, 0.36, 0.23,
  0.13, 0.06, 0.03, 0.05, 0.12, 0.24, 0.38, 0.52, 0.66, 0.78, 0.88, 0.94,
];

const HOUR_MARKS = ['00:00', '12:00', '18:00', '24:00'];

function StarRating({ count, max = 4 }: { count: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: max }).map((_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < count ? 'star' : 'star-outline'}
          size={11}
          color={i < count ? colors.secondary : colors.textSecondary}
        />
      ))}
    </View>
  );
}

export default function FishTipsScreen() {
  const [activePeriod, setActivePeriod] = useState(0);
  const router = useRouter();
  const now = new Date();
  const moon = useMemo(() => getMoonPhase(now), []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Best Fishing Times</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Period segmented control */}
        <View style={styles.segmentRow}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity
              key={p}
              style={[styles.segment, activePeriod === i && styles.segmentActive]}
              onPress={() => setActivePeriod(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activePeriod === i && styles.segmentTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Best Bite Windows */}
        <Text style={styles.sectionLabel}>Best Bite Windows</Text>
        <View style={[styles.biteCard, styles.biteCardBest]}>
          <Text style={styles.biteCardBestLabel}>Best</Text>
          <Text style={styles.biteCardBestTime}>18:30 - 20:00</Text>
          <View style={styles.biteCardRight}>
            <Text style={styles.biteCardBestQuality}>Great</Text>
            <StarRating count={4} />
          </View>
        </View>
        <View style={styles.biteCard}>
          <Text style={styles.biteCardLabel}>Good</Text>
          <Text style={styles.biteCardTime}>05:30 - 07:30</Text>
          <View style={styles.biteCardRight}>
            <Text style={styles.biteCardQuality}>Good</Text>
            <StarRating count={2} />
          </View>
        </View>

        {/* Sun / Moon row */}
        <View style={styles.sunMoonRow}>
          <View style={styles.sunMoonItem}>
            <MaterialCommunityIcons name="weather-sunset-up" size={22} color={colors.secondary} />
            <Text style={styles.sunMoonTime}>05:18</Text>
          </View>
          <View style={styles.sunMoonItem}>
            <MaterialCommunityIcons name="weather-sunset-down" size={22} color={colors.secondary} />
            <Text style={styles.sunMoonTime}>20:42</Text>
          </View>
          <View style={styles.moonPhaseBox}>
            <Text style={styles.moonPhaseLabel}>Moon Phase</Text>
            <Text style={styles.moonPhaseName}>{moon.name}</Text>
          </View>
          <View style={styles.moonGraphic}>
            <MaterialCommunityIcons
              name={(MOON_PHASE_ICONS[moon.name] || 'moon-full') as any}
              size={34}
              color={colors.textPrimary}
            />
          </View>
        </View>

        {/* Tides */}
        <Text style={styles.sectionLabel}>Tides</Text>
        <View style={[styles.tideCard, elevation.raised]}>
          <View style={styles.tideLabelsRow}>
            <Text style={styles.tideLabel}>High</Text>
            <Text style={styles.tideLabel}>Low</Text>
          </View>
          <View style={styles.tideChart}>
            {TIDE_POINTS.map((v, i) => (
              <View key={i} style={styles.tideBarTrack}>
                <View style={[styles.tideBar, { height: `${v * 100}%` }]} />
              </View>
            ))}
          </View>
          <View style={styles.tideHoursRow}>
            {HOUR_MARKS.map((h) => (
              <Text key={h} style={styles.tideHourText}>{h}</Text>
            ))}
          </View>
        </View>

        {/* Weather Factors */}
        <Text style={styles.sectionLabel}>Weather Factors</Text>
        <View style={styles.weatherRow}>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons name="thermometer" size={20} color={colors.primary} />
            <Text style={styles.weatherValue}>18°C</Text>
            <Text style={styles.weatherLabel}>Temp</Text>
          </View>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons name="weather-windy" size={20} color={colors.primary} />
            <Text style={styles.weatherValue}>12 km/h</Text>
            <Text style={styles.weatherLabel}>Wind</Text>
          </View>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons name="water-percent" size={20} color={colors.primary} />
            <Text style={styles.weatherValue}>76%</Text>
            <Text style={styles.weatherLabel}>Humidity</Text>
          </View>
          <View style={styles.weatherItem}>
            <MaterialCommunityIcons name="gauge" size={20} color={colors.primary} />
            <Text style={styles.weatherValue}>1016 hPa</Text>
            <Text style={styles.weatherLabel}>Pressure</Text>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.background,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  biteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  biteCardBest: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  biteCardBestLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    width: 50,
  },
  biteCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    width: 50,
  },
  biteCardBestTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    flex: 1,
  },
  biteCardTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  biteCardRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  biteCardBestQuality: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  biteCardQuality: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  sunMoonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sunMoonItem: {
    alignItems: 'center',
    gap: 4,
  },
  sunMoonTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moonPhaseBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  moonPhaseLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moonPhaseName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  moonGraphic: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tideLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tideLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tideChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 70,
    gap: 2,
  },
  tideBarTrack: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  tideBar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.85,
  },
  tideHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  tideHourText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weatherItem: {
    alignItems: 'center',
    gap: 4,
  },
  weatherValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weatherLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
