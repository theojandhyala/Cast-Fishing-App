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
const BITE_WINDOWS: Record<MonthKey, string> = {
  january: '19:45–21:45', february: '19:15–21:15', march: '18:45–20:45',
  april: '18:00–20:00', may: '17:15–19:15', june: '16:45–18:45',
  july: '17:00–19:00', august: '17:30–19:30', september: '18:15–20:15',
  october: '19:00–21:00', november: '19:30–21:30', december: '20:00–22:00',
};

const SPOT_GRADIENTS: Record<string, readonly [string, string]> = {
  river:     ['#0F2A1A', '#061410'],
  lake:      ['#0F1E2E', '#060E18'],
  sea:       ['#0A1828', '#050C14'],
  reservoir: ['#0F1C28', '#061018'],
  private:   ['#140F28', '#0A0614'],
};

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 2880) return 'Yesterday';
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const router = useRouter();
  const { weather } = useWeather(location?.query);

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const w = weather ?? { temp: 18, wind: 12, pressure: 1016, description: 'Partly Cloudy', fishingScore: 72 };
  const score = w.fishingScore ?? 72;
  const scoreLabel = score >= 70 ? 'Great' : score >= 50 ? 'Fair' : 'Poor';
  const scoreColor = score >= 70 ? colors.primary : score >= 50 ? colors.secondary : colors.danger;
  const biteWindow = BITE_WINDOWS[MONTH_KEYS[new Date().getMonth()]];
  const spots = ukSpots.slice(0, 5);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Nav bar ── */}
        <View style={s.nav}>
          <Text style={s.logo}>CAST</Text>
          <TouchableOpacity
            style={s.navBtn}
            onPress={() => router.push('/notifications' as any)}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={s.greeting}>
          <Text style={s.greetHi}>Good {getGreeting()},</Text>
          <Text style={s.greetName}>{firstName}.</Text>
        </View>

        {/* ── HERO: Conditions + CTA ── */}
        <TouchableOpacity
          style={s.heroCard}
          onPress={() => router.push('/conditions' as any)}
          activeOpacity={0.92}
          accessibilityLabel="View today's fishing conditions"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#0D2A1E', '#081610']}
            style={s.heroGrad}
          >
            {/* Top row: score pill + conditions */}
            <View style={s.heroTop}>
              <View style={[s.scorePill, { backgroundColor: scoreColor + '22', borderColor: scoreColor + '44' }]}>
                <View style={[s.scoreDot, { backgroundColor: scoreColor }]} />
                <Text style={[s.scoreText, { color: scoreColor }]}>{scoreLabel} Conditions</Text>
              </View>
              <Text style={s.heroLocation}>{location?.name || 'Set location'}</Text>
            </View>

            {/* Main weather display */}
            <View style={s.heroWeather}>
              <View>
                <Text style={s.heroTemp}>{w.temp}°</Text>
                <Text style={s.heroDesc}>{w.description}</Text>
              </View>
              <View style={s.heroStats}>
                <View style={s.heroStatItem}>
                  <MaterialCommunityIcons name="weather-windy" size={14} color={colors.textSecondary} />
                  <Text style={s.heroStatVal}>{w.wind} km/h</Text>
                </View>
                <View style={s.heroStatItem}>
                  <MaterialCommunityIcons name="gauge" size={14} color={colors.textSecondary} />
                  <Text style={s.heroStatVal}>{w.pressure} hPa</Text>
                </View>
                <View style={s.heroStatItem}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.secondary} />
                  <Text style={[s.heroStatVal, { color: colors.secondary }]}>{biteWindow}</Text>
                </View>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={s.heroCta}
              onPress={() => router.push('/add-catch' as any)}
              activeOpacity={0.85}
              accessibilityLabel="Start fishing"
              accessibilityRole="button"
            >
              <LinearGradient colors={['#00D4AA', '#00A882']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.heroCtaGrad}>
                <MaterialCommunityIcons name="fishbowl-outline" size={18} color="#051410" />
                <Text style={s.heroCtaText}>START FISHING</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Spots ── */}
        <View style={s.block}>
          <View style={s.blockHead}>
            <Text style={s.blockTitle}>Recommended Spots</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/map' as any)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="See all spots"
              accessibilityRole="button"
            >
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotsRow}>
            {spots.map((spot) => {
              const grad = (SPOT_GRADIENTS[spot.type] || ['#0F1E2E', '#060E18']) as [string, string];
              return (
                <TouchableOpacity
                  key={spot.id}
                  style={s.spotCard}
                  onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
                  activeOpacity={0.85}
                  accessibilityLabel={`${spot.name.split(',')[0]}, rating ${spot.rating}`}
                  accessibilityRole="button"
                >
                  <LinearGradient colors={grad} style={s.spotBg}>
                    <MaterialCommunityIcons
                      name={spot.type === 'river' ? 'waves' : spot.type === 'sea' ? 'sail-boat' : 'water'}
                      size={36} color="rgba(255,255,255,0.07)"
                      style={s.spotBgIcon}
                    />
                    {/* Overlay info at bottom */}
                    <View style={s.spotOverlay}>
                      <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                      <View style={s.spotMetaRow}>
                        <Text style={s.spotType}>{spot.type}</Text>
                        <View style={s.spotRatingRow}>
                          <MaterialCommunityIcons name="star" size={10} color={colors.secondary} />
                          <Text style={s.spotRating}>{spot.rating}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Recent Catches ── */}
        <View style={s.block}>
          <View style={s.blockHead}>
            <Text style={s.blockTitle}>Recent Catches</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/catches' as any)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
            >
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {catches.length === 0 ? (
            <TouchableOpacity
              style={s.emptyCard}
              onPress={() => router.push('/add-catch')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Log your first catch"
            >
              <View style={s.emptyIcon}>
                <MaterialCommunityIcons name="fish" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.emptyTitle}>No catches yet</Text>
                <Text style={s.emptySub}>Log your first catch to get started</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : (
            <View style={s.catchesList}>
              {catches.slice(0, 4).map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.catchRow, i > 0 && s.catchBorderTop]}
                  onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.species}${c.weight ? ', ' + c.weight + ' kg' : ''}`}
                >
                  <LinearGradient colors={['#132010', '#0A130A']} style={s.catchThumb}>
                    <MaterialCommunityIcons name="fish" size={18} color="rgba(0,212,170,0.6)" />
                  </LinearGradient>
                  <View style={s.catchInfo}>
                    <Text style={s.catchSpecies}>{c.species}</Text>
                    <Text style={s.catchMeta}>
                      {[c.weight ? `${c.weight} kg` : null, c.location].filter(Boolean).join('  ·  ')}
                    </Text>
                  </View>
                  <Text style={s.catchTime}>{timeAgo(c.date)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {},

  // Nav
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 4,
  },
  logo: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, letterSpacing: 3 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  // Greeting
  greeting: { paddingHorizontal: spacing.lg, paddingTop: 4, paddingBottom: spacing.md },
  greetHi: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  greetName: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginTop: 2 },

  // Hero card
  heroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    ...elevation.card,
  },
  heroGrad: { padding: spacing.lg, gap: 20 },

  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  heroLocation: { fontSize: 12, color: colors.textTertiary, fontWeight: '500' },

  heroWeather: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroTemp: { fontSize: 56, fontWeight: '800', color: colors.textPrimary, letterSpacing: -2, lineHeight: 60 },
  heroDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  heroStats: { gap: 8, alignItems: 'flex-end', paddingBottom: 6 },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroStatVal: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  heroCta: { borderRadius: radius.full, overflow: 'hidden', ...elevation.glow },
  heroCtaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: radius.full,
  },
  heroCtaText: { fontSize: 14, fontWeight: '800', color: '#051410', letterSpacing: 2 },

  // Blocks
  block: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  blockHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  blockTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Spot cards — tall with gradient overlay
  spotsRow: { gap: 12, paddingRight: spacing.lg },
  spotCard: {
    width: 160, borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, ...elevation.raised,
  },
  spotBg: { height: 180, justifyContent: 'flex-end' },
  spotBgIcon: { position: 'absolute', right: 12, top: 12 },
  spotOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  spotName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  spotMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotType: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' },
  spotRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  spotRating: { fontSize: 11, fontWeight: '700', color: colors.secondary },

  // Recent catches
  catchesList: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    ...elevation.raised,
  },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  catchBorderTop: { borderTopWidth: 1, borderTopColor: colors.border },
  catchThumb: {
    width: 48, height: 48, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  catchInfo: { flex: 1 },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textTertiary },

  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, ...elevation.raised,
  },
  emptyIcon: {
    width: 48, height: 48, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  emptySub: { fontSize: 12, color: colors.textSecondary },
});
