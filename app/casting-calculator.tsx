import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../constants/theme';

const LINE_WEIGHTS = [6, 8, 10, 12, 15, 17, 20, 25];

const SETUP_RECOMMENDATIONS = [
  {
    range: '< 40m',
    rod: '10ft 2.75lb TC',
    line: '8-10lb',
    lead: '25-40g',
    tip: 'Great for margin and close-range presentations.',
  },
  {
    range: '40–70m',
    rod: '12ft 3lb TC',
    line: '12-15lb',
    lead: '50-68g',
    tip: 'Standard carp rod setup for most day-ticket lakes.',
  },
  {
    range: '70–100m',
    rod: '12ft 3.25–3.5lb TC',
    line: '15lb',
    lead: '80-100g',
    tip: 'Use a tapered leader and tight braided main line for best results.',
  },
  {
    range: '> 100m',
    rod: '13ft 3.5lb TC',
    line: '15lb + braid',
    lead: '100-120g',
    tip: 'Distance casting rod, shock leader essential. Helicopter or lead clip rig.',
  },
];

const TIPS = [
  { icon: 'arrow-up-circle', text: 'Aim for a 45° launch angle for maximum distance.' },
  { icon: 'weather-windy', text: 'Cast with the wind, never into it — it can add 20m+.' },
  { icon: 'sync', text: 'Smooth acceleration through the cast — power at the top.' },
  { icon: 'weight', text: 'Heavier leads increase distance up to a point — don\'t overdo it.' },
  { icon: 'rope', text: 'Low-diameter line (0.28mm or below) reduces air resistance dramatically.' },
  { icon: 'fish', text: 'Practice your clip distance before attaching a rig to save time.' },
];

function calculateDistance(rodLength: number, lineWeight: number, leadGrams: number, windSpeed: number): { calm: number; wind: number } {
  // Base distance from lead weight
  let base = 20 + leadGrams * 0.9;

  // Adjust for rod length (3m = base, 4.5m = +15%)
  const rodMult = 1 + ((rodLength - 3) / 1.5) * 0.15;
  base *= rodMult;

  // Adjust for line weight (lighter line = more distance, up to a point)
  const lineMult = lineWeight <= 10 ? 1.08 : lineWeight <= 15 ? 1.0 : 0.93;
  base *= lineMult;

  const calm = Math.round(Math.min(base, 160));
  const windEffect = windSpeed * 0.5;
  const withWind = Math.round(Math.max(calm - windEffect, 20));

  return { calm, wind: withWind };
}

export default function CastingCalculatorScreen() {
  const [rodLength, setRodLength] = useState(3.65);
  const [lineWeight, setLineWeight] = useState(15);
  const [leadWeight, setLeadWeight] = useState(56);
  const [windSpeed, setWindSpeed] = useState(0);
  const [windText, setWindText] = useState('0');
  const [result, setResult] = useState<{ calm: number; wind: number } | null>(null);

  const rodSteps = [3.0, 3.25, 3.5, 3.65, 3.9, 4.0, 4.2, 4.5];
  const leadSteps = [10, 20, 28, 40, 50, 56, 68, 80, 100, 120];

  const handleCalculate = () => {
    setResult(calculateDistance(rodLength, lineWeight, leadWeight, windSpeed));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(96,165,250,0.12)', 'transparent']} style={styles.hero}>
          <MaterialCommunityIcons name="target" size={40} color="#60A5FA" />
          <Text style={styles.heroTitle}>Casting Calculator</Text>
          <Text style={styles.heroSub}>Estimate your maximum casting distance</Text>
        </LinearGradient>

        <View style={styles.section}>
          {/* Rod length */}
          <Text style={styles.sectionTitle}>ROD LENGTH</Text>
          <View style={styles.card}>
            <View style={styles.stepsRow}>
              {rodSteps.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.step, rodLength === v && styles.stepActive]}
                  onPress={() => setRodLength(v)}
                >
                  <Text style={[styles.stepText, rodLength === v && styles.stepTextActive]}>{v}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Line weight */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>LINE WEIGHT</Text>
          <View style={styles.card}>
            <View style={styles.stepsRow}>
              {LINE_WEIGHTS.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.step, lineWeight === v && styles.stepActive]}
                  onPress={() => setLineWeight(v)}
                >
                  <Text style={[styles.stepText, lineWeight === v && styles.stepTextActive]}>{v}lb</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lead weight */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>LEAD / SINKER WEIGHT</Text>
          <View style={styles.card}>
            <View style={styles.stepsRow}>
              {leadSteps.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.step, leadWeight === v && styles.stepActive]}
                  onPress={() => setLeadWeight(v)}
                >
                  <Text style={[styles.stepText, leadWeight === v && styles.stepTextActive]}>{v}g</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wind speed */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>WIND SPEED (km/h)</Text>
          <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: spacing.md }]}>
            <MaterialCommunityIcons name="weather-windy" size={22} color="#60A5FA" />
            <TextInput
              style={styles.windInput}
              keyboardType="numeric"
              value={windText}
              onChangeText={t => {
                setWindText(t);
                const n = parseFloat(t);
                if (!isNaN(n)) setWindSpeed(n);
              }}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.windUnit}>km/h</Text>
          </View>

          {/* Calculate button */}
          <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
            <MaterialCommunityIcons name="calculator" size={20} color="#0A0E1A" />
            <Text style={styles.calcBtnText}>Calculate Distance</Text>
          </TouchableOpacity>

          {/* Result */}
          {result && (
            <LinearGradient colors={['rgba(96,165,250,0.15)', 'rgba(0,212,170,0.08)']} style={styles.resultCard}>
              <Text style={styles.resultTitle}>Estimated Distance</Text>
              <View style={styles.resultRow}>
                <View style={styles.resultBox}>
                  <Text style={styles.resultValue}>{result.calm}m</Text>
                  <Text style={styles.resultLabel}>Calm conditions</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultBox}>
                  <Text style={[styles.resultValue, { color: windSpeed > 0 ? '#F97316' : colors.textPrimary }]}>{result.wind}m</Text>
                  <Text style={styles.resultLabel}>In {windSpeed}km/h wind</Text>
                </View>
              </View>
              <Text style={styles.resultNote}>Estimates are indicative. Actual distance depends on casting technique and conditions.</Text>
            </LinearGradient>
          )}
        </View>

        {/* Recommended setups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECOMMENDED SETUPS</Text>
          {SETUP_RECOMMENDATIONS.map(s => (
            <View key={s.range} style={styles.setupCard}>
              <Text style={styles.setupRange}>{s.range}</Text>
              <View style={styles.setupMeta}>
                <View style={styles.setupItem}>
                  <Text style={styles.setupLabel}>Rod</Text>
                  <Text style={styles.setupValue}>{s.rod}</Text>
                </View>
                <View style={styles.setupItem}>
                  <Text style={styles.setupLabel}>Line</Text>
                  <Text style={styles.setupValue}>{s.line}</Text>
                </View>
                <View style={styles.setupItem}>
                  <Text style={styles.setupLabel}>Lead</Text>
                  <Text style={styles.setupValue}>{s.lead}</Text>
                </View>
              </View>
              <Text style={styles.setupTip}>{s.tip}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CASTING TIPS</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <MaterialCommunityIcons name={tip.icon as any} size={18} color="#60A5FA" />
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm },
  heroSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  step: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.surface2, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  stepActive: { backgroundColor: '#60A5FA', borderColor: '#60A5FA' },
  stepText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  stepTextActive: { color: '#0A0E1A', fontWeight: '700' },
  windInput: { flex: 1, fontSize: 22, fontWeight: '800', color: colors.textPrimary, padding: 0 },
  windUnit: { fontSize: 14, color: colors.textSecondary },
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 14, marginTop: spacing.md },
  calcBtnText: { fontSize: 17, fontWeight: '800', color: '#0A0E1A' },
  resultCard: { borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: 'rgba(96,165,250,0.3)' },
  resultTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md, textAlign: 'center' },
  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  resultBox: { flex: 1, alignItems: 'center' },
  resultValue: { fontSize: 42, fontWeight: '900', color: colors.textPrimary },
  resultLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  resultDivider: { width: 1, height: 60, backgroundColor: colors.border },
  resultNote: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  setupCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  setupRange: { fontSize: 16, fontWeight: '800', color: colors.primary },
  setupMeta: { flexDirection: 'row', gap: spacing.md },
  setupItem: { flex: 1 },
  setupLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  setupValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  setupTip: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  tipIcon: { width: 36, height: 36, backgroundColor: 'rgba(96,165,250,0.1)', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, paddingTop: spacing.xs },
});
