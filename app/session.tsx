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
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { colors, radius, spacing, elevation } from '../constants/theme';
import { useSessionStore } from '../store/sessionStore';
import { useCatchStore } from '../store/catchStore';
import { useWeather } from '../hooks/useWeather';

const { width } = Dimensions.get('window');

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

// Fake bar chart data (hourly activity)
const BAR_DATA = [
  0.15, 0.1, 0.08, 0.12, 0.2, 0.35,
  0.55, 0.7, 0.85, 0.65, 0.5, 0.45,
  0.4, 0.38, 0.42, 0.5, 0.75, 0.95,
  0.88, 0.6, 0.35, 0.25, 0.18, 0.12,
];
const BAR_LABELS = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM'];

function getBarColor(v: number): string {
  if (v >= 0.75) return '#00D4AA';
  if (v >= 0.5) return '#00A882';
  if (v >= 0.3) return '#F59E0B';
  return '#4B5566';
}

export default function SessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSession, addCatchToSession, endSession, sessionHistory } = useSessionStore();
  const { addCatch, catches } = useCatchStore();
  const { weather } = useWeather(activeSession?.latitude, activeSession?.longitude);
  const [now, setNow] = useState(Date.now());
  const [logOpen, setLogOpen] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [bait, setBait] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedMs = activeSession ? now - new Date(activeSession.startTime).getTime() : 0;

  const sessionCatches = useMemo(
    () => catches.filter((c) => activeSession?.catchIds.includes(c.id)),
    [catches, activeSession]
  );

  const w = weather ?? { temp: 18, wind: 12, pressure: 1016, description: 'Partly Cloudy' };
  const spotName = activeSession?.spotName || 'Rocky Point';

  const handleEnd = () => setEndConfirmOpen(true);
  const confirmEnd = () => {
    setEndConfirmOpen(false);
    endSession();
    router.replace('/session-summary' as any);
  };

  const handleLogCatch = async () => {
    if (!species.trim()) return;
    const newCatch = {
      species: species.trim(),
      weight: parseFloat(weight) || 0,
      location: spotName,
      bait: bait.trim() || undefined,
      notes: '',
    };
    const result = await addCatch(newCatch as any);
    addCatchToSession(result.id);
    setSpecies(''); setWeight(''); setBait('');
    setLogOpen(false);
  };

  const startTime = activeSession ? new Date(activeSession.startTime) : new Date();

  const activity = [
    { time: formatTime(startTime), text: 'Session started', type: 'start' as const },
    ...(weather ? [{ time: formatTime(new Date(startTime.getTime() + 32 * 60000)), text: `Weather update: ${w.description}, ${w.temp}°C`, type: 'note' as const }] : []),
    ...sessionCatches.map(c => ({
      time: formatTime(new Date(c.date)),
      text: `Caught ${c.species}${c.weight ? ` (${c.weight} kg)` : ''}`,
      type: 'catch' as const,
    })),
  ];

  const DOT_COLORS = { start: colors.primary, catch: colors.secondary, note: colors.accentBlue };

  if (!activeSession) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <LinearGradient colors={['#0A1E2E', '#051015']} style={s.noSessionHero}>
            <MaterialCommunityIcons name="fish" size={48} color="rgba(0,212,170,0.3)" />
            <Text style={s.noSessionTitle}>No Active Session</Text>
            <Text style={s.noSessionSub}>Start fishing to track your session</Text>
            <TouchableOpacity
              style={s.noSessionBtn}
              onPress={() => router.push('/(tabs)/map' as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#00D4AA', '#00B891']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.noSessionBtnGrad}>
                <MaterialCommunityIcons name="fish" size={18} color="#051410" />
                <Text style={s.noSessionBtnText}>FIND A SPOT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          {sessionHistory.length > 0 && (
            <View style={s.historySection}>
              <Text style={s.historyTitle}>PAST SESSIONS</Text>
              {sessionHistory.map((sess, i) => {
                const start = new Date(sess.startTime);
                const end = new Date(sess.endTime);
                const durMs = end.getTime() - start.getTime();
                const durH = Math.floor(durMs / 3600000);
                const durM = Math.floor((durMs % 3600000) / 60000);
                const durStr = durH > 0 ? `${durH}h ${durM}m` : `${durM}m`;
                const dateStr = start.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <View key={i} style={[s.historyRow, i > 0 && s.historyRowBorder]}>
                    <View style={s.historyIcon}>
                      <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={s.historyBody}>
                      <Text style={s.historySpot}>{sess.spotName}</Text>
                      <Text style={s.historyMeta}>{dateStr} · {durStr}</Text>
                    </View>
                    <View style={s.historyCatches}>
                      <MaterialCommunityIcons name="fish" size={12} color={colors.textSecondary} />
                      <Text style={s.historyCatchCount}>{sess.catchIds.length}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ─── HERO ─── */}
        <LinearGradient colors={['#0A1E2E', '#061318', '#04090E']} style={[s.hero, { paddingTop: insets.top }]}>
          {/* Nav bar */}
          <View style={s.heroNav}>
            <TouchableOpacity style={s.heroNavBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={s.heroNavCenter}>
              <MaterialCommunityIcons name="map-marker" size={13} color={colors.primary} />
              <Text style={s.heroNavName}>{spotName}</Text>
            </View>
            <View style={s.heroNavRight}>
              <TouchableOpacity style={s.heroNavBtn}>
                <MaterialCommunityIcons name="share-variant-outline" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              <TouchableOpacity style={s.heroNavBtn} onPress={() => setSaved(v => !v)}>
                <MaterialCommunityIcons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? colors.secondary : 'rgba(255,255,255,0.7)'} />
              </TouchableOpacity>
              <TouchableOpacity style={s.heroNavBtn}>
                <MaterialCommunityIcons name="dots-horizontal" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={s.heroSubtitle}>Coastal · Saltwater</Text>

          {/* Timer + Conditions panel */}
          <View style={s.heroBody}>
            {/* Left: SESSION ACTIVE + timer + end */}
            <View style={s.timerCol}>
              <View style={s.sessionActivePill}>
                <View style={s.activeDot} />
                <Text style={s.sessionActiveText}>SESSION ACTIVE</Text>
              </View>
              <Text style={s.timerText}>{formatElapsed(elapsedMs)}</Text>
              <Text style={s.timerLabel}>Session Time</Text>
              <TouchableOpacity style={s.endBtn} onPress={handleEnd} activeOpacity={0.85}>
                <MaterialCommunityIcons name="stop-circle-outline" size={14} color={colors.danger} />
                <Text style={s.endBtnText}>End Session</Text>
              </TouchableOpacity>
            </View>

            {/* Right: Conditions card */}
            <View style={s.condCard}>
              <View style={s.condHeader}>
                <Text style={s.condTitle}>CONDITIONS</Text>
                <TouchableOpacity onPress={() => router.push('/conditions' as any)}>
                  <Text style={s.condViewAll}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={s.condGrid}>
                {[
                  { icon: 'thermometer', val: `${w.temp}°C`, label: w.description },
                  { icon: 'weather-windy', val: `${w.wind} km/h`, label: 'NW Wind' },
                  { icon: 'waves', val: '1.2 m', label: 'Rising Tide' },
                  { icon: 'gauge', val: `${w.pressure} hPa`, label: 'Pressure' },
                  { icon: 'water-percent', val: '85%', label: 'Humidity' },
                  { icon: 'arrow-expand-vertical', val: '8–15 m', label: 'Depth' },
                ].map((item, i) => (
                  <View key={i} style={s.condItem}>
                    <View style={s.condItemTop}>
                      <MaterialCommunityIcons name={item.icon as any} size={10} color={colors.primary} />
                      <Text style={s.condValue}>{item.val}</Text>
                    </View>
                    <Text style={s.condLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ─── BEST FISHING TIMES + FISH ACTIVITY ─── */}
        <View style={s.twoColRow}>
          {/* Best Fishing Times */}
          <View style={[s.card, { flex: 1.55 }]}>
            <View style={s.cardHeaderRow}>
              <Text style={s.cardTitle}>BEST FISHING TIMES</Text>
              <MaterialCommunityIcons name="information-outline" size={14} color={colors.textTertiary} />
            </View>
            <View style={s.starsRow}>
              <Text style={s.starsLabel}>Today</Text>
              <View style={s.stars}>
                {[1,2,3,4,5].map(i => (
                  <MaterialCommunityIcons key={i} name={i <= 4 ? 'star' : 'star-half-full'} size={12} color={colors.secondary} />
                ))}
              </View>
            </View>
            <View style={[s.starsRow, { marginBottom: 10 }]}>
              <Text style={s.starsLabel}>Tomorrow</Text>
              <View style={s.stars}>
                {[1,2,3,4,5].map(i => (
                  <MaterialCommunityIcons key={i} name={i <= 4 ? 'star' : 'star-outline'} size={12} color={colors.secondary} />
                ))}
              </View>
            </View>
            {/* Bar chart */}
            <View style={s.barChart}>
              {BAR_DATA.map((v, i) => (
                <View key={i} style={s.barWrap}>
                  <View style={[s.bar, { height: Math.max(4, v * 48), backgroundColor: getBarColor(v) }]} />
                </View>
              ))}
            </View>
            <View style={s.barLabels}>
              {BAR_LABELS.map((l, i) => (
                <Text key={i} style={s.barLabel}>{l}</Text>
              ))}
            </View>
            {/* Legend */}
            <View style={s.legendRow}>
              {[
                { color: '#00D4AA', label: 'Best' },
                { color: '#00A882', label: 'Good' },
                { color: '#F59E0B', label: 'Fair' },
                { color: '#4B5566', label: 'Poor' },
              ].map(l => (
                <View key={l.label} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: l.color }]} />
                  <Text style={s.legendText}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Fish Activity */}
          <View style={[s.card, { flex: 1 }]}>
            <View style={s.cardHeaderRow}>
              <Text style={s.cardTitle}>FISH ACTIVITY</Text>
              <MaterialCommunityIcons name="information-outline" size={14} color={colors.textTertiary} />
            </View>
            {/* Ring */}
            <View style={s.ringContainer}>
              <View style={s.ringOuter}>
                <View style={s.ringInner}>
                  <Text style={s.ringPct}>78%</Text>
                  <Text style={s.ringLabel}>High</Text>
                </View>
              </View>
            </View>
            {/* Major times */}
            <Text style={s.majorTimesTitle}>MAJOR TIMES</Text>
            {[
              '6:30 AM – 9:30 AM',
              '5:20 PM – 8:20 PM',
            ].map(t => (
              <View key={t} style={s.majorTimeRow}>
                <Text style={s.majorTimeText}>{t}</Text>
                <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
              </View>
            ))}
          </View>
        </View>

        {/* ─── QUICK ACTIONS ─── */}
        <View style={s.actionsSection}>
          <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
          <View style={s.actionsGrid}>
            {[
              { icon: 'fish-plus', label: 'Log a Catch', onPress: () => setLogOpen(true) },
              { icon: 'magnify-scan', label: 'Scan a Fish', onPress: () => router.push('/identifier' as any) },
              { icon: 'note-plus-outline', label: 'Add Note', onPress: () => {} },
              { icon: 'camera-outline', label: 'Take Photo', onPress: () => {} },
            ].map(a => (
              <TouchableOpacity key={a.label} style={s.actionBtn} onPress={a.onPress} activeOpacity={0.85}>
                <MaterialCommunityIcons name={a.icon as any} size={28} color={colors.primary} />
                <Text style={s.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── RECENT CATCHES + TIDE ─── */}
        <View style={s.twoColRow}>
          {/* Recent Catches */}
          <View style={[s.card, { flex: 1.4 }]}>
            <View style={s.cardHeaderRow}>
              <Text style={s.cardTitle}>RECENT CATCHES</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)}>
                <Text style={s.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {sessionCatches.length === 0 ? (
              <>
                {/* Demo catches when no real ones */}
                {[
                  { name: 'European Sea Bass', meta: '72 cm · 4.2 kg', time: '7:15 AM' },
                  { name: 'Bluefin Tuna', meta: '112 cm · 18.7 kg', time: 'Yesterday' },
                  { name: 'Mackerel', meta: '51 cm · 2.1 kg', time: 'Yesterday' },
                ].map(c => (
                  <View key={c.name} style={s.miniCatch}>
                    <LinearGradient colors={['#132035', '#0a1525']} style={s.miniCatchPhoto}>
                      <MaterialCommunityIcons name="fish" size={14} color="rgba(0,212,170,0.4)" />
                      <View style={s.miniCatchBookmark}>
                        <MaterialCommunityIcons name="bookmark-outline" size={10} color="rgba(255,255,255,0.5)" />
                      </View>
                    </LinearGradient>
                    <Text style={s.miniCatchName} numberOfLines={1}>{c.name}</Text>
                    <Text style={s.miniCatchMeta}>{c.meta}</Text>
                    <Text style={s.miniCatchTime}>{c.time}</Text>
                  </View>
                ))}
              </>
            ) : sessionCatches.slice(0, 3).map(c => (
              <View key={c.id} style={s.miniCatch}>
                <LinearGradient colors={['#1a3a2a', '#0d1f16']} style={s.miniCatchPhoto}>
                  <MaterialCommunityIcons name="fish" size={14} color="rgba(0,212,170,0.4)" />
                </LinearGradient>
                <Text style={s.miniCatchName} numberOfLines={1}>{c.species}</Text>
                <Text style={s.miniCatchMeta}>{c.weight ? `${c.weight} kg` : ''}</Text>
                <Text style={s.miniCatchTime}>{formatTime(new Date(c.date))}</Text>
              </View>
            ))}
          </View>

          {/* Tide */}
          <View style={[s.card, { flex: 1 }]}>
            <Text style={s.cardTitle}>TIDE</Text>
            <Text style={s.tideHeight}>1.2 m</Text>
            <Text style={s.tideStatus}>Rising</Text>
            <View style={s.tideTimesRow}>
              <View>
                <Text style={s.tideLbl}>High</Text>
                <Text style={s.tideTime}>6:42 AM</Text>
              </View>
              <View>
                <Text style={s.tideLbl}>Low</Text>
                <Text style={s.tideTime}>12:48 PM</Text>
              </View>
            </View>
            {/* Tide chart */}
            <View style={s.tideChart}>
              <View style={s.tideAxisRow}>
                <Text style={s.tideAxis}>2.0 m</Text>
                <View style={s.tideAxisLine} />
              </View>
              <View style={s.tideAxisRow}>
                <Text style={s.tideAxis}>1.0 m</Text>
                <View style={s.tideAxisLine} />
              </View>
              <View style={s.tideAxisRow}>
                <Text style={s.tideAxis}>0 m</Text>
                <View style={s.tideAxisLine} />
              </View>
              {/* Wave */}
              <View style={s.tideWaveContainer}>
                <LinearGradient
                  colors={['transparent', 'rgba(0,212,170,0.25)']}
                  style={s.tideWaveFill}
                />
              </View>
              <View style={s.tideBottomLabels}>
                {['12 AM','6 AM','12 PM','6 PM','12 AM'].map(l => (
                  <Text key={l} style={s.tideBottomLabel}>{l}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ─── SPOT INFO + SPOT NOTES ─── */}
        <View style={s.twoColRow}>
          {/* Spot info */}
          <View style={[s.card, { flex: 1, padding: 0, overflow: 'hidden' }]}>
            <LinearGradient colors={['#1a2a40', '#0d1828']} style={s.spotPhotoArea}>
              <MaterialCommunityIcons name="map-marker" size={28} color="rgba(0,212,170,0.3)" />
            </LinearGradient>
            <View style={s.spotCardInfo}>
              <Text style={s.spotCardName}>{spotName}</Text>
              <View style={s.spotCardMeta}>
                <MaterialCommunityIcons name="star" size={11} color={colors.secondary} />
                <Text style={s.spotCardRating}>4.8 (128)</Text>
              </View>
              <Text style={s.spotCardType}>Coastal · Saltwater</Text>
              <Text style={s.spotCardDesc} numberOfLines={3}>Rocky Point is known for seabass, bluefish and mackerel.</Text>
              <TouchableOpacity
                style={s.spotCardBtn}
                onPress={() => router.push({ pathname: '/spot-details', params: { id: activeSession?.spotName } } as any)}
              >
                <Text style={s.spotCardBtnText}>View Spot Details</Text>
                <MaterialCommunityIcons name="chevron-right" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Spot Notes */}
          <View style={[s.card, { flex: 1 }]}>
            <View style={s.cardHeaderRow}>
              <Text style={s.cardTitle}>SPOT NOTES</Text>
              <TouchableOpacity><Text style={s.viewAll}>View All</Text></TouchableOpacity>
            </View>
            <View style={s.noteItem}>
              <View style={s.noteAvatar}>
                <Text style={s.noteAvatarText}>TC</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.noteAuthor}>Tom C.</Text>
                <Text style={s.noteTime}>2d ago</Text>
              </View>
              <TouchableOpacity>
                <MaterialCommunityIcons name="dots-horizontal" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <Text style={s.noteText}>Great conditions in the morning. Topwater lures worked best around dawn.</Text>
            <TouchableOpacity style={s.addNoteBtn} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.textSecondary} />
              <Text style={s.addNoteText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── SESSION ACTIVITY ─── */}
        <View style={s.actionsSection}>
          <Text style={s.sectionTitle}>Session Activity</Text>
          {activity.map((item, i) => (
            <View key={i} style={s.activityRow}>
              <View style={s.timelineSide}>
                <View style={[s.activityDot, { backgroundColor: DOT_COLORS[item.type] }]} />
                {i < activity.length - 1 && <View style={s.timelineLine} />}
              </View>
              <View style={s.activityContent}>
                <Text style={s.activityTime}>{item.time}</Text>
                <Text style={s.activityText}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Log Catch Modal */}
      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setLogOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Log a Catch</Text>
            {[
              { label: 'Species', value: species, set: setSpecies, placeholder: 'e.g. Northern Pike', keyboard: 'default' as const },
              { label: 'Weight (kg)', value: weight, set: setWeight, placeholder: 'e.g. 4.2', keyboard: 'decimal-pad' as const },
              { label: 'Bait / Lure', value: bait, set: setBait, placeholder: 'e.g. Deadbait', keyboard: 'default' as const },
            ].map(f => (
              <View key={f.label}>
                <Text style={s.sheetLabel}>{f.label}</Text>
                <TextInput
                  style={s.sheetInput}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textSecondary}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.keyboard}
                />
              </View>
            ))}
            <TouchableOpacity style={s.saveBtn} onPress={handleLogCatch} activeOpacity={0.85}>
              <Text style={s.saveBtnText}>SAVE CATCH</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* End Session Confirm Modal */}
      <Modal visible={endConfirmOpen} transparent animationType="fade" onRequestClose={() => setEndConfirmOpen(false)}>
        <View style={s.confirmOverlay}>
          <View style={s.confirmBox}>
            <MaterialCommunityIcons name="flag-checkered" size={36} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={s.confirmTitle}>End Session?</Text>
            <Text style={s.confirmSub}>Finish your session at {spotName} and view your summary.</Text>
            <TouchableOpacity style={s.confirmEndBtn} onPress={confirmEnd} activeOpacity={0.85}>
              <Text style={s.confirmEndText}>End Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmCancelBtn} onPress={() => setEndConfirmOpen(false)} activeOpacity={0.85}>
              <Text style={s.confirmCancelText}>Keep Fishing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  noSessionHero: {
    alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, paddingVertical: 60,
  },
  noSessionTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 8 },
  noSessionSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  noSessionBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: 16, alignSelf: 'stretch', ...elevation.glow },
  noSessionBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  noSessionBtnText: { fontSize: 14, fontWeight: '800', color: '#051410', letterSpacing: 1.5 },

  historySection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  historyTitle: {
    fontSize: 10, fontWeight: '800', color: colors.textTertiary,
    letterSpacing: 1.5, paddingHorizontal: spacing.md, paddingTop: 14, paddingBottom: 10,
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  historyRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  historyIcon: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyBody: { flex: 1, gap: 3 },
  historySpot: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyMeta: { fontSize: 12, color: colors.textSecondary },
  historyCatches: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyCatchCount: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },

  // Hero
  hero: { paddingHorizontal: spacing.lg, paddingBottom: 20 },
  heroNav: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 4,
  },
  heroNavBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heroNavCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroNavName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  heroNavRight: { flexDirection: 'row', gap: 0 },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 20, marginLeft: 36 },

  heroBody: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },

  timerCol: { flex: 1 },
  sessionActivePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  sessionActiveText: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },

  timerText: { fontSize: 38, fontWeight: '700', color: '#fff', letterSpacing: -1, marginBottom: 4 },
  timerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },

  endBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.danger,
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  endBtnText: { fontSize: 12, fontWeight: '700', color: colors.danger },

  condCard: {
    flex: 1.1,
    backgroundColor: 'rgba(16,24,39,0.92)',
    borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  condHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  condTitle: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1 },
  condViewAll: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  condItem: { width: '33.33%', marginBottom: 10 },
  condItemTop: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  condValue: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
  condLabel: { fontSize: 9, color: colors.textSecondary },

  // Two-column sections
  twoColRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 12,
    ...elevation.raised,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1 },
  viewAll: { fontSize: 11, color: colors.primary, fontWeight: '600' },

  // Stars
  starsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  starsLabel: { fontSize: 12, color: colors.textSecondary },
  stars: { flexDirection: 'row', gap: 1 },

  // Bar chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 1, marginBottom: 4 },
  barWrap: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 1 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  barLabel: { fontSize: 8, color: colors.textTertiary },
  legendRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 9, color: colors.textSecondary },

  // Activity ring
  ringContainer: { alignItems: 'center', marginVertical: 10 },
  ringOuter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 5, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...elevation.glow,
  },
  ringInner: { alignItems: 'center' },
  ringPct: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  ringLabel: { fontSize: 10, color: colors.textSecondary },

  majorTimesTitle: { fontSize: 9, fontWeight: '800', color: colors.textTertiary, letterSpacing: 1, marginBottom: 6 },
  majorTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  majorTimeText: { fontSize: 10, color: colors.textSecondary },

  // Actions
  actionsSection: { paddingHorizontal: spacing.lg, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1, marginBottom: 10 },
  actionsGrid: {
    flexDirection: 'row', gap: 8,
  },
  actionBtn: {
    flex: 1, alignItems: 'center', gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    paddingVertical: 16,
    ...elevation.raised,
  },
  actionLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },

  // Mini catch cards
  miniCatch: { marginBottom: 10 },
  miniCatchPhoto: {
    height: 60, borderRadius: radius.sm, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', marginBottom: 5, position: 'relative',
  },
  miniCatchBookmark: { position: 'absolute', top: 4, right: 4 },
  miniCatchName: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
  miniCatchMeta: { fontSize: 10, color: colors.textSecondary },
  miniCatchTime: { fontSize: 9, color: colors.textTertiary },

  // Tide
  tideHeight: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  tideStatus: { fontSize: 12, color: colors.primary, fontWeight: '700', marginBottom: 8 },
  tideTimesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tideLbl: { fontSize: 9, color: colors.textTertiary, marginBottom: 2 },
  tideTime: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },

  tideChart: { flex: 1, position: 'relative', marginTop: 4 },
  tideAxisRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  tideAxis: { fontSize: 8, color: colors.textTertiary, width: 22 },
  tideAxisLine: { flex: 1, height: 1, backgroundColor: colors.border },
  tideWaveContainer: { position: 'absolute', bottom: 16, left: 0, right: 0, height: 28, overflow: 'hidden' },
  tideWaveFill: { flex: 1, borderRadius: 8 },
  tideBottomLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  tideBottomLabel: { fontSize: 8, color: colors.textTertiary },

  // Spot card
  spotPhotoArea: { height: 80, alignItems: 'center', justifyContent: 'center' },
  spotCardInfo: { padding: 10 },
  spotCardName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  spotCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  spotCardRating: { fontSize: 12, color: colors.secondary, fontWeight: '700' },
  spotCardType: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  spotCardDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: 8 },
  spotCardBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  spotCardBtnText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  // Spot notes
  noteItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noteAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,212,170,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  noteAvatarText: { fontSize: 10, fontWeight: '800', color: colors.primary },
  noteAuthor: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  noteTime: { fontSize: 10, color: colors.textTertiary },
  noteText: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: 10 },
  addNoteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
    marginTop: 4,
  },
  addNoteText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  // Activity
  activityRow: { flexDirection: 'row', gap: 12, paddingBottom: 16 },
  timelineSide: { alignItems: 'center', width: 16 },
  activityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  timelineLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  activityContent: { flex: 1 },
  activityTime: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  activityText: { fontSize: 13, color: colors.textPrimary },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, paddingBottom: 40, gap: 8,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sheetLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  sheetInput: {
    backgroundColor: colors.surface2, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    alignItems: 'center', paddingVertical: 15, marginTop: 8,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A', letterSpacing: 1 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  confirmBox: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center' },
  confirmTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  confirmSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  confirmEndBtn: { backgroundColor: '#E53E3E', borderRadius: radius.full, alignItems: 'center', paddingVertical: 14, width: '100%', marginBottom: 10 },
  confirmEndText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  confirmCancelBtn: { alignItems: 'center', paddingVertical: 10, width: '100%' },
  confirmCancelText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
