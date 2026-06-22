import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { colors, radius, spacing, typography, fonts } from '../constants/theme';
import { CastButton } from '../components/ui/CastButton';
import { useSessionStore } from '../store/sessionStore';
import { useCatchStore } from '../store/catchStore';

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}H ${m}M`;
  return `${m}M`;
}

export default function SessionSummaryScreen() {
  const router = useRouter();
  const { lastSummary, clearSummary } = useSessionStore();
  const { catches } = useCatchStore();

  const sessionCatches = useMemo(
    () => (lastSummary ? catches.filter((c) => lastSummary.catchIds.includes(c.id)) : []),
    [catches, lastSummary]
  );

  const totalWeight = sessionCatches.reduce((sum, c) => sum + c.weight, 0);
  const speciesCount = new Set(sessionCatches.map((c) => c.species)).size;
  const durationMs = lastSummary
    ? new Date(lastSummary.endTime).getTime() - new Date(lastSummary.startTime).getTime()
    : 0;

  const handleClose = () => {
    clearSummary();
    router.replace('/(tabs)/map');
  };

  if (!lastSummary) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={typography.body}>No session recap available.</Text>
          <CastButton title="Back to Spots" onPress={handleClose} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>SESSION COMPLETE</Text>
        <Text style={styles.spotName}>{lastSummary.spotName}</Text>
        <Text style={styles.duration}>{formatDuration(durationMs)}</Text>

        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{sessionCatches.length}</Text>
            <Text style={styles.statLabel}>CATCHES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{speciesCount}</Text>
            <Text style={styles.statLabel}>SPECIES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{totalWeight.toFixed(1)}</Text>
            <Text style={styles.statLabel}>KG TOTAL</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <Text style={styles.label}>CATCH LOG</Text>
        {sessionCatches.length === 0 ? (
          <Text style={styles.emptyText}>No catches logged this session — back out there.</Text>
        ) : (
          sessionCatches.map((c) => (
            <View key={c.id} style={styles.catchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.catchSpecies}>{c.species}</Text>
                {c.bait && <Text style={styles.catchBait}>{c.bait}</Text>}
              </View>
              <Text style={styles.catchWeight}>{c.weight}kg</Text>
              <Text style={styles.catchTime}>
                {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <CastButton title="Done" onPress={handleClose} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...typography.caption, textAlign: 'center' },
  spotName: { ...typography.h1, textAlign: 'center', marginTop: spacing.sm },
  duration: { ...typography.mono, fontFamily: fonts.monoBold, fontSize: 18, color: colors.primary, textAlign: 'center', marginTop: 4 },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { ...typography.monoLarge, fontSize: 26 },
  statLabel: { ...typography.caption, fontSize: 10 },
  sectionDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },
  emptyText: { ...typography.bodySmall, marginTop: spacing.sm },
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  catchSpecies: { ...typography.label },
  catchBait: { ...typography.caption, fontSize: 10, marginTop: 2 },
  catchWeight: { ...typography.mono, fontSize: 13, color: colors.primary, marginRight: spacing.md },
  catchTime: { ...typography.mono, fontSize: 12, color: colors.textTertiary },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
