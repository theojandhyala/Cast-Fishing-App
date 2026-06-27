import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';
import { useCatchStore } from '../../store/catchStore';
import { useFriendsStore } from '../../store/friendsStore';
import { useWeather } from '../../hooks/useWeather';

const TEAL_LINE = 'rgba(0,212,170,0.12)';
const PANEL_RADIUS = radius.sm;

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function scoreCode(score: number): string {
  if (score >= 80) return 'XCLT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
}

function scoreColor(score: number): string {
  if (score >= 80) return colors.primary;
  if (score >= 60) return '#4DA3FF';
  if (score >= 40) return colors.accent;
  return '#EF4444';
}

// 20-segment bar identical to home screen
function ScoreBar({ score }: { score: number }) {
  const total = 20;
  const filled = Math.round((score / 100) * total);
  const heights = [10,11,12,13,13,14,14,15,15,16,16,15,15,14,14,13,13,12,11,10];
  const col = scoreColor(score);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: heights[i],
            borderRadius: 2,
            backgroundColor: i < filled ? col : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </View>
  );
}

export default function SessionTab() {
  const router = useRouter();
  const activeSession = useSessionStore((s) => s.activeSession);
  const endSession = useSessionStore((s) => s.endSession);
  const incrementCastCount = useSessionStore((s) => s.incrementCastCount);
  const inviteFriend = useSessionStore((s) => s.inviteFriend);
  const refreshLive = useSessionStore((s) => s.refreshLive);
  const goingLive = useSessionStore((s) => s.goingLive);
  const catches = useCatchStore((s) => s.catches);
  const friends = useFriendsStore((s) => s.friends);
  const hydrateFriends = useFriendsStore((s) => s.hydrate);
  const [now, setNow] = useState(Date.now());
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const { weather } = useWeather(
    activeSession?.latitude,
    activeSession?.longitude,
  );

  useEffect(() => {
    if (!activeSession) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeSession]);

  // Keep the live crew (and host-ended state) in sync while sharing a session.
  const liveId = activeSession?.liveId;
  useEffect(() => {
    if (!liveId) return;
    refreshLive();
    const id = setInterval(refreshLive, 10000);
    return () => clearInterval(id);
  }, [liveId, refreshLive]);

  const openInvite = async () => {
    if (friends.length === 0) await hydrateFriends();
    setInviteOpen(true);
  };
  const handleInvite = async (friendId: string) => {
    const ok = await inviteFriend(friendId);
    if (ok) setInvitedIds((prev) => [...prev, friendId]);
  };
  const participants = activeSession?.participants ?? [];

  const elapsedMs = activeSession
    ? now - new Date(activeSession.startTime).getTime()
    : 0;

  const sessionCatches = catches.filter((c) =>
    activeSession?.catchIds.includes(c.id),
  );

  const windDir = weather?.windDirection != null
    ? degreesToCompass(weather.windDirection)
    : '--';

  const fishScore = weather?.fishingScore ?? 0;

  if (!activeSession) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <Text style={s.brand}>SESSION</Text>
          <View style={s.headerRight} />
        </View>
        <View style={s.noSession}>
          <View style={s.noSessionIconCircle}>
            <MaterialCommunityIcons name="fish" size={32} color={colors.primary} />
          </View>
          <Text style={s.noSessionTitle}>NO ACTIVE SESSION</Text>
          <Text style={s.noSessionSub}>Head to the water and start tracking your trip.</Text>
          <TouchableOpacity
            style={s.startBtn}
            onPress={() => router.push('/(tabs)/map' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.startBtnText}>START SESSION</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.brand}>SESSION</Text>
        <View style={s.liveChip}>
          <View style={s.livePulse} />
          <Text style={s.liveLabel}>LIVE</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Timer panel */}
        <View style={[s.panel, { marginHorizontal: spacing.lg, marginBottom: 10 }]}>
          <Text style={s.eyebrow}>ELAPSED TIME</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Text style={s.timerText}>{formatElapsed(elapsedMs)}</Text>
            <TouchableOpacity
              style={s.endBtn}
              onPress={endSession}
              activeOpacity={0.75}
            >
              <Text style={s.endBtnText}>END</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live crew panel */}
        <View style={[s.panel, { marginHorizontal: spacing.lg, marginBottom: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[s.eyebrow, { marginBottom: 0 }]}>CREW</Text>
            {activeSession.role !== 'guest' && (
              <TouchableOpacity onPress={openInvite} activeOpacity={0.75} style={s.inviteBtn} disabled={goingLive}>
                <MaterialCommunityIcons name="account-plus" size={14} color={colors.primary} />
                <Text style={s.inviteBtnText}>{goingLive ? 'STARTING…' : 'INVITE FRIEND'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {participants.length > 0 ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              {participants.map((p) => (
                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[s.avatar, { backgroundColor: p.avatarColor }]}>
                    <Text style={s.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={s.crewName}>{p.name}</Text>
                  <Text style={[s.crewStatus, p.status === 'joined' && { color: colors.primary }]}>
                    {p.role === 'host' ? 'HOST' : p.status === 'joined' ? 'JOINED' : p.status === 'declined' ? 'DECLINED' : 'INVITED'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.crewEmpty}>
              {activeSession.role === 'guest' ? 'You joined this session.' : 'Fishing solo — invite a friend to share this session live.'}
            </Text>
          )}
        </View>

        {/* Activity + stats cluster */}
        <View style={[s.panel, { marginHorizontal: spacing.lg, marginBottom: 10 }]}>
          <Text style={s.eyebrow}>FISH ACTIVITY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 10 }}>
            <Text style={[s.scoreNum, { color: scoreColor(fishScore) }]}>{fishScore}</Text>
            <View style={{ gap: 4, paddingBottom: 4 }}>
              <Text style={[s.scoreCode, { color: scoreColor(fishScore) }]}>{scoreCode(fishScore)}</Text>
              <ScoreBar score={fishScore} />
            </View>
          </View>
          {/* 3-stat divider row */}
          <View style={s.dividerLine} />
          <View style={{ flexDirection: 'row' }}>
            {[
              { label: 'CATCHES', value: String(sessionCatches.length) },
              { label: 'KEEPERS', value: String(sessionCatches.filter((c) => (c.weight ?? 0) > 0).length) },
              { label: 'CASTS', value: String(activeSession.castCount ?? 0) },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={[
                  s.instrumentCell,
                  i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: TEAL_LINE },
                ]}
              >
                <Text style={s.eyebrow}>{item.label}</Text>
                <Text style={s.instrumentValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Conditions cluster */}
        {weather ? (
          <View style={[s.panel, { marginHorizontal: spacing.lg, marginBottom: 10 }]}>
            <Text style={s.eyebrow}>CONDITIONS</Text>
            <View style={{ flexDirection: 'row' }}>
              {[
                { label: 'TEMP', value: `${weather.temp}°` },
                { label: `WIND ${windDir}`, value: `${weather.wind}` },
                { label: 'PRES', value: `${weather.pressure}` },
              ].map((item, i, arr) => (
                <View
                  key={item.label}
                  style={[
                    s.instrumentCell,
                    i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: TEAL_LINE },
                  ]}
                >
                  <Text style={s.eyebrow}>{item.label}</Text>
                  <Text style={s.instrumentValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.castBtn}
            onPress={incrementCastCount}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="hook" size={18} color={colors.textSecondary} />
            <Text style={s.castBtnText}>COUNT CAST</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.logBtn}
            onPress={() => router.push('/identifier' as any)}
            activeOpacity={0.75}
          >
            <Text style={s.logBtnText}>+ LOG CATCH</Text>
          </TouchableOpacity>
        </View>

        {/* Session catches list */}
        {sessionCatches.length > 0 && (
          <View style={[s.panel, { marginHorizontal: spacing.lg }]}>
            <Text style={s.eyebrow}>THIS SESSION</Text>
            {sessionCatches.map((c, i) => (
              <View key={c.id}>
                {i > 0 && <View style={s.dividerLine} />}
                <View style={s.catchRow}>
                  <View style={s.catchDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.catchSpecies}>{c.species ?? 'Unknown'}</Text>
                    <Text style={s.catchMeta}>{c.bait ?? '—'}</Text>
                  </View>
                  {c.weight != null && c.weight > 0 && (
                    <View style={s.weightBadge}>
                      <Text style={s.weightText}>{c.weight.toFixed(1)} kg</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Invite-a-friend modal */}
      <Modal visible={inviteOpen} animationType="slide" transparent onRequestClose={() => setInviteOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalSheet}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={s.modalTitle}>INVITE TO SESSION</Text>
              <TouchableOpacity onPress={() => setInviteOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={s.modalSub}>They’ll get a prompt to join — and your session goes live on their device with the same timer.</Text>
            <ScrollView style={{ marginTop: 12, maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {friends.length === 0 ? (
                <Text style={s.crewEmpty}>Add friends first to invite them to live sessions.</Text>
              ) : friends.map((f) => {
                const already = invitedIds.includes(f.id) || participants.some((p) => p.id === f.id);
                return (
                  <View key={f.id} style={s.friendRow}>
                    <View style={[s.avatar, { backgroundColor: f.avatarColor }]}>
                      <Text style={s.avatarText}>{f.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.crewName}>{f.name}</Text>
                      <Text style={s.crewMeta}>Lvl {f.level} · {f.catchCount} catches</Text>
                    </View>
                    <TouchableOpacity
                      style={[s.inviteRowBtn, already && s.inviteRowBtnDone]}
                      onPress={() => handleInvite(f.id)}
                      disabled={already}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.inviteRowBtnText, already && { color: colors.primary }]}>
                        {already ? 'INVITED' : 'INVITE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Live crew + invite
  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: TEAL_LINE, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  inviteBtnText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: colors.primary },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  crewName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  crewMeta: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  crewStatus: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: colors.textTertiary },
  crewEmpty: { fontSize: 12, color: colors.textTertiary, marginTop: 8, lineHeight: 17 },

  // Invite modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    borderWidth: 1, borderColor: TEAL_LINE, padding: spacing.lg, paddingBottom: spacing.xl,
  },
  modalTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: colors.textPrimary },
  modalSub: { fontSize: 12, color: colors.textSecondary, marginTop: 6, lineHeight: 17 },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: TEAL_LINE,
  },
  inviteRowBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8 },
  inviteRowBtnDone: { backgroundColor: 'rgba(0,212,170,0.12)', borderWidth: 1, borderColor: TEAL_LINE },
  inviteRowBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  headerRight: { width: 60 },

  // Live chip
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },

  // Panel
  panel: {
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    padding: spacing.md,
    overflow: 'hidden',
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  dividerLine: {
    height: 1,
    backgroundColor: TEAL_LINE,
    marginVertical: 10,
  },

  // Timer
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    lineHeight: 54,
  },
  endBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: PANEL_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  endBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 2,
  },

  // Score
  scoreNum: {
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 60,
  },
  scoreCode: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Instrument cells
  instrumentCell: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  instrumentValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: 10,
    gap: 8,
  },
  castBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: PANEL_RADIUS,
    borderWidth: 1,
    borderColor: TEAL_LINE,
    height: 48,
    paddingHorizontal: 16,
  },
  castBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  logBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: PANEL_RADIUS,
    height: 48,
  },
  logBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.bg,
    letterSpacing: 2,
  },

  // No session empty state
  noSession: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: 12,
  },
  noSessionIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1,
    borderColor: TEAL_LINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noSessionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  noSessionSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  startBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: PANEL_RADIUS,
    alignItems: 'center',
    paddingVertical: 14,
  },
  startBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.bg,
    letterSpacing: 2,
  },

  // Session catches
  catchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  catchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  catchSpecies: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catchMeta: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 1,
  },
  weightBadge: {
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TEAL_LINE,
  },
  weightText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
});
