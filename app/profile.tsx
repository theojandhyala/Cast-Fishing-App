import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { useAchievementStore } from '../store/achievementStore';
import { colors, radius, spacing } from '../constants/theme';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner Angler',
  2: 'Apprentice Angler',
  3: 'Keen Angler',
  4: 'Elite Angler',
  5: 'Expert Angler',
  6: 'Master Angler',
  7: 'Grand Master',
  8: 'Legendary Angler',
};

const AVATAR_COLORS = [
  '#00D4AA', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
  '#10B981', '#F97316', '#EC4899', '#06B6D4', '#84CC16',
];

function getFishingPersonality(speciesCounts: Record<string, number>, catches: Array<{ date: string; species: string; weight: number }>) {
  const total = catches.length;
  if (total === 0) return { title: 'The Aspiring Angler', desc: 'Just getting started on the fishing journey.' };

  const hours = catches.map(c => new Date(c.date).getHours());
  const earlyCount = hours.filter(h => h < 8).length;
  const nightCount = hours.filter(h => h >= 22 || h < 4).length;
  const carpCount = speciesCounts['Carp'] || 0;
  const bigFishCount = catches.filter(c => c.weight >= 10).length;
  const speciesCount = Object.keys(speciesCounts).length;

  if (carpCount > total * 0.6) return { title: 'The Carp Obsessive', desc: 'If it\'s not a carp, it barely counts.' };
  if (nightCount > total * 0.4) return { title: 'The Night Fisher', desc: 'You come alive when the sun goes down.' };
  if (earlyCount > total * 0.5) return { title: 'The Dawn Stalker', desc: 'Up before the alarm, rod in hand at first light.' };
  if (bigFishCount > total * 0.3) return { title: 'The Specimen Hunter', desc: 'You\'re only interested in the big ones.' };
  if (speciesCount >= 6) return { title: 'The Explorer', desc: 'No species is off-limits. You fish them all.' };
  if (speciesCount <= 2 && total >= 10) return { title: 'The Match Angler', desc: 'Technique, accuracy, and numbers — that\'s your game.' };
  return { title: 'The All-Rounder', desc: 'Versatile angler who adapts to any situation.' };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const { achievements } = useAchievementStore();
  const stats = getStats();
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || colors.primary);

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const xpForNextLevel = level * 500;
  const xpProgress = Math.min((xp % 500) / 500, 1);
  const levelName = LEVEL_NAMES[level] || 'Legendary Angler';
  const initials = (user?.name || 'A').slice(0, 2).toUpperCase();
  const avatarColor = user?.avatarColor || colors.primary;

  const personality = getFishingPersonality(stats.speciesCounts, catches);
  const totalWeight = catches.reduce((sum, c) => sum + c.weight, 0);
  const uniqueLocations = new Set(catches.filter(c => c.location).map(c => c.location)).size;
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentActivity = catches.slice(0, 5).map(c => ({
    icon: 'fish',
    label: `Caught ${c.species} (${c.weight}kg)`,
    sub: c.location || 'Unknown location',
    date: new Date(c.date).toLocaleDateString('en-GB'),
    color: colors.primary,
  }));

  const saveEdit = () => {
    if (editName.trim()) {
      updateUser({ name: editName.trim(), avatarColor: selectedColor });
    }
    setEditModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['rgba(0,212,170,0.15)', 'transparent']} style={styles.hero}>
          <TouchableOpacity style={[styles.avatar, { backgroundColor: avatarColor + '33', borderColor: avatarColor }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'Angler'}</Text>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
            <Text style={styles.levelBadgeText}>Level {level} — {levelName}</Text>
          </View>
          <Text style={styles.memberSince}>Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Recently'}</Text>
        </LinearGradient>

        {/* XP Progress */}
        <View style={styles.section}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Level {level}</Text>
            <Text style={styles.xpCount}>{xp} XP / {level * 500} XP</Text>
            <Text style={styles.xpLabel}>Level {level + 1}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>{Math.round((1 - xpProgress) * level * 500)} XP to next level</Text>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <StatBox icon="fish" label="Total Catches" value={stats.total.toString()} color={colors.primary} />
            <StatBox icon="dna" label="Species Caught" value={Object.keys(stats.speciesCounts).length.toString()} color="#8B5CF6" />
            <StatBox icon="map-marker" label="Spots Visited" value={uniqueLocations.toString()} color="#3B82F6" />
            <StatBox icon="weight" label="Total Weight (kg)" value={totalWeight.toFixed(1)} color={colors.secondary} />
          </View>
        </View>

        {/* Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fishing Personality</Text>
          <LinearGradient colors={['rgba(0,212,170,0.08)', 'rgba(0,212,170,0.02)']} style={styles.personalityCard}>
            <Text style={styles.personalityTitle}>{personality.title}</Text>
            <Text style={styles.personalityDesc}>{personality.desc}</Text>
          </LinearGradient>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achieveCount}>{unlockedAchievements.length} / {achievements.length}</Text>
          </View>
          <View style={styles.badgesGrid}>
            {achievements.map(a => (
              <View key={a.id} style={[styles.badge, !a.unlocked && styles.badgeLocked]}>
                {a.unlocked ? (
                  <MaterialCommunityIcons name="trophy" size={28} color={colors.secondary} />
                ) : (
                  <MaterialCommunityIcons name="lock" size={28} color={colors.textSecondary} />
                )}
                <Text style={styles.badgeName} numberOfLines={1}>{a.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.card}>
            {recentActivity.length === 0 ? (
              <Text style={styles.emptyText}>No activity yet — log your first catch!</Text>
            ) : (
              recentActivity.map((item, i) => (
                <View key={i} style={[styles.activityRow, i < recentActivity.length - 1 && styles.activityBorder]}>
                  <View style={[styles.activityIcon, { backgroundColor: item.color + '22' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityLabel}>{item.label}</Text>
                    <Text style={styles.activitySub}>{item.sub}</Text>
                  </View>
                  <Text style={styles.activityDate}>{item.date}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            {[
              { icon: 'trophy-outline', label: 'Achievements', route: '/my-stats' },
              { icon: 'toolbox-outline', label: 'Gear', route: '/gear-tracker' },
              { icon: 'map-marker-outline', label: 'Favorite Spots', route: '/(tabs)/map' },
              { icon: 'cog-outline', label: 'Settings', route: '/settings' },
              { icon: 'help-circle-outline', label: 'Help & Support', route: '/safety' },
              { icon: 'information-outline', label: 'About Cast Fishing', route: '/more' },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i < arr.length - 1 && styles.menuRowBorder]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name={item.icon as any} size={19} color={colors.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn} onPress={() => { setEditName(user?.name || ''); setEditModal(true); }}>
          <MaterialCommunityIcons name="account-edit" size={18} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalLabel}>Display Name</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>{editName}</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Edit Name', 'Name editing requires text input — use the keyboard to change your name.', [{ text: 'OK' }])}>
              <Text style={styles.changeNameHint}>Tap to change name</Text>
            </TouchableOpacity>
            <Text style={styles.modalLabel}>Avatar Colour</Text>
            <View style={styles.colorGrid}>
              {AVATAR_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setSelectedColor(c)} style={[styles.colorSwatch, { backgroundColor: c }, selectedColor === c && styles.colorSelected]} />
              ))}
            </View>
            <View style={styles.avatarPreview}>
              <View style={[styles.avatar, { backgroundColor: selectedColor + '33', borderColor: selectedColor }]}>
                <Text style={[styles.avatarText, { color: selectedColor }]}>{initials}</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: spacing.md },
  avatarText: { fontSize: 32, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 6 },
  levelBadgeText: { fontSize: 13, fontWeight: '700', color: colors.secondary },
  memberSince: { fontSize: 12, color: colors.textSecondary },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontSize: 12, color: colors.textSecondary },
  xpCount: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: colors.surface2, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  progressHint: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 4 },
  statIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  personalityCard: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  personalityTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  personalityDesc: { fontSize: 14, color: colors.textSecondary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  achieveCount: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { width: '18%', alignItems: 'center', gap: 2 },
  badgeLocked: { opacity: 0.35 },
  badgeName: { fontSize: 9, color: colors.textSecondary, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  emptyText: { padding: spacing.lg, color: colors.textSecondary, textAlign: 'center' },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  activityIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  activitySub: { fontSize: 12, color: colors.textSecondary },
  activityDate: { fontSize: 11, color: colors.textSecondary },
  menuCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)' },
  editBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  inputRow: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md, marginBottom: 4 },
  inputText: { color: colors.textPrimary, fontSize: 16 },
  changeNameHint: { fontSize: 12, color: colors.primary, marginBottom: spacing.lg },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: colors.textPrimary },
  avatarPreview: { alignItems: 'center', marginBottom: spacing.lg },
  modalButtons: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.lg },
  cancelBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg },
  saveBtnText: { color: '#0A0E1A', fontSize: 15, fontWeight: '700' },
});
