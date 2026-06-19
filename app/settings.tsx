import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing, elevation } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Account
  const [publicProfile, setPublicProfile] = useState(true);

  // Fishing Preferences
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [defaultWater, setDefaultWater] = useState<'Lake' | 'River' | 'Canal' | 'Sea'>('Lake');

  // Notifications
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biteAlerts, setBiteAlerts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'App cache cleared successfully.', [{ text: 'OK' }]);
  };

  const cycleWater = () => {
    const options: ('Lake' | 'River' | 'Canal' | 'Sea')[] = ['Lake', 'River', 'Canal', 'Sea'];
    const idx = options.indexOf(defaultWater);
    setDefaultWater(options[(idx + 1) % options.length]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.titleRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={s.titleBar} />
            <Text style={s.title}>Settings</Text>
          </View>
          {user?.email && <Text style={s.userEmail}>{user.email}</Text>}
        </View>

        {/* ACCOUNT */}
        <SectionHeader label="ACCOUNT" />
        <View style={s.card}>
          <RowButton
            icon="account-edit"
            color="#60A5FA"
            label="Edit Name"
            sub={user?.name || 'Angler'}
            onPress={() => Alert.alert('Edit Name', 'Name editing coming soon.')}
            first
          />
          <RowButton
            icon="email-outline"
            color="#A78BFA"
            label="Change Email"
            sub={user?.email || ''}
            onPress={() => Alert.alert('Change Email', 'Email editing coming soon.')}
          />
          <RowToggle
            icon="earth"
            color="#22C55E"
            label="Public Profile"
            sub="Allow others to see your catches"
            value={publicProfile}
            onValueChange={setPublicProfile}
            last
          />
        </View>

        {/* FISHING PREFERENCES */}
        <SectionHeader label="FISHING PREFERENCES" />
        <View style={s.card}>
          <RowPicker
            icon="scale"
            color="#60A5FA"
            label="Weight Unit"
            value={weightUnit}
            options={['kg', 'lbs']}
            onSelect={(v) => setWeightUnit(v as 'kg' | 'lbs')}
            first
          />
          <RowPicker
            icon="map-marker-distance"
            color="#F59E0B"
            label="Distance Unit"
            value={distanceUnit}
            options={['km', 'miles']}
            onSelect={(v) => setDistanceUnit(v as 'km' | 'miles')}
          />
          <RowButton
            icon="waves"
            color="#3B82F6"
            label="Default Water Type"
            sub={defaultWater}
            onPress={cycleWater}
            last
          />
        </View>

        {/* NOTIFICATIONS */}
        <SectionHeader label="NOTIFICATIONS" />
        <View style={s.card}>
          <RowToggle
            icon="bell-outline"
            color="#8B5CF6"
            label="Push Notifications"
            sub="App alerts and updates"
            value={pushNotifications}
            onValueChange={setPushNotifications}
            first
          />
          <RowToggle
            icon="hook"
            color={colors.primary}
            label="Bite Window Alerts"
            sub="Get notified during prime feeding times"
            value={biteAlerts}
            onValueChange={setBiteAlerts}
          />
          <RowToggle
            icon="weather-partly-cloudy"
            color="#60A5FA"
            label="Weather Alerts"
            sub="Conditions warnings for your spots"
            value={weatherAlerts}
            onValueChange={setWeatherAlerts}
            last
          />
        </View>

        {/* APP */}
        <SectionHeader label="APP" />
        <View style={s.card}>
          <RowButton
            icon="moon-waning-crescent"
            color="#A78BFA"
            label="Dark Mode"
            sub="Always on"
            onPress={() => Alert.alert('Dark Mode', 'CAST uses dark mode by default for the best fishing experience.')}
            first
          />
          <RowButton
            icon="cached"
            color="#F59E0B"
            label="Clear Cache"
            sub="Free up storage space"
            onPress={handleClearCache}
          />
          <RowButton
            icon="information-outline"
            color={colors.textSecondary}
            label="App Version"
            sub="CAST v1.0.0"
            onPress={() => {}}
            last
            noChevron
          />
        </View>

        {/* ABOUT */}
        <SectionHeader label="ABOUT" />
        <View style={s.card}>
          <RowButton
            icon="file-document-outline"
            color="#60A5FA"
            label="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'Full terms available at castfishingapp.com/terms')}
            first
          />
          <RowButton
            icon="shield-lock-outline"
            color="#22C55E"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Full policy available at castfishingapp.com/privacy')}
          />
          <RowButton
            icon="star-outline"
            color={colors.secondary}
            label="Rate the App"
            sub="Tell us what you think"
            onPress={() => Alert.alert('Rate CAST', 'Thank you for using CAST! A rating means the world to us.')}
            last
          />
        </View>

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

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <Text style={s.groupLabel}>{label}</Text>
  );
}

interface RowButtonProps {
  icon: string;
  color: string;
  label: string;
  sub?: string;
  onPress: () => void;
  first?: boolean;
  last?: boolean;
  noChevron?: boolean;
}
function RowButton({ icon, color, label, sub, onPress, first, last, noChevron }: RowButtonProps) {
  return (
    <TouchableOpacity
      style={[s.row, !first && s.rowBorder, last && s.rowLast]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[s.iconBox, { backgroundColor: color + '18', borderColor: color + '28' }]}>
        <MaterialCommunityIcons name={icon as any} size={17} color={color} />
      </View>
      <View style={s.rowInfo}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {!noChevron && <MaterialCommunityIcons name="chevron-right" size={17} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
}

interface RowToggleProps {
  icon: string;
  color: string;
  label: string;
  sub?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  first?: boolean;
  last?: boolean;
}
function RowToggle({ icon, color, label, sub, value, onValueChange, first, last }: RowToggleProps) {
  return (
    <View style={[s.row, !first && s.rowBorder, last && s.rowLast]}>
      <View style={[s.iconBox, { backgroundColor: color + '18', borderColor: color + '28' }]}>
        <MaterialCommunityIcons name={icon as any} size={17} color={color} />
      </View>
      <View style={s.rowInfo}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surface2, true: colors.primary + '66' }}
        thumbColor={value ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

interface RowPickerProps {
  icon: string;
  color: string;
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  first?: boolean;
  last?: boolean;
}
function RowPicker({ icon, color, label, value, options, onSelect, first, last }: RowPickerProps) {
  return (
    <View style={[s.row, !first && s.rowBorder, last && s.rowLast]}>
      <View style={[s.iconBox, { backgroundColor: color + '18', borderColor: color + '28' }]}>
        <MaterialCommunityIcons name={icon as any} size={17} color={color} />
      </View>
      <View style={s.rowInfo}>
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <View style={s.segmentRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[s.segment, value === opt && s.segmentActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[s.segmentText, value === opt && s.segmentTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  backBtn: { width: 36, height: 36, justifyContent: 'center', marginRight: 2 },
  titleBar: { width: 3, height: 22, backgroundColor: colors.primary, borderRadius: 2 },
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.6 },
  userEmail: { fontSize: 12, color: colors.textTertiary, marginTop: 2, marginLeft: 44 },

  groupLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginBottom: 8, marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing.lg,
    ...elevation.card,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.md, minHeight: 58, paddingVertical: 12,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowLast: {},
  iconBox: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowSub: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },

  segmentRow: { flexDirection: 'row', gap: 4 },
  segment: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
  segmentText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.primary },

  logoutSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  logoutBtn: {
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', backgroundColor: 'rgba(239,68,68,0.06)',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: colors.danger },
});
