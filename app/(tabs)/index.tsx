import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useLocationStore } from '../../store/locationStore';
import { useWeather } from '../../hooks/useWeather';
import { colors, spacing } from '../../constants/theme';
import { species } from '../../data/species';
import { SPECIES_ACTIVITY_BY_HOUR, MONTHLY_ACTIVITY, getMoonPhase, getTimePeriodLabel } from '../../data/fishingTimes';

const { width } = Dimensions.get('window');

const QUICK_SPOTS = [
  'River Thames', 'Loch Lomond', 'Grafham Water', 'Chesil Beach',
  'Norfolk Broads', 'River Wye', 'Port de Sóller', 'Florida Keys',
];

const FISH_OF_WEEK_DATA = [
  { id: 'carp',   name: 'Carp',   emoji: '🐠', bestBait: 'Boilies & Sweetcorn', bestTime: 'Dawn & Dusk',   difficulty: 'Intermediate', accent: '#22C55E' },
  { id: 'pike',   name: 'Pike',   emoji: '🦷', bestBait: 'Deadbait (Mackerel)', bestTime: 'Cold mornings', difficulty: 'Intermediate', accent: '#3B82F6' },
  { id: 'perch',  name: 'Perch',  emoji: '🎣', bestBait: 'Worms & Lures',       bestTime: 'Morning',       difficulty: 'Beginner',     accent: '#00D4AA' },
  { id: 'tench',  name: 'Tench',  emoji: '🌿', bestBait: 'Maggots & Corn',      bestTime: 'Early dawn',    difficulty: 'Intermediate', accent: '#22C55E' },
  { id: 'bream',  name: 'Bream',  emoji: '🫧', bestBait: 'Maggots & Groundbait',bestTime: 'Night',         difficulty: 'Beginner',     accent: '#9CA3AF' },
  { id: 'barbel', name: 'Barbel', emoji: '💪', bestBait: 'Pellets & Hemp',       bestTime: 'Evening',       difficulty: 'Expert',       accent: '#F59E0B' },
  { id: 'trout',  name: 'Trout',  emoji: '🌈', bestBait: 'Flies & Spinners',     bestTime: 'Morning',       difficulty: 'Intermediate', accent: '#8B5CF6' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', bestBait: 'Spinners & Flies',     bestTime: 'Autumn dawn',   difficulty: 'Expert',       accent: '#EC4899' },
];

function getWeekNumber(d: Date) {
  const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = u.getUTCDay() || 7;
  u.setUTCDate(u.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(u.getUTCFullYear(), 0, 1));
  return Math.ceil((((u.getTime() - y.getTime()) / 86400000) + 1) / 7);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Night';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function getTopSpecies(count: number) {
  const hour  = new Date().getHours();
  const month = new Date().getMonth();
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
  const { location, setLocation } = useLocationStore();
  const router = useRouter();

  const { weather } = useWeather(location?.query);
  const stats = getStats();
  const moon = getMoonPhase(new Date());
  const timePeriod = getTimePeriodLabel();
  const top5 = getTopSpecies(5);
  const weekNum = getWeekNumber(new Date());
  const fow = FISH_OF_WEEK_DATA[weekNum % FISH_OF_WEEK_DATA.length];
  const level = user?.level ?? 1;
  const xpPct = user ? (user.xp % 1000) / 1000 : 0;

  const [editing, setEditing] = useState(!location);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  const w = weather ?? {
    temp: 14, wind: 12, pressure: 1016, humidity: 72,
    fishingScore: 65, city: location?.name ?? '', description: 'Partly Cloudy',
    pressureTrend: 'rising' as const,
  };
  const scoreColor = w.fishingScore >= 70 ? colors.primary : w.fishingScore >= 50 ? colors.secondary : '#EF4444';
  const scoreWord  = w.fishingScore >= 70 ? 'PRIME' : w.fishingScore >= 50 ? 'GOOD' : 'SLOW';

  const confirmLocation = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLocation({ name: trimmed, query: trimmed });
    setEditing(false);
    setDraft('');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── TOP BAR ── */}
          <View style={s.topBar}>
            <View>
              <Text style={s.topGreeting}>GOOD {getGreeting().toUpperCase()} · {moon.emoji} {moon.name.toUpperCase()}</Text>
              <Text style={s.topName}>{user?.name?.split(' ')[0] || 'Angler'}</Text>
            </View>
            <View style={s.topRight}>
              <TouchableOpacity onPress={() => router.push('/notifications' as any)} style={s.iconBtn}>
                <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/pro')} style={s.proChip}>
                <MaterialCommunityIcons name="crown" size={12} color={colors.secondary} />
                <Text style={s.proChipText}>{user?.isPro ? 'PRO' : 'GO PRO'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── WHERE ARE WE FISHING? ── */}
          {editing ? (
            <View style={s.locationHero}>
              <Text style={s.locationHeroQ}>Where are we fishing?</Text>
              <Text style={s.locationHeroSub}>Tell CAST your spot — we'll pull conditions, species activity and local intelligence.</Text>
              <View style={s.locationInputRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary} style={{ marginLeft: 14 }} />
                <TextInput
                  ref={inputRef}
                  style={s.locationInput}
                  placeholder="Lake, river, coast, town..."
                  placeholderTextColor="#4B5563"
                  value={draft}
                  onChangeText={setDraft}
                  autoFocus
                  returnKeyType="go"
                  onSubmitEditing={() => confirmLocation(draft)}
                />
                {draft.length > 0 && (
                  <TouchableOpacity style={s.locationGo} onPress={() => confirmLocation(draft)}>
                    <Text style={s.locationGoText}>GO</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Quick picks */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickSpotsRow}>
                {QUICK_SPOTS.map(spot => (
                  <TouchableOpacity key={spot} style={s.quickSpotChip} onPress={() => confirmLocation(spot)}>
                    <Text style={s.quickSpotText}>{spot}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            /* ── LOCATION SET: conditions panel ── */
            <View style={s.condPanel}>
              <TouchableOpacity style={s.condLocation} onPress={() => { setDraft(''); setEditing(true); }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="map-marker" size={15} color={colors.primary} />
                <Text style={s.condLocationText}>{location?.name}</Text>
                <MaterialCommunityIcons name="chevron-down" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={s.condMain}>
                <View style={s.condLeft}>
                  <Text style={s.condDesc}>{w.description}</Text>
                  <View style={s.condStats}>
                    <Text style={s.condStat}>🌡 {w.temp}°C</Text>
                    <Text style={s.condDot}>·</Text>
                    <Text style={s.condStat}>💨 {w.wind}km/h</Text>
                    <Text style={s.condDot}>·</Text>
                    <Text style={s.condStat}>{w.pressure}mb</Text>
                  </View>
                  <View style={[s.trendBadge, {
                    backgroundColor: w.pressureTrend === 'rising' ? 'rgba(0,212,170,0.1)' : w.pressureTrend === 'falling' ? 'rgba(239,68,68,0.1)' : 'rgba(156,163,175,0.1)',
                  }]}>
                    <Text style={[s.trendText, {
                      color: w.pressureTrend === 'rising' ? colors.primary : w.pressureTrend === 'falling' ? '#EF4444' : colors.textSecondary,
                    }]}>
                      {w.pressureTrend === 'rising' ? '↑ Pressure rising — fish feeding' : w.pressureTrend === 'falling' ? '↓ Dropping — fish before it falls' : '→ Pressure stable'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/conditions' as any)}>
                    <Text style={s.condMore}>Full forecast →</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.condScore}>
                  <Text style={[s.condScoreNum, { color: scoreColor }]}>{w.fishingScore}</Text>
                  <Text style={[s.condScoreWord, { color: scoreColor }]}>{scoreWord}</Text>
                </View>
              </View>
              <View style={[s.condBar, { backgroundColor: scoreColor }]} />
            </View>
          )}

          {/* ── STATS ROW ── */}
          <View style={s.statsRow}>
            <StatCell label="LEVEL" value={`${level}`} />
            <View style={s.statLine} />
            <StatCell label="CATCHES" value={`${stats.total}`} />
            <View style={s.statLine} />
            <StatCell label="STREAK" value={`${user?.streak || 0}🔥`} />
            <View style={s.statLine} />
            <StatCell label="XP" value={`${user?.xp || 0}`} />
          </View>
          <View style={s.xpTrack}><View style={[s.xpFill, { width: `${xpPct * 100}%` }]} /></View>

          <View style={s.divider} />

          {/* ── QUICK ACTIONS ── */}
          <View style={s.section}>
            <Text style={s.label}>QUICK ACTIONS</Text>
            <View style={s.qaRow}>
              {[
                { icon: 'plus-circle-outline', label: 'Log Catch',  route: '/add-catch',         color: colors.primary },
                { icon: 'camera-outline',       label: 'ID Fish',    route: '/identifier',         color: '#8B5CF6'      },
                { icon: 'map-marker-outline',   label: 'Spots',      route: '/(tabs)/map',         color: '#3B82F6'      },
                { icon: 'robot-outline',        label: 'AI',         route: '/ai-advisor',         color: colors.secondary },
                { icon: 'fish',                 label: 'Species',    route: '/fish-encyclopedia',  color: '#22C55E'      },
                { icon: 'weather-partly-cloudy',label: 'Weather',    route: '/conditions',         color: '#60A5FA'      },
              ].map(a => (
                <TouchableOpacity key={a.route} style={s.qaItem} onPress={() => router.push(a.route as any)} activeOpacity={0.7}>
                  <View style={[s.qaCircle, { borderColor: a.color + '50' }]}>
                    <MaterialCommunityIcons name={a.icon as any} size={22} color={a.color} />
                  </View>
                  <Text style={s.qaLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.divider} />

          {/* ── WHAT'S BITING ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.label}>WHAT'S BITING{location ? ` NEAR ${location.name.toUpperCase().split(',')[0]}` : ' NOW'}</Text>
              <TouchableOpacity onPress={() => router.push('/fish-tips' as any)}>
                <Text style={s.linkText}>All species →</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.sectionSub}>{timePeriod.emoji} {timePeriod.description}</Text>
            {top5.map((fish, i) => {
              const pct = Math.min(100, Math.round((fish.score / 20) * 100));
              const ac  = pct >= 80 ? colors.primary : pct >= 60 ? colors.success : pct >= 40 ? colors.secondary : colors.textSecondary;
              const lbl = pct >= 80 ? 'Peak' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Slow';
              return (
                <TouchableOpacity key={fish.id} style={[s.bitingRow, i < 4 && s.bitingBorder]} onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })} activeOpacity={0.7}>
                  <Text style={s.bitingRank}>{i + 1}</Text>
                  <Text style={s.bitingEmoji}>{fish.emoji}</Text>
                  <View style={s.bitingMid}>
                    <Text style={s.bitingName}>{fish.commonName}</Text>
                    <View style={s.bitingBarTrack}>
                      <View style={[s.bitingBarFill, { width: `${pct}%`, backgroundColor: ac }]} />
                    </View>
                  </View>
                  <Text style={[s.bitingStatus, { color: ac }]}>{lbl}</Text>
                  {i === 0 && <View style={s.hotTag}><Text style={s.hotText}>HOT</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.divider} />

          {/* ── SPOTLIGHT ── */}
          <TouchableOpacity onPress={() => router.push({ pathname: '/species-detail', params: { id: fow.id } })} activeOpacity={0.85}>
            <LinearGradient colors={[fow.accent + '18', fow.accent + '06']} style={s.fowBlock}>
              <View style={[s.fowAccent, { backgroundColor: fow.accent }]} />
              <View style={s.fowInner}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[s.fowLabel, { color: fow.accent }]}>WEEK {weekNum} · SPOTLIGHT</Text>
                  <Text style={s.fowName}>{fow.name}</Text>
                  <Text style={s.fowDetail}>{fow.bestBait}</Text>
                  <Text style={s.fowDetail}>{fow.bestTime} · {fow.difficulty}</Text>
                  <Text style={[s.fowCta, { color: fow.accent }]}>Full guide →</Text>
                </View>
                <Text style={s.fowEmoji}>{fow.emoji}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.divider} />

          {/* ── EXPLORE ── */}
          <View style={s.section}>
            <Text style={s.label}>EXPLORE</Text>
            <View style={s.exploreGrid}>
              {[
                { emoji: '🐠', title: 'Fish Database', sub: '132 species',    route: '/fish-database',    color: '#3B82F6'       },
                { emoji: '🗺️', title: 'World Spots',   sub: '168+ locations', route: '/(tabs)/map',       color: colors.primary  },
                { emoji: '🌙', title: 'Moon Calendar', sub: 'Solunar times',  route: '/moon-calendar',    color: '#8B5CF6'       },
                { emoji: '🪢', title: 'Knot Guide',    sub: '20+ knots',      route: '/knots',            color: colors.secondary},
                { emoji: '🤖', title: 'AI Advisor',    sub: 'Ask anything',   route: '/ai-advisor',       color: '#EC4899'       },
                { emoji: '📊', title: 'My Stats',      sub: 'PBs & records',  route: '/my-stats',         color: '#22C55E'       },
              ].map(card => (
                <TouchableOpacity key={card.route} style={s.exploreItem} onPress={() => router.push(card.route as any)} activeOpacity={0.7}>
                  <View style={[s.exploreIcon, { backgroundColor: card.color + '18' }]}>
                    <Text style={{ fontSize: 26 }}>{card.emoji}</Text>
                  </View>
                  <Text style={s.exploreTitle}>{card.title}</Text>
                  <Text style={s.exploreSub}>{card.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.divider} />

          {/* ── RECENT CATCHES ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.label}>RECENT CATCHES</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)}>
                <Text style={s.linkText}>See all →</Text>
              </TouchableOpacity>
            </View>
            {catches.length === 0 ? (
              <TouchableOpacity onPress={() => router.push('/add-catch')} style={s.emptyRow} activeOpacity={0.8}>
                <Text style={{ fontSize: 28 }}>🎣</Text>
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
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 26 }}>🐟</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.catchSpecies}>{c.species}</Text>
                    <Text style={s.catchMeta}>{c.location || 'Unknown location'}</Text>
                  </View>
                  {c.weight ? <Text style={s.catchWeight}>{c.weight}kg</Text> : null}
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.border} />
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statCell}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  topGreeting: { fontSize: 10, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 3 },
  topName: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 6 },
  proChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  proChipText: { fontSize: 10, fontWeight: '800', color: colors.secondary, letterSpacing: 0.5 },

  // Location hero (editing state)
  locationHero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  locationHeroQ: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 6 },
  locationHeroSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.lg },
  locationInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D1620',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
    marginBottom: 12,
  },
  locationInput: {
    flex: 1, paddingVertical: 15, paddingHorizontal: 10,
    fontSize: 16, color: colors.textPrimary,
  },
  locationGo: {
    backgroundColor: colors.primary, borderRadius: 10,
    margin: 6, paddingHorizontal: 16, paddingVertical: 8,
  },
  locationGoText: { fontSize: 13, fontWeight: '900', color: '#0A0E1A', letterSpacing: 0.5 },
  quickSpotsRow: { gap: 8, paddingRight: spacing.lg },
  quickSpotChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  quickSpotText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  // Conditions panel (location set)
  condPanel: {
    marginHorizontal: spacing.lg,
    backgroundColor: '#0D1620',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  condLocation: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 4,
  },
  condLocationText: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  condMain: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  condLeft: { flex: 1, gap: 7 },
  condDesc: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  condStats: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  condStat: { fontSize: 12, color: colors.textSecondary },
  condDot: { fontSize: 12, color: colors.border },
  trendBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  trendText: { fontSize: 11, fontWeight: '600' },
  condMore: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  condScore: { alignItems: 'flex-end', paddingLeft: spacing.md },
  condScoreNum: { fontSize: 56, fontWeight: '900', lineHeight: 60, letterSpacing: -2 },
  condScoreWord: { fontSize: 12, fontWeight: '900', letterSpacing: 2, textAlign: 'right' },
  condBar: { height: 3 },

  // Stats
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 14 },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLbl: { fontSize: 9, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  statLine: { width: 1, height: 24, backgroundColor: colors.border },
  xpTrack: { height: 2, backgroundColor: colors.surface2, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  xpFill: { height: 2, backgroundColor: colors.primary },

  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },

  // Sections
  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  label: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 2 },
  sectionSub: { fontSize: 11, color: colors.textSecondary, marginBottom: 12 },
  linkText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  // Quick actions
  qaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  qaItem: { alignItems: 'center', gap: 6 },
  qaCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  qaLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Biting
  bitingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  bitingBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  bitingRank: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, width: 16, textAlign: 'center' },
  bitingEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  bitingMid: { flex: 1, gap: 6 },
  bitingName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  bitingBarTrack: { height: 3, backgroundColor: colors.surface2, borderRadius: 2 },
  bitingBarFill: { height: 3, borderRadius: 2 },
  bitingStatus: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  hotTag: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  hotText: { fontSize: 8, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 },

  // Spotlight
  fowBlock: { flexDirection: 'row', paddingVertical: 28 },
  fowAccent: { width: 3, marginLeft: spacing.lg, borderRadius: 2 },
  fowInner: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: spacing.lg },
  fowLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  fowName: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  fowDetail: { fontSize: 13, color: colors.textSecondary },
  fowCta: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  fowEmoji: { fontSize: 64 },

  // Explore
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  exploreItem: { width: (width - spacing.lg * 2 - 20) / 3, gap: 4 },
  exploreIcon: { borderRadius: 12, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  exploreTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  exploreSub: { fontSize: 10, color: colors.textSecondary },

  // Catches
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  emptySub: { fontSize: 12, color: colors.textSecondary },
  catchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  catchBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  catchSpecies: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  catchMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  catchWeight: { fontSize: 14, fontWeight: '800', color: colors.primary },
});
