import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useSessionStore } from '../../store/sessionStore';
import { useSolunar } from '../../hooks/useSolunar';
import { colors, spacing, radius } from '../../constants/theme';
import { FishSpeciesPhoto } from '../../components/fish/FishSpeciesPhoto';
import { getTipOfDay } from '../../data/tipOfDay';

function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getConditionsColor(score: number) {
  if (score >= 80) return colors.primary;
  if (score >= 60) return '#4DA3FF';
  if (score >= 40) return colors.accent;
  return '#EF4444';
}

function getConditionsLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Tough';
}

function getSunTimes(lat: number, lng: number, date = new Date()) {
  const J = date.getTime() / 86400000 + 2440587.5;
  const n = Math.ceil(J - 2451545 + 0.0008);
  const Jstar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C = 1.9148 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180);
  const lam = (M + C + 180 + 102.9372) % 360;
  const Jtransit =
    2451545 + Jstar + 0.0053 * Math.sin((M * Math.PI) / 180) -
    0.0069 * Math.sin((2 * lam * Math.PI) / 180);
  const d = (Math.asin(Math.sin((lam * Math.PI) / 180) * Math.sin((23.45 * Math.PI) / 180)) * 180) / Math.PI;
  const latR = (lat * Math.PI) / 180;
  const h0 = (-0.8333 * Math.PI) / 180;
  const cosOmega =
    (Math.sin(h0) - Math.sin(latR) * Math.sin((d * Math.PI) / 180)) /
    (Math.cos(latR) * Math.cos((d * Math.PI) / 180));
  if (Math.abs(cosOmega) > 1) return null;
  const omega = (Math.acos(cosOmega) * 180) / Math.PI;
  const Jrise = Jtransit - omega / 360;
  const Jset = Jtransit + omega / 360;
  const offsetMin = -date.getTimezoneOffset();
  const toTime = (Jd: number) => {
    const totalMin = Math.round(((Jd - 2440587.5) * 1440) % 1440);
    const localMin = ((totalMin + offsetMin) % 1440 + 1440) % 1440;
    const h = Math.floor(localMin / 60);
    const m = localMin % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  return { sunrise: toTime(Jrise), sunset: toTime(Jset) };
}

// Circular score ring with ambient glow
function ScoreRing({ score, color }: { score: number; color: string }) {
  const SIZE = 96;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 38;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * R;
  const filled = (score / 100) * circumference;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={46} fill="url(#glow)" />
        <Circle cx={cx} cy={cy} r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={cx} cy={cy} r={R}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </Svg>
      <Text style={{ fontSize: 26, fontWeight: '800', color, letterSpacing: -1 }}>{score}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const catches = useCatchStore((s) => s.catches);
  const router = useRouter();
  const { location: gpsLocation } = useLocation();
  const activeSession = useSessionStore((s) => s.activeSession);

  const { weather } = useWeather(gpsLocation?.latitude, gpsLocation?.longitude);

  const score = weather?.fishingScore ?? 0;
  const moonPhase = weather?.moonPhase ?? 'Waxing Crescent';
  const solunar = useSolunar(gpsLocation?.latitude, gpsLocation?.longitude);
  const condColor = getConditionsColor(score);

  const windDir = weather?.windDirection != null ? degreesToCompass(weather.windDirection) : 'SW';

  const sunTimes = useMemo(() => {
    if (gpsLocation) return getSunTimes(gpsLocation.latitude, gpsLocation.longitude);
    return null;
  }, [gpsLocation?.latitude, gpsLocation?.longitude]);

  const stats = useMemo(() => {
    const speciesSet = new Set(catches.map((c) => c.species));
    let streak = 0;
    const days = new Set(catches.map((c) => new Date(c.date).toDateString()));
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) streak++;
      else break;
    }
    return { total: catches.length, species: speciesSet.size, streak };
  }, [catches]);

  const nextWindowStr = useMemo(() => {
    if (!solunar?.nextWindow) return null;
    const min = solunar.nextWindow.minutesUntil;
    if (min <= 0) return 'Active now';
    if (min < 60) return `in ${min}m`;
    return `in ${Math.floor(min / 60)}h ${min % 60}m`;
  }, [solunar]);

  const recentCatches = useMemo(() => catches.slice(0, 5), [catches]);

  const targetSpecies = useMemo(() => {
    const s = score;
    const phase = moonPhase?.toLowerCase() ?? '';
    if (s >= 75) {
      if (phase.includes('full') || phase.includes('new')) return { name: 'Murray Cod', reason: 'Moon + high conditions' };
      return { name: 'Bass', reason: 'Peak feeding window' };
    }
    if (s >= 50) {
      const hour = new Date().getHours();
      if (hour < 9 || hour > 17) return { name: 'Bream', reason: 'Active at low light' };
      return { name: 'Flathead', reason: 'Moderate activity' };
    }
    return { name: 'Carp', reason: 'Tolerant of tough conditions' };
  }, [score, moonPhase]);

  const tip = useMemo(() => getTipOfDay(), []);
  const solunarWindows = solunar?.windows ?? [];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <View style={s.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={11} color={colors.textTertiary} />
              <Text style={s.locationText}>{gpsLocation ? 'Your Location' : 'Gold Coast, QLD'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.notifBtn}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.75}
            accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Score Card ── */}
        <LinearGradient
          colors={['#0D1E33', '#091525', '#061120']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          {/* Decorative accent line at top */}
          <View style={[s.heroAccentLine, { backgroundColor: condColor }]} />

          <View style={s.heroBody}>
            {/* Score ring on the left */}
            <ScoreRing score={score} color={condColor} />

            {/* Right content */}
            <View style={s.heroText}>
              <View style={s.conditionsPill}>
                <View style={[s.conditionsDot, { backgroundColor: condColor }]} />
                <Text style={[s.conditionsLabel, { color: condColor }]}>
                  {getConditionsLabel(score)} Conditions
                </Text>
              </View>
              <Text style={s.heroScoreLabel}>Fishing Score</Text>
              {nextWindowStr && (
                <View style={s.primeRow}>
                  <MaterialCommunityIcons name="clock-fast" size={11} color={colors.textTertiary} />
                  <Text style={s.primeText}>Next prime {nextWindowStr}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Sun bar */}
          <View style={s.sunBar}>
            <View style={s.sunItem}>
              <MaterialCommunityIcons name="weather-sunset-up" size={13} color={colors.accent} />
              <Text style={s.sunTime}>{sunTimes?.sunrise ?? '5:42 AM'}</Text>
              <Text style={s.sunLabel}>Sunrise</Text>
            </View>
            <View style={s.sunArcContainer}>
              <Svg width={80} height={28}>
                <Path d="M 4 24 Q 40 4 76 24" stroke={colors.accent} strokeWidth={1.5} fill="none" strokeDasharray="3 2.5" opacity={0.5} />
                <Circle cx={40} cy={8} r={3} fill={colors.accent} opacity={0.85} />
              </Svg>
            </View>
            <View style={s.sunItem}>
              <MaterialCommunityIcons name="weather-sunset-down" size={13} color={colors.accent} />
              <Text style={s.sunTime}>{sunTimes?.sunset ?? '6:27 PM'}</Text>
              <Text style={s.sunLabel}>Sunset</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Weather Strip ── */}
        <View style={s.weatherStrip}>
          {[
            { icon: 'weather-windy', value: weather ? `${weather.wind}` : '22', unit: 'km/h', sub: windDir },
            { icon: 'thermometer', value: weather ? `${weather.temp}` : '15', unit: '°C', sub: 'Temp' },
            { icon: 'gauge', value: weather ? `${weather.pressure}` : '1007', unit: 'hPa', sub: 'Pressure' },
            { icon: 'moon-waxing-crescent', value: moonPhase.split(' ')[0], unit: '', sub: moonPhase.split(' ').slice(1).join(' ') || 'Moon' },
          ].map((chip, i) => (
            <View key={i} style={s.weatherChip}>
              <MaterialCommunityIcons name={chip.icon as any} size={16} color={colors.textTertiary} />
              <View style={s.weatherChipVals}>
                <Text style={s.weatherChipValue} numberOfLines={1}>
                  {chip.value}<Text style={s.weatherChipUnit}>{chip.unit}</Text>
                </Text>
                <Text style={s.weatherChipSub} numberOfLines={1}>{chip.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            style={s.actionPrimary}
            onPress={() => router.push('/(tabs)/session' as any)}
            activeOpacity={0.82}
            accessibilityLabel="Start Session"
          >
            <MaterialCommunityIcons name="play-circle-outline" size={20} color={colors.bg} />
            <Text style={s.actionPrimaryText}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionSecondary}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.82}
            accessibilityLabel="Scan Fish"
          >
            <MaterialCommunityIcons name="camera-outline" size={20} color={colors.primary} />
            <Text style={s.actionSecondaryText}>Scan Fish</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Grid ── */}
        <View style={s.statsSection}>
          <View style={s.statsSectionHeader}>
            <Text style={s.eyebrow}>YOUR STATS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} activeOpacity={0.75}>
              <Text style={s.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.statsGrid}>
            {[
              { icon: 'fish', value: String(stats.total), label: 'Catches', color: colors.primary },
              { icon: 'dna', value: String(stats.species), label: 'Species', color: '#4DA3FF' },
              { icon: 'timer-outline', value: '142', label: 'Hours Fished', color: colors.accent },
              { icon: 'fire', value: String(stats.streak), label: 'Day Streak', color: '#EF4444' },
            ].map((item) => (
              <View key={item.label} style={s.statTile}>
                <View style={[s.statIconWrap, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={s.statValue}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Today's Target ── */}
        <TouchableOpacity
          style={s.targetCard}
          onPress={() => router.push('/(tabs)/catches' as any)}
          activeOpacity={0.88}
          accessibilityLabel={`Today's target: ${targetSpecies.name}`}
        >
          <FishSpeciesPhoto species={targetSpecies.name} style={s.targetPhoto} />
          <View style={s.targetContent}>
            <Text style={s.targetEyebrow}>TODAY'S TARGET</Text>
            <Text style={s.targetName}>{targetSpecies.name}</Text>
            <Text style={s.targetReason}>{targetSpecies.reason}</Text>
            <View style={s.targetCta}>
              <Text style={s.targetCtaText}>View tips</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} style={{ marginLeft: 'auto' as any }} />
        </TouchableOpacity>

        {/* ── Solunar Feeding Windows ── */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.eyebrow}>FEEDING WINDOWS</Text>
            <View style={s.moonChip}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={11} color={colors.textTertiary} />
              <Text style={s.moonChipText}>{solunar?.moonPhaseName ?? '—'} · {solunar?.moonIllumination ?? 0}%</Text>
            </View>
          </View>
          <View style={s.solunarTable}>
            {solunarWindows.map((win, i) => (
              <View key={i} style={[s.solunarRow, win.isActive && s.solunarRowActive]}>
                <View style={s.solunarLeft}>
                  {win.isActive
                    ? <View style={s.solunarLiveDot} />
                    : <View style={[s.solunarQualityBar, { backgroundColor: win.quality === 'major' ? colors.primary : '#4DA3FF' }]} />
                  }
                  <View>
                    <Text style={[s.solunarQualityLabel, { color: win.quality === 'major' ? colors.primary : '#4DA3FF' }]}>
                      {win.quality === 'major' ? 'Major' : 'Minor'} window
                    </Text>
                    <Text style={s.solunarSubLabel}>{win.duration}</Text>
                  </View>
                </View>
                <Text style={[s.solunarTime, win.isActive && { color: colors.primary }]}>
                  {win.time} – {win.endTime}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tip of the Day ── */}
        <View style={s.tipCard}>
          <View style={s.tipIconWrap}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color={colors.accent} />
          </View>
          <View style={s.tipBody}>
            <View style={s.tipTopRow}>
              <Text style={s.tipEyebrow}>TIP OF THE DAY</Text>
              <Text style={s.tipCategory}>{tip.category}</Text>
            </View>
            <Text style={s.tipText}>{tip.tip}</Text>
          </View>
        </View>

        {/* ── Recent Catches ── */}
        {recentCatches.length > 0 && (
          <View style={s.recentSection}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.eyebrow}>RECENT CATCHES</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} activeOpacity={0.75}>
                <Text style={s.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recentStrip}>
              {recentCatches.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={s.recentCard}
                  onPress={() => router.push(`/catch-detail?id=${c.id}` as any)}
                  activeOpacity={0.85}
                >
                  <FishSpeciesPhoto species={c.species} photo={c.photo} style={s.recentPhoto} />
                  <View style={s.recentCardBody}>
                    <Text style={s.recentSpecies} numberOfLines={1}>{c.species}</Text>
                    {c.weight > 0 && <Text style={s.recentWeight}>{c.weight.toFixed(1)} kg</Text>}
                    <Text style={s.recentDate}>{new Date(c.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: 120 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  locationText: { fontSize: 12, color: colors.textTertiary, fontWeight: '500' },
  notifBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },

  // ── Hero Card ───────────────────────────────────────────────────────────────
  heroCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroAccentLine: {
    height: 2,
    opacity: 0.7,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 20,
  },
  heroText: { flex: 1, gap: 6 },
  conditionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  conditionsDot: { width: 6, height: 6, borderRadius: 3 },
  conditionsLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  heroScoreLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '500', letterSpacing: 0.5 },
  primeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  primeText: { fontSize: 11, color: colors.textTertiary, fontWeight: '500' },

  // Sun bar inside hero
  sunBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sunItem: { alignItems: 'center', gap: 2 },
  sunTime: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  sunLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },
  sunArcContainer: { flex: 1, alignItems: 'center' },

  // ── Weather Strip ────────────────────────────────────────────────────────────
  weatherStrip: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: 16,
    gap: 8,
  },
  weatherChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weatherChipVals: { gap: 1 },
  weatherChipValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  weatherChipUnit: { fontSize: 10, fontWeight: '500', color: colors.textTertiary },
  weatherChipSub: { fontSize: 10, fontWeight: '500', color: colors.textTertiary },

  // ── Actions ─────────────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: 20,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPrimaryText: { fontSize: 14, fontWeight: '700', color: colors.bg, letterSpacing: 0.1 },
  actionSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderMid,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionSecondaryText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  // ── Stats Grid ───────────────────────────────────────────────────────────────
  statsSection: { marginHorizontal: spacing.lg, marginBottom: 20 },
  statsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  statIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  statLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '500' },

  // ── Section shared ────────────────────────────────────────────────────────────
  section: { marginHorizontal: spacing.lg, marginBottom: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyebrow: { fontSize: 10, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.5 },
  viewAll: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  // ── Target Species ───────────────────────────────────────────────────────────
  targetCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMid,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  targetPhoto: {
    width: 72,
    height: 72,
    borderRadius: 10,
    flexShrink: 0,
    backgroundColor: colors.surface2,
  },
  targetOverlay: {
    flex: 1,
  },
  targetGradient: {
    display: 'none',
  },
  targetContent: {
    gap: 3,
  },
  targetEyebrow: { fontSize: 9, fontWeight: '700', color: colors.primary, letterSpacing: 2 },
  targetName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  targetReason: { fontSize: 12, color: colors.textSecondary, fontWeight: '400' },
  targetCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  targetCtaText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  // ── Solunar ──────────────────────────────────────────────────────────────────
  solunarTable: { gap: 6 },
  solunarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  solunarRowActive: {
    borderColor: 'rgba(0,212,170,0.3)',
    backgroundColor: 'rgba(0,212,170,0.05)',
  },
  solunarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  solunarQualityBar: { width: 3, height: 28, borderRadius: 2 },
  solunarLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: 2.5,
  },
  solunarQualityLabel: { fontSize: 13, fontWeight: '600' },
  solunarSubLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '400', marginTop: 1 },
  solunarTime: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  moonChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moonChipText: { fontSize: 11, color: colors.textTertiary, fontWeight: '500' },

  // ── Tip ──────────────────────────────────────────────────────────────────────
  tipCard: {
    marginHorizontal: spacing.lg,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipBody: { flex: 1, gap: 6 },
  tipTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipEyebrow: { fontSize: 9, fontWeight: '700', color: colors.accent, letterSpacing: 2 },
  tipCategory: { fontSize: 10, fontWeight: '600', color: colors.accent, opacity: 0.75 },
  tipText: { fontSize: 14, color: colors.textPrimary, lineHeight: 21, fontWeight: '400' },

  // ── Recent Catches ────────────────────────────────────────────────────────────
  recentSection: { marginBottom: 20, paddingHorizontal: spacing.lg },
  recentStrip: { gap: 10, paddingRight: spacing.lg },
  recentCard: {
    width: 108,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recentPhoto: { width: 108, height: 84 },
  recentCardBody: { padding: 9, gap: 2 },
  recentSpecies: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  recentWeight: { fontSize: 11, fontWeight: '600', color: colors.primary },
  recentDate: { fontSize: 10, color: colors.textTertiary, fontWeight: '400' },
});
