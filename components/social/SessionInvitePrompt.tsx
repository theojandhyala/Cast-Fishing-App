import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../ui/Icon';
import { colors, radius, spacing } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';
import { useAuthStore } from '../../store/authStore';

const TEAL_LINE = 'rgba(0,212,170,0.12)';

/**
 * Polls for live-session invites and asks the user to join.
 * Mounted once at the tab layout so it works on whatever screen they're on.
 */
export function SessionInvitePrompt() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeSession = useSessionStore((s) => s.activeSession);
  const pendingInvites = useSessionStore((s) => s.pendingInvites);
  const fetchInvites = useSessionStore((s) => s.fetchInvites);
  const acceptInvite = useSessionStore((s) => s.acceptInvite);
  const declineInvite = useSessionStore((s) => s.declineInvite);

  // Poll for invites while signed in and not already in a session.
  useEffect(() => {
    if (!isAuthenticated || activeSession) return;
    fetchInvites();
    const id = setInterval(fetchInvites, 8000);
    return () => clearInterval(id);
  }, [isAuthenticated, activeSession, fetchInvites]);

  const invite = !activeSession ? pendingInvites[0] : undefined;
  if (!invite) return null;

  const onJoin = async () => {
    await acceptInvite(invite);
    router.push('/(tabs)/session' as any);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => declineInvite(invite.id)}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.iconCircle}>
            <MaterialCommunityIcons name="account-group" size={28} color={colors.primary} />
          </View>
          <Text style={s.eyebrow}>LIVE SESSION INVITE</Text>
          <Text style={s.title}>{invite.hostName} invited you to fish</Text>
          <Text style={s.spot}>{invite.spotName}</Text>
          <Text style={s.sub}>Join and this session goes live on your device too — same timer, in real time.</Text>
          <View style={s.row}>
            <TouchableOpacity style={s.declineBtn} onPress={() => declineInvite(invite.id)} activeOpacity={0.75}>
              <Text style={s.declineText}>DECLINE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.joinBtn} onPress={onJoin} activeOpacity={0.85}>
              <Text style={s.joinText}>JOIN SESSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: {
    width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: TEAL_LINE, padding: spacing.lg, alignItems: 'center',
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1, borderColor: TEAL_LINE, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: colors.primary },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 8, textAlign: 'center' },
  spot: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  sub: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  row: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  declineBtn: {
    flex: 1, height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: TEAL_LINE,
    alignItems: 'center', justifyContent: 'center',
  },
  declineText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: colors.textSecondary },
  joinBtn: { flex: 1.4, height: 48, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  joinText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: colors.bg },
});
