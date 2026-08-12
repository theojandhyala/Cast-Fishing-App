import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useSessionStore } from '../../store/sessionStore';
import { useSolunar } from '../../hooks/useSolunar';
import { colors, spacing, radius, elevation } from '../../constants/theme';
import { FishSpeciesPhoto } from '../../components/fish/FishSpeciesPhoto';
import { getTipOfDay } from '../../data/tipOfDay';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function degreesToCompass(deg: number) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(((deg % 360) / 45)) % 8];
}

function scoreCode(score: number) {
  if (score >= 80) return 'XCLT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
}

function scoreColor(score: number) {
  if (score >= 80) return colors.primary;
  if (score >= 60) return '#4DA3FF';
  if (score >= 40) return colors.accent;
  return '#EF4444';
}

function moonAbbr(name: string) {
  const map: Record<string, string> = {
    'New Moon': 'NEW', 'Waxing Crescent': 'WXC', 'First Quarter': '1QT',
    'Waxing Gibbous': 'WXG', 'Full Moon': 'FULL', 'Waning Gibbous': 'WNG',
    'Last Quarter': 'LQT', 'Waning Crescent': 'WNC',
  };
  return map[name] ?? name.slice(0, 3).toUpperCase();
}

function getSunTimes(lat: number, lng: number, date = new Date()) {
  const J = date.getTime() / 86400000 + 2440587.5;
  const n = Math.ceil(J - 2451545 + 0.0008);
  const Jstar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C = 1.9148 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180);
  const lam = (M + C + 180 + 102.9372) % 360;
  const Jtransit = 2451545 + Jstar + 0.0053 * Math.sin((M * Math.PI) / 180) - 0.0069 * Math.sin((2 * lam * Math.PI) / 180);
  const d = (Math.asin(Math.sin((lam * Math.PI) / 180) * Math.sin((23.45 * Math.PI) / 180)) * 180) / Math.PI;
  const latR = (lat * Math.PI) / 180;
  const cosOmega = (Math.sin((-0.8333 * Math.PI) / 180) - Math.sin(latR) * Math.sin((d * Math.PI) / 180)) / (Math.cos(latR) * Math.cos((d * Math.PI) / 180));
  if (Math.abs(cosOmega) > 1) return null;
  const omega = (Math.acos(cosOmega) * 180) / Math.PI;
  const offsetMin = -date.getTimezoneOffset();
  const toTime = (Jd: number) => {
    const totalMin = Math.round(((Jd - 2440587.5) * 1440) % 1440);
    const localMin = ((totalMin + offsetMin) % 1440 + 1440) % 1440;
    const h = Math.floor(localMin / 60), m = localMin % 60;
    return `${(h % 12) || 12}:${String(m).padStart(2,'0')}${h >= 12 ? 'P' : 'A'}`;
  };
  return { sunrise: toTime(Jtransit - omega / 360), sunset: toTime(Jtransit + omega / 360) };
}

// ─── Score bar — segmented like a signal meter ───────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  const SEGS = 20;
  const filled = Math.round((score / 100) * SEGS);
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: SEGS }, (_, i) => (
        <View
          key={i}
          style={{
            width: 10,
            height: i < 6 ? 10 : i < 13 ? 13 : 16,
            borderRadius: 1,
            backgroundColor: i < filled ? color : 'rgba(255,255,255,0.07)',
            opacity: i < filled ? (0.5 + (i / SEGS) * 0.5) : 1,
          }}
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuthStore();
  const catches = useCatchStore((s) => s.catches);
  const router = useRouter();
  const { location } = useLocation();
  const activeSession = useSessionStore((s) => s.activeSession);
  const { weather } = useWeather(location?.latitude, location?.longitude);
  const solunar = useSolunar(location?.latitude, location?.longitude);

  const score = weather?.fishingScore ?? 0;
  const sigColor = scoreColor(score);
  const windDir = weather?.windDirection != null ? degreesToCompass(weather.windDirection) : 'SW';

  const sunTimes = useMemo(() => {
    if (location) return getSunTimes(location.latitude, location.longitude);
    return null;
  }, [location?.latitude, location?.longitude]);

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
    if (min <= 0) return 'ACTIVE';
    if (min < 60) return `${min}M`;
    return `${Math.floor(min / 60)}H ${min % 60}M`;
  }, [solunar]);

  const recentCatches = useMemo(() => catches.slice(0, 5), [catches]);

  const targetSpecies = useMemo(() => {
    const phase = (weather?.moonPhase ?? '').toLowerCase();
    if (score >= 75) {
      if (phase.includes('full') || phase.includes('new')) return { name: 'Murray Cod', code: 'MOON+COND' };
      return { name: 'Bass', code: 'PEAK WINDOW' };
    }
    if (score >= 50) {
      const h = new Date().getHours();
      if (h < 9 || h > 17) return { name: 'Bream', code: 'LOW LIGHT' };
      return { name: 'Flathead', code: 'MOD ACTIVITY' };
    }
    return { name: 'Carp', code: 'TOUGH COND' };
  }, [score, weather?.moonPhase]);

  const tip = useMemo(() => getTipOfDay(), []);
  const solunarWindows = solunar?.windows ?? [];

  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const firstName = (user?.name || '').trim().split(' ')[0];
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting}{firstName ? `, ${firstName}` : ''}</Text>
            <View style={s.locRow}>
              <MaterialCommunityIcons name="map-marker" size={13} color={colors.primary} />
              <Text style={s.locationLabel}>{location ? 'Current location' : 'Gold Coast, QLD'}</Text>
              <Text style={s.locDivider}>·</Text>
              <Text style={s.locationLabel}>{dateStr}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.notifBtn}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.75}
            accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── HERO — CONDITIONS ──────────────────────────────────────────── */}
        <View style={s.heroWrap}>
          <LinearGradient
            colors={[withAlpha(sigColor, 0.22), withAlpha(sigColor, 0.05), 'rgba(13,26,45,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroTopRow}>
              <Text style={s.heroEyebrow}>Today's bite forecast</Text>
              {nextWindowStr && (
                <View style={[s.primeBadge, { borderColor: withAlpha(sigColor, 0.35), backgroundColor: withAlpha(sigColor, 0.1) }]}>
                  <View style={[s.primeIndicator, { backgroundColor: sigColor }]} />
                  <Text style={[s.primeBadgeText, { color: sigColor }]}>PRIME {nextWindowStr}</Text>
                </View>
              )}
            </View>

            {/* Score readout */}
            <View style={s.scoreBlock}>
              <View style={s.scoreLeft}>
                <Text style={[s.scoreNum, { color: sigColor, textShadowColor: withAlpha(sigColor, 0.5) }]}>{score}</Text>
                <Text style={s.scoreSlash}>/100</Text>
              </View>
              <View style={s.scoreRight}>
                <Text style={[s.scoreCode, { color: sigColor }]}>{scoreCode(score)}</Text>
                <Text style={s.scoreDesc}>
                  {score >= 80 ? 'Excellent conditions' : score >= 60 ? 'Good conditions' : score >= 40 ? 'Fair conditions' : 'Tough conditions'}
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 2, paddingBottom: 4 }}>
              <ScoreBar score={score} color={sigColor} />
            </View>

            {/* Sun row */}
            <View style={s.sunRow}>
              <View style={s.sunItem}>
                <MaterialCommunityIcons name="weather-sunset-up" size={15} color={colors.accent} />
                <View>
                  <Text style={s.sunLabel}>SUNRISE</Text>
                  <Text style={s.sunTime}>{sunTimes?.sunrise ?? '05:44A'}</Text>
                </View>
              </View>
              <Svg width={92} height={24}>
                <Path d="M 6 20 Q 46 2 86 20" stroke={colors.accent} strokeWidth={1.2} fill="none" strokeDasharray="3 3" opacity={0.5} />
                <Circle cx={46} cy={5} r={3.5} fill={colors.accent} />
              </Svg>
              <View style={[s.sunItem, { justifyContent: 'flex-end' }]}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.sunLabel}>SUNSET</Text>
                  <Text style={s.sunTime}>{sunTimes?.sunset ?? '08:22P'}</Text>
                </View>
                <MaterialCommunityIcons name="weather-sunset-down" size={15} color={colors.accent} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── INSTRUMENT CLUSTER ─────────────────────────────────────────── */}
        <View style={s.instrumentGrid}>
          {[
            { icon: 'weather-windy', label: 'Wind', value: weather ? `${weather.wind}` : '22', unit: ' km/h', sub: windDir },
            { icon: 'thermometer', label: 'Temp', value: weather ? `${weather.temp}` : '15', unit: '°', sub: 'Air' },
            { icon: 'gauge', label: 'Pressure', value: weather ? `${weather.pressure}` : '1007', unit: '', sub: 'Steady' },
            { icon: 'moon-waning-crescent', label: 'Moon', value: moonAbbr(solunar?.moonPhaseName ?? 'Waxing Gibbous'), unit: '', sub: `${solunar?.moonIllumination ?? 68}% lit` },
          ].map((item, i) => (
            <View key={item.label} style={[s.instrument, i < 3 && s.instrumentBorder]}>
              <MaterialCommunityIcons name={item.icon as any} size={16} color={colors.primary} />
              <Text style={s.instrumentValue}>{item.value}<Text style={s.instrumentUnit}>{item.unit}</Text></Text>
              <Text style={s.instrumentSub}>{item.sub}</Text>
            </View>
          ))}
        </View>

        {/* ── ACTIONS ────────────────────────────────────────────────────── */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            style={s.actionPrimary}
            onPress={() => router.push('/(tabs)/session' as any)}
            activeOpacity={0.88}
            accessibilityLabel="Start Session"
          >
            <LinearGradient
              colors={['#00E9BC', '#00B78F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.actionPrimaryGrad}
            >
              <MaterialCommunityIcons name="play" size={20} color={colors.bg} />
              <Text style={s.actionPrimaryText}>Start Session</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionSecondary}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.82}
            accessibilityLabel="Scan Fish"
          >
            <MaterialCommunityIcons name="camera-outline" size={19} color={colors.primary} />
            <Text style={s.actionSecondaryText}>Scan Fish</Text>
          </TouchableOpacity>
        </View>

        {/* ── VESSEL STATS ───────────────────────────────────────────────── */}
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelLabel}>SESSION TOTALS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} activeOpacity={0.75}>
              <Text style={s.viewAll}>VIEW LOG →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.panelDivider} />
          <View style={s.statsCluster}>
            {[
              { value: String(stats.total), label: 'CATCHES' },
              { value: String(stats.species), label: 'SPECIES' },
              { value: '142', label: 'HRS FISHED' },
              { value: String(stats.streak), label: 'DAY STREAK' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={s.statsDivider} />}
                <View style={s.statCell}>
                  <Text style={s.statValue}>{item.value}</Text>
                  <Text style={s.statLabel}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── TARGET SPECIES ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={s.targetPanel}
          onPress={() => router.push('/(tabs)/catches' as any)}
          activeOpacity={0.88}
        >
          <View style={s.targetLeft}>
            <Text style={s.panelLabel}>TARGET SPECIES</Text>
            <View style={s.panelDivider} />
            <Text style={s.targetName}>{targetSpecies.name}</Text>
            <View style={s.targetCodeRow}>
              <View style={s.targetCodeChip}>
                <Text style={s.targetCode}>{targetSpecies.code}</Text>
              </View>
              <Text style={s.targetArrow}>→</Text>
            </View>
          </View>
          <FishSpeciesPhoto species={targetSpecies.name} style={s.targetPhoto} />
        </TouchableOpacity>

        {/* ── SOLUNAR TABLE ──────────────────────────────────────────────── */}
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelLabel}>SOLUNAR ACTIVITY</Text>
            <Text style={s.panelMeta}>{moonAbbr(solunar?.moonPhaseName ?? 'Waxing Gibbous')} · {solunar?.moonIllumination ?? 68}% ILL</Text>
          </View>
          <View style={s.panelDivider} />
          {solunarWindows.map((win, i) => (
            <View key={i}>
              {i > 0 && <View style={s.tableRowDivider} />}
              <View style={[s.solunarRow, win.isActive && s.solunarRowActive]}>
                <View style={s.solunarLeft}>
                  {win.isActive
                    ? <View style={s.livePulse} />
                    : <View style={[s.solunarQBar, { backgroundColor: win.quality === 'major' ? colors.primary : '#4DA3FF' }]} />
                  }
                  <Text style={[s.solunarQLabel, { color: win.quality === 'major' ? colors.primary : '#4DA3FF' }]}>
                    {win.quality === 'major' ? 'MAJ' : 'MIN'}
                  </Text>
                </View>
                <Text style={s.solunarTimeRange}>{win.time} — {win.endTime}</Text>
                <Text style={s.solunarDur}>{win.duration}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── TIP INTERCEPT ──────────────────────────────────────────────── */}
        <View style={s.tipPanel}>
          <Text style={s.panelLabel}>FIELD NOTE · {tip.category.toUpperCase()}</Text>
          <View style={s.panelDivider} />
          <Text style={s.tipText}>{tip.tip}</Text>
        </View>

        {/* ── RECENT CATCHES ─────────────────────────────────────────────── */}
        {recentCatches.length > 0 && (
          <View style={s.panel}>
            <View style={s.panelHeader}>
              <Text style={s.panelLabel}>RECENT CATCHES</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} activeOpacity={0.75}>
                <Text style={s.viewAll}>VIEW ALL →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.panelDivider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recentStrip}>
              {recentCatches.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={s.recentCard}
                  onPress={() => router.push(`/catch-detail?id=${c.id}` as any)}
                  activeOpacity={0.85}
                >
                  <FishSpeciesPhoto species={c.species} photo={c.photo} style={s.recentPhoto} />
                  <View style={s.recentBody}>
                    <Text style={s.recentSpecies} numberOfLines={1}>{c.species.toUpperCase()}</Text>
                    {c.weight > 0 && <Text style={s.recentWeight}>{c.weight.toFixed(1)} KG</Text>}
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

// ─── Shared token ─────────────────────────────────────────────────────────────
const TEAL_LINE = 'rgba(0,212,170,0.12)';
const CARD_LINE = 'rgba(255,255,255,0.06)';
const PANEL_RADIUS = 20; // soft, modern

// Translate a hex colour to an rgba() string with the given alpha.
function withAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  locationLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  locDivider: { color: colors.textTertiary, fontSize: 12 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: CARD_LINE,
  },

  // Panels — the base unit
  panel: {
    marginHorizontal: spacing.lg,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: CARD_LINE,
    overflow: 'hidden',
    ...elevation.card,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  panelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panelMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  panelDivider: {
    height: 1,
    backgroundColor: CARD_LINE,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.2,
  },

  // Prime badge in header
  primeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,212,170,0.06)',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  primeIndicator: { width: 5, height: 5, borderRadius: 3 },
  primeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  // Hero
  heroWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: 14,
    borderRadius: PANEL_RADIUS,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: CARD_LINE,
    overflow: 'hidden',
    ...elevation.raised,
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },

  // Score block
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 12,
  },
  scoreLeft: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  scoreNum: {
    fontSize: 84,
    fontWeight: '800',
    lineHeight: 84,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  scoreSlash: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  scoreRight: { alignItems: 'flex-end', gap: 3, paddingBottom: 8 },
  scoreCode: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scoreDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Score bar is inline component, no styles needed

  // Sun row
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CARD_LINE,
  },
  sunItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sunLabel: { fontSize: 9, fontWeight: '700', color: colors.textTertiary, letterSpacing: 2 },
  sunTime: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },

  // Instrument cluster
  instrumentGrid: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: CARD_LINE,
    overflow: 'hidden',
    ...elevation.card,
  },
  instrument: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  instrumentBorder: { borderRightWidth: 1, borderRightColor: CARD_LINE },
  instrumentValue: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  instrumentUnit: { fontSize: 11, color: colors.textTertiary, fontWeight: '500' },
  instrumentSub: { fontSize: 11, fontWeight: '500', color: colors.textSecondary },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
  },
  actionPrimary: {
    flex: 1.15,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  actionPrimaryGrad: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.bg,
    letterSpacing: 0.2,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.borderMid,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.2,
  },

  // Stats cluster
  statsCluster: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  statsDivider: { width: 1, backgroundColor: TEAL_LINE },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },

  // Target species
  targetPanel: {
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  targetLeft: {
    flex: 1,
    padding: 14,
  },
  targetName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  targetCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetCodeChip: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  targetCode: { fontSize: 9, fontWeight: '700', color: colors.primary, letterSpacing: 1.5 },
  targetArrow: { fontSize: 14, color: colors.textTertiary, fontWeight: '300' },
  targetPhoto: { width: 110, height: 110 },

  // Solunar table
  tableRowDivider: { height: 1, backgroundColor: TEAL_LINE, marginHorizontal: 14 },
  solunarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  solunarRowActive: { backgroundColor: 'rgba(0,212,170,0.04)' },
  solunarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 52 },
  solunarQBar: { width: 2, height: 22, borderRadius: 1 },
  livePulse: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 1, shadowRadius: 6, elevation: 4,
    marginLeft: 0,
  },
  solunarQLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  solunarTimeRange: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  solunarDur: { fontSize: 10, color: colors.textTertiary, fontWeight: '600', letterSpacing: 0.5 },

  // Tip
  tipPanel: {
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    padding: 14,
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    fontWeight: '400',
  },

  // Recent
  recentStrip: { gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  recentCard: {
    width: 96,
    backgroundColor: colors.surface2,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    overflow: 'hidden',
  },
  recentPhoto: { width: 96, height: 72 },
  recentBody: { padding: 8, gap: 2 },
  recentSpecies: { fontSize: 10, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
  recentWeight: { fontSize: 10, fontWeight: '600', color: colors.primary, fontVariant: ['tabular-nums'] },
});
