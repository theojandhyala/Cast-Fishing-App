import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { colors, spacing, radius, elevation } from '../../constants/theme';
import { WORLD_SPOTS, WorldSpot } from '../../data/worldSpots';
import { haversineKm, formatDistance } from '../../utils/distance';
import { getSpotPhoto } from '../../constants/spotPhotos';

type SpotWithDist = WorldSpot & { _distKm?: number };

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

function getScoreColor(score: number): string {
  if (score >= 70) return '#00D4AA';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
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
  const router = useRouter();
  const { location: gpsLocation } = useLocation();

  const [selectedSpot, setSelectedSpot] = useState<WorldSpot | null>(null);

  const { weather } = useWeather(
    selectedSpot?.latitude,
    selectedSpot?.longitude
  );

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const bestWindow = getBestWindow();
  const recentCatches = catches.slice(0, 3);
  const tip = getTipOfDay();

  const spots: SpotWithDist[] = useMemo(() => {
    if (!gpsLocation) return WORLD_SPOTS.slice(0, 6);
    return [...WORLD_SPOTS]
      .map(s => ({ ...s, _distKm: haversineKm(gpsLocation.latitude, gpsLocation.longitude, s.latitude, s.longitude) }))
      .sort((a, b) => a._distKm! - b._distKm!)
      .slice(0, 6);
  }, [gpsLocation]);

  const nearMe = !!gpsLocation;

  const w = weather;
  const scoreColor = w ? getScoreColor(w.fishingScore) : '#F59E0B';
  const scoreInfo = w ? getScoreLabel(w.fishingScore) : { label: 'Unknown', color: '#F59E0B' };

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

        {/* ── No Spot Selected Prompt ── */}
        {!selectedSpot && (
          <View style={s.chooseSpotCard}>
            <Text style={s.chooseSpotLabel}>SELECT A SPOT</Text>
            <Text style={s.chooseSpotText}>
              Pick where you're fishing to get real-time conditions, tides and fishing forecast
            </Text>
            <TouchableOpacity
              style={s.chooseSpotBtn}
              onPress={() => router.push('/(tabs)/map' as any)}
              activeOpacity={0.85}
            >
              <Text style={s.chooseSpotBtnText}>Choose Spot →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Conditions Card (only when spot selected) ── */}
        {selectedSpot && (
          <View style={s.condCard}>
            {/* Card header with spot name, change button, score badge */}
            <View style={s.condHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.condLabel}>CONDITIONS AT</Text>
                <Text style={s.condSpotName} numberOfLines={1}>{selectedSpot.name.split(',')[0]}</Text>
              </View>
              <View style={s.condHeaderRight}>
                {w && (
                  <View style={[s.scoreBadge, { borderColor: scoreColor }]}>
                    <Text style={[s.scoreBadgeNum, { color: scoreColor }]}>{w.fishingScore}</Text>
                    <Text style={[s.scoreBadgeLabel, { color: scoreColor }]}>/ 100</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={s.changeBtn}
                  onPress={() => setSelectedSpot(null)}
                >
                  <Text style={s.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {w ? (
              <>
                {/* Score label row */}
                <View style={s.scoreRow}>
                  <View style={s.scoreLeft}>
                    <Text style={[s.scoreNum, { color: scoreInfo.color }]}>{w.fishingScore}</Text>
                    <Text style={[s.scoreLabelText, { color: scoreInfo.color }]}>{scoreInfo.label} conditions</Text>
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

                {/* Description row */}
                <View style={s.condDescRow}>
                  <MaterialCommunityIcons name={w.icon as any} size={16} color={colors.primary} />
                  <Text style={s.condDescText}>{w.description}</Text>
                  <Text style={s.condWindDir}>Wind {w.windDirection}°</Text>
                </View>

                {/* Best window */}
                <View style={s.bestWindow}>
                  <MaterialCommunityIcons name={getBestWindow().icon} size={16} color={colors.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.bestWindowTitle}>Best window today: {getBestWindow().time}</Text>
                    <Text style={s.bestWindowSub}>{getBestWindow().label}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={s.loadingRow}>
                <Text style={s.loadingText}>Loading conditions…</Text>
              </View>
            )}
          </View>
        )}

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
              style={[s.spotCard, selectedSpot?.id === spot.id && s.spotCardSelected]}
              onPress={() => {
                setSelectedSpot(spot);
                router.push({ pathname: '/spot-details', params: { id: spot.id } } as any);
              }}
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
              {/* selected indicator */}
              {selectedSpot?.id === spot.id && (
                <View style={s.spotSelectedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
                </View>
              )}
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

  // ── Choose Spot Prompt
  chooseSpotCard: {
    marginHorizontal: spacing.lg, marginBottom: 24,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    padding: spacing.lg, alignItems: 'center', gap: 12,
    ...elevation.raised,
  },
  chooseSpotLabel: {
    fontSize: 10, fontWeight: '800', color: colors.primary,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  chooseSpotText: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20,
  },
  chooseSpotBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 4,
  },
  chooseSpotBtnText: { fontSize: 14, fontWeight: '700', color: '#031A12' },

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
  condSpotName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  condHeaderRight: { alignItems: 'flex-end', gap: 8 },

  scoreBadge: {
    borderWidth: 2, borderRadius: 30,
    width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreBadgeNum: { fontSize: 18, fontWeight: '900', lineHeight: 22 },
  scoreBadgeLabel: { fontSize: 9, fontWeight: '700' },

  changeBtn: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  changeBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreLeft: { gap: 3 },
  scoreNum: { fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 52 },
  scoreLabelText: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  scoreDesc: { fontSize: 11, color: colors.textTertiary },
  scoreRight: { flex: 1, gap: 10 },
  condItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  condItemVal: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  condItemLabel: { fontSize: 10, color: colors.textTertiary },

  condDescRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,212,170,0.05)', borderRadius: radius.sm,
    padding: 10, borderWidth: 1, borderColor: 'rgba(0,212,170,0.1)',
  },
  condDescText: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  condWindDir: { fontSize: 11, color: colors.textTertiary },

  bestWindow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(245,158,11,0.07)', borderRadius: radius.sm,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', padding: 12,
  },
  bestWindowTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  bestWindowSub: { fontSize: 12, color: colors.textSecondary },

  loadingRow: { alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 13, color: colors.textTertiary },

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
  spotCardSelected: {
    borderColor: colors.primary, borderWidth: 2,
  },
  spotBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-end', margin: 8,
    backgroundColor: 'rgba(3,8,18,0.7)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  spotBadgeText: { fontSize: 9, color: colors.primary, fontWeight: '700' },
  spotSelectedBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(3,8,18,0.7)', borderRadius: radius.full, padding: 2,
  },
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
