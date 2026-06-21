import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { WATER_CONDITIONS, SPECIES_IDEAL_CONDITIONS } from '../data/waterConditionsData';
import { colors, radius, spacing } from '../constants/theme';

// Temperature gauge: simple arc rendered with View+borderRadius trick
function TempGauge({ temp }: { temp: number }) {
  const min = 0; const max = 30;
  const pct = Math.min(Math.max((temp - min) / (max - min), 0), 1);
  const color = temp < 8 ? '#60A5FA' : temp < 14 ? colors.primary : temp < 22 ? '#10B981' : '#F97316';
  const label = temp < 8 ? 'Very Cold' : temp < 14 ? 'Cool' : temp < 22 ? 'Optimal' : 'Warm';
  return (
    <View style={gaugeStyles.wrap}>
      <View style={gaugeStyles.arcBg}>
        <View style={[gaugeStyles.arcFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[gaugeStyles.tempValue, { color }]}>{temp}°C</Text>
      <Text style={[gaugeStyles.tempLabel, { color }]}>{label}</Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  arcBg: { width: 120, height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' },
  arcFill: { height: '100%', borderRadius: 5 },
  tempValue: { fontSize: 28, fontWeight: '900' },
  tempLabel: { fontSize: 12, fontWeight: '700' },
});

// Mini temperature history chart (7 days) rendered as bars
function TempHistoryChart({ history }: { history: { date: string; temp: number; clarity: string }[] }) {
  const maxTemp = Math.max(...history.map(h => h.temp));
  const minTemp = Math.min(...history.map(h => h.temp));
  const range = maxTemp - minTemp || 1;
  return (
    <View style={chartStyles.wrap}>
      <Text style={chartStyles.title}>7-Day Temperature Trend</Text>
      <View style={chartStyles.bars}>
        {history.map((h, i) => {
          const heightPct = ((h.temp - minTemp) / range) * 60 + 20;
          const color = h.temp < 10 ? '#60A5FA' : h.temp < 18 ? colors.primary : '#F97316';
          return (
            <View key={i} style={chartStyles.barWrap}>
              <Text style={chartStyles.barTemp}>{h.temp}°</Text>
              <View style={chartStyles.barTrack}>
                <View style={[chartStyles.bar, { height: heightPct, backgroundColor: color }]} />
              </View>
              <Text style={chartStyles.barDate}>{h.date.slice(5)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  title: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  barWrap: { flex: 1, alignItems: 'center', gap: 3 },
  barTemp: { fontSize: 9, color: colors.textSecondary },
  barTrack: { flex: 1, width: '70%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '100%', borderRadius: 3, minHeight: 8 },
  barDate: { fontSize: 8, color: colors.textSecondary },
});

const SPECIES_TEMP_ADVICE = [
  { name: 'Carp', icon: 'fish', advice: 'Active above 12°C, peak 18–22°C', min: 12, peak1: 18, peak2: 22 },
  { name: 'Pike', icon: 'fish', advice: 'Active 4–16°C, prefer colder water', min: 4, peak1: 4, peak2: 12 },
  { name: 'Trout', icon: 'fish', advice: 'Peak 8–16°C', min: 8, peak1: 8, peak2: 16 },
  { name: 'Tench', icon: 'fish', advice: 'Active 15–22°C, summer species', min: 15, peak1: 18, peak2: 22 },
  { name: 'Bream', icon: 'fish', advice: 'Active 10–20°C', min: 10, peak1: 14, peak2: 20 },
  { name: 'Perch', icon: 'fish', advice: 'Active year-round, prefer 8–18°C', min: 8, peak1: 10, peak2: 18 },
];

const CLARITY_COLORS: Record<string, string> = { clear: colors.primary, coloured: colors.secondary, murky: '#8B5CF6' };
const CLARITY_ICONS: Record<string, string> = { clear: 'water', coloured: 'water-opacity', murky: 'weather-fog' };
const LEVEL_COLORS: Record<string, string> = { low: '#60A5FA', normal: colors.primary, rising: colors.secondary, high: '#F97316', flood: colors.danger };
const TREND_ICONS: Record<string, string> = { rising: 'arrow-up', falling: 'arrow-down', stable: 'minus' };

export default function WaterConditionsScreen() {
  const [selectedRegion, setSelectedRegion] = useState(WATER_CONDITIONS[0].region);
  const region = WATER_CONDITIONS.find(r => r.region === selectedRegion)!;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Region selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionBar} contentContainerStyle={styles.regionContent}>
          {WATER_CONDITIONS.map(r => (
            <TouchableOpacity key={r.region} style={[styles.regionChip, selectedRegion === r.region && styles.regionChipActive]} onPress={() => setSelectedRegion(r.region)}>
              <Text style={[styles.regionText, selectedRegion === r.region && styles.regionTextActive]}>{r.region}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Algae Alert */}
        {region.algaeAlert && (
          <View style={styles.alertBanner}>
            <MaterialCommunityIcons name="alert" size={18} color={colors.danger} />
            <Text style={styles.alertText}>{region.algaeNote}</Text>
          </View>
        )}

        {/* Temperature Gauge */}
        <View style={styles.section}>
          <TempGauge temp={region.waterTemp} />
        </View>

        {/* Main stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="thermometer" size={20} color="#F97316" />
            <Text style={styles.statValue}>{region.waterTemp}°C</Text>
            <View style={styles.trendRow}>
              <MaterialCommunityIcons name={TREND_ICONS[region.tempTrend] as any} size={12} color={region.tempTrend === 'rising' ? colors.success : region.tempTrend === 'falling' ? colors.danger : colors.textSecondary} />
              <Text style={styles.trendText}>{region.tempTrend}</Text>
            </View>
            <Text style={styles.statLabel}>Water Temp</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name={CLARITY_ICONS[region.clarity] as any} size={20} color={CLARITY_COLORS[region.clarity]} />
            <Text style={[styles.statValue, { color: CLARITY_COLORS[region.clarity] }]}>{region.clarity.charAt(0).toUpperCase() + region.clarity.slice(1)}</Text>
            <Text style={styles.statLabel}>Water Clarity</Text>
          </View>
          {region.algaeAlert ? (
            <View style={[styles.statCard, { borderColor: colors.danger + '44' }]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={colors.danger} />
              <Text style={[styles.statValue, { color: colors.danger, fontSize: 14 }]}>Alert</Text>
              <Text style={styles.statLabel}>Algae Warning</Text>
            </View>
          ) : (
            <View style={[styles.statCard, { borderColor: colors.success + '44' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.success, fontSize: 14 }]}>Clear</Text>
              <Text style={styles.statLabel}>No Algae</Text>
            </View>
          )}
        </View>

        {/* Advice */}
        <View style={styles.section}>
          <View style={styles.adviceCard}>
            <MaterialCommunityIcons name="lightbulb" size={18} color={colors.secondary} />
            <Text style={styles.adviceText}>{region.advice}</Text>
          </View>
        </View>

        {/* River Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>River Levels</Text>
          <View style={styles.card}>
            {region.rivers.map((r, i) => (
              <View key={r.name} style={[styles.riverRow, i < region.rivers.length - 1 && styles.riverBorder]}>
                <MaterialCommunityIcons name="waves" size={16} color={LEVEL_COLORS[r.level]} />
                <Text style={styles.riverName}>{r.name}</Text>
                <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[r.level] + '22' }]}>
                  <Text style={[styles.levelText, { color: LEVEL_COLORS[r.level] }]}>{r.level.charAt(0).toUpperCase() + r.level.slice(1)}</Text>
                </View>
                <Text style={styles.riverChange}>{r.change}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Temp history chart */}
        <View style={styles.section}>
          <TempHistoryChart history={region.history} />
        </View>

        {/* Species temperature advice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature by Species</Text>
          <View style={styles.card}>
            {SPECIES_TEMP_ADVICE.map((s, i) => {
              const isActive = region.waterTemp >= s.min;
              const isPeak = region.waterTemp >= s.peak1 && region.waterTemp <= s.peak2;
              return (
                <View key={s.name} style={[styles.riverRow, i < SPECIES_TEMP_ADVICE.length - 1 && styles.riverBorder]}>
                  <MaterialCommunityIcons name={s.icon as any} size={18} color={colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.riverName}>{s.name}</Text>
                    <Text style={[styles.riverChange, { fontSize: 12 }]}>{s.advice}</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: isPeak ? 'rgba(0,212,170,0.15)' : isActive ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.1)' }]}>
                    <Text style={[styles.levelText, { color: isPeak ? colors.primary : isActive ? colors.secondary : colors.danger }]}>
                      {isPeak ? 'Peak' : isActive ? 'Active' : 'Slow'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 Days (Table)</Text>
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyCol}>Date</Text>
              <Text style={styles.historyCol}>Temp</Text>
              <Text style={styles.historyCol}>Clarity</Text>
            </View>
            {region.history.map((h, i) => (
              <View key={i} style={[styles.historyRow, i < region.history.length - 1 && styles.historyBorder]}>
                <Text style={styles.historyDate}>{h.date}</Text>
                <Text style={styles.historyTemp}>{h.temp}°C</Text>
                <View style={[styles.clarityBadge, { backgroundColor: CLARITY_COLORS[h.clarity] + '22' }]}>
                  <Text style={[styles.clarityText, { color: CLARITY_COLORS[h.clarity] }]}>{h.clarity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Ideal species */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Good for Fishing</Text>
          <View style={styles.speciesGrid}>
            {region.idealFor.map(s => (
              <View key={s} style={styles.idealSpecies}>
                <MaterialCommunityIcons name="fish" size={14} color={colors.success} />
                <Text style={styles.idealText}>{s}</Text>
              </View>
            ))}
            {region.poorFor.map(s => (
              <View key={s} style={[styles.idealSpecies, styles.poorSpecies]}>
                <MaterialCommunityIcons name="fish-off" size={14} color={colors.danger} />
                <Text style={[styles.idealText, { color: colors.danger }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Species ideal conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ideal Conditions by Species</Text>
          {Object.entries(SPECIES_IDEAL_CONDITIONS).map(([species, info]) => (
            <View key={species} style={styles.speciesCard}>
              <Text style={styles.speciesCardName}>{species}</Text>
              <View style={styles.speciesRow}>
                <MaterialCommunityIcons name="thermometer" size={12} color={colors.primary} />
                <Text style={styles.speciesInfo}>{info.temp}</Text>
                <MaterialCommunityIcons name="water" size={12} color="#60A5FA" />
                <Text style={styles.speciesInfo}>{info.clarity}</Text>
              </View>
              <Text style={styles.speciesAdvice}>{info.advice}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  regionBar: { marginTop: spacing.md },
  regionContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  regionChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  regionChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  regionText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  regionTextActive: { color: '#0A0E1A', fontWeight: '700' },
  alertBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', margin: spacing.lg, marginBottom: 0, padding: spacing.md },
  alertText: { fontSize: 13, color: colors.danger, flex: 1, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendText: { fontSize: 10, color: colors.textSecondary },
  statLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  adviceCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', padding: spacing.md },
  adviceText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 19 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  riverRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  riverBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  riverName: { flex: 1, fontSize: 14, color: colors.textPrimary },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  levelText: { fontSize: 11, fontWeight: '700' },
  riverChange: { fontSize: 11, color: colors.textSecondary },
  historyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  historyHeader: { flexDirection: 'row', padding: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface2 },
  historyCol: { flex: 1, fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, paddingHorizontal: spacing.md },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  historyDate: { flex: 1, fontSize: 13, color: colors.textPrimary },
  historyTemp: { flex: 1, fontSize: 13, color: colors.textPrimary },
  clarityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  clarityText: { fontSize: 10, fontWeight: '700' },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  idealSpecies: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  poorSpecies: { backgroundColor: 'rgba(239,68,68,0.08)' },
  idealText: { fontSize: 12, color: colors.success, fontWeight: '500' },
  speciesCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, gap: 4 },
  speciesCardName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  speciesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  speciesInfo: { fontSize: 12, color: colors.textSecondary, marginRight: spacing.sm },
  speciesAdvice: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
