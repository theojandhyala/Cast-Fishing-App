import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
import { ukSpots } from '../../data/ukSpots';
const { width } = Dimensions.get('window');

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const;
type MonthKey = typeof MONTH_KEYS[number];
const FEEDING_WINDOWS: Record<MonthKey, { major: string[]; minor: string[] }> = {
  january:   { major: ['07:30-09:30', '19:45-21:45'], minor: [] },
  february:  { major: ['07:00-09:00', '19:15-21:15'], minor: [] },
  march:     { major: ['06:30-08:30', '18:45-20:45'], minor: [] },
  april:     { major: ['05:45-07:45', '18:00-20:00'], minor: [] },
  may:       { major: ['05:00-07:00', '17:15-19:15'], minor: [] },
  june:      { major: ['04:30-06:30', '16:45-18:45'], minor: [] },
  july:      { major: ['04:45-06:45', '17:00-19:00'], minor: [] },
  august:    { major: ['05:15-07:15', '17:30-19:30'], minor: [] },
  september: { major: ['06:00-08:00', '18:15-20:15'], minor: [] },
  october:   { major: ['06:45-08:45', '19:00-21:00'], minor: [] },
  november:  { major: ['07:15-09:15', '19:30-21:30'], minor: [] },
  december:  { major: ['07:45-09:45', '20:00-22:00'], minor: [] },
};

const SPOT_GRADIENTS: Record<string, [string, string]> = {
  river:     ['#1a3a2a', '#0f2419'],
  lake:      ['#1a2a3a', '#0f1924'],
  sea:       ['#1a2535', '#0d1520'],
  reservoir: ['#1a2a3a', '#0f1924'],
  private:   ['#2a1a2a', '#1a0f1a'],
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function getBestBiteWindow() {
  const month = new Date().getMonth();
  const key = MONTH_KEYS[month];
  const windows = FEEDING_WINDOWS[key];
  const major = windows?.major[1] || '18:30-20:00';
  const [start, end] = major.split('-');
  return { start, end, label: 'Great bite window' };
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const router = useRouter();

  const { weather } = useWeather(location?.query);
  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const biteWindow = getBestBiteWindow();

  const w = weather ?? {
    temp: 18, wind: 12, pressure: 1016, humidity: 76,
    fishingScore: 70, city: '', description: 'Partly Cloudy',
    pressureTrend: 'rising' as const,
  };

  const condWord = w.fishingScore >= 70 ? 'Good' : w.fishingScore >= 50 ? 'Fair' : 'Poor';

  const recommendedSpots = ukSpots.slice(0, 6);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Top bar */}
        <View style={s.topBar}>
          <Text style={s.logo}>CAST</Text>
          <TouchableOpacity onPress={() => router.push('/notifications' as any)} style={s.bellBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={s.greeting}>
          <Text style={s.greetingTitle}>Good {getGreeting()}, {firstName}.</Text>
          <Text style={s.greetingSub}>Ready for a great day on the water?</Text>
        </View>

        {/* Start Fishing button */}
        <TouchableOpacity
          style={s.startBtn}
          onPress={() => router.push('/add-catch' as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00D4AA', '#00B892']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.startBtnGradient}
          >
            <MaterialCommunityIcons name="fishbowl-outline" size={20} color="#0A0E1A" />
            <Text style={s.startBtnText}>START FISHING</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recommended Spots */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Recommended Spots</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/map' as any)}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotsRow}>
            {recommendedSpots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={s.spotCard}
                onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={SPOT_GRADIENTS[spot.type] || ['#1a2a3a', '#0f1924']}
                  style={s.spotPhoto}
                >
                  <MaterialCommunityIcons
                    name={spot.type === 'river' ? 'waves' : spot.type === 'sea' ? 'sail-boat' : 'water'}
                    size={28} color="rgba(255,255,255,0.2)"
                  />
                </LinearGradient>
                <View style={s.spotInfo}>
                  <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                  <View style={s.spotMeta}>
                    <MaterialCommunityIcons name="star" size={11} color={colors.secondary} />
                    <Text style={s.spotRating}>{spot.rating}</Text>
                    <Text style={s.spotType}>{spot.type}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Best Bite Time Today */}
        <View style={s.section}>
          <View style={s.biteCard}>
            <MaterialCommunityIcons name="weather-sunny" size={22} color={colors.secondary} />
            <View style={s.biteMid}>
              <Text style={s.biteLabel}>Best Time Today</Text>
              <Text style={s.biteTime}>{biteWindow.start} – {biteWindow.end}</Text>
              <Text style={s.biteSub}>{biteWindow.label}</Text>
            </View>
          </View>
        </View>

        {/* Weather + Conditions */}
        <View style={[s.section, s.weatherRow]}>
          <TouchableOpacity
            style={s.weatherCard}
            onPress={() => router.push('/conditions' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.weatherLabel}>Weather</Text>
            <View style={s.weatherMain}>
              <Text style={s.weatherTemp}>{w.temp}°</Text>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={colors.secondary} />
            </View>
            <Text style={s.weatherDesc}>{w.description}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.weatherCard}
            onPress={() => router.push('/conditions' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.weatherLabel}>Conditions</Text>
            <View style={s.weatherMain}>
              <MaterialCommunityIcons name="waves" size={22} color={colors.primary} />
            </View>
            <Text style={s.condGood}>{condWord}</Text>
            <Text style={s.weatherDesc}>{w.pressure} hPa</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Catches */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Recent Catches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {catches.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/add-catch')} style={s.emptyRow} activeOpacity={0.8}>
              <View style={s.catchThumb}>
                <MaterialCommunityIcons name="fish" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.catchSpecies}>No catches yet</Text>
                <Text style={s.catchMeta}>Log your first catch</Text>
              </View>
            </TouchableOpacity>
          ) : (
            catches.slice(0, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={s.catchRow}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#1a2a1a', '#0f1a0f']} style={s.catchThumb}>
                  <MaterialCommunityIcons name="fish" size={22} color="rgba(0,212,170,0.5)" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={s.catchSpecies}>{c.species}</Text>
                  <Text style={s.catchMeta}>
                    {c.weight ? `${c.weight} kg` : ''}
                    {c.weight && c.location ? ' • ' : ''}
                    {c.location || ''}
                  </Text>
                </View>
                <Text style={s.catchTime}>{timeAgo(c.date)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  logo: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, letterSpacing: 2 },
  bellBtn: { padding: 6 },

  greeting: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  greetingTitle: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  greetingSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  startBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.full,
    overflow: 'hidden',
    ...elevation.glow,
  },
  startBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 17,
    borderRadius: radius.full,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: '#0A0E1A', letterSpacing: 1.5 },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  spotsRow: { gap: 12, paddingRight: spacing.lg },
  spotCard: {
    width: 140, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    ...elevation.raised,
  },
  spotPhoto: {
    height: 90, alignItems: 'center', justifyContent: 'center',
  },
  spotInfo: { padding: 10 },
  spotName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  spotRating: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  spotType: { fontSize: 11, color: colors.textSecondary, textTransform: 'capitalize', marginLeft: 4 },

  biteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    ...elevation.raised,
  },
  biteMid: { flex: 1 },
  biteLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  biteTime: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  biteSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  weatherRow: { flexDirection: 'row', gap: 12 },
  weatherCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    ...elevation.raised,
  },
  weatherLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  weatherMain: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  weatherTemp: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  weatherDesc: { fontSize: 12, color: colors.textSecondary },
  condGood: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 2 },

  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  emptyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12,
  },
  catchThumb: {
    width: 56, height: 56, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textSecondary },
});
