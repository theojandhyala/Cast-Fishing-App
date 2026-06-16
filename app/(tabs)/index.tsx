import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useLocationStore } from '../../store/locationStore';
import { useWeather } from '../../hooks/useWeather';
import { colors, spacing, radius, elevation } from '../../constants/theme';
import { WORLD_SPOTS } from '../../data/worldSpots';

const SPOT_GRADIENTS: Record<string, readonly [string, string]> = {
  river:     ['#1a3a2a', '#0d1f16'],
  lake:      ['#1a2a3a', '#0d1620'],
  sea:       ['#132035', '#0a1525'],
  reservoir: ['#1a2535', '#0f1928'],
  ocean:     ['#0f1e30', '#0a1320'],
  estuary:   ['#1a2a20', '#0f1a12'],
};

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

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const w = weather ?? { temp: 18, wind: 12, pressure: 1016, description: 'Partly Cloudy', fishingScore: 72 };
  const recentCatches = catches.slice(0, 3);
  const recommendedSpots = WORLD_SPOTS.slice(0, 4);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>CAST</Text>
          <TouchableOpacity
            style={s.bellBtn}
            onPress={() => router.push('/notifications' as any)}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={s.greetSection}>
          <Text style={s.greetName}>{getGreeting()}, {firstName}.</Text>
          <Text style={s.greetSub}>Ready for a great day on the water?</Text>
        </View>

        {/* START FISHING button */}
        <TouchableOpacity
          style={s.startBtn}
          onPress={() => router.push('/(tabs)/session' as any)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start fishing session"
        >
          <LinearGradient
            colors={['#00D4AA', '#00B891']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.startBtnGrad}
          >
            <MaterialCommunityIcons name="fish" size={20} color="#051410" />
            <Text style={s.startBtnText}>START FISHING</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recommended Spots */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recommended Spots</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/map' as any)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotsScroll}>
          {recommendedSpots.map((spot) => {
            const grad = (SPOT_GRADIENTS[spot.type] || ['#1a2a3a', '#0f1924']) as [string, string];
            const icon = SPOT_ICONS[spot.type] || 'water';
            return (
              <TouchableOpacity
                key={spot.id}
                style={s.spotCard}
                onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={grad} style={s.spotPhoto}>
                  <MaterialCommunityIcons name={icon as any} size={24} color="rgba(255,255,255,0.18)" />
                </LinearGradient>
                <View style={s.spotInfo}>
                  <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                  <View style={s.spotMeta}>
                    <Text style={s.spotType}>{spot.type}</Text>
                    <View style={s.spotRating}>
                      <MaterialCommunityIcons name="star" size={9} color={colors.secondary} />
                      <Text style={s.spotRatingText}>{spot.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Best Time Today */}
        <View style={s.bestTimeCard}>
          <MaterialCommunityIcons name="weather-sunny" size={32} color={colors.secondary} />
          <View style={s.bestTimeInfo}>
            <Text style={s.bestTimeLabel}>Best Time Today</Text>
            <Text style={s.bestTimeValue}>18:30 – 20:00</Text>
            <Text style={s.bestTimeSub}>Great bite window</Text>
          </View>
        </View>

        {/* Weather + Conditions 2-col */}
        <View style={s.weatherRow}>
          <View style={[s.weatherCard, s.weatherLeft]}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={26} color="#93C5FD" />
            <Text style={s.weatherTemp}>{w.temp}°C</Text>
            <Text style={s.weatherDesc}>{w.description}</Text>
          </View>
          <View style={[s.weatherCard, s.weatherRight]}>
            <MaterialCommunityIcons name="waves" size={26} color={colors.primary} />
            <Text style={s.weatherTemp}>Good</Text>
            <Text style={s.weatherDesc}>{w.pressure} hPa</Text>
          </View>
        </View>

        {/* Recent Catches */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Catches</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={s.catchesList}>
          {recentCatches.length === 0 ? (
            <TouchableOpacity
              style={s.emptyRow}
              onPress={() => router.push('/add-catch' as any)}
              activeOpacity={0.85}
            >
              <View style={s.catchThumb}>
                <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
              </View>
              <View style={s.catchInfo}>
                <Text style={s.catchSpecies}>No catches yet</Text>
                <Text style={s.catchMeta}>Log your first catch!</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : recentCatches.map((c, i) => (
            <TouchableOpacity
              key={c.id}
              style={[s.catchRow, i > 0 && s.catchBorder]}
              onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#1a3a2a', '#0d1f16']} style={s.catchThumb}>
                <MaterialCommunityIcons name="fish" size={18} color="rgba(0,212,170,0.55)" />
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 4,
  },
  logo: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: 3 },
  bellBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  greetSection: {
    paddingHorizontal: spacing.lg, paddingTop: 6, paddingBottom: spacing.md,
  },
  greetName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  greetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },

  startBtn: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: radius.lg, overflow: 'hidden',
    ...elevation.glow,
  },
  startBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: '#051410', letterSpacing: 1.5 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  spotsScroll: { paddingHorizontal: spacing.lg, gap: 10, paddingBottom: 4, marginBottom: spacing.lg },
  spotCard: {
    width: 110,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  spotPhoto: {
    height: 88, alignItems: 'center', justifyContent: 'center',
  },
  spotInfo: { padding: 8 },
  spotName: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginBottom: 5 },
  spotMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotType: { fontSize: 10, color: colors.textSecondary, textTransform: 'capitalize' },
  spotRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  spotRatingText: { fontSize: 10, fontWeight: '700', color: colors.secondary },

  bestTimeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: spacing.lg, marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },
  bestTimeInfo: {},
  bestTimeLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 3 },
  bestTimeValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  bestTimeSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  weatherRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg, marginBottom: spacing.lg, gap: 10,
  },
  weatherCard: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'flex-start', gap: 4,
    ...elevation.raised,
  },
  weatherLeft: {},
  weatherRight: {},
  weatherTemp: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  weatherDesc: { fontSize: 12, color: colors.textSecondary },

  catchesList: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 13,
  },
  emptyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 13,
  },
  catchBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  catchThumb: {
    width: 44, height: 44, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,212,170,0.08)',
  },
  catchInfo: { flex: 1 },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textTertiary },
});
