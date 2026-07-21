import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing, elevation } from '../constants/theme';

const SETTINGS_ROWS = [
  { icon: 'scale', color: '#60A5FA', label: 'Units', sub: 'kg, cm', route: null },
  { icon: 'fish', color: colors.primary, label: 'Fishing Preferences', sub: 'Species, Bait, Style', route: null },
  { icon: 'bell-outline', color: colors.secondary, label: 'Notifications', sub: 'Manage alerts, Reminders', route: '/notifications' },
  { icon: 'bookmark-outline', color: '#8B5CF6', label: 'Saved Spots', sub: 'Manage your saved spots', route: null },
  { icon: 'shield-outline', color: '#22C55E', label: 'Privacy', sub: 'Data and privacy settings', route: null },
  { icon: 'moon-waning-crescent', color: '#A78BFA', label: 'Appearance', sub: 'Dark Mode', route: null },
  { icon: 'information-outline', color: colors.textSecondary, label: 'About CAST', sub: 'Version 1.0.0', route: null },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, deleteAccount } = useAuthStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const ok = await deleteAccount();
    setDeleting(false);
    if (ok) {
      setDeleteOpen(false);
      router.replace('/(auth)/login' as any);
    } else {
      setDeleteError(useAuthStore.getState().authError || 'Could not delete your account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <Text style={s.title}>Settings</Text>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Settings</Text>
          <View style={s.card}>
            {SETTINGS_ROWS.map((row, i) => (
              <TouchableOpacity
                key={row.label}
                style={[s.row, i < SETTINGS_ROWS.length - 1 && s.rowBorder]}
                onPress={() => row.route && router.push(row.route as any)}
                activeOpacity={0.75}
              >
                <View style={[s.iconBox, { backgroundColor: row.color + '18' }]}>
                  <MaterialCommunityIcons name={row.icon as any} size={18} color={row.color} />
                </View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>{row.label}</Text>
                  {row.sub ? <Text style={s.rowSub}>{row.sub}</Text> : null}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Log Out */}
        <View style={s.logoutSection}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Account management — Delete Account (Apple 5.1.1(v) requirement) */}
        <View style={s.accountSection}>
          <Text style={s.sectionLabel}>Account</Text>
          <TouchableOpacity
            style={s.deleteRow}
            onPress={() => { setDeleteError(null); setDeleteOpen(true); }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <View style={[s.iconBox, { backgroundColor: colors.danger + '18' }]}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
            </View>
            <View style={s.rowInfo}>
              <Text style={[s.rowLabel, { color: colors.danger }]}>Delete Account</Text>
              <Text style={s.rowSub}>Permanently erase your account and data</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Delete-account confirmation */}
      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <View style={s.modalIcon}>
              <MaterialCommunityIcons name="alert-outline" size={26} color={colors.danger} />
            </View>
            <Text style={s.modalTitle}>Delete your account?</Text>
            <Text style={s.modalBody}>
              This permanently deletes {user?.email ? user.email : 'your account'}, your catches, sessions,
              friends and saved spots. This cannot be undone.
            </Text>
            {deleteError ? <Text style={s.modalError}>{deleteError}</Text> : null}
            <View style={s.modalRow}>
              <TouchableOpacity
                style={s.modalCancel}
                onPress={() => setDeleteOpen(false)}
                disabled={deleting}
                activeOpacity={0.75}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalDelete}
                onPress={confirmDelete}
                disabled={deleting}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Confirm delete account"
              >
                {deleting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.modalDeleteText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  title: {
    fontSize: 24, fontWeight: '700', color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    ...elevation.card,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.md, minHeight: 56, paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBox: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    ...elevation.raised,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

  logoutSection: { paddingHorizontal: spacing.lg },
  logoutBtn: {
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },

  accountSection: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, minHeight: 56, paddingVertical: 12,
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
    width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center',
  },
  modalIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.danger + '18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  modalBody: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  modalError: { fontSize: 12, color: colors.danger, textAlign: 'center', marginTop: 10 },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  modalCancel: {
    flex: 1, height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCancelText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.textSecondary },
  modalDelete: { flex: 1, height: 48, borderRadius: radius.sm, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  modalDeleteText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
});
