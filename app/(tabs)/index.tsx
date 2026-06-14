import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
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
  { id: 'carp', name: 'Carp', emoji: '🐠', bestBait: 'Boilies & Sweetcorn', bestTime: 'Dawn & Dusk', difficulty: 'Intermediate', color: '#22C55E' },
  { id: 'pike', name: 'Pike', emoji: '🦷', bestBait: 'Deadbait (Mackerel)', bestTime: 'Cold mornings', difficulty: 'Intermediate', color: '#3B82F6' },
  { id: 'perch', name: 'Perch', emoji: '🎣', bestBait: 'Worms & Lures', bestTime: 'Morning', difficulty: 'Beginner', color: '#00D4AA' },
  { id: 'tench', name: 'Tench', emoji: '🌿', bestBait: 'Maggots & Corn', bestTime: 'Early dawn', difficulty: 'Intermediate', color: '#22C55E' },
  { id: 'bream', name: 'Bream', emoji: '🫧', bestBait: 'Maggots & Groundbait', bestTime: 'Night', difficulty: 'Beginner', color: '#9CA3AF' },
  { id: 'barbel', name: 'Barbel', emoji: '💪', bestBait: 'Pellets & Hemp', bestTime: 'Evening', difficulty: 'Expert', color: '#F59E0B' },
  { id: 'trout', name: 'Trout', emoji: '🌈', bestBait: 'Flies & Spinners', bestTime: 'Morning', difficulty: 'Intermediate', color: '#8B5CF6' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', bestBait: 'Spinners & Flies', bestTime: 'Autumn dawn', difficulty: 'Expert', color: '#EC4899' },
];

const QUICK_ACTIONS = [
  { icon: 'plus-circle', label: 'Log Catch', route: '/add-catch', color: colors.primary, bg: 'rgba(0,212,170,0.15)' },
  { icon: 'camera', label: 'ID Fish', route: '/identifier', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  { icon: 'map-marker', label: 'Find Spots', route: '/(tabs)/map', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  { icon: 'robot', label: 'AI Advisor', route: '/ai-advisor', color: colors.secondary, bg: 'rgba(245,158,11,0.15)' },
  { icon: 'book-open-variant', label: 'Species', route: '/fish-encyclopedia', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  { icon: 'weather-partly-cloudy', label: 'Conditions', route: '/conditions', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' },
];

const EXPLORE_CARDS = [
  { emoji: '🐠', title: 'Fish Database', sub: '132 species', route: '/fish-database', colors: ['rgba(59,130,246,0.25)', 'rgba(59,130,246,0.05)'] as [string,string] },
  { emoji: '🗺️', title: 'World Spots', sub: '168+ locations', route: '/(tabs)/map', colors: ['rgba(0,212,170,0.25)', 'rgba(0,212,170,0.05)'] as [string,string] },
  { emoji: '🌙', title: 'Moon Calendar', sub: 'Solunar times', route: '/moon-calendar', colors: ['rgba(139,92,246,0.25)', 'rgba(139,92,246,0.05)'] as [string,string] },
  { emoji: '🪢', title: 'Knot Guide', sub: '20+ knots', route: '/knots', colors: ['rgba(245,158,11,0.25)', 'rgba(245,158,11,0.05)'] as [string,string] },
  { emoji: '🤖', title: 'AI Advisor', sub: 'Ask anything', route: '/ai-advisor', colors: ['rgba(236,72,153,0.25)', 'rgba(236,72,153,0.05)'] as [string,string] },
  { emoji: '📊', title: 'My Stats', sub: 'PBs & records', route: '/my-stats', colors: ['rgba(34,197,94,0.25)', 'rgba(34,197,94,0.05)'] as [string,string] },
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
  if (h < 5) return 'Good Night';
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
  const { weather } = useWeather(location?.latitude, location?.longitude);
  const router = useRouter();
  const stats = getStats();

  const moon = getMoonPhase(new Date());
  const timePeriod = getTimePeriodLabel();
  const top5 = getTopSpeciesNow(5);
  const weekNum = getWeekNumber(new Date());
  const fishOfWeek = FISH_OF_WEEK_DATA[weekNum % FISH_OF_WEEK_DATA.length];

  const xpProgress = user ? (user.xp % 1000) / 1000 : 0;
  const level = user ? user.level : 1;

  const w = weather ?? {
    temp: 14, wind: 12, pressure: 1016, humidity: 72,
    fishingScore: 65, city: 'Your Location', description: 'Partly Cloudy',
    moonEmoji: '🌒', pressureTrend: 'rising',
  };

  const scoreColor = w.fishingScore >= 70 ? colors.success : w.fishingScore >= 50 ? colors.secondary : '#EF4444';
  const scoreLabel = w.fishingScore >= 70 ? 'PRIME' : w.fishingScore >= 50 ? 'GOOD' : 'SLOW';
  const heroGradient: [string, string, string] = ['#071018', '#0D1B2A', colors.background];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── CINEMATIC HERO ── */}
        <LinearGradient colors={heroGradient} style={styles.hero}>
          {/* Top bar */}
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} ·  {moon.emoji} {moon.name}</Text>
              <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Angler'}</Text>
            </View>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications' as any)}>
                <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.proBadge} onPress={() => router.push('/pro')}>
                <MaterialCommunityIcons name="crown" size={13} color={colors.secondary} />
                <Text style={styles.proText}>{user?.isPro ? 'PRO' : 'Go Pro'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Big fishing score */}
          <LinearGradient
            colors={[scoreColor + '22', scoreColor + '08']}
            style={[styles.bigScoreCard, { borderColor: scoreColor + '40' }]}
          >
            <View style={styles.bigScoreLeft}>
              <View style={[styles.scoreStatusDot, { backgroundColor: scoreColor }]} />
              <Text style={styles.bigScoreLocation}>📍 {w.city}</Text>
              <Text style={styles.bigScoreDesc}>{w.description} · {timePeriod.emoji} {timePeriod.label}</Text>
              <View style={styles.bigScoreMiniRow}>
                <Text style={styles.bigScoreMini}>🌡 {w.temp}°C</Text>
                <Text style={styles.bigScoreMini}>💨 {w.wind}km/h</Text>
                <Text style={styles.bigScoreMini}>📊 {w.pressure}mb</Text>
              </View>
              <View style={[styles.pressureBadge, { backgroundColor: w.pressureTrend === 'rising' ? 'rgba(34,197,94,0.2)' : w.pressureTrend === 'falling' ? 'rgba(239,68,68,0.2)' : 'rgba(156,163,175,0.2)' }]}>
                <MaterialCommunityIcons
                  name={w.pressureTrend === 'rising' ? 'trending-up' : w.pressureTrend === 'falling' ? 'trending-down' : 'trending-neutral'}
                  size={11}
                  color={w.pressureTrend === 'rising' ? colors.success : w.pressureTrend === 'falling' ? '#EF4444' : colors.textSecondary}
                />
                <Text style={[styles.pressureBadgeText, { color: w.pressureTrend === 'rising' ? colors.success : w.pressureTrend === 'falling' ? '#EF4444' : colors.textSecondary }]}>
                  Pressure {w.pressureTrend}
                </Text>
              </View>
            </View>
            <View style={styles.bigScoreRight}>
              <Text style={[styles.bigScoreNum, { color: scoreColor }]}>{w.fishingScore}</Text>
              <Text style={styles.bigScoreOf}>/100</Text>
              <View style={[styles.bigScoreLabel, { backgroundColor: scoreColor + '30' }]}>
                <Text style={[styles.bigScoreLabelText, { color: scoreColor }]}>{scoreLabel}</Text>
              </View>
              <Text style={styles.bigScoreSub}>Fishing{'\n'}Score</Text>
            </View>
          </LinearGradient>

          {/* XP / Level bar */}
          <View style={styles.xpBar}>
            <View style={styles.xpLeft}>
              <Text style={styles.xpLevel}>LVL {level}</Text>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
              </View>
            </View>
            <View style={styles.xpStats}>
              <View style={styles.xpStat}>
                <Text style={styles.xpStatNum}>{stats.total}</Text>
                <Text style={styles.xpStatLabel}>Catches</Text>
              </View>
              <View style={styles.xpDivider} />
              <View style={styles.xpStat}>
                <Text style={styles.xpStatNum}>{user?.streak || 0}🔥</Text>
                <Text style={styles.xpStatLabel}>Streak</Text>
              </View>
              <View style={styles.xpDivider} />
              <View style={styles.xpStat}>
                <Text style={styles.xpStatNum}>{user?.xp || 0}</Text>
                <Text style={styles.xpStatLabel}>XP</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── QUICK ACTIONS GRID ── */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.qaGrid}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity
                key={a.route}
                style={styles.qaBtn}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.qaIcon, { backgroundColor: a.bg, borderColor: a.color + '40' }]}>
                  <MaterialCommunityIcons name={a.icon as any} size={26} color={a.color} />
                </View>
                <Text style={styles.qaLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── WHAT'S BITING — horizontal scroll ── */}
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
          <View style={styles.sectionHeaderPx}>
            <SectionHeader title="What's Biting Now" subtitle={`${timePeriod.emoji} ${timePeriod.description}`} />
            <TouchableOpacity onPress={() => router.push('/fish-tips' as any)}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bitingScroll}>
            {top5.map((fish, i) => {
              const activity = fish.score >= 16 ? { label: 'PEAK', color: colors.primary } :
                fish.score >= 12 ? { label: 'GOOD', color: colors.success } :
                { label: 'FAIR', color: colors.secondary };
              return (
                <TouchableOpacity
                  key={fish.id}
                  style={[styles.bitingCard, i === 0 && { borderColor: colors.primary + '60', backgroundColor: 'rgba(0,212,170,0.06)' }]}
                  onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })}
                  activeOpacity={0.8}
                >
                  {i === 0 && (
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotText}>🔥 HOT</Text>
                    </View>
                  )}
                  <Text style={styles.bitingEmoji}>{fish.emoji}</Text>
                  <Text style={styles.bitingName}>{fish.commonName}</Text>
                  <View style={[styles.activityPill, { backgroundColor: activity.color + '20' }]}>
                    <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
                    <Text style={[styles.activityText, { color: activity.color }]}>{activity.label}</Text>
                  </View>
                  <Text style={styles.bitingTip} numberOfLines={2}>{fish.tip || 'Active now'}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── FISH OF THE WEEK ── */}
        <View style={styles.section}>
          <SectionHeader title="Species Spotlight" />
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/species-detail', params: { id: fishOfWeek.id } })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[fishOfWeek.color + '25', fishOfWeek.color + '08', 'transparent']}
              style={[styles.fowCard, { borderColor: fishOfWeek.color + '40' }]}
            >
              <View style={styles.fowInner}>
                <View style={styles.fowLeft}>
                  <View style={[styles.fowWeekBadge, { backgroundColor: fishOfWeek.color + '25' }]}>
                    <Text style={[styles.fowWeekText, { color: fishOfWeek.color }]}>WEEK {weekNum} · SPOTLIGHT</Text>
                  </View>
                  <Text style={styles.fowName}>{fishOfWeek.name}</Text>
                  <View style={styles.fowMeta}>
                    <View style={styles.fowMetaRow}>
                      <MaterialCommunityIcons name="hook" size={12} color={fishOfWeek.color} />
                      <Text style={styles.fowMetaText}>{fishOfWeek.bestBait}</Text>
                    </View>
                    <View style={styles.fowMetaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={fishOfWeek.color} />
                      <Text style={styles.fowMetaText}>{fishOfWeek.bestTime}</Text>
                    </View>
                    <View style={styles.fowMetaRow}>
                      <MaterialCommunityIcons name="chart-bar" size={12} color={fishOfWeek.color} />
                      <Text style={styles.fowMetaText}>{fishOfWeek.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={[styles.fowCta, { color: fishOfWeek.color }]}>Full guide →</Text>
                </View>
                <Text style={styles.fowEmoji}>{fishOfWeek.emoji}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── EXPLORE GRID ── */}
        <View style={styles.section}>
          <SectionHeader title="Explore" />
          <View style={styles.exploreGrid}>
            {EXPLORE_CARDS.map(card => (
              <TouchableOpacity
                key={card.route}
                style={styles.exploreCard}
                onPress={() => router.push(card.route as any)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={card.colors} style={styles.exploreGrad}>
                  <Text style={styles.exploreEmoji}>{card.emoji}</Text>
                  <Text style={styles.exploreTitle}>{card.title}</Text>
                  <Text style={styles.exploreSub}>{card.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── RECENT CATCHES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="Recent Catches" />
            <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {catches.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/add-catch')} activeOpacity={0.85}>
              <LinearGradient colors={['rgba(0,212,170,0.12)', 'rgba(0,212,170,0.02)']} style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🎣</Text>
                <Text style={styles.emptyTitle}>Log Your First Catch</Text>
                <Text style={styles.emptySub}>Start tracking your fishing journey</Text>
                <View style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>+ Log a Catch</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.catchList}>
              {catches.slice(0, 3).map(c => (
                <TouchableOpacity key={c.id} style={styles.catchRow} onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)} activeOpacity={0.8}>
                  <View style={styles.catchIconWrap}>
                    <Text style={{ fontSize: 24 }}>🐟</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catchSpecies}>{c.species}</Text>
                    <Text style={styles.catchMeta}>{c.location || 'Unknown location'}</Text>
                  </View>
                  {c.weight ? <Text style={styles.catchWeight}>{c.weight}kg</Text> : null}
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Hero
  hero: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greeting: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  name: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5, marginTop: 2 },
  notifBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  proText: { fontSize: 11, fontWeight: '800', color: colors.secondary, letterSpacing: 0.5 },

  // Big score card
  bigScoreCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bigScoreLeft: { flex: 1, gap: 6 },
  scoreStatusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  bigScoreLocation: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  bigScoreDesc: { fontSize: 12, color: colors.textSecondary },
  bigScoreMiniRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  bigScoreMini: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  pressureBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.full,
  },
  pressureBadgeText: { fontSize: 11, fontWeight: '700' },
  bigScoreRight: { alignItems: 'center', paddingLeft: spacing.md },
  bigScoreNum: { fontSize: 52, fontWeight: '900', lineHeight: 56 },
  bigScoreOf: { fontSize: 14, color: colors.textSecondary, marginTop: -4 },
  bigScoreLabel: {
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    marginTop: 4,
  },
  bigScoreLabelText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  bigScoreSub: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },

  // XP bar
  xpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpLeft: { flex: 1, gap: 6 },
  xpLevel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  xpTrack: { height: 4, backgroundColor: colors.surface2, borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  xpStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  xpStat: { alignItems: 'center' },
  xpStatNum: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  xpStatLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 1 },
  xpDivider: { width: 1, height: 22, backgroundColor: colors.border },

  // Sections
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionHeaderPx: { paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionAccent: { width: 3, height: 18, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  sectionSub: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  // Quick actions — 3 column grid
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  qaBtn: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: {
    width: '100%',
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  qaLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Biting — horizontal scroll
  bitingScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  bitingCard: {
    width: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    position: 'relative',
  },
  hotBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  hotText: { fontSize: 8, fontWeight: '800', color: '#EF4444' },
  bitingEmoji: { fontSize: 36, marginTop: 4 },
  bitingName: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  activityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
  },
  activityDot: { width: 5, height: 5, borderRadius: 3 },
  activityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bitingTip: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', lineHeight: 14 },

  // Fish of week
  fowCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  fowLeft: { flex: 1, gap: 6 },
  fowWeekBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  fowWeekText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  fowName: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  fowMeta: { gap: 4 },
  fowMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fowMetaText: { fontSize: 12, color: colors.textSecondary },
  fowCta: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  fowEmoji: { fontSize: 72, marginLeft: spacing.sm },

  // Explore grid
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  exploreCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  exploreGrad: { padding: spacing.md, gap: 4, minHeight: 100, justifyContent: 'center' },
  exploreEmoji: { fontSize: 30, marginBottom: 6 },
  exploreTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  exploreSub: { fontSize: 11, color: colors.textSecondary },

  // Catches
  emptyCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    gap: 6,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary },
  emptyBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A' },

  catchList: { gap: spacing.sm },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catchIconWrap: {
    width: 48, height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  catchSpecies: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  catchMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  catchWeight: { fontSize: 15, fontWeight: '800', color: colors.primary, marginRight: 2 },
});
