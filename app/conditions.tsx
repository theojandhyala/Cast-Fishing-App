import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from '../store/locationStore';
import { useWeather } from '../hooks/useWeather';
import { useTides } from '../hooks/useTides';
import { useSolunar } from '../hooks/useSolunar';
import { useForecast } from '../hooks/useForecast';
import { colors, radius, spacing, typography, fonts } from '../constants/theme';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

const CHART_WIDTH = Dimensions.get('window').width - 48 - 32;
const CHART_HEIGHT = 100;

interface TideChartProps {
  points: { time: string; height: number; timestamp: number }[];
  min: number;
  max: number;
  currentHour: number;
}

function TideChart({ points, min, max, currentHour }: TideChartProps) {
  if (points.length < 2) return null;

  const w = CHART_WIDTH;
  const h = CHART_HEIGHT;
  const range = max - min || 1;

  const toX = (i: number) => (i / 24) * w;
  const toY = (v: number) => h - ((v - min) / range) * (h - 16) - 4;

  // Build smooth cubic bezier path
  const coords = points.map((p, i) => ({ x: toX(i), y: toY(p.height) }));

  let pathD = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = curr.x - (curr.x - prev.x) / 3;
    const cp2y = curr.y;
    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
  }

  // Area path: close back to bottom
  const areaD =
    pathD +
    ` L ${coords[coords.length - 1].x},${h} L ${coords[0].x},${h} Z`;

  // Current hour vertical line x position (clamped)
  const clampedHour = Math.min(Math.max(currentHour, 0), 24);
  const lineX = toX(clampedHour);
  const currentPoint = points[Math.min(currentHour, points.length - 1)];
  const lineY = currentPoint ? toY(currentPoint.height) : h / 2;

  // Time label positions: 00:00=0, 06:00=6, 12:00=12, 18:00=18, 24:00=24
  const timeLabels = [
    { label: '00:00', x: toX(0) },
    { label: '06:00', x: toX(6) },
    { label: '12:00', x: toX(12) },
    { label: '18:00', x: toX(18) },
    { label: '24:00', x: toX(24) },
  ];

  return (
    <Svg width={w} height={h + 16} viewBox={`0 0 ${w} ${h + 16}`}>
      {/* Filled area under curve */}
      <Path d={areaD} fill="rgba(0,212,170,0.12)" />
      {/* Tide curve */}
      <Path d={pathD} stroke="#00D4AA" strokeWidth={2} fill="none" />
      {/* Current hour vertical line */}
      <Line
        x1={lineX}
        y1={0}
        x2={lineX}
        y2={h}
        stroke="rgba(0,212,170,0.5)"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      {/* Current position circle */}
      <Circle cx={lineX} cy={lineY} r={4} fill="#00D4AA" />
      {/* Time labels */}
      {timeLabels.map(({ label, x }) => (
        <SvgText
          key={label}
          x={x}
          y={h + 13}
          fontSize={9}
          fill={colors.textTertiary}
          fontFamily={fonts.mono}
          textAnchor={label === '00:00' ? 'start' : label === '24:00' ? 'end' : 'middle'}
        >
          {label}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function ConditionsScreen() {
  const router = useRouter();
  const { location } = useLocationStore();
  const locationWithCoords = location as (typeof location & { coords?: { latitude: number; longitude: number } }) | null;
  const coordLat = locationWithCoords?.coords?.latitude;
  const coordLng = locationWithCoords?.coords?.longitude;
  const { weather } = useWeather(location?.query);
  const tideData = useTides(coordLat, coordLng);
  const solunar = useSolunar(coordLat ?? 52.5, coordLng ?? -1.5);
  const forecast = useForecast(coordLat ?? 52.5, coordLng ?? -1.5);

  const w = weather || {
    temp: 18,
    wind: 12,
    windDirection: 315,
    feelsLike: 17,
    pressure: 1014,
    pressureTrend: 'rising' as const,
    moonPhase: 'Waxing Crescent',
    humidity: 72,
    fishingScore: 7,
    city: 'Rocky Point',
    description: 'Partly Cloudy',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerLocation}>
          <MaterialCommunityIcons name="map-marker" size={15} color={colors.primary} />
          <Text style={styles.headerLocationText}>{location?.name || w.city}</Text>
        </View>
        <TouchableOpacity hitSlop={10}>
          <MaterialCommunityIcons name="bookmark-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Current conditions hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroTemp}>{Math.round(w.temp)}<Text style={styles.heroTempUnit}>°C</Text></Text>
              <Text style={styles.heroDesc}>{w.description}</Text>
            </View>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={48} color={colors.secondary} />
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Wind</Text>
              <Text style={styles.heroStatValue}>{w.wind} km/h</Text>
              <Text style={styles.heroStatSub}>NW</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Feels Like</Text>
              <Text style={styles.heroStatValue}>{w.feelsLike ?? w.temp - 1}°C</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Pressure</Text>
              <Text style={styles.heroStatValue}>{w.pressure} hPa</Text>
            </View>
          </View>
        </View>

        {/* Tide */}
        <View style={styles.card}>
          <View style={styles.tideCardHeader}>
            <Text style={styles.cardLabel}>Tide</Text>
            <View style={[
              styles.sourceChip,
              tideData.source === 'uk_ea' && styles.sourceChipLive,
              tideData.source === 'noaa' && styles.sourceChipLive,
              tideData.source === 'computed' && styles.sourceChipEst,
            ]}>
              <Text style={[
                styles.sourceChipText,
                tideData.source === 'computed' && styles.sourceChipTextEst,
              ]}>
                {tideData.source === 'uk_ea'
                  ? 'LIVE · EA'
                  : tideData.source === 'noaa'
                  ? 'LIVE · NOAA'
                  : 'Est.'}
              </Text>
            </View>
          </View>
          {tideData.loading ? (
            <View style={styles.tideSkeleton} />
          ) : (
            <>
              <View style={styles.tideRow}>
                <Text style={styles.tideValue}>
                  {tideData.currentHeight.toFixed(1)}
                  <Text style={styles.tideUnit}>m</Text>
                </Text>
                <View>
                  <Text style={styles.tideTrend}>
                    {tideData.trend === 'rising'
                      ? 'Rising ▲'
                      : tideData.trend === 'falling'
                      ? 'Falling ▼'
                      : 'Slack ~'}
                    {'  '}
                    <Text style={styles.tideTrendRate}>
                      {Math.abs(tideData.trendRate).toFixed(2)}m/hr
                    </Text>
                  </Text>
                  <Text style={styles.tideSub}>
                    High {tideData.nextHigh.time} · {tideData.nextHigh.height.toFixed(1)}m
                  </Text>
                  <Text style={styles.tideSub}>
                    Low {tideData.nextLow.time} · {tideData.nextLow.height.toFixed(1)}m
                  </Text>
                </View>
              </View>
              <TideChart
                points={tideData.points}
                min={tideData.range.min}
                max={tideData.range.max}
                currentHour={new Date().getHours()}
              />
              <Text style={styles.tideStation}>Data: {tideData.stationName}</Text>
            </>
          )}
        </View>

        {/* Solunar */}
        <View style={styles.card}>
          <View style={styles.tideCardHeader}>
            <Text style={styles.cardLabel}>Solunar Activity</Text>
            <Text style={styles.moonPhaseChip}>{solunar.moonPhaseName} · {solunar.moonIllumination}%</Text>
          </View>
          <Text style={styles.solunarValue}>{solunar.score}<Text style={styles.tideUnit}>%</Text></Text>
          <Text style={styles.solunarSub}>{solunar.scoreLabel}</Text>
          <View style={styles.barsWrap}>
            {solunar.hourlyActivity
              .filter((_, i) => i % 3 === 0) // Show every 3rd hour to fit ~8 bars
              .map((v, i) => (
                <View key={i} style={[styles.bar, { height: Math.max(2, (v / 100) * 48) }]} />
              ))}
          </View>
          <View style={styles.curveLabels}>
            <Text style={styles.curveLabel}>00:00</Text>
            <Text style={styles.curveLabel}>06:00</Text>
            <Text style={styles.curveLabel}>12:00</Text>
            <Text style={styles.curveLabel}>18:00</Text>
            <Text style={styles.curveLabel}>24:00</Text>
          </View>
        </View>

        {/* Solunar feeding windows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feeding Windows</Text>
          {solunar.windows.map((win) => (
            <View key={win.time + win.quality} style={[styles.windowCard, win.quality === 'major' && styles.windowCardMajor, win.isActive && styles.windowCardActive]}>
              <View style={[styles.windowDot, { backgroundColor: win.quality === 'major' ? colors.primary : colors.secondary }]} />
              <View style={styles.windowInfo}>
                <Text style={styles.windowTime}>{win.time} – {win.endTime}</Text>
                <Text style={styles.windowLabel}>{win.label}{win.isActive ? '  ● NOW' : win.minutesUntil > 0 ? `  in ${win.minutesUntil}m` : ''}</Text>
              </View>
              <View style={styles.windowRight}>
                <Text style={styles.windowDuration}>{win.duration}</Text>
                <View style={[styles.windowBadge, win.quality === 'major' && styles.windowBadgeMajor]}>
                  <Text style={[styles.windowBadgeText, win.quality === 'major' && { color: colors.primary }]}>
                    {win.quality.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 7-day forecast */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            {forecast.error && <Text style={styles.forecastEstLabel}>Est.</Text>}
          </View>
          {forecast.loading ? (
            <View style={styles.forecastSkeleton} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.forecastRow}>
                {forecast.days.map((day) => {
                  const scoreColor = day.score >= 7 ? colors.primary : day.score >= 5 ? colors.secondary : colors.danger;
                  return (
                    <View key={day.day} style={styles.forecastCard}>
                      <Text style={styles.forecastDay}>{day.day}</Text>
                      <MaterialCommunityIcons name={day.icon as any} size={22} color={colors.textSecondary} />
                      <Text style={styles.forecastHigh}>{day.high}°</Text>
                      <Text style={styles.forecastLow}>{day.low}°</Text>
                      <View style={[styles.forecastScore, { backgroundColor: scoreColor + '22' }]}>
                        <Text style={[styles.forecastScoreText, { color: scoreColor }]}>{day.score}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerLocation: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerLocationText: { ...typography.label, fontSize: 15 },
  content: { padding: spacing.lg, paddingTop: spacing.sm },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  heroTemp: { ...typography.monoLarge, fontSize: 40 },
  heroTempUnit: { fontSize: 18, color: colors.textSecondary, fontFamily: fonts.mono },
  heroDesc: { ...typography.bodySmall, marginTop: 2 },
  heroStatsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  heroStat: { flex: 1, gap: 3 },
  heroStatLabel: { ...typography.caption, fontSize: 10 },
  heroStatValue: { ...typography.label, fontSize: 14 },
  heroStatSub: { ...typography.caption, fontSize: 10, textTransform: 'none', color: colors.textTertiary },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLabel: { ...typography.caption, marginBottom: spacing.sm },
  tideCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sourceChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.18)',
  },
  sourceChipLive: { backgroundColor: 'rgba(0,212,170,0.18)' },
  sourceChipEst: { backgroundColor: 'rgba(255,183,77,0.18)' },
  sourceChipText: { fontSize: 9, fontWeight: '700', color: '#00D4AA', letterSpacing: 0.5 },
  sourceChipTextEst: { color: '#FFB74D' },
  tideRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  tideValue: { ...typography.monoLarge, fontSize: 32 },
  tideUnit: { fontSize: 15, color: colors.textSecondary, fontFamily: fonts.mono },
  tideTrend: { ...typography.label, color: colors.primary, textAlign: 'right', fontSize: 13 },
  tideTrendRate: { fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono },
  tideSub: { ...typography.caption, fontSize: 10, textTransform: 'none', textAlign: 'right', marginTop: 2 },
  tideSkeleton: { height: 116, backgroundColor: colors.surface2, borderRadius: radius.md, marginVertical: spacing.sm },
  tideStation: { fontSize: 9, color: colors.textTertiary, fontFamily: fonts.mono, marginTop: 4 },
  curveLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  curveLabel: { fontSize: 9, color: colors.textTertiary, fontFamily: fonts.mono },

  solunarValue: { ...typography.monoLarge, fontSize: 32 },
  solunarSub: { ...typography.bodySmall, marginBottom: spacing.md },
  barsWrap: { flexDirection: 'row', alignItems: 'flex-end', height: 48, gap: 5 },
  bar: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.xs },

  moonPhaseChip: { fontSize: 10, color: colors.textTertiary, fontFamily: fonts.mono },
  windowCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.1)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  forecastEstLabel: { fontSize: 9, color: '#FFB74D', fontFamily: fonts.mono, fontWeight: '700' },
  forecastSkeleton: { height: 120, backgroundColor: colors.surface2, borderRadius: radius.md },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.caption, marginBottom: spacing.sm },
  windowCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  windowCardMajor: { borderColor: 'rgba(0,212,170,0.3)', backgroundColor: 'rgba(0,212,170,0.06)' },
  windowDot: { width: 8, height: 8, borderRadius: 4 },
  windowInfo: { flex: 1 },
  windowTime: { ...typography.mono, fontSize: 15 },
  windowLabel: { ...typography.caption, fontSize: 10, textTransform: 'none', marginTop: 2 },
  windowRight: { alignItems: 'flex-end', gap: 4 },
  windowDuration: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.mono },
  windowBadge: { backgroundColor: colors.surface2, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  windowBadgeMajor: { backgroundColor: 'rgba(0,212,170,0.15)' },
  windowBadgeText: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 },

  forecastRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.sm },
  forecastCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', width: 72, borderWidth: 1, borderColor: colors.border, gap: 5,
  },
  forecastDay: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  forecastHigh: { ...typography.mono, fontSize: 14 },
  forecastLow: { fontSize: 12, color: colors.textTertiary, fontFamily: fonts.mono },
  forecastScore: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  forecastScoreText: { fontSize: 11, fontWeight: '800' },
});
