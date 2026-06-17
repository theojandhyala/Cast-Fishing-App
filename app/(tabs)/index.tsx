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
import { getSpotImage } from '../../constants/spotImages';

type SpotWithDist = typeof WORLD_SPOTS[0] & { _distKm?: number };

const SPOT_ICONS: Record<string, string> = {
  river: 'waves', lake: 'water', sea: 'anchor',
  reservoir: 'water-pump', ocean: 'sail-boat', estuary: 'water-outline',
};

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

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const router = useRouter();
  const { weather } = useWeather(location?.query);
  const { location: gpsLocation } = useLocation();

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const w = weather ?? { temp: 18, wind: 12, pressure: 1016, description: 'Partly Cloudy', fishingScore: 72 };
  const recentCatches = catches.slice(0, 3);

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

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
          <Text style={s.greetLine}>{getGreeting()},</Text>
          <Text style={s.greetName}>{firstName}.</Text>
          <Text style={s.greetSub}>Ready for a great day on the water?</Text>
        </View>

        {/* ── START FISHING ── */}
        <TouchableOpacity
          style={s.ctaWrap}
          onPress={() => router.push('/(tabs)/session' as any)}
          activeOpacity={0.88}
          accessibilityRole="button" accessibilityLabel="Start fishing session"
        >
          <LinearGradient colors={['#00D4AA', '#00B88A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaGrad}>
            <MaterialCommunityIcons name="fish" size={19} color="#031A12" />
            <Text style={s.ctaText}>START FISHING</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Spots Near Me / Recommended ── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>{nearMe ? 'Near Me' : 'Recommended Spots'}</Text>
            {nearMe && (
              <View style={s.nearBadge}>
                <MaterialCommunityIcons name="map-marker" size={10} color={colors.primary} />
                <Text style={s.nearBadgeText}>Using your location</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>See all</Text>
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
              <View style={s.spotPhoto}>
                <LinearGradient colors={['#0F1E2E', '#060E18']} style={StyleSheet.absoluteFillObject} />
                <Image
                  source={{ uri: getSpotImage(spot) }}
                  style={[StyleSheet.absoluteFillObject, { opacity: 0.8 }]}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={s.spotPhotoOverlay}
                >
                  <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                  <View style={s.spotMetaRow}>
                    <Text style={s.spotType}>{spot.type}</Text>
                    <View style={s.spotRatingRow}>
                      <MaterialCommunityIcons name="star" size={9} color={colors.secondary} />
                      <Text style={s.spotRating}>{spot.rating}</Text>
                    </View>
                  </View>
                  {spot._distKm !== undefined && (
                    <Text style={s.spotDist}>{formatDistance(spot._distKm)}</Text>
                  )}
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Best Time Today ── */}
        <View style={s.bestCard}>
          <View style={s.bestAccent} />
          <View style={s.bestIconWrap}>
            <MaterialCommunityIcons name="weather-sunny" size={30} color={colors.secondary} />
          </View>
          <View style={s.bestInfo}>
            <Text style={s.bestLabel}>BEST TIME TODAY</Text>
            <Text style={s.bestTime}>18:30 – 20:00</Text>
            <Text style={s.bestSub}>Great bite window</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
        </View>

        {/* ── Weather + Conditions ── */}
        <View style={s.weatherRow}>
          <LinearGradient colors={['#0E1827', '#090F1A']} style={[s.wCard, s.wCardLeft]}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color="#7DD3FC" />
            <Text style={s.wValue}>{w.temp}°C</Text>
            <Text style={s.wLabel}>{w.description}</Text>
          </LinearGradient>
          <LinearGradient colors={['#0C1E18', '#08120F']} style={[s.wCard, s.wCardRight]}>
            <MaterialCommunityIcons name="waves" size={28} color={colors.primary} />
            <Text style={s.wValue}>Good</Text>
            <Text style={s.wLabel}>{w.pressure} hPa</Text>
          </LinearGradient>
        </View>

        {/* ── Recent Catches ── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <Text style={s.sectionTitle}>Recent Catches</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={s.catchList}>
          {recentCatches.length === 0 ? (
            <TouchableOpacity style={s.catchRow} onPress={() => router.push('/add-catch' as any)} activeOpacity={0.85}>
              <View style={[s.catchThumb, { backgroundColor: 'rgba(0,212,170,0.08)' }]}>
                <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
              </View>
              <View style={s.catchInfo}>
                <Text style={s.catchSpecies}>No catches yet</Text>
                <Text style={s.catchMeta}>Log your first catch</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : recentCatches.map((c, i) => (
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
  greetLine: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', letterSpacing: 0.3 },
  greetName: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.8, marginTop: 1 },
  greetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  ctaWrap: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    borderRadius: radius.lg, overflow: 'hidden',
    shadowColor: colors.primary, shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18,
  },
  ctaText: { fontSize: 14, fontWeight: '800', color: '#031A12', letterSpacing: 2 },

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

  spotsScroll: { paddingHorizontal: spacing.lg, gap: 10, paddingBottom: 4, marginBottom: spacing.xl },
  spotCard: {
    width: 130, borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    ...elevation.raised,
  },
  spotPhoto: { height: 150, justifyContent: 'flex-end' },
  spotPhotoOverlay: { padding: 10 },
  spotName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 4 },
  spotMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotType: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  spotRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  spotRating: { fontSize: 10, fontWeight: '700', color: colors.secondary },
  spotDist: { fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 2 },

  bestCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.15)',
    overflow: 'hidden',
    ...elevation.raised,
  },
  bestAccent: { width: 3, alignSelf: 'stretch', backgroundColor: colors.primary },
  bestIconWrap: { paddingVertical: 16, paddingLeft: 2 },
  bestInfo: { flex: 1, paddingVertical: 16 },
  bestLabel: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  bestTime: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  bestSub: { fontSize: 12, color: colors.secondary, marginTop: 2 },

  weatherRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: spacing.xl,
  },
  wCard: {
    flex: 1, borderRadius: radius.md,
    borderWidth: 1, padding: spacing.md, gap: 6,
    ...elevation.raised,
  },
  wCardLeft: { borderColor: 'rgba(125,211,252,0.15)' },
  wCardRight: { borderColor: 'rgba(0,212,170,0.15)' },
  wValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  wLabel: { fontSize: 12, color: colors.textSecondary },

  catchList: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    overflow: 'hidden',
    ...elevation.raised,
  },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  catchDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  catchThumb: {
    width: 44, height: 44, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  catchInfo: { flex: 1 },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textTertiary },
});
