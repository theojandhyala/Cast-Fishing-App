import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [deleteModal, setDeleteModal] = useState(false);
  const [publicProfile, setPublicProfile] = useState(user?.isPublicProfile ?? true);
  const [sharesCatches, setSharesCatches] = useState(user?.sharesCatchesPublicly ?? false);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>(user?.distanceUnit || 'km');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(user?.weightUnit || 'kg');
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>(user?.tempUnit || 'celsius');

  const savePrefs = (updates: Partial<typeof user>) => {
    updateUser(updates as any);
  };

  const handleDeleteAccount = () => {
    setDeleteModal(false);
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingRow icon="email" label="Email" value={user?.email || ''} color="#60A5FA" />
            <SettingRow icon="lock" label="Change Password" onPress={() => Alert.alert('Change Password', 'A password reset link would be sent to your email.')} color={colors.primary} border />
            <SettingRow icon="account-edit" label="Edit Profile" onPress={() => router.push('/profile' as any)} color={colors.secondary} border />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(96,165,250,0.1)' }]}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#60A5FA" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Default Location</Text>
                <Text style={styles.rowSub}>{user?.defaultLocation || 'Not set'}</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Default Location', 'Use your current GPS location as default.')}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0,212,170,0.1)' }]}>
                <MaterialCommunityIcons name="ruler" size={18} color={colors.primary} />
              </View>
              <Text style={styles.rowLabel}>Distance Units</Text>
              <View style={styles.unitToggle}>
                {(['km', 'miles'] as const).map(u => (
                  <TouchableOpacity key={u} style={[styles.unitOption, distanceUnit === u && styles.unitOptionActive]} onPress={() => { setDistanceUnit(u); savePrefs({ distanceUnit: u }); }}>
                    <Text style={[styles.unitText, distanceUnit === u && styles.unitTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                <MaterialCommunityIcons name="weight" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.rowLabel}>Weight Units</Text>
              <View style={styles.unitToggle}>
                {(['kg', 'lbs'] as const).map(u => (
                  <TouchableOpacity key={u} style={[styles.unitOption, weightUnit === u && styles.unitOptionActive]} onPress={() => { setWeightUnit(u); savePrefs({ weightUnit: u }); }}>
                    <Text style={[styles.unitText, weightUnit === u && styles.unitTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <MaterialCommunityIcons name="thermometer" size={18} color={colors.danger} />
              </View>
              <Text style={styles.rowLabel}>Temperature</Text>
              <View style={styles.unitToggle}>
                {(['celsius', 'fahrenheit'] as const).map(u => (
                  <TouchableOpacity key={u} style={[styles.unitOption, tempUnit === u && styles.unitOptionActive]} onPress={() => { setTempUnit(u); savePrefs({ tempUnit: u }); }}>
                    <Text style={[styles.unitText, tempUnit === u && styles.unitTextActive]}>{u === 'celsius' ? '°C' : '°F'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
                <MaterialCommunityIcons name="eye" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Public Profile</Text>
                <Text style={styles.rowSub}>Others can view your profile and stats</Text>
              </View>
              <Switch value={publicProfile} onValueChange={v => { setPublicProfile(v); savePrefs({ isPublicProfile: v }); }} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
            </View>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0,212,170,0.1)' }]}>
                <MaterialCommunityIcons name="fish" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Share Catches Publicly</Text>
                <Text style={styles.rowSub}>Catches visible in community feed</Text>
              </View>
              <Switch value={sharesCatches} onValueChange={v => { setSharesCatches(v); savePrefs({ sharesCatchesPublicly: v }); }} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow icon="bell" label="Notification Settings" onPress={() => router.push('/notifications' as any)} color="#8B5CF6" />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.card}>
            <SettingRow icon="download" label="Export All Data" onPress={() => Alert.alert('Export Data', 'Your data export would be emailed to ' + user?.email)} color={colors.primary} />
            <SettingRow icon="database" label="Storage Used" value="2.4 MB" color="#60A5FA" border />
            <SettingRow icon="delete" label="Clear Catch History" onPress={() => Alert.alert('Clear History', 'This will delete all catch records. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cleared', 'Catch history has been cleared.') }])} color={colors.danger} border />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingRow icon="information" label="Version" value="1.0.0 (Build 42)" color={colors.primary} />
            <SettingRow icon="file-document" label="Changelog" onPress={() => Alert.alert('Changelog', 'v1.0.0 — Initial release\n• Catch logging\n• Spot mapping\n• Knot library\n• Species guide\n• Achievements')} color="#60A5FA" border />
            <SettingRow icon="shield-check" label="Terms of Service" onPress={() => Alert.alert('Terms', 'Full terms would open in browser.')} color={colors.textSecondary} border />
            <SettingRow icon="lock" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'Full privacy policy would open in browser.')} color={colors.textSecondary} border />
            <SettingRow icon="code-tags" label="Open Source Licences" onPress={() => Alert.alert('Open Source', 'Expo, React Native, Zustand, and other open source libraries are used in this app.')} color={colors.textSecondary} border />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: 'rgba(239,68,68,0.3)' }]}>
            <TouchableOpacity style={styles.deleteRow} onPress={() => setDeleteModal(true)}>
              <MaterialCommunityIcons name="account-remove" size={20} color={colors.danger} />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.deleteHint}>Deleting your account is permanent and cannot be undone. All data will be lost.</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <MaterialCommunityIcons name="alert-circle" size={48} color={colors.danger} />
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalText}>This will permanently delete your account, all catches, spots, and progress. This action cannot be undone.</Text>
            <TouchableOpacity style={styles.confirmDelete} onPress={handleDeleteAccount}>
              <Text style={styles.confirmDeleteText}>Yes, Delete My Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelDelete} onPress={() => setDeleteModal(false)}>
              <Text style={styles.cancelDeleteText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, value, onPress, color, border }: { icon: string; label: string; value?: string; onPress?: () => void; color: string; border?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.row, border && styles.rowBorder]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: '500', flex: 1 },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 14, color: colors.textSecondary },
  changeLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  iconBox: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  unitToggle: { flexDirection: 'row', gap: 4 },
  unitOption: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: colors.surface2, borderRadius: radius.md },
  unitOptionActive: { backgroundColor: colors.primary },
  unitText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  unitTextActive: { color: '#0A0E1A' },
  deleteRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  deleteText: { fontSize: 15, fontWeight: '600', color: colors.danger },
  deleteHint: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 17 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modal: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  modalText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  confirmDelete: { width: '100%', backgroundColor: colors.danger, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  confirmDeleteText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cancelDelete: { width: '100%', backgroundColor: colors.surface2, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  cancelDeleteText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
