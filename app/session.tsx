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
import { colors, radius, spacing, elevation } from '../constants/theme';
import { useSessionStore } from '../store/sessionStore';
import { useCatchStore } from '../store/catchStore';
import { useWeather } from '../hooks/useWeather';

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function SessionScreen() {
  const router = useRouter();
  const { activeSession, addCatchToSession, endSession } = useSessionStore();
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
    if (!activeSession) router.replace('/(tabs)/map' as any);
  }, [activeSession]);

  const elapsedMs = activeSession ? now - new Date(activeSession.startTime).getTime() : 0;

  const sessionCatches = useMemo(
    () => catches.filter((c) => activeSession?.catchIds.includes(c.id)),
    [catches, activeSession]
  );

  if (!activeSession) return null;

  const w = weather ?? { temp: 18, wind: 12, pressure: 1016, description: 'Cloudy' };

  const handleEnd = () => {
    Alert.alert('End Session', `End your session at ${activeSession.spotName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Session', style: 'destructive',
        onPress: () => {
          endSession();
          router.replace('/session-summary' as any);
        },
      },
    ]);
  };

  const handleLogCatch = () => {
    if (!species.trim()) return;
    const w2 = parseFloat(weight) || undefined;
    const newCatch = {
      id: `c_${Date.now()}`,
      species: species.trim(),
      weight: w2 ?? 0,
      location: activeSession.spotName,
      date: new Date().toISOString(),
      bait: bait.trim() || undefined,
      notes: '',
    };
    addCatch(newCatch);
    addCatchToSession(newCatch.id);
    setSpecies(''); setWeight(''); setBait('');
    setLogOpen(false);
  };

  // Build activity timeline
  const startTime = new Date(activeSession.startTime);
  const activity: { time: string; text: string; type: 'start' | 'catch' | 'note' }[] = [
    { time: formatTime(startTime), text: 'Session started', type: 'start' },
    ...sessionCatches.map(c => ({
      time: formatTime(new Date(c.date)),
      text: `Caught: ${c.species}${c.weight ? ` (${c.weight} kg)` : ''}`,
      type: 'catch' as const,
    })),
  ];

  const DOT_COLORS = { start: colors.primary, catch: colors.secondary, note: colors.accentBlue };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header: timer + END SESSION */}
        <View style={s.header}>
          <View>
            <Text style={s.timerLabel}>Session Time</Text>
            <Text style={s.timer}>{formatElapsed(elapsedMs)}</Text>
          </View>
          <TouchableOpacity style={s.endBtn} onPress={handleEnd} activeOpacity={0.85}>
            <Text style={s.endBtnText}>END SESSION</Text>
          </TouchableOpacity>
        </View>

        {/* Spot banner */}
        <View style={s.spotBanner}>
          <View>
            <Text style={s.spotName}>{activeSession.spotName}</Text>
            <Text style={s.spotSub}>{w.description || 'Calm Water'}</Text>
          </View>
          <MaterialCommunityIcons name="waves" size={24} color="rgba(0,212,170,0.3)" />
        </View>

        {/* Weather strip */}
        <View style={s.weatherStrip}>
          <View style={s.weatherItem}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color={colors.textSecondary} />
            <Text style={s.weatherValue}>{w.temp}°C</Text>
            <Text style={s.weatherLabel}>{w.description || 'Cloudy'}</Text>
          </View>
          <View style={s.weatherDivider} />
          <View style={s.weatherItem}>
            <MaterialCommunityIcons name="weather-windy" size={20} color={colors.textSecondary} />
            <Text style={s.weatherValue}>{w.wind} km/h</Text>
            <Text style={s.weatherLabel}>Wind</Text>
          </View>
          <View style={s.weatherDivider} />
          <View style={s.weatherItem}>
            <MaterialCommunityIcons name="gauge" size={20} color={colors.textSecondary} />
            <Text style={s.weatherValue}>{w.pressure} hPa</Text>
            <Text style={s.weatherLabel}>Pressure</Text>
          </View>
        </View>

        {/* 2x2 action grid */}
        <View style={s.actionGrid}>
          {[
            { icon: 'fish', label: 'LOG CATCH', onPress: () => setLogOpen(true) },
            { icon: 'camera-outline', label: 'SCAN FISH', onPress: () => router.push('/identifier' as any) },
            { icon: 'note-plus-outline', label: 'ADD NOTE', onPress: () => {} },
            { icon: 'image-plus', label: 'TAKE PHOTO', onPress: () => {} },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={s.actionBtn} onPress={a.onPress} activeOpacity={0.85}>
              <MaterialCommunityIcons name={a.icon as any} size={26} color={colors.primary} />
              <Text style={s.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Session Activity */}
        <View style={s.activitySection}>
          <Text style={s.activityTitle}>Session Activity</Text>
          {activity.map((item, i) => (
            <View key={i} style={s.activityRow}>
              <View style={[s.activityDot, { backgroundColor: DOT_COLORS[item.type] }]} />
              <Text style={s.activityTime}>{item.time}</Text>
              <Text style={s.activityText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Log Catch Modal */}
      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setLogOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Log a Catch</Text>
            <Text style={s.sheetLabel}>Species</Text>
            <TextInput style={s.sheetInput} placeholder="e.g. Northern Pike" placeholderTextColor={colors.textSecondary} value={species} onChangeText={setSpecies} />
            <Text style={s.sheetLabel}>Weight (kg)</Text>
            <TextInput style={s.sheetInput} placeholder="e.g. 4.2" placeholderTextColor={colors.textSecondary} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            <Text style={s.sheetLabel}>Bait / Lure</Text>
            <TextInput style={s.sheetInput} placeholder="e.g. Deadbait" placeholderTextColor={colors.textSecondary} value={bait} onChangeText={setBait} />
            <TouchableOpacity style={s.saveBtn} onPress={handleLogCatch} activeOpacity={0.85}>
              <Text style={s.saveBtnText}>SAVE CATCH</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  timerLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  timer: { fontSize: 44, fontWeight: '700', color: colors.textPrimary, letterSpacing: -1 },
  endBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1, borderColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 10,
  },
  endBtnText: { fontSize: 11, fontWeight: '800', color: colors.danger, letterSpacing: 0.5 },

  spotBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.surface2, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  spotName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  spotSub: { fontSize: 13, color: colors.textSecondary },

  weatherStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    ...elevation.raised,
  },
  weatherItem: { flex: 1, alignItems: 'center', gap: 3 },
  weatherValue: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  weatherLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  weatherDivider: { width: 1, height: 36, backgroundColor: colors.border },

  actionGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  actionBtn: {
    width: '46%',
    alignItems: 'center', gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
    paddingVertical: spacing.lg,
    ...elevation.raised,
  },
  actionLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },

  activitySection: { paddingHorizontal: spacing.lg },
  activityTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityTime: { fontSize: 12, color: colors.textSecondary, width: 36 },
  activityText: { flex: 1, fontSize: 13, color: colors.textPrimary },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  sheetLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 6, marginTop: spacing.sm },
  sheetInput: {
    backgroundColor: colors.surface2, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    alignItems: 'center', paddingVertical: 15, marginTop: spacing.lg,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A', letterSpacing: 1 },
});
