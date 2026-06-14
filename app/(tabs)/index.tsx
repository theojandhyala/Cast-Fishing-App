import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useLocationStore } from '../../store/locationStore';
import { useWeather } from '../../hooks/useWeather';
import { colors, spacing, radius } from '../../constants/theme';
import { species } from '../../data/species';
import { SPECIES_ACTIVITY_BY_HOUR, MONTHLY_ACTIVITY, getMoonPhase, getTimePeriodLabel } from '../../data/fishingTimes';

const { width } = Dimensions.get('window');

const FISH_OF_WEEK_DATA = [
  { id: 'carp', name: 'Carp', emoji: '🐠', bestBait: 'Boilies & Sweetcorn', bestTime: 'Dawn & Dusk', difficulty: 'Intermediate', accent: '#22C55E' },
  { id: 'pike', name: 'Pike', emoji: '🦷', bestBait: 'Deadbait (Mackerel)', bestTime: 'Cold mornings', difficulty: 'Intermediate', accent: '#3B82F6' },
  { id: 'perch', name: 'Perch', emoji: '🎣', bestBait: 'Worms & Lures', bestTime: 'Morning', difficulty: 'Beginner', accent: '#00D4AA' },
  { id: 'tench', name: 'Tench', emoji: '🌿', bestBait: 'Maggots & Corn', bestTime: 'Early dawn', difficulty: 'Intermediate', accent: '#22C55E' },
  { id: 'bream', name: 'Bream', emoji: '🫧', bestBait: 'Maggots & Groundbait', bestTime: 'Night', difficulty: 'Beginner', accent: '#9CA3AF' },
  { id: 'barbel', name: 'Barbel', emoji: '💪', bestBait: 'Pellets & Hemp', bestTime: 'Evening', difficulty: 'Expert', accent: '#F59E0B' },
  { id: 'trout', name: 'Trout', emoji: '🌈', bestBait: 'Flies & Spinners', bestTime: 'Morning', difficulty: 'Intermediate', accent: '#8B5CF6' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', bestBait: 'Spinners & Flies', bestTime: 'Autumn dawn', difficulty: 'Expert', accent: '#EC4899' },
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
  if (h < 5) return 'Night';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
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
  const { location, setLocation } = useLocationStore();
  const { weather } = useWeather(location?.query);
  const router = useRouter();
  const [locationModal, setLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const stats = getStats();

  const moon = getMoonPhase(new Date());
  const timePeriod = getTimePeriodLabel();
  const top5 = getTopSpeciesNow(5);
  const weekNum = getWeekNumber(new Date());
  const fishOfWeek = FISH_OF_WEEK_DATA[weekNum % FISH_OF_WEEK_DATA.length];
  const level = user?.level ?? 1;
  const xpProgress = user ? (user.xp % 1000) / 1000 : 0;

  const w = weather ?? {
    temp: 14, wind: 12, pressure: 1016, humidity: 72,
    fishingScore: 65, city: location?.name ?? 'Set Location', description: 'Partly Cloudy',
    pressureTrend: 'rising',
  };

  const displayCity = location?.name ?? w.city ?? 'Set Location';
  const scoreColor = w.fishingScore >= 70 ? colors.primary : w.fishingScore >= 50 ? colors.secondary : '#EF4444';
  const scoreWord = w.fishingScore >= 70 ? 'PRIME' : w.fishingScore >= 50 ? 'GOOD' : 'SLOW';

  const saveLocation = () => {
    const trimmed = locationInput.trim();
    if (!trimmed) return;
    setLocation({ name: trimmed, query: trimmed });
    setLocationModal(false);
    setLocationInput('');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Location picker modal */}
      <Modal visible={locationModal} transparent animationType="fade" onRequestClose={() => setLocationModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setLocationModal(false)}>
            <TouchableOpacity activeOpacity={1} style={s.modalBox}>
              <Text style={s.modalTitle}>Where are you fishing?</Text>
              <Text style={s.modalSub}>Enter a lake, river, town or coastline</Text>
              <TextInput
                style={s.modalInput}
                placeholder="e.g. Port de Sóller, Mallorca"
                placeholderTextColor={colors.textSecondary}
                value={locationInput}
                onChangeText={setLocationInput}
                autoFocus
                onSubmitEditing={saveLocation}
                returnKeyType="done"
              />
              <View style={s.modalButtons}>
                <TouchableOpacity style={s.modalCancel} onPress={() => setLocationModal(false)}>
                  <Text style={s.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalSave, !locationInput.trim() && { opacity: 0.4 }]} onPress={saveLocation}>
                  <Text style={s.modalSaveText}>Set Location</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerSub}>GOOD {getGreeting().toUpperCase()} · {moon.emoji} {moon.name.toUpperCase()}</Text>
            <Text style={s.headerName}>{user?.name?.split(' ')[0] || 'Angler'}</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={() => router.push('/notifications' as any)} style={s.iconBtn}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/pro')} style={s.proChip}>
              <MaterialCommunityIcons name="crown" size={12} color={colors.secondary} />
              <Text style={s.proChipText}>{user?.isPro ? 'PRO' : 'GO PRO'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── FISHING SCORE — full bleed ── */}
        <View style={s.scoreBlock}>
          <View style={s.scoreBlockInner}>
            <View style={s.scoreLeft}>
              <TouchableOpacity style={s.locationRow} onPress={() => setLocationModal(true)} activeOpacity={0.7}>
                <MaterialCommunityIcons name="map-marker" size={13} color={colors.primary} />
                <Text style={s.scoreCity}>{displayCity.toUpperCase()}</Text>
                <MaterialCommunityIcons name="pencil-outline" size={12} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={s.scoreDesc}>{w.description}</Text>
              <View style={s.condRow}>
                <Text style={s.condPill}>🌡 {w.temp}°C</Text>
                <Text style={s.condSep}>·</Text>
                <Text style={s.condPill}>💨 {w.wind}km/h</Text>
                <Text style={s.condSep}>·</Text>
                <Text style={s.condPill}>{w.pressure}mb</Text>
              </View>
              <View style={[s.trendTag, { backgroundColor: w.pressureTrend === 'rising' ? 'rgba(0,212,170,0.12)' : w.pressureTrend === 'falling' ? 'rgba(239,68,68,0.12)' : 'rgba(156,163,175,0.12)' }]}>
                <Text style={[s.trendTagText, { color: w.pressureTrend === 'rising' ? colors.primary : w.pressureTrend === 'falling' ? '#EF4444' : colors.textSecondary }]}>
                  {w.pressureTrend === 'rising' ? '↑ Pressure rising — fish feeding' : w.pressureTrend === 'falling' ? '↓ Pressure dropping — fish fast' : '→ Pressure stable'}
                </Text>
              </View>
            </View>
            <View style={s.scoreRight}>
              <Text style={[s.scoreNum, { color: scoreColor }]}>{w.fishingScore}</Text>
              <Text style={[s.scoreWord, { color: scoreColor }]}>{scoreWord}</Text>
            </View>
          </View>
          {/* Thin color bar at bottom */}
          <View style={[s.scoreBar, { backgroundColor: scoreColor }]} />
        </View>

        {/* ── STATS ROW ── */}
        <View style={s.statsRow}>
          <Stat label="LEVEL" value={`${level}`} />
          <View style={s.statLine} />
          <Stat label="CATCHES" value={`${stats.total}`} />
          <View style={s.statLine} />
          <Stat label="STREAK" value={`${user?.streak || 0}🔥`} />
          <View style={s.statLine} />
          <Stat label="XP" value={`${user?.xp || 0}`} />
        </View>
        {/* XP progress line */}
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${xpProgress * 100}%` }]} />
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={s.section}>
          <Text style={s.label}>QUICK ACTIONS</Text>
          <View style={s.qaRow}>
            {[
              { icon: 'plus-circle-outline', label: 'Log Catch', route: '/add-catch', color: colors.primary },
              { icon: 'camera-outline', label: 'ID Fish', route: '/identifier', color: '#8B5CF6' },
              { icon: 'map-marker-outline', label: 'Spots', route: '/(tabs)/map', color: '#3B82F6' },
              { icon: 'robot-outline', label: 'AI', route: '/ai-advisor', color: colors.secondary },
              { icon: 'fish', label: 'Species', route: '/fish-encyclopedia', color: '#22C55E' },
              { icon: 'weather-partly-cloudy', label: 'Weather', route: '/conditions', color: '#60A5FA' },
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
            <Text style={s.label}>WHAT'S BITING</Text>
            <Text style={s.sectionSub}>{timePeriod.emoji} {timePeriod.description}</Text>
          </View>
          {top5.map((fish, i) => {
            const pct = Math.min(100, Math.round((fish.score / 20) * 100));
            const actColor = pct >= 80 ? colors.primary : pct >= 60 ? colors.success : pct >= 40 ? colors.secondary : colors.textSecondary;
            const actLabel = pct >= 80 ? 'Peak' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Slow';
            return (
              <TouchableOpacity key={fish.id} style={s.bitingRow} onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })} activeOpacity={0.7}>
                <Text style={s.bitingRank}>{i + 1}</Text>
                <Text style={s.bitingEmoji}>{fish.emoji}</Text>
                <View style={s.bitingInfo}>
                  <Text style={s.bitingName}>{fish.commonName}</Text>
                  <View style={s.bitingBarTrack}>
                    <View style={[s.bitingBarFill, { width: `${pct}%`, backgroundColor: actColor }]} />
                  </View>
                </View>
                <Text style={[s.bitingStatus, { color: actColor }]}>{actLabel}</Text>
                {i === 0 && <View style={s.hotDot}><Text style={s.hotDotText}>HOT</Text></View>}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={() => router.push('/fish-tips' as any)}>
            <Text style={s.viewMore}>View all species →</Text>
          </TouchableOpacity>
        </View>

        <View style={s.divider} />

        {/* ── FISH OF THE WEEK — colour block ── */}
        <TouchableOpacity onPress={() => router.push({ pathname: '/species-detail', params: { id: fishOfWeek.id } })} activeOpacity={0.85}>
          <LinearGradient colors={[fishOfWeek.accent + '18', fishOfWeek.accent + '06']} style={s.fowBlock}>
            <View style={[s.fowAccentBar, { backgroundColor: fishOfWeek.accent }]} />
            <View style={s.fowContent}>
              <View style={s.fowLeft}>
                <Text style={[s.fowLabel, { color: fishOfWeek.accent }]}>WEEK {weekNum} · SPOTLIGHT</Text>
                <Text style={s.fowName}>{fishOfWeek.name}</Text>
                <Text style={s.fowDetail}>{fishOfWeek.bestBait}</Text>
                <Text style={s.fowDetail}>{fishOfWeek.bestTime} · {fishOfWeek.difficulty}</Text>
                <Text style={[s.fowCta, { color: fishOfWeek.accent }]}>Full guide →</Text>
              </View>
              <Text style={s.fowEmoji}>{fishOfWeek.emoji}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.divider} />

        {/* ── EXPLORE ── */}
        <View style={s.section}>
          <Text style={s.label}>EXPLORE</Text>
          <View style={s.exploreGrid}>
            {[
              { emoji: '🐠', title: 'Fish Database', sub: '132 species', route: '/fish-database', color: '#3B82F6' },
              { emoji: '🗺️', title: 'World Spots', sub: '168+ locations', route: '/(tabs)/map', color: colors.primary },
              { emoji: '🌙', title: 'Moon Calendar', sub: 'Solunar times', route: '/moon-calendar', color: '#8B5CF6' },
              { emoji: '🪢', title: 'Knot Guide', sub: '20+ knots', route: '/knots', color: colors.secondary },
              { emoji: '🤖', title: 'AI Advisor', sub: 'Ask anything', route: '/ai-advisor', color: '#EC4899' },
              { emoji: '📊', title: 'My Stats', sub: 'PBs & records', route: '/my-stats', color: '#22C55E' },
            ].map(card => (
              <TouchableOpacity key={card.route} style={s.exploreItem} onPress={() => router.push(card.route as any)} activeOpacity={0.7}>
                <View style={[s.exploreIcon, { backgroundColor: card.color + '18' }]}>
                  <Text style={s.exploreEmoji}>{card.emoji}</Text>
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
              <Text style={s.viewMore}>See all →</Text>
            </TouchableOpacity>
          </View>
          {catches.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/add-catch')} style={s.emptyCta} activeOpacity={0.8}>
              <Text style={s.emptyCtaEmoji}>🎣</Text>
              <View>
                <Text style={s.emptyCtaTitle}>Log your first catch</Text>
                <Text style={s.emptyCtaSub}>Start your fishing journal</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ) : (
            catches.slice(0, 4).map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[s.catchRow, i < Math.min(catches.length, 4) - 1 && s.catchRowBorder]}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                activeOpacity={0.7}
              >
                <Text style={s.catchEmoji}>🐟</Text>
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
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerSub: { fontSize: 10, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  headerName: { fontSize: 32, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: 6 },
  proChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  proChipText: { fontSize: 10, fontWeight: '800', color: colors.secondary, letterSpacing: 0.5 },

  // Location modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  modalSub: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  modalInput: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  modalButtons: { flexDirection: 'row', gap: spacing.sm },
  modalCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  modalSave: {
    flex: 2, paddingVertical: 13, borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSaveText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A' },

  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },

  // Score block
  scoreBlock: {
    backgroundColor: '#0D1620',
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  scoreBlockInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  scoreLeft: { flex: 1, gap: 6 },
  scoreCity: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 2 },
  scoreDesc: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  condRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  condPill: { fontSize: 12, color: colors.textSecondary },
  condSep: { fontSize: 12, color: colors.border },
  trendTag: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    marginTop: 2,
  },
  trendTagText: { fontSize: 11, fontWeight: '600' },
  scoreRight: { alignItems: 'flex-end', paddingLeft: spacing.md },
  scoreNum: { fontSize: 64, fontWeight: '900', lineHeight: 68, letterSpacing: -2 },
  scoreWord: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: -4 },
  scoreBar: { height: 3 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLbl: { fontSize: 9, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  statLine: { width: 1, height: 24, backgroundColor: colors.border },
  xpTrack: { height: 2, backgroundColor: colors.surface2, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  xpFill: { height: 2, backgroundColor: colors.primary },

  // Section
  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md },
  label: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 2 },
  sectionSub: { fontSize: 11, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  viewMore: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  // Quick actions
  qaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  qaItem: { alignItems: 'center', gap: 6 },
  qaCircle: {
    width: 50, height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  qaLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Biting
  bitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bitingRank: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, width: 16, textAlign: 'center' },
  bitingEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  bitingInfo: { flex: 1, gap: 6 },
  bitingName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  bitingBarTrack: { height: 3, backgroundColor: colors.surface2, borderRadius: 2 },
  bitingBarFill: { height: 3, borderRadius: 2 },
  bitingStatus: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  hotDot: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  hotDotText: { fontSize: 8, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 },

  // Fish of week
  fowBlock: {
    flexDirection: 'row',
    paddingVertical: spacing.xl,
  },
  fowAccentBar: { width: 3, marginLeft: spacing.lg, borderRadius: 2 },
  fowContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, paddingRight: spacing.lg },
  fowLeft: { flex: 1, gap: 5 },
  fowLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  fowName: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  fowDetail: { fontSize: 13, color: colors.textSecondary },
  fowCta: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  fowEmoji: { fontSize: 64 },

  // Explore
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  exploreItem: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
    gap: 4,
  },
  exploreIcon: {
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  exploreEmoji: { fontSize: 26 },
  exploreTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  exploreSub: { fontSize: 10, color: colors.textSecondary },

  // Catches
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emptyCtaEmoji: { fontSize: 32 },
  emptyCtaTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  emptyCtaSub: { fontSize: 12, color: colors.textSecondary },
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  catchRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  catchEmoji: { fontSize: 24 },
  catchSpecies: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  catchMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  catchWeight: { fontSize: 14, fontWeight: '800', color: colors.primary },
});
