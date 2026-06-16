import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, fonts, elevation } from '../constants/theme';
import { CastButton } from '../components/ui/CastButton';
import { useSessionStore } from '../store/sessionStore';
import { useCatchStore, Catch } from '../store/catchStore';
import { useWeather } from '../hooks/useWeather';
import { FEEDING_WINDOWS, MONTH_NAMES, SPECIES_ACTIVITY_BY_HOUR } from '../data/fishingTimes';
import { species as SPECIES_LIST } from '../data/species';

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function isInWindow(nowMin: number, range: string) {
  const [startStr, endStr] = range.split('-');
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const start = toMin(startStr);
  const end = toMin(endStr);
  if (end < start) return nowMin >= start || nowMin <= end; // wraps midnight
  return nowMin >= start && nowMin <= end;
}

export default function SessionScreen() {
  const router = useRouter();
  const { activeSession, addCatchToSession, endSession, discardSession } = useSessionStore();
  const { addCatch, catches } = useCatchStore();
  const { weather } = useWeather(activeSession?.spotQuery);
  const [now, setNow] = useState(Date.now());
  const [logOpen, setLogOpen] = useState(false);
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [bait, setBait] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeSession) router.replace('/(tabs)/map');
  }, [activeSession]);

  const elapsedMs = activeSession ? now - new Date(activeSession.startTime).getTime() : 0;

  const sessionCatches = useMemo(
    () => catches.filter((c) => activeSession?.catchIds.includes(c.id)),
    [catches, activeSession]
  );

  const windowInfo = useMemo(() => {
    const d = new Date();
    const monthKey = MONTH_NAMES[d.getMonth()].toLowerCase();
    const months: Record<string, string> = {
      jan: 'january', feb: 'february', mar: 'march', apr: 'april', may: 'may', jun: 'june',
      jul: 'july', aug: 'august', sep: 'september', oct: 'october', nov: 'november', dec: 'december',
    };
    const full = months[monthKey] || 'january';
    const w = (FEEDING_WINDOWS as any)[full];
    const nowMin = d.getHours() * 60 + d.getMinutes();
    const inMajor = w?.major?.some((r: string) => isInWindow(nowMin, r));
    const inMinor = w?.minor?.some((r: string) => isInWindow(nowMin, r));
    return { major: w?.major || [], minor: w?.minor || [], status: inMajor ? 'MAJOR WINDOW' : inMinor ? 'MINOR WINDOW' : 'OFF-PEAK' };
  }, [now]);

  const topSpecies = useMemo(() => {
    const hour = new Date().getHours();
    return Object.entries(SPECIES_ACTIVITY_BY_HOUR)
      .map(([id, arr]) => ({ id, score: arr[hour] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [now]);

  if (!activeSession) return null;

  const handleEnd = () => {
    Alert.alert('End Session', `End your session at ${activeSession.spotName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Session',
        style: 'destructive',
        onPress: () => {
          endSession();
          router.replace('/session-summary');
        },
      },
    ]);
  };

  const handleLogCatch = async () => {
    if (!species.trim() || !weight.trim()) {
      Alert.alert('Missing info', 'Add a species and weight to log this catch.');
      return;
    }
    const newCatch: Catch = await addCatch({
      species: species.trim(),
      weight: parseFloat(weight) || 0,
      bait: bait.trim() || undefined,
      location: activeSession.spotName,
      latitude: activeSession.latitude,
      longitude: activeSession.longitude,
      weather: weather ? { temp: weather.temp, description: weather.description, wind: weather.wind } : undefined,
    });
    addCatchToSession(newCatch.id);
    setSpecies('');
    setWeight('');
    setBait('');
    setLogOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>SESSION ACTIVE</Text>
        </View>
        <TouchableOpacity onPress={handleEnd} style={styles.endBtn}>
          <Text style={styles.endBtnText}>END</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.spotRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.accentBlue} />
          <Text style={styles.spotName}>{activeSession.spotName}</Text>
        </View>

        <View style={styles.timerWrap}>
          <View style={styles.timerGlow} />
          <View style={styles.timerRing}>
            <Text style={styles.timer}>{formatElapsed(elapsedMs)}</Text>
            <Text style={styles.timerCaption}>TIME ON WATER</Text>
          </View>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickAction} onPress={() => setLogOpen(true)} activeOpacity={0.85}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(0,212,170,0.12)' }]}>
              <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Log Catch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/identifier')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(45,212,255,0.12)' }]}>
              <MaterialCommunityIcons name="camera-outline" size={20} color={colors.accentBlue} />
            </View>
            <Text style={styles.quickActionLabel}>Scan Fish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Add Note', 'Note-taking coming soon.')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
              <MaterialCommunityIcons name="note-text-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.quickActionLabel}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleEnd} activeOpacity={0.85}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <MaterialCommunityIcons name="stop-circle-outline" size={20} color={colors.danger} />
            </View>
            <Text style={styles.quickActionLabel}>End Session</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{sessionCatches.length}</Text>
            <Text style={styles.statLabel}>CATCHES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{weather ? `${Math.round(weather.temp)}°` : '--'}</Text>
            <Text style={styles.statLabel}>TEMP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{weather ? weather.fishingScore : '--'}</Text>
            <Text style={styles.statLabel}>SCORE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { fontSize: 13 }]}>{weather?.pressureTrend?.toUpperCase() || '--'}</Text>
            <Text style={styles.statLabel}>PRESSURE</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.windowCard}>
          <View style={styles.windowHead}>
            <Text style={styles.sectionLabel}>FEEDING WINDOW</Text>
            <View
              style={[
                styles.windowBadge,
                windowInfo.status === 'MAJOR WINDOW' && { backgroundColor: colors.primary },
                windowInfo.status === 'MINOR WINDOW' && { backgroundColor: colors.secondary },
              ]}
            >
              <Text
                style={[
                  styles.windowBadgeText,
                  windowInfo.status === 'OFF-PEAK' && { color: colors.textSecondary },
                ]}
              >
                {windowInfo.status}
              </Text>
            </View>
          </View>
          <Text style={styles.windowTimes}>
            Major: {windowInfo.major.join(' · ')}
          </Text>
          <Text style={styles.windowTimes}>
            Minor: {windowInfo.minor.join(' · ')}
          </Text>
        </View>

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionLabel}>ACTIVE NOW</Text>
        <View style={styles.speciesGrid}>
          {topSpecies.map((s) => (
            <View key={s.id} style={styles.speciesChip}>
              <Text style={styles.speciesChipName}>{s.id.toUpperCase()}</Text>
              <Text style={styles.speciesChipScore}>{s.score}/10</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.windowHead}>
          <Text style={styles.sectionLabel}>SESSION TIMELINE</Text>
        </View>
        {sessionCatches.length === 0 ? (
          <View style={styles.emptyTimeline}>
            <MaterialCommunityIcons name="waves" size={18} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No catches logged yet this session.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {sessionCatches.map((c, idx) => {
              const isBest = sessionCatches.every((other) => other.weight <= c.weight) && c.weight > 0;
              return (
                <View key={c.id} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, isBest && styles.timelineDotBest]} />
                    {idx < sessionCatches.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.catchRow}>
                      <Text style={styles.catchSpecies}>{c.species}</Text>
                      <Text style={styles.catchWeight}>{c.weight}kg</Text>
                      <Text style={styles.catchTime}>
                        {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    {isBest && (
                      <View style={styles.bestBadge}>
                        <MaterialCommunityIcons name="trophy-outline" size={11} color={colors.secondary} />
                        <Text style={styles.bestBadgeText}>PERSONAL BEST THIS SESSION</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <CastButton title="Log Catch" onPress={() => setLogOpen(true)} fullWidth size="lg" />
      </View>

      <Modal visible={logOpen} animationType="slide" transparent onRequestClose={() => setLogOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Catch</Text>

            <Text style={styles.fieldLabel}>SPECIES</Text>
            <TextInput
              style={styles.input}
              value={species}
              onChangeText={setSpecies}
              placeholder="e.g. Carp"
              placeholderTextColor={colors.textTertiary}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
              {SPECIES_LIST.slice(0, 8).map((sp) => (
                <TouchableOpacity key={sp.id} style={styles.quickChip} onPress={() => setSpecies(sp.commonName)}>
                  <Text style={styles.quickChipText}>{sp.commonName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>WEIGHT (KG)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="0.0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>BAIT (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              value={bait}
              onChangeText={setBait}
              placeholder="e.g. Boilies"
              placeholderTextColor={colors.textTertiary}
            />

            <View style={styles.modalActions}>
              <CastButton title="Cancel" variant="ghost" onPress={() => setLogOpen(false)} style={{ flex: 1 }} />
              <CastButton title="Save Catch" onPress={handleLogCatch} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  liveLabel: { ...typography.caption, color: colors.primary },
  endBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  endBtnText: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  spotName: { ...typography.h3, fontSize: 16, color: colors.textSecondary },
  timerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  timerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    opacity: 0.12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.glow,
  },
  timer: {
    ...typography.monoLarge,
    fontSize: 40,
    textAlign: 'center',
    color: colors.primary,
  },
  timerCaption: {
    ...typography.caption,
    fontSize: 9,
    marginTop: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.raised,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { ...typography.caption, fontSize: 9.5, textAlign: 'center' },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...elevation.card,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { ...typography.mono, fontSize: 18, fontFamily: fonts.monoBold },
  statLabel: { ...typography.caption, fontSize: 10 },
  sectionDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  sectionLabel: { ...typography.caption },
  windowCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
    backgroundColor: colors.surface,
    ...elevation.card,
  },
  windowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  windowBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: colors.surface2 },
  windowBadgeText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.background, letterSpacing: 0.6 },
  windowTimes: { ...typography.bodySmall, fontFamily: fonts.mono },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  speciesChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  speciesChipName: { ...typography.label, fontSize: 12 },
  speciesChipScore: { ...typography.mono, fontSize: 12, color: colors.primary },
  emptyTimeline: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  emptyText: { ...typography.bodySmall, marginTop: 0 },
  timeline: { marginTop: spacing.xs },
  timelineRow: { flexDirection: 'row' },
  timelineRail: { width: 20, alignItems: 'center' },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 14,
  },
  timelineDotBest: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  timelineLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 4 },
  catchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  catchSpecies: { ...typography.label, flex: 1 },
  catchWeight: { ...typography.mono, fontSize: 13, color: colors.primary },
  catchTime: { ...typography.mono, fontSize: 12, color: colors.textTertiary, marginLeft: spacing.md },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 4,
  },
  bestBadgeText: { fontSize: 9.5, fontFamily: fonts.bodySemi, color: colors.secondary, letterSpacing: 0.6 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, marginBottom: spacing.sm },
  fieldLabel: { ...typography.caption, marginTop: spacing.sm, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  quickRow: { marginTop: spacing.sm, marginBottom: spacing.xs },
  quickChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  quickChipText: { ...typography.bodySmall, fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
