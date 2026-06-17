import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing, elevation } from '../constants/theme';

const SETTINGS_GROUPS = [
  {
    label: 'Preferences',
    rows: [
      { icon: 'scale', color: '#60A5FA', label: 'Units', sub: 'kg · cm', route: null },
      { icon: 'fish', color: colors.primary, label: 'Fishing Preferences', sub: 'Species, Bait, Style', route: null },
      { icon: 'bell-outline', color: colors.secondary, label: 'Notifications', sub: 'Alerts & reminders', route: '/notifications' },
    ],
  },
  {
    label: 'Account',
    rows: [
      { icon: 'bookmark-outline', color: '#8B5CF6', label: 'Saved Spots', sub: 'Manage saved spots', route: null },
      { icon: 'shield-outline', color: '#22C55E', label: 'Privacy', sub: 'Data & privacy', route: null },
      { icon: 'moon-waning-crescent', color: '#A78BFA', label: 'Appearance', sub: 'Dark mode', route: null },
    ],
  },
  {
    label: 'About',
    rows: [
      { icon: 'information-outline', color: colors.textSecondary, label: 'About CAST', sub: 'Version 1.0.0', route: null },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.titleRow}>
            <View style={s.titleBar} />
            <Text style={s.title}>Settings</Text>
          </View>
          {user?.email && <Text style={s.userEmail}>{user.email}</Text>}
        </View>

        {/* Grouped rows */}
        {SETTINGS_GROUPS.map(group => (
          <View key={group.label} style={s.group}>
            <Text style={s.groupLabel}>{group.label}</Text>
            <View style={s.card}>
              {group.rows.map((row, i) => (
                <TouchableOpacity
                  key={row.label}
                  style={[s.row, i < group.rows.length - 1 && s.rowBorder]}
                  onPress={() => row.route && router.push(row.route as any)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={row.label}
                >
                  <View style={[s.iconBox, { backgroundColor: row.color + '18', borderColor: row.color + '28' }]}>
                    <MaterialCommunityIcons name={row.icon as any} size={17} color={row.color} />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>{row.label}</Text>
                    {row.sub ? <Text style={s.rowSub}>{row.sub}</Text> : null}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={17} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Log Out */}
        <View style={s.logoutSection}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <MaterialCommunityIcons name="logout" size={16} color={colors.danger} style={{ marginRight: 8 }} />
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  titleBar: { width: 3, height: 22, backgroundColor: colors.primary, borderRadius: 2 },
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.6 },
  userEmail: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },

  group: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  groupLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    ...elevation.card,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.md, minHeight: 58, paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBox: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowSub: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },

  logoutSection: { paddingHorizontal: spacing.lg },
  logoutBtn: {
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', backgroundColor: 'rgba(239,68,68,0.06)',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: colors.danger },
});
