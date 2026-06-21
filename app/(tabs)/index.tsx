import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image,
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
import { getSpotPhoto } from '../../constants/spotPhotos';

type SpotWithDist = typeof WORLD_SPOTS[0] & { _distKm?: number };

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return 'Yesterday';
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function getBestWindow() {
  const h = new Date().getHours();
  if (h < 10) return { time: '05:30 – 08:00', label: 'Dawn — fish are most active', icon: 'weather-sunset-up' as const };
  if (h < 15) return { time: '12:00 – 14:00', label: 'Midday activity window', icon: 'weather-sunny' as const };
  if (h < 20) return { time: '18:30 – 20:30', label: 'Evening — prime feeding time', icon: 'weather-sunset-down' as const };
  return { time: '21:00 – 23:00', label: 'Night session opportunity', icon: 'weather-night' as const };
}

function getFishingScore(temp: number, pressure: number, wind: number): number {
  let score = 60;
  if (temp >= 12 && temp <= 22) score += 15;
  else if (temp < 6 || temp > 28) score -= 15;
  if (pressure >= 1010 && pressure <= 1025) score += 15;
  else if (pressure < 990) score -= 10;
  if (wind < 15) score += 10;
  else if (wind > 30) score -= 10;
  return Math.min(100, Math.max(20, score));
}

function getScoreLabel(score: number) {
  if (score >= 80) return { label: 'Excellent', color: '#00D4AA' };
  if (score >= 60) return { label: 'Good', color: '#10B981' };
  if (score >= 40) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Tough', color: '#EF4444' };
}

const FISHING_TIPS = [
  'Fish move into shallow margins at dawn — this is your best chance for specimen fish.',
  'A rising barometer signals improved feeding activity across most freshwater species.',
  'Wind from the west or south-west brings insects onto the water, triggering surface feeding.',
  'After rain, rivers carry extra colour and food — fish the inside of bends where current slows.',
  'Full moon nights improve tidal patterns for sea fishing — plan sessions around it.',
  'In cold water, slow your retrieve to a crawl. Fish are lethargic and won\'t chase fast lures.',
  'Pre-baiting a swim for two days before fishing can dramatically increase your catch rate.',
  'Overcast days reduce light penetration — fish feel safer feeding in open water.',
];

function getTipOfDay(): string {
  const day = new Date().getDate();
  return FISHING_TIPS[day % FISHING_TIPS.length];
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const router = useRouter();
  const { weather } = useWeather(location?.query);
  const { location: gpsLocation } = useLocation();

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const bestWindow = getBestWindow();
  const w = weather ?? { temp: 16, wind: 10, pressure: 1015, description: 'Partly Cloudy', fishingScore: 72 };
  const recentCatches = catches.slice(0, 3);
  const fishingScore = getFishingScore(w.temp, w.pressure, w.wind);
  const scoreInfo = getScoreLabel(fishingScore);
  const tip = getTipOfDay();

  const spots: SpotWithDist[] = useMemo(() => {
    if (!gpsLocation) return WORLD_SPOTS.slice(0, 6);
    return [...WORLD_SPOTS]
      .map(s => ({ ...s, _distKm: haversineKm(gpsLocation.latitude, gpsLocation.longitude, s.latitude, s.longitude) }))
      .sort((a, b) => a._distKm! - b._distKm!)
      .slice(0, 6);
  }, [gpsLocation]);

  const nearMe = !!gpsLocation;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>CAST</Text>
            <View style={s.logoUnderline} />
          </View>
          <TouchableOpacity
            style={s.bellWrap}
            onPress={() => router.push('/notifications' as any)}
            accessibilityRole="button" accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={s.greet}>
          <Text style={s.greetLine}>{getGreeting()}, {firstName}</Text>
          <Text style={s.greetSub}>Here's what the water looks like today.</Text>
        </View>

        {/* ── START FISHING CTA ── */}
        <TouchableOpacity
          style={s.ctaWrap}
          onPress={() => router.push('/(tabs)/session' as any)}
          activeOpacity={0.88}
          accessibilityRole="button" accessibilityLabel="Start fishing session"
        >
          <LinearGradient colors={['#00D4AA', '#00B88A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaGrad}>
            <MaterialCommunityIcons name="fish" size={19} color="#031A12" />
            <Text style={s.ctaText}>START FISHING</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#031A12" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Today's Conditions ── */}
        <View style={s.condCard}>
          <View style={s.condHeader}>
            <View>
              <Text style={s.condLabel}>TODAY'S CONDITIONS</Text>
              <Text style={s.condSub}>Based on current weather data</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/weather-detail' as any)}>
              <Text style={s.condLink}>Full report</Text>
            </TouchableOpacity>
          </View>

          {/* Score row */}
          <View style={s.scoreRow}>
            <View style={s.scoreLeft}>
              <Text style={[s.scoreNum, { color: scoreInfo.color }]}>{fishingScore}</Text>
              <Text style={[s.scoreLabel, { color: scoreInfo.color }]}>{scoreInfo.label} conditions</Text>
              <Text style={s.scoreDesc}>Fishing score out of 100</Text>
            </View>
            <View style={s.scoreRight}>
              {[
                { icon: 'thermometer', label: 'Air Temp', value: `${w.temp}°C` },
                { icon: 'weather-windy', label: 'Wind', value: `${w.wind} km/h` },
                { icon: 'gauge', label: 'Pressure', value: `${w.pressure} hPa` },
              ].map(item => (
                <View key={item.label} style={s.condItem}>
                  <MaterialCommunityIcons name={item.icon as any} size={13} color={colors.textTertiary} />
                  <View>
                    <Text style={s.condItemVal}>{item.value}</Text>
                    <Text style={s.condItemLabel}>{item.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Best window */}
          <View style={s.bestWindow}>
            <MaterialCommunityIcons name={bestWindow.icon} size={16} color={colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={s.bestWindowTitle}>Best window today: {bestWindow.time}</Text>
              <Text style={s.bestWindowSub}>{bestWindow.label}</Text>
            </View>
          </View>
        </View>

        {/* ── Spots Near Me / Recommended ── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>{nearMe ? 'Spots Near You' : 'Recommended Spots'}</Text>
            {nearMe && (
              <View style={s.nearBadge}>
                <MaterialCommunityIcons name="map-marker" size={10} color={colors.primary} />
                <Text style={s.nearBadgeText}>GPS</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>See all →</Text>
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
              <Image
                source={{ uri: getSpotPhoto(spot) }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(3,8,18,0.92)']}
                style={StyleSheet.absoluteFillObject}
              />
              {/* distance badge top right */}
              <View style={s.spotBadge}>
                <MaterialCommunityIcons name="map-marker" size={10} color={colors.primary} />
                {spot._distKm !== undefined && (
                  <Text style={s.spotBadgeText}>{formatDistance(spot._distKm)}</Text>
                )}
              </View>
              {/* species chips */}
              <View style={s.spotInfo}>
                <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                <View style={s.spotMetaRow}>
                  <Text style={s.spotType}>{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</Text>
                  <View style={s.spotRatingRow}>
                    <MaterialCommunityIcons name="star" size={10} color={colors.secondary} />
                    <Text style={s.spotRating}>{spot.rating}</Text>
                  </View>
                </View>
                {/* top species row */}
                <View style={s.spotSpeciesRow}>
                  {spot.species.slice(0, 3).map((sp, i) => (
                    <View key={i} style={s.spotSpeciesChip}>
                      <Text style={s.spotSpeciesText}>{sp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Tip of the Day ── */}
        <View style={s.tipCard}>
          <View style={s.tipIconWrap}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tipLabel}>TIP OF THE DAY</Text>
            <Text style={s.tipText}>{tip}</Text>
          </View>
        </View>

        {/* ── Recent Catches ── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <Text style={s.sectionTitle}>Recent Catches</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {recentCatches.length === 0 ? (
          <View style={s.emptyCatches}>
            <LinearGradient colors={['rgba(0,212,170,0.06)', 'transparent']} style={s.emptyCatchesGrad}>
              <MaterialCommunityIcons name="fish" size={40} color="rgba(0,212,170,0.25)" />
              <Text style={s.emptyTitle}>No catches logged yet</Text>
              <Text style={s.emptySub}>Every great fishing story starts with the first cast. Get out there and log your first catch.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
                <Text style={s.emptyBtnText}>Log a Catch</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={s.catchList}>
            {recentCatches.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[s.catchRow, i > 0 && s.catchDivider]}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#0F2A1A', '#081610']} style={s.catchThumb}>
                  <MaterialCommunityIcons name="fish" size={18} color="rgba(0,212,170,0.6)" />
                </LinearGradient>
                <View style={s.catchInfo}>
                  <Text style={s.catchSpecies}>{c.species}</Text>
                  <Text style={s.catchMeta}>
                    {[c.weight ? `${c.weight} kg` : null, c.location].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={s.catchTime}>{timeAgo(c.date)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Quick Links ── */}
        <View style={s.quickLinksRow}>
          {[
            { icon: 'fish', label: 'Species Guide', route: '/(tabs)/tips' },
            { icon: 'rope', label: 'Knots', route: '/knots' },
            { icon: 'food-drumstick', label: 'Bait Guide', route: '/bait-guide' },
            { icon: 'weather-partly-cloudy', label: 'Weather', route: '/weather-detail' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={s.quickLink}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.85}
            >
              <View style={s.quickLinkIcon}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={s.quickLinkLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 4,
  },
  logo: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: 4 },
  logoUnderline: { width: 28, height: 2, backgroundColor: colors.primary, borderRadius: 1, marginTop: 3 },
  bellWrap: {
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  greet: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  greetLine: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  greetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  ctaWrap: {
    marginHorizontal: spacing.lg, marginBottom: 24,
    borderRadius: radius.lg, overflow: 'hidden',
    shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18,
  },
  ctaText: { fontSize: 14, fontWeight: '800', color: '#031A12', letterSpacing: 2 },

  // ── Conditions card
  condCard: {
    marginHorizontal: spacing.lg, marginBottom: 28,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, gap: 16,
    ...elevation.raised,
  },
  condHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  condLabel: { fontSize: 10, fontWeight: '800', color: colors.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase' },
  condSub: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  condLink: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreLeft: { gap: 3 },
  scoreNum: { fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 52 },
  scoreLabel: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  scoreDesc: { fontSize: 11, color: colors.textTertiary },
  scoreRight: { flex: 1, gap: 10 },
  condItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  condItemVal: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  condItemLabel: { fontSize: 10, color: colors.textTertiary },
  bestWindow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(245,158,11,0.07)', borderRadius: radius.sm,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', padding: 12,
  },
  bestWindowTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  bestWindowSub: { fontSize: 12, color: colors.textSecondary },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: 14,
  },
  sectionBar: { width: 3, height: 18, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.2 },
  nearBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  nearBadgeText: { fontSize: 9, color: colors.primary, fontWeight: '700' },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  spotsScroll: { paddingHorizontal: spacing.lg, gap: 10, paddingBottom: 4, marginBottom: 28 },
  spotCard: {
    width: 140, height: 185, borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    justifyContent: 'space-between',
    ...elevation.raised,
  },
  spotBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-end', margin: 8,
    backgroundColor: 'rgba(3,8,18,0.7)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  spotBadgeText: { fontSize: 9, color: colors.primary, fontWeight: '700' },
  spotInfo: { padding: 10 },
  spotName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 4 },
  spotMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotType: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  spotRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  spotRating: { fontSize: 10, fontWeight: '700', color: colors.secondary },
  spotSpeciesRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 4 },
  spotSpeciesChip: {
    backgroundColor: 'rgba(0,212,170,0.18)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  spotSpeciesText: { fontSize: 9, color: colors.primary, fontWeight: '700' },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    marginHorizontal: spacing.lg, marginBottom: 28,
    backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', padding: spacing.md,
  },
  tipIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  tipLabel: { fontSize: 9, fontWeight: '800', color: colors.secondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
  tipText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  emptyCatches: {
    marginHorizontal: spacing.lg, marginBottom: 28,
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
  },
  emptyCatchesGrad: { alignItems: 'center', padding: 32, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  emptyBtn: {
    marginTop: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 11,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  catchList: {
    marginHorizontal: spacing.lg, marginBottom: 28,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    overflow: 'hidden', ...elevation.raised,
  },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 15,
  },
  catchDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  catchThumb: {
    width: 44, height: 44, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  catchInfo: { flex: 1 },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textTertiary },

  quickLinksRow: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, gap: 10,
  },
  quickLink: {
    flex: 1, alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingVertical: 14,
    ...elevation.raised,
  },
  quickLinkIcon: {
    width: 38, height: 38, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.08)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.15)',
  },
  quickLinkLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
});
