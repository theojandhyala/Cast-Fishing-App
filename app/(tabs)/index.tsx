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
import { colors, spacing, radius } from '../../constants/theme';
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

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.brandLabel}>CAST</Text>
            <Text style={s.locationLabel}>
              <Text style={s.locDot}>◈ </Text>
              {location ? 'GPS LOCKED' : 'GOLD COAST, QLD'}
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.dateLabel}>{dateStr}</Text>
            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => router.push('/notifications' as any)}
              activeOpacity={0.75}
              accessibilityLabel="Notifications"
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── INTEL PANEL ────────────────────────────────────────────────── */}
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <Text style={s.panelLabel}>FISHING INTEL</Text>
            {nextWindowStr && (
              <View style={s.primeBadge}>
                <View style={[s.primeIndicator, { backgroundColor: sigColor }]} />
                <Text style={[s.primeBadgeText, { color: sigColor }]}>PRIME {nextWindowStr}</Text>
              </View>
            )}
          </View>
          <View style={s.panelDivider} />

          {/* Score readout */}
          <View style={s.scoreBlock}>
            <View style={s.scoreLeft}>
              <Text style={[s.scoreNum, { color: sigColor }]}>{score}</Text>
              <Text style={s.scoreSlash}>/100</Text>
            </View>
            <View style={s.scoreRight}>
              <Text style={[s.scoreCode, { color: sigColor }]}>{scoreCode(score)}</Text>
              <Text style={s.scoreDesc}>
                {score >= 80 ? 'Excellent Conditions' : score >= 60 ? 'Good Conditions' : score >= 40 ? 'Fair Conditions' : 'Tough Conditions'}
              </Text>
            </View>
          </View>
          <ScoreBar score={score} color={sigColor} />

          <View style={s.panelDivider} />

          {/* Sun row */}
          <View style={s.sunRow}>
            <View style={s.sunItem}>
              <Text style={s.sunLabel}>SUNRISE</Text>
              <Text style={s.sunTime}>{sunTimes?.sunrise ?? '05:44A'}</Text>
            </View>
            <Svg width={100} height={24} style={{ marginTop: 2 }}>
              <Path d="M 6 20 Q 50 4 94 20" stroke={colors.accent} strokeWidth={1} fill="none" strokeDasharray="3 2" opacity={0.5} />
              <Circle cx={50} cy={6} r={3} fill={colors.accent} opacity={0.8} />
            </Svg>
            <View style={[s.sunItem, { alignItems: 'flex-end' }]}>
              <Text style={s.sunLabel}>SUNSET</Text>
              <Text style={s.sunTime}>{sunTimes?.sunset ?? '08:22P'}</Text>
            </View>
          </View>
        </View>

        {/* ── INSTRUMENT CLUSTER ─────────────────────────────────────────── */}
        <View style={s.instrumentGrid}>
          {[
            { label: 'WIND', value: weather ? `${weather.wind}` : '22', unit: 'KM/H', sub: windDir },
            { label: 'TEMP', value: weather ? `${weather.temp}` : '15', unit: '°C', sub: 'AIR' },
            { label: 'PRES', value: weather ? `${weather.pressure}` : '1007', unit: 'HPA', sub: 'STEADY' },
            { label: 'MOON', value: moonAbbr(solunar?.moonPhaseName ?? 'Waxing Gibbous'), unit: '', sub: `${solunar?.moonIllumination ?? 68}%` },
          ].map((item) => (
            <View key={item.label} style={s.instrument}>
              <Text style={s.instrumentLabel}>{item.label}</Text>
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
            activeOpacity={0.82}
            accessibilityLabel="Start Session"
          >
            <MaterialCommunityIcons name="play-circle-outline" size={18} color={colors.bg} />
            <Text style={s.actionPrimaryText}>START SESSION</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionSecondary}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.82}
            accessibilityLabel="Scan Fish"
          >
            <MaterialCommunityIcons name="camera-outline" size={18} color={colors.primary} />
            <Text style={s.actionSecondaryText}>SCAN FISH</Text>
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
const PANEL_RADIUS = radius.sm; // 8 — bezel feel

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
  brandLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  locDot: { color: colors.primary },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  notifBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Panels — the base unit
  panel: {
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  panelLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 2,
  },
  panelMeta: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  panelDivider: {
    height: 1,
    backgroundColor: TEAL_LINE,
  },
  viewAll: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
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

  // Score block
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  scoreLeft: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  scoreNum: {
    fontSize: 80,
    fontWeight: '700',
    lineHeight: 80,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
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
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sunItem: { gap: 2 },
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
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    overflow: 'hidden',
  },
  instrument: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
    borderRightWidth: 1,
    borderRightColor: TEAL_LINE,
  },
  instrumentLabel: { fontSize: 8, fontWeight: '700', color: colors.textTertiary, letterSpacing: 2 },
  instrumentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  instrumentUnit: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },
  instrumentSub: { fontSize: 9, fontWeight: '600', color: colors.textTertiary, letterSpacing: 1 },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: PANEL_RADIUS,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  actionPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.bg,
    letterSpacing: 2,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  actionSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
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
