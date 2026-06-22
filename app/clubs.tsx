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
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { CLUBS, Club } from '../data/clubsData';
import { colors, radius, spacing } from '../constants/theme';

const TYPE_COLORS: Record<string, string> = {
  coarse: '#10B981',
  game: '#8B5CF6',
  sea: '#3B82F6',
  mixed: colors.primary,
};

export default function ClubsScreen() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);

  const handleJoin = (clubId: string) => {
    if (joinedClubs.includes(clubId)) {
      Alert.alert('Leave Club', 'Are you sure you want to leave this club?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => setJoinedClubs(j => j.filter(id => id !== clubId)) },
      ]);
    } else {
      setJoinedClubs(j => [...j, clubId]);
      Alert.alert('Joined!', 'Welcome to the club. You can now see member catches and shared spots.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Clubs</Text>
          {joinedClubs.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="account-group" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No clubs yet</Text>
              <Text style={styles.emptyText}>Join a club to share spots, catches and tips with fellow anglers</Text>
              <View style={styles.emptyButtons}>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setCreateModal(true)}>
                  <Text style={styles.emptyBtnText}>Create Club</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.emptyBtn, styles.emptyBtnPrimary]}>
                  <Text style={styles.emptyBtnPrimaryText}>Browse Clubs</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            joinedClubs.map(id => {
              const club = CLUBS.find(c => c.id === id);
              if (!club) return null;
              return (
                <TouchableOpacity key={id} style={styles.clubCard} onPress={() => setSelectedClub(club)}>
                  <ClubCardContent club={club} isJoined />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Featured Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Clubs</Text>
          {CLUBS.map(club => (
            <TouchableOpacity key={club.id} style={styles.clubCard} onPress={() => setSelectedClub(club)}>
              <ClubCardContent club={club} isJoined={joinedClubs.includes(club.id)} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={createModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create a Club</Text>
            {[
              { label: 'Club Name', hint: 'e.g. Thames Valley Carpers' },
              { label: 'Description', hint: 'What\'s your club about?' },
            ].map(f => (
              <View key={f.label} style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <View style={styles.fieldInput}>
                  <Text style={styles.fieldHint}>{f.hint}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {(['coarse', 'game', 'sea', 'mixed'] as const).map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, { borderColor: TYPE_COLORS[t] }]}>
                  <Text style={[styles.typeChipText, { color: TYPE_COLORS[t] }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Visibility</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeChip, { borderColor: colors.success }]}>
                <Text style={[styles.typeChipText, { color: colors.success }]}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeChip, { borderColor: colors.textSecondary }]}>
                <Text style={[styles.typeChipText, { color: colors.textSecondary }]}>Private</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={() => { setCreateModal(false); Alert.alert('Club Created!', 'Your club has been created. Invite your friends!'); }}>
                <Text style={styles.createBtnText}>Create Club</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Club Detail Modal */}
      <Modal visible={!!selectedClub} transparent animationType="slide">
        <View style={styles.overlay}>
          {selectedClub && (
            <View style={[styles.modal, { maxHeight: '90%' }]}>
              <ScrollView>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailName}>{selectedClub.name}</Text>
                    <View style={styles.detailRow}>
                      <View style={[styles.typePill, { backgroundColor: TYPE_COLORS[selectedClub.type] + '22' }]}>
                        <Text style={[styles.typePillText, { color: TYPE_COLORS[selectedClub.type] }]}>{selectedClub.type}</Text>
                      </View>
                      {selectedClub.isPrivate && (
                        <View style={styles.privatePill}>
                          <MaterialCommunityIcons name="lock" size={10} color={colors.textSecondary} />
                          <Text style={styles.privatePillText}>Private</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedClub(null)}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailDesc}>{selectedClub.description}</Text>
                <View style={styles.detailStats}>
                  <StatPill icon="account-group" value={selectedClub.memberCount.toLocaleString()} label="Members" />
                  <StatPill icon="fish" value={selectedClub.catchesThisWeek.toString()} label="Catches this week" />
                  <StatPill icon="calendar" value={selectedClub.founded} label="Founded" />
                </View>
                <Text style={styles.detailSectionLabel}>Top Members</Text>
                {selectedClub.members.map(m => (
                  <View key={m.id} style={styles.memberRow}>
                    <View style={styles.memberAvatar}><Text style={styles.memberAvatarText}>{m.avatar}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberRole}>{m.role === 'admin' ? '⭐ Admin' : 'Member'}</Text>
                    </View>
                    <Text style={styles.memberCatches}>{m.catchesThisWeek} this week</Text>
                  </View>
                ))}
                <Text style={styles.detailSectionLabel}>Recent Catches</Text>
                {selectedClub.recentCatches.map(c => (
                  <View key={c.id} style={styles.catchRow}>
                    <MaterialCommunityIcons name="fish" size={16} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catchText}>{c.memberName} caught {c.species} ({c.weight}kg)</Text>
                      <Text style={styles.catchSub}>{c.location} • {new Date(c.date).toLocaleDateString('en-GB')}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.joinBtn, joinedClubs.includes(selectedClub.id) && styles.joinBtnLeave]}
                onPress={() => { handleJoin(selectedClub.id); setSelectedClub(null); }}
              >
                <Text style={styles.joinBtnText}>{joinedClubs.includes(selectedClub.id) ? 'Leave Club' : 'Join Club'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ClubCardContent({ club, isJoined }: { club: Club; isJoined: boolean }) {
  return (
    <View style={styles.cardInner}>
      <View style={styles.cardLeft}>
        <View style={[styles.clubIcon, { backgroundColor: TYPE_COLORS[club.type] + '22' }]}>
          <MaterialCommunityIcons name="account-group" size={24} color={TYPE_COLORS[club.type]} />
        </View>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{club.name}</Text>
          {club.isPrivate && <MaterialCommunityIcons name="lock" size={12} color={colors.textSecondary} />}
          {isJoined && <View style={styles.joinedPill}><Text style={styles.joinedText}>Joined</Text></View>}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{club.description}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaItem}>👥 {club.memberCount.toLocaleString()}</Text>
          <Text style={styles.metaItem}>🎣 {club.catchesThisWeek} this week</Text>
          <View style={[styles.typeTag, { backgroundColor: TYPE_COLORS[club.type] + '22' }]}>
            <Text style={[styles.typeTagText, { color: TYPE_COLORS[club.type] }]}>{club.type}</Text>
          </View>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
    </View>
  );
}

function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <MaterialCommunityIcons name={icon as any} size={14} color={colors.primary} />
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  emptyButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  emptyBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  emptyBtnText: { color: colors.textSecondary, fontWeight: '600' },
  emptyBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  emptyBtnPrimaryText: { color: '#0A0E1A', fontWeight: '700' },
  clubCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  cardLeft: {},
  clubIcon: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  cardDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  metaItem: { fontSize: 11, color: colors.textSecondary },
  typeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  typeTagText: { fontSize: 10, fontWeight: '700' },
  joinedPill: { backgroundColor: 'rgba(0,212,170,0.15)', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  joinedText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  fieldBlock: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md },
  fieldHint: { color: colors.textSecondary, fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1 },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.lg },
  cancelBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  createBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg },
  createBtnText: { color: '#0A0E1A', fontSize: 15, fontWeight: '700' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  detailName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  detailRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  typePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  typePillText: { fontSize: 11, fontWeight: '700' },
  privatePill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.surface2, borderRadius: radius.full },
  privatePillText: { fontSize: 10, color: colors.textSecondary },
  detailDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  detailStats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statPill: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', gap: 2 },
  statPillValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statPillLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  detailSectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  memberName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  memberRole: { fontSize: 11, color: colors.textSecondary },
  memberCatches: { fontSize: 12, color: colors.primary },
  catchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  catchText: { fontSize: 14, color: colors.textPrimary },
  catchSub: { fontSize: 12, color: colors.textSecondary },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  joinBtnLeave: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: colors.danger },
  joinBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0E1A' },
});
