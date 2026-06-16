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
const FEEDING_WINDOWS: Record<MonthKey, { major: string[] }> = {
  january:   { major: ['07:30-09:30', '19:45-21:45'] },
  february:  { major: ['07:00-09:00', '19:15-21:15'] },
  march:     { major: ['06:30-08:30', '18:45-20:45'] },
  april:     { major: ['05:45-07:45', '18:00-20:00'] },
  may:       { major: ['05:00-07:00', '17:15-19:15'] },
  june:      { major: ['04:30-06:30', '16:45-18:45'] },
  july:      { major: ['04:45-06:45', '17:00-19:00'] },
  august:    { major: ['05:15-07:15', '17:30-19:30'] },
  september: { major: ['06:00-08:00', '18:15-20:15'] },
  october:   { major: ['06:45-08:45', '19:00-21:00'] },
  november:  { major: ['07:15-09:15', '19:30-21:30'] },
  december:  { major: ['07:45-09:45', '20:00-22:00'] },
};

const SPOT_GRADIENTS: Record<string, [string, string]> = {
  river:     ['#1B3A2A', '#0D1F16'],
  lake:      ['#1A2A3A', '#0D1620'],
  sea:       ['#132035', '#0A1525'],
  reservoir: ['#1A2535', '#0F1928'],
  private:   ['#1A1A2A', '#0F0F1A'],
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     colors.success,
  intermediate: colors.secondary,
  expert:       colors.danger,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getBestBiteWindow() {
  const key = MONTH_KEYS[new Date().getMonth()];
  const [start, end] = (FEEDING_WINDOWS[key].major[1] || '18:30-20:00').split('-');
  return { start, end };
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return `Today, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

// Reusable section header matching the skill's typography guidelines
function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderLeft}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={s.seeAll}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const router = useRouter();

  const { weather } = useWeather(location?.query);
  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const biteWindow = getBestBiteWindow();

  const w = weather ?? { temp: 18, wind: 12, pressure: 1016, description: 'Partly Cloudy', fishingScore: 70 };
  const condWord = w.fishingScore >= 70 ? 'Good' : w.fishingScore >= 50 ? 'Fair' : 'Poor';
  const condColor = w.fishingScore >= 70 ? colors.primary : w.fishingScore >= 50 ? colors.secondary : colors.danger;

  const recommendedSpots = ukSpots.slice(0, 6);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <View>
            <Text style={s.logo}>CAST</Text>
            <View style={s.logoUnderline} />
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notifications' as any)}
            style={s.bellBtn}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={s.greeting}>
          <Text style={s.greetingTitle}>Good {getGreeting()}, {firstName}.</Text>
          <Text style={s.greetingSub}>Ready for a great day on the water?</Text>
        </View>

        {/* ── Start Fishing CTA ── */}
        <TouchableOpacity
          style={s.startBtn}
          onPress={() => router.push('/add-catch' as any)}
          activeOpacity={0.85}
          accessibilityLabel="Start fishing"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#00D4AA', '#00B892']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.startGrad}
          >
            <MaterialCommunityIcons name="fishbowl-outline" size={20} color="#051410" />
            <Text style={s.startText}>START FISHING</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Recommended Spots ── */}
        <View style={s.section}>
          <SectionHeader title="Recommended Spots" action="See all" onAction={() => router.push('/(tabs)/map' as any)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotsRow}>
            {recommendedSpots.map((spot) => {
              const grad = SPOT_GRADIENTS[spot.type] || ['#1A2A3A', '#0F1924'];
              const diffColor = DIFFICULTY_COLORS[spot.difficulty] || colors.primary;
              return (
                <TouchableOpacity
                  key={spot.id}
                  style={s.spotCard}
                  onPress={() => router.push({ pathname: '/spot-details', params: { id: spot.id } } as any)}
                  activeOpacity={0.85}
                  accessibilityLabel={`${spot.name}, rated ${spot.rating}`}
                  accessibilityRole="button"
                >
                  <LinearGradient colors={grad} style={s.spotPhoto}>
                    <MaterialCommunityIcons
                      name={spot.type === 'river' ? 'waves' : spot.type === 'sea' ? 'sail-boat' : 'water'}
                      size={26} color="rgba(255,255,255,0.18)"
                    />
                    {/* Difficulty pill */}
                    <View style={[s.diffPill, { backgroundColor: diffColor + '22', borderColor: diffColor + '55' }]}>
                      <Text style={[s.diffText, { color: diffColor }]}>{spot.difficulty}</Text>
                    </View>
                  </LinearGradient>
                  <View style={s.spotInfo}>
                    <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                    <View style={s.spotMeta}>
                      <MaterialCommunityIcons name="star" size={11} color={colors.secondary} />
                      <Text style={s.spotRating}>{spot.rating}</Text>
                      <Text style={s.spotDot}>·</Text>
                      <Text style={s.spotType}>{spot.type}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Best Bite Time ── */}
        <View style={s.section}>
          <View style={s.biteCard}>
            <View style={s.biteIconWrap}>
              <MaterialCommunityIcons name="weather-sunny" size={22} color={colors.secondary} />
            </View>
            <View style={s.biteMid}>
              <Text style={s.biteLabel}>Best Time Today</Text>
              <Text style={s.biteTime}>{biteWindow.start} – {biteWindow.end}</Text>
              <Text style={s.biteSub}>Great bite window</Text>
            </View>
            <View style={s.biteStars}>
              {[0,1,2,3].map(i => (
                <MaterialCommunityIcons key={i} name="star" size={11} color={colors.secondary} />
              ))}
            </View>
          </View>
        </View>

        {/* ── Weather / Conditions ── */}
        <View style={[s.section, s.weatherRow]}>
          <TouchableOpacity
            style={s.weatherCard}
            onPress={() => router.push('/conditions' as any)}
            activeOpacity={0.85}
            accessibilityLabel="View weather details"
            accessibilityRole="button"
          >
            <Text style={s.weatherCardLabel}>Weather</Text>
            <View style={s.weatherMain}>
              <Text style={s.weatherTemp}>{w.temp}°</Text>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={30} color={colors.secondary} />
            </View>
            <Text style={s.weatherDesc}>{w.description}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.weatherCard}
            onPress={() => router.push('/conditions' as any)}
            activeOpacity={0.85}
            accessibilityLabel="View conditions details"
            accessibilityRole="button"
          >
            <Text style={s.weatherCardLabel}>Conditions</Text>
            <View style={s.weatherMain}>
              <MaterialCommunityIcons name="waves" size={22} color={condColor} />
            </View>
            <Text style={[s.condWord, { color: condColor }]}>{condWord}</Text>
            <Text style={s.weatherDesc}>{w.pressure} hPa</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Catches ── */}
        <View style={s.section}>
          <SectionHeader title="Recent Catches" action="See all" onAction={() => router.push('/(tabs)/catches' as any)} />

          {catches.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/add-catch')} style={s.emptyCard} activeOpacity={0.8}>
              <MaterialCommunityIcons name="fish" size={28} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={s.emptyTitle}>Log your first catch</Text>
                <Text style={s.emptySub}>Start your fishing journal</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            catches.slice(0, 4).map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[s.catchRow, i < Math.min(catches.length, 4) - 1 && s.catchBorder]}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                activeOpacity={0.85}
                accessibilityLabel={`${c.species}, ${c.weight ? c.weight + ' kg' : ''}`}
                accessibilityRole="button"
              >
                <LinearGradient colors={['#1A2A1A', '#0F1A0F']} style={s.catchThumb}>
                  <MaterialCommunityIcons name="fish" size={20} color="rgba(0,212,170,0.5)" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={s.catchSpecies}>{c.species}</Text>
                  <Text style={s.catchMeta}>
                    {c.weight ? `${c.weight} kg` : ''}
                    {c.weight && c.location ? '  ·  ' : ''}
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

const CARD_W = 148;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {},

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  logo: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, letterSpacing: 3 },
  logoUnderline: { height: 2, width: 28, backgroundColor: colors.primary, borderRadius: radius.full, marginTop: 3 },
  bellBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  greeting: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.md },
  greetingTitle: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  greetingSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },

  startBtn: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: radius.full, overflow: 'hidden', ...elevation.glow,
  },
  startGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18, borderRadius: radius.full,
  },
  startText: { fontSize: 14, fontWeight: '800', color: '#051410', letterSpacing: 2 },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 16, backgroundColor: colors.primary, borderRadius: radius.full },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  spotsRow: { gap: 12, paddingRight: spacing.lg },
  spotCard: {
    width: CARD_W, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...elevation.raised,
  },
  spotPhoto: { height: 96, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  diffPill: {
    position: 'absolute', bottom: 6, left: 6,
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  diffText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  spotInfo: { padding: 10 },
  spotName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 5 },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  spotRating: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  spotDot: { fontSize: 10, color: colors.textTertiary },
  spotType: { fontSize: 11, color: colors.textSecondary, textTransform: 'capitalize' },

  biteCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 14,
    ...elevation.raised,
  },
  biteIconWrap: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  biteMid: { flex: 1 },
  biteLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  biteTime: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  biteSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  biteStars: { flexDirection: 'row', gap: 1 },

  weatherRow: { flexDirection: 'row', gap: 12 },
  weatherCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...elevation.raised,
  },
  weatherCardLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 10 },
  weatherMain: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  weatherTemp: { fontSize: 32, fontWeight: '700', color: colors.textPrimary },
  weatherDesc: { fontSize: 12, color: colors.textSecondary },
  condWord: { fontSize: 24, fontWeight: '700', marginBottom: 2 },

  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, ...elevation.raised,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  emptySub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13,
  },
  catchBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  catchThumb: {
    width: 52, height: 52, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textSecondary },
});
