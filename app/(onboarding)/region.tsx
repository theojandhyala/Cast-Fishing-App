import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { colors, fonts, spacing, radius } from '../../constants/theme';

export let pendingRegion = '';
export function setPendingRegion(v: string) { pendingRegion = v; }

const REGIONS = [
  { id: 'UK', label: 'UK & Ireland', color: '#1D4ED8' },
  { id: 'EU', label: 'Europe', color: '#7C3AED' },
  { id: 'NA', label: 'North America', color: '#B45309' },
  { id: 'AUS', label: 'Australia & NZ', color: '#047857' },
  { id: 'ZA', label: 'South Africa', color: '#DC2626' },
  { id: 'JP', label: 'Japan', color: '#DB2777' },
  { id: 'ASIA', label: 'South / SE Asia', color: '#D97706' },
  { id: 'SA', label: 'South America', color: '#059669' },
  { id: 'WW', label: 'Worldwide / Other', color: '#6B7280' },
];

export default function RegionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    setPendingRegion(selected);
    router.push('/(onboarding)/species');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Icon name="arrow-left" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.step}>Step 3 of 4</Text>
        <Text style={styles.title}>Where do you fish?</Text>
        <Text style={styles.subtitle}>
          We'll personalise species, spots, and conditions for your region.
        </Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {REGIONS.map((r) => {
              const isSelected = selected === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelected(r.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    isSelected && { borderColor: r.color, backgroundColor: r.color + '22' },
                  ]}
                >
                  <View style={[styles.chipDot, { backgroundColor: r.color }]} />
                  <Icon name="map-marker" size={14} color={isSelected ? r.color : colors.textSecondary} />
                  <Text style={[styles.chipText, isSelected && { color: r.color, fontFamily: fonts.bodySemi }]}>
                    {r.label}
                  </Text>
                  {isSelected && (
                    <Icon name="check" size={14} color={r.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Next */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={[styles.btn, !selected && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>Next</Text>
          <Icon name="arrow-right" size={18} color="#0A0E1A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: 40 },
  back: { marginTop: spacing.md, marginBottom: spacing.lg },
  step: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  scroll: { flex: 1, marginBottom: spacing.md },
  grid: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#0A0E1A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
