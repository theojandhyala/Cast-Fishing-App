import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useLocationStore } from '../../store/locationStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { colors, spacing, radius, elevation } from '../../constants/theme';
import { WORLD_SPOTS } from '../../data/worldSpots';
import { haversineKm, formatDistance } from '../../utils/distance';
function getSpotIcon(type: string): string {
  switch (type) {
    case 'river': return 'waves';
    case 'lake': return 'water';
    case 'ocean': return 'anchor';
    case 'reef': return 'fish';
    case 'estuary': return 'water-outline';
    default: return 'map-marker-outline';
  }
}

const SPOT_GRADS: Record<string, [string, string]> = {
  river: ['#0C2340', '#051218'],
  lake:  ['#0A1F30', '#051015'],
  ocean: ['#081830', '#030C18'],
  reef:  ['#0F1A20', '#050D10'],
  estuary: ['#102015', '#05100A'],
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SpotWithDist = typeof WORLD_SPOTS[0] & { _distKm?: number };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Solunar-style fishing activity by hour (0-23), 0-100
const HOURLY_ACTIVITY = [
  45, 55, 40, 30, 25, 60, 90, 85, 70, 55, 45, 65,
  60, 50, 45, 55, 70, 80, 95, 85, 65, 50, 40, 35,
];

function getBarColor(val: number) {
  if (val >= 80) return colors.primary;
  if (val >= 60) return '#00B88A';
  if (val >= 40) return colors.secondary;
  return colors.textTertiary;
}

function getBarLabel(val: number) {
  if (val >= 80) return 'Best';
  if (val >= 60) return 'Good';
  if (val >= 40) return 'Fair';
  return 'Poor';
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const router = useRouter();
  const { weather } = useWeather(location?.query);
  const { location: gpsLocation } = useLocation();
  const [conditionsDismissed, setConditionsDismissed] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const w = weather ?? { temp: 18, wind: 12, pressure: 1015, description: 'Partly Cloudy', fishingScore: 85 };
  const recentCatches = catches.slice(0, 3);

  const spots: SpotWithDist[] = useMemo(() => {
    if (!gpsLocation) return WORLD_SPOTS.slice(0, 5);
    return [...WORLD_SPOTS]
      .map(s => ({ ...s, _distKm: haversineKm(gpsLocation.latitude, gpsLocation.longitude, s.latitude, s.longitude) }))
      .sort((a, b) => a._distKm! - b._distKm!)
      .slice(0, 5);
  }, [gpsLocation]);

  const nearMe = !!gpsLocation;

  // Chart data - 24 bars (one per hour)
  const chartData = HOURLY_ACTIVITY.map((activity, h) => ({
    hour: h,
    label: h === 0 ? '12AM' : h === 6 ? '6AM' : h === 12 ? '12PM' : h === 18 ? '6PM' : '',
    activity,
  }));
  const maxActivity = Math.max(...chartData.map(d => d.activity));

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.menuBtn}>
            <View style={s.menuLine} />
            <View style={[s.menuLine, { width: 16 }]} />
            <View style={s.menuLine} />
          </TouchableOpacity>

          <View style={s.greetBlock}>
            <Text style={s.greetLine}>{getGreeting()}, {firstName} 🎣</Text>
            <Text style={s.greetSub}>Let's make it a great day to catch fish!</Text>
          </View>

          <TouchableOpacity
            style={s.bellBtn}
            onPress={() => router.push('/notifications' as any)}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Current Conditions Card ── */}
        {!conditionsDismissed && (
          <View style={s.condCard}>
            <View style={s.condCardHeader}>
              <Text style={s.condCardTitle}>CURRENT CONDITIONS</Text>
              <TouchableOpacity onPress={() => setConditionsDismissed(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Weather hero row */}
            <View style={s.condHeroRow}>
              <View style={s.condWeatherIcon}>
                <MaterialCommunityIcons name="weather-partly-cloudy" size={36} color={colors.textSecondary} />
              </View>
              <View style={s.condTempBlock}>
                <Text style={s.condTemp}>{w.temp}°C</Text>
                <Text style={s.condDesc}>{w.description}</Text>
              </View>
            </View>

            {/* 3-column stats */}
            <View style={s.condStatsRow}>
              <View style={s.condStat}>
                <MaterialCommunityIcons name="weather-windy" size={16} color={colors.textSecondary} />
                <Text style={s.condStatVal}>{w.wind} km/h</Text>
                <Text style={s.condStatSub}>NW</Text>
                <Text style={s.condStatLabel}>Wind</Text>
              </View>
              <View style={s.condStatDivider} />
              <View style={s.condStat}>
                <MaterialCommunityIcons name="waves" size={16} color={colors.textSecondary} />
                <Text style={s.condStatVal}>1.2 m</Text>
                <Text style={s.condStatSub}>Rising</Text>
                <Text style={s.condStatLabel}>Tide</Text>
              </View>
              <View style={s.condStatDivider} />
              <View style={s.condStat}>
                <MaterialCommunityIcons name="moon-waxing-crescent" size={16} color={colors.textSecondary} />
                <Text style={s.condStatVal}>85%</Text>
                <Text style={s.condStatSub}>High Activity</Text>
                <Text style={s.condStatLabel}>Solunar</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Best Fishing Times ── */}
        <View style={s.timesCard}>
          <View style={s.sectionHeadRow}>
            <Text style={s.sectionTitle}>BEST FISHING TIMES</Text>
            <TouchableOpacity onPress={() => router.push('/conditions' as any)}>
              <Text style={s.seeAllLink}>Today</Text>
            </TouchableOpacity>
          </View>

          {/* Bar chart */}
          <View style={s.chart}>
            {chartData.map((bar, i) => {
              const barH = Math.max(4, (bar.activity / maxActivity) * 72);
              const barColor = getBarColor(bar.activity);
              return (
                <View key={i} style={s.chartCol}>
                  <View style={s.chartBarWrap}>
                    <View style={[s.chartBar, { height: barH, backgroundColor: barColor }]} />
                  </View>
                  <Text style={s.chartLabel}>{bar.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={s.chartLegend}>
            {[
              { color: colors.primary, label: 'Best' },
              { color: '#00B88A', label: 'Good' },
              { color: colors.secondary, label: 'Fair' },
            ].map(item => (
              <View key={item.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: item.color }]} />
                <Text style={s.legendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nearby Spots ── */}
        <View style={s.sectionHeadRow2}>
          <Text style={s.sectionTitle}>NEARBY SPOTS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map' as any)}>
            <Text style={s.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotsScroll}>
          {spots.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={s.spotCard}
              onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={SPOT_GRADS[spot.type] ?? ['#0C1A28', '#050C14']}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Decorative watermark icon */}
              <View style={s.spotIconBg}>
                <MaterialCommunityIcons
                  name={getSpotIcon(spot.type) as any}
                  size={72}
                  color="rgba(0,212,170,0.12)"
                />
              </View>
              {/* Distance badge */}
              <View style={s.spotBadge}>
                <MaterialCommunityIcons name="map-marker" size={10} color={colors.primary} />
                {spot._distKm !== undefined && (
                  <Text style={s.spotBadgeText}>{formatDistance(spot._distKm)}</Text>
                )}
              </View>
              {/* Spot type icon */}
              <View style={s.spotTypeIcon}>
                <MaterialCommunityIcons
                  name={getSpotIcon(spot.type) as any}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={s.spotInfo}>
                <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                <View style={s.spotMetaRow}>
                  <Text style={s.spotType}>{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</Text>
                  <View style={s.spotRatingRow}>
                    <MaterialCommunityIcons name="star" size={10} color={colors.secondary} />
                    <Text style={s.spotRating}>{spot.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Recent Catches ── */}
        {recentCatches.length > 0 && (
          <>
            <View style={s.sectionHeadRow2}>
              <Text style={s.sectionTitle}>RECENT CATCHES</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)}>
                <Text style={s.seeAllLink}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={s.catchesCard}>
              {recentCatches.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.catchRow, i > 0 && s.catchDivider]}
                  onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#0F2A1A', '#081610']} style={s.catchThumb}>
                    <MaterialCommunityIcons name="fish" size={16} color="rgba(0,212,170,0.6)" />
                  </LinearGradient>
                  <View style={s.catchInfo}>
                    <Text style={s.catchSpecies}>{c.species}</Text>
                    <Text style={s.catchMeta}>
                      {[c.weight ? `${c.weight} kg` : null, c.location].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 12,
  },
  menuBtn: { width: 36, height: 36, justifyContent: 'center', gap: 5 },
  menuLine: { width: 22, height: 2, backgroundColor: colors.textSecondary, borderRadius: 1 },
  greetBlock: { flex: 1 },
  greetLine: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  greetSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  bellBtn: {
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Conditions card
  condCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 14,
    ...elevation.raised,
  },
  condCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  condCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  condHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  condWeatherIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  condTempBlock: { gap: 2 },
  condTemp: { fontSize: 32, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1 },
  condDesc: { fontSize: 13, color: colors.textSecondary },
  condStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  condStat: { flex: 1, alignItems: 'center', gap: 3 },
  condStatDivider: { width: 1, height: 40, backgroundColor: colors.border },
  condStatVal: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  condStatSub: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  condStatLabel: { fontSize: 9, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Fishing times chart card
  timesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  seeAllLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 80,
  },
  chartCol: { flex: 1, alignItems: 'center', gap: 3 },
  chartBarWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  chartBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 3,
  },
  chartLabel: {
    fontSize: 7,
    color: colors.textTertiary,
    textAlign: 'center',
    fontWeight: '600',
  },

  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },

  // Section headers (outside cards)
  sectionHeadRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 12,
    marginTop: 4,
  },

  // Spots scroll
  spotsScroll: { paddingHorizontal: spacing.lg, gap: 10, paddingBottom: 4, marginBottom: spacing.md },
  spotCard: {
    width: 155,
    height: 190,
    borderRadius: radius.md,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...elevation.raised,
  },
  spotIconBg: {
    position: 'absolute',
    bottom: 32,
    right: -8,
  },
  spotTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  spotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  spotBadgeText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  spotInfo: { gap: 4 },
  spotName: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  spotMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotType: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  spotRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  spotRating: { fontSize: 11, fontWeight: '700', color: colors.secondary },

  // Recent catches
  catchesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  catchDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  catchThumb: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchInfo: { flex: 1 },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
});
