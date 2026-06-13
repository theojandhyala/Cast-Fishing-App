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
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { colors, spacing, radius } from '../../constants/theme';
import { species } from '../../data/species';
import { SPECIES_ACTIVITY_BY_HOUR, MONTHLY_ACTIVITY, getMoonPhase, getTimePeriodLabel } from '../../data/fishingTimes';

const { width } = Dimensions.get('window');

const FISH_OF_WEEK_DATA = [
  { id: 'carp', name: 'Carp', emoji: '🐠', bestBait: 'Boilies & Sweetcorn', bestTime: 'Dawn & Dusk', difficulty: 'Intermediate' },
  { id: 'pike', name: 'Pike', emoji: '🦷', bestBait: 'Deadbait (Mackerel)', bestTime: 'Cold mornings', difficulty: 'Intermediate' },
  { id: 'perch', name: 'Perch', emoji: '🎣', bestBait: 'Worms & Lures', bestTime: 'Morning', difficulty: 'Beginner' },
  { id: 'tench', name: 'Tench', emoji: '🌿', bestBait: 'Maggots & Corn', bestTime: 'Early dawn', difficulty: 'Intermediate' },
  { id: 'bream', name: 'Bream', emoji: '🫧', bestBait: 'Maggots & Groundbait', bestTime: 'Night', difficulty: 'Beginner' },
  { id: 'barbel', name: 'Barbel', emoji: '💪', bestBait: 'Pellets & Hemp', bestTime: 'Evening', difficulty: 'Expert' },
  { id: 'trout', name: 'Trout', emoji: '🌈', bestBait: 'Flies & Spinners', bestTime: 'Morning', difficulty: 'Intermediate' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', bestBait: 'Spinners & Flies', bestTime: 'Autumn dawn', difficulty: 'Expert' },
  { id: 'roach', name: 'Roach', emoji: '🔴', bestBait: 'Maggots & Bread', bestTime: 'Afternoon', difficulty: 'Beginner' },
  { id: 'chub', name: 'Chub', emoji: '🌊', bestBait: 'Bread & Cheese', bestTime: 'Winter days', difficulty: 'Intermediate' },
  { id: 'zander', name: 'Zander', emoji: '👁️', bestBait: 'Lures & Deadbait', bestTime: 'Dusk', difficulty: 'Expert' },
  { id: 'seabass', name: 'Sea Bass', emoji: '🐡', bestBait: 'Sandeel & Ragworm', bestTime: 'High tide', difficulty: 'Intermediate' },
];

const QUICK_ACTIONS = [
  { icon: 'plus-circle', label: 'Log Catch', route: '/add-catch', color: colors.primary },
  { icon: 'camera', label: 'ID Fish', route: '/identifier', color: '#8B5CF6' },
  { icon: 'map-marker', label: 'Spots', route: '/(tabs)/map', color: '#3B82F6' },
  { icon: 'book-open-variant', label: 'Species', route: '/fish-encyclopedia', color: colors.secondary },
];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getTopSpeciesNow(count: number) {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  return [...species]
    .map(s => ({
      ...s,
      score: (SPECIES_ACTIVITY_BY_HOUR[s.id]?.[hour] ?? 5) + (MONTHLY_ACTIVITY[s.id]?.[month] ?? 5),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const { location } = useLocation();
  const { weather, loading: weatherLoading } = useWeather(location?.latitude, location?.longitude);
  const router = useRouter();
  const stats = getStats();

  const moon = getMoonPhase(new Date());
  const timePeriod = getTimePeriodLabel();
  const top3 = getTopSpeciesNow(3);
  const weekNum = getWeekNumber(new Date());
  const fishOfWeek = FISH_OF_WEEK_DATA[weekNum % FISH_OF_WEEK_DATA.length];

  const xpProgress = user ? (user.xp % 1000) / 1000 : 0;
  const level = user ? user.level : 1;

  const w = weather ?? {
    temp: 14, wind: 12, pressure: 1016, humidity: 72,
    fishingScore: 65, city: 'Your Location', description: 'Partly Cloudy',
    moonEmoji: '🌒', pressureTrend: 'rising',
  };

  const scoreColor = w.fishingScore >= 70 ? colors.success : w.fishingScore >= 50 ? colors.secondary : colors.danger;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HERO HEADER ── */}
        <LinearGradient
          colors={['#0D1B2A', colors.background]}
          style={styles.hero}
        >
          {/* Top row */}
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Angler'} 🎣</Text>
            </View>
            <TouchableOpacity style={styles.proBadge} onPress={() => router.push('/pro')}>
              <MaterialCommunityIcons name="crown" size={14} color={colors.secondary} />
              <Text style={styles.proText}>{user?.isPro ? 'PRO' : 'Go Pro'}</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Catches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statNum}>Lv {level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{user?.streak || 0}🔥</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>

          {/* XP bar */}
          <View style={styles.xpRow}>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.xpLabel}>{user?.xp || 0} / {level * 1000} XP</Text>
          </View>
        </LinearGradient>

        {/* ── FISHING SCORE CARD ── */}
        <View style={styles.px}>
          <LinearGradient
            colors={['rgba(0,212,170,0.15)', 'rgba(0,212,170,0.03)']}
            style={styles.scoreCard}
          >
            <View style={styles.scoreCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scoreCardLocation}>📍 {w.city}</Text>
                <Text style={styles.scoreCardDesc}>{w.description}</Text>
              </View>
              <View style={[styles.scoreBubble, { borderColor: scoreColor + '44' }]}>
                <Text style={[styles.scoreBig, { color: scoreColor }]}>{w.fishingScore}</Text>
                <Text style={styles.scoreSmall}>/ 100</Text>
                <Text style={styles.scoreLabel2}>FISHING{'\n'}SCORE</Text>
              </View>
            </View>

            <View style={styles.condGrid}>
              <CondItem icon="thermometer" label="Temp" value={`${w.temp}°C`} />
              <CondItem icon="weather-windy" label="Wind" value={`${w.wind} km/h`} />
              <CondItem icon="gauge" label="Pressure" value={`${w.pressure} mb`} />
              <CondItem icon="water-percent" label="Humidity" value={`${w.humidity}%`} />
            </View>

            <View style={styles.trendRow}>
              <MaterialCommunityIcons
                name={w.pressureTrend === 'rising' ? 'trending-up' : w.pressureTrend === 'falling' ? 'trending-down' : 'trending-neutral'}
                size={14}
                color={w.pressureTrend === 'rising' ? colors.success : w.pressureTrend === 'falling' ? '#EF4444' : colors.textSecondary}
              />
              <Text style={styles.trendText}>
                Pressure {w.pressureTrend} · {moon.emoji} {moon.name}
              </Text>
              <Text style={[styles.trendVerdict, { color: w.pressureTrend === 'rising' ? colors.success : w.pressureTrend === 'falling' ? '#EF4444' : colors.textSecondary }]}>
                {w.pressureTrend === 'rising' ? 'Great conditions' : w.pressureTrend === 'falling' ? 'Fish before drop' : 'Stable'}
              </Text>
            </View>
          </LinearGradient>

          {/* ── QUICK ACTIONS ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.qaGrid}>
              {QUICK_ACTIONS.map(a => (
                <TouchableOpacity
                  key={a.route}
                  style={styles.qaBtn}
                  onPress={() => router.push(a.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.qaIcon, { backgroundColor: a.color + '20', borderColor: a.color + '40' }]}>
                    <MaterialCommunityIcons name={a.icon as any} size={24} color={a.color} />
                  </View>
                  <Text style={styles.qaLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── WHAT'S BITING NOW ── */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionTitle}>What's Biting Now</Text>
                <Text style={styles.sectionSub}>{timePeriod.emoji} {timePeriod.description}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/fish-tips' as any)}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bitingRow}>
              {top3.map((fish, i) => {
                const activity = fish.score >= 16 ? { label: 'Peak', color: colors.primary } :
                  fish.score >= 12 ? { label: 'Good', color: colors.success } :
                  { label: 'Fair', color: colors.secondary };
                return (
                  <TouchableOpacity
                    key={fish.id}
                    style={[styles.bitingCard, i === 0 && styles.bitingCardFeatured]}
                    onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })}
                    activeOpacity={0.8}
                  >
                    {i === 0 && <View style={styles.hotTag}><Text style={styles.hotText}>🔥 HOT</Text></View>}
                    <Text style={styles.bitingEmoji}>{fish.emoji}</Text>
                    <Text style={styles.bitingName}>{fish.commonName}</Text>
                    <View style={[styles.activityBadge, { backgroundColor: activity.color + '22' }]}>
                      <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
                      <Text style={[styles.activityText, { color: activity.color }]}>{activity.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── FISH OF THE WEEK ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fish of the Week</Text>
            <TouchableOpacity
              style={styles.fowCard}
              onPress={() => router.push({ pathname: '/species-detail', params: { id: fishOfWeek.id } })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['rgba(245,158,11,0.12)', 'transparent']} style={styles.fowGrad}>
                <View style={styles.fowTop}>
                  <View style={styles.fowBadge}>
                    <Text style={styles.fowBadgeText}>WEEK {weekNum} TARGET</Text>
                  </View>
                  <Text style={styles.fowEmoji}>{fishOfWeek.emoji}</Text>
                </View>
                <Text style={styles.fowName}>{fishOfWeek.name}</Text>
                <View style={styles.fowStats}>
                  <View style={styles.fowStat}>
                    <MaterialCommunityIcons name="hook" size={13} color={colors.secondary} />
                    <Text style={styles.fowStatText}>{fishOfWeek.bestBait}</Text>
                  </View>
                  <View style={styles.fowStat}>
                    <MaterialCommunityIcons name="clock-outline" size={13} color={colors.secondary} />
                    <Text style={styles.fowStatText}>{fishOfWeek.bestTime}</Text>
                  </View>
                  <View style={styles.fowStat}>
                    <MaterialCommunityIcons name="chart-bar" size={13} color={colors.secondary} />
                    <Text style={styles.fowStatText}>{fishOfWeek.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.fowCta}>Full species guide →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── EXPLORE ROW ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <View style={styles.exploreRow}>
              <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/fish-database' as any)} activeOpacity={0.85}>
                <LinearGradient colors={['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.05)']} style={styles.exploreGrad}>
                  <Text style={styles.exploreEmoji}>🐠</Text>
                  <Text style={styles.exploreTitle}>Fish Database</Text>
                  <Text style={styles.exploreSub}>132 species worldwide</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/(tabs)/map' as any)} activeOpacity={0.85}>
                <LinearGradient colors={['rgba(0,212,170,0.2)', 'rgba(0,212,170,0.05)']} style={styles.exploreGrad}>
                  <Text style={styles.exploreEmoji}>🗺️</Text>
                  <Text style={styles.exploreTitle}>World Spots</Text>
                  <Text style={styles.exploreSub}>150+ locations</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={[styles.exploreRow, { marginTop: spacing.sm }]}>
              <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/moon-calendar' as any)} activeOpacity={0.85}>
                <LinearGradient colors={['rgba(139,92,246,0.2)', 'rgba(139,92,246,0.05)']} style={styles.exploreGrad}>
                  <Text style={styles.exploreEmoji}>🌙</Text>
                  <Text style={styles.exploreTitle}>Moon Calendar</Text>
                  <Text style={styles.exploreSub}>Solunar feeding times</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/knots' as any)} activeOpacity={0.85}>
                <LinearGradient colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']} style={styles.exploreGrad}>
                  <Text style={styles.exploreEmoji}>🪢</Text>
                  <Text style={styles.exploreTitle}>Knot Guide</Text>
                  <Text style={styles.exploreSub}>20+ essential knots</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── RECENT CATCHES or EMPTY ── */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Catches</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {catches.length === 0 ? (
              <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/add-catch')} activeOpacity={0.85}>
                <LinearGradient colors={['rgba(0,212,170,0.1)', 'transparent']} style={styles.emptyGrad}>
                  <Text style={styles.emptyEmoji}>🎣</Text>
                  <Text style={styles.emptyTitle}>Log Your First Catch</Text>
                  <Text style={styles.emptySub}>Track your fishing journey</Text>
                  <View style={styles.emptyBtn}>
                    <Text style={styles.emptyBtnText}>+ Log a Catch</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.catchList}>
                {catches.slice(0, 3).map(c => (
                  <View key={c.id} style={styles.catchRow}>
                    <View style={styles.catchIcon}>
                      <Text style={{ fontSize: 22 }}>🐟</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catchSpecies}>{c.species}</Text>
                      <Text style={styles.catchMeta}>{c.weight ? `${c.weight}kg · ` : ''}{c.location || 'Unknown location'}</Text>
                    </View>
                    <Text style={styles.catchWeight}>{c.weight ? `${c.weight}kg` : '—'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CondItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.condItem}>
      <MaterialCommunityIcons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.condValue}>{value}</Text>
      <Text style={styles.condLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  px: { paddingHorizontal: spacing.lg },

  // Hero
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  proText: { fontSize: 12, fontWeight: '800', color: colors.secondary, letterSpacing: 0.5 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statPill: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },

  xpRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  xpTrack: { flex: 1, height: 5, backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  xpLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },

  // Score card
  scoreCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    marginBottom: spacing.lg,
  },
  scoreCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  scoreCardLocation: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  scoreCardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  scoreBubble: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scoreBig: { fontSize: 32, fontWeight: '900', lineHeight: 36 },
  scoreSmall: { fontSize: 12, color: colors.textSecondary },
  scoreLabel2: { fontSize: 9, color: colors.textSecondary, textAlign: 'center', letterSpacing: 0.5, marginTop: 2 },

  condGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  condItem: { alignItems: 'center', flex: 1 },
  condValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
  condLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 1 },

  trendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  trendText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  trendVerdict: { fontSize: 12, fontWeight: '700' },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm },
  sectionSub: { fontSize: 12, color: colors.textSecondary, marginTop: -spacing.xs },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },

  // Quick actions
  qaGrid: { flexDirection: 'row', gap: spacing.sm },
  qaBtn: { flex: 1, alignItems: 'center', gap: 6 },
  qaIcon: {
    width: 56, height: 56,
    borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  qaLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Biting
  bitingRow: { flexDirection: 'row', gap: spacing.sm },
  bitingCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    position: 'relative',
  },
  bitingCardFeatured: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderColor: 'rgba(0,212,170,0.3)',
  },
  hotTag: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  hotText: { fontSize: 8, fontWeight: '800', color: '#EF4444' },
  bitingEmoji: { fontSize: 32 },
  bitingName: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  activityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full },
  activityDot: { width: 6, height: 6, borderRadius: 3 },
  activityText: { fontSize: 10, fontWeight: '700' },

  // Fish of the week
  fowCard: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  fowGrad: { padding: spacing.lg },
  fowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  fowBadge: { backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  fowBadgeText: { fontSize: 10, fontWeight: '800', color: colors.secondary, letterSpacing: 0.8 },
  fowEmoji: { fontSize: 44 },
  fowName: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: spacing.sm },
  fowStats: { gap: 6, marginBottom: spacing.md },
  fowStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fowStatText: { fontSize: 13, color: colors.textSecondary },
  fowCta: { fontSize: 13, color: colors.secondary, fontWeight: '700' },

  // Explore
  exploreRow: { flexDirection: 'row', gap: spacing.sm },
  exploreCard: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  exploreGrad: { padding: spacing.md, gap: 4 },
  exploreEmoji: { fontSize: 28, marginBottom: 4 },
  exploreTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  exploreSub: { fontSize: 11, color: colors.textSecondary },

  // Empty / catches
  emptyCard: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  emptyGrad: { padding: spacing.xl, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2 },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A' },

  catchList: { gap: spacing.sm },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catchIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  catchMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  catchWeight: { fontSize: 15, fontWeight: '800', color: colors.primary },
});
