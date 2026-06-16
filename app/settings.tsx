import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

      </ScrollView>
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
});
