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
import { colors, radius, spacing, elevation, typography } from '../constants/theme';

const TYPE_COLORS: Record<string, string> = {
  coarse: '#10B981',
  game: '#8B5CF6',
  sea: '#3B82F6',
  mixed: colors.primary,
};

// ─── Demo leaderboard data ────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  color: string;
  level: number;
  catches: number;
  weightKg: number;
  xp: number;
  isMe?: boolean;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'CarpKingUK',    initials: 'CK', color: '#F59E0B', level: 24, catches: 31, weightKg: 287.4, xp: 1240 },
  { rank: 2, name: 'NightCarper',   initials: 'NC', color: '#8B5CF6', level: 21, catches: 27, weightKg: 241.8, xp: 1050 },
  { rank: 3, name: 'DaveAngler',    initials: 'DA', color: '#3B82F6', level: 19, catches: 22, weightKg: 198.5, xp: 890  },
  { rank: 4, name: 'You',           initials: 'ME', color: colors.primary, level: 17, catches: 18, weightKg: 162.0, xp: 720, isMe: true },
  { rank: 5, name: 'BreamBuster',   initials: 'BB', color: '#10B981', level: 16, catches: 15, weightKg: 134.3, xp: 610  },
  { rank: 6, name: 'PikePete',      initials: 'PP', color: '#EF4444', level: 14, catches: 12, weightKg: 108.6, xp: 490  },
  { rank: 7, name: 'TroutMaster',   initials: 'TM', color: '#6366F1', level: 13, catches: 11, weightKg: 97.2,  xp: 440  },
  { rank: 8, name: 'SalmonSue',     initials: 'SS', color: '#EC4899', level: 12, catches: 9,  weightKg: 82.5,  xp: 370  },
  { rank: 9, name: 'CastAngler_UK', initials: 'CA', color: '#F97316', level: 10, catches: 7,  weightKg: 61.0,  xp: 280  },
  { rank: 10, name: 'RiverRoger',   initials: 'RR', color: '#14B8A6', level: 9,  catches: 5,  weightKg: 44.8,  xp: 200  },
];

// ─── Demo recent club catches ─────────────────────────────────────────────────

interface ClubCatchItem {
  id: string;
  who: string;
  species: string;
  weightKg: number;
  ago: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const CLUB_CATCHES: ClubCatchItem[] = [
  { id: 'cc1', who: 'CarpKingUK',    species: 'Common Carp',  weightKg: 18.2, ago: '2h ago',   rarity: 'epic'     },
  { id: 'cc2', who: 'NightCarper',   species: 'Common Carp',  weightKg: 14.7, ago: '5h ago',   rarity: 'rare'     },
  { id: 'cc3', who: 'You',           species: 'Mirror Carp',  weightKg: 11.4, ago: '8h ago',   rarity: 'rare'     },
  { id: 'cc4', who: 'DaveAngler',    species: 'Common Carp',  weightKg: 12.4, ago: '1d ago',   rarity: 'rare'     },
  { id: 'cc5', who: 'BreamBuster',   species: 'Bream',        weightKg: 4.2,  ago: '1d ago',   rarity: 'uncommon' },
  { id: 'cc6', who: 'PikePete',      species: 'Pike',         weightKg: 9.8,  ago: '2d ago',   rarity: 'rare'     },
  { id: 'cc7', who: 'CarpKingUK',    species: 'Leather Carp', weightKg: 22.6, ago: '2d ago',   rarity: 'legendary'},
  { id: 'cc8', who: 'TroutMaster',   species: 'Rainbow Trout',weightKg: 3.1,  ago: '3d ago',   rarity: 'common'   },
  { id: 'cc9', who: 'SalmonSue',     species: 'Atlantic Salmon',weightKg:7.4, ago: '3d ago',   rarity: 'uncommon' },
  { id: 'cc10',who: 'RiverRoger',    species: 'Common Carp',  weightKg: 8.9,  ago: '4d ago',   rarity: 'uncommon' },
];

// ─── Rank badge colours ───────────────────────────────────────────────────────

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#CD7F32'];

// ─── Club detail tab type ─────────────────────────────────────────────────────

type DetailTab = 'overview' | 'leaderboard' | 'catches';

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ClubsScreen() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [createModal, setCreateModal] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);

  const openClub = (club: Club, tab: DetailTab = 'overview') => {
    setDetailTab(tab);
    setSelectedClub(club);
  };

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
                <TouchableOpacity key={id} style={styles.clubCard} onPress={() => openClub(club)}>
                  <ClubCardContent club={club} isJoined onViewLeaderboard={() => openClub(club, 'leaderboard')} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Featured Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Clubs</Text>
          {CLUBS.map(club => (
            <TouchableOpacity key={club.id} style={styles.clubCard} onPress={() => openClub(club)}>
              <ClubCardContent
                club={club}
                isJoined={joinedClubs.includes(club.id)}
                onViewLeaderboard={() => openClub(club, 'leaderboard')}
              />
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
              { label: 'Description', hint: "What's your club about?" },
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
            <View style={[styles.modal, { maxHeight: '92%', paddingBottom: 0 }]}>
              {/* Header */}
              <View style={styles.detailHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailName} numberOfLines={1}>{selectedClub.name}</Text>
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
                <TouchableOpacity onPress={() => setSelectedClub(null)} hitSlop={10}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabBar}>
                {(['overview', 'leaderboard', 'catches'] as DetailTab[]).map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabBtn, detailTab === tab && styles.tabBtnActive]}
                    onPress={() => setDetailTab(tab)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabBtnText, detailTab === tab && styles.tabBtnTextActive]}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab content */}
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
                {detailTab === 'overview' && (
                  <OverviewTab club={selectedClub} />
                )}
                {detailTab === 'leaderboard' && (
                  <LeaderboardTab />
                )}
                {detailTab === 'catches' && (
                  <CatchesTab />
                )}
              </ScrollView>

              {/* Join/Leave button */}
              <TouchableOpacity
                style={[styles.joinBtn, joinedClubs.includes(selectedClub.id) && styles.joinBtnLeave]}
                onPress={() => { handleJoin(selectedClub.id); setSelectedClub(null); }}
              >
                <Text style={[styles.joinBtnText, joinedClubs.includes(selectedClub.id) && { color: colors.danger }]}>
                  {joinedClubs.includes(selectedClub.id) ? 'Leave Club' : 'Join Club'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ club }: { club: Club }) {
  return (
    <View style={{ paddingTop: spacing.md }}>
      <Text style={styles.detailDesc}>{club.description}</Text>
      <View style={styles.detailStats}>
        <StatPill icon="account-group" value={club.memberCount.toLocaleString()} label="Members" />
        <StatPill icon="fish" value={club.catchesThisWeek.toString()} label="Catches/week" />
        <StatPill icon="calendar" value={club.founded} label="Founded" />
      </View>
      <Text style={styles.detailSectionLabel}>Top Members</Text>
      {club.members.map(m => (
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
      {club.recentCatches.map(c => (
        <View key={c.id} style={styles.catchRow}>
          <MaterialCommunityIcons name="fish" size={16} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.catchText}>{c.memberName} caught {c.species} ({c.weight}kg)</Text>
            <Text style={styles.catchSub}>{c.location} • {new Date(c.date).toLocaleDateString('en-GB')}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

function LeaderboardTab() {
  return (
    <View style={{ paddingTop: spacing.md }}>
      <Text style={styles.lbSubtitle}>Top 10 members this month</Text>

      {/* Column headers */}
      <View style={styles.lbHeaderRow}>
        <Text style={[styles.lbHeaderCell, { width: 32 }]}>#</Text>
        <Text style={[styles.lbHeaderCell, { flex: 1 }]}>Angler</Text>
        <Text style={[styles.lbHeaderCell, styles.lbHeaderRight]}>Catches</Text>
        <Text style={[styles.lbHeaderCell, styles.lbHeaderRight]}>Weight</Text>
        <Text style={[styles.lbHeaderCell, styles.lbHeaderRight]}>XP</Text>
      </View>

      {LEADERBOARD_DATA.map((entry) => {
        const rankColor = entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : colors.textTertiary;
        return (
          <View
            key={entry.rank}
            style={[
              styles.lbRow,
              entry.isMe && styles.lbRowMe,
              entry.rank === 1 && styles.lbRowFirst,
            ]}
          >
            {/* Rank */}
            <View style={[styles.lbRankBadge, { borderColor: rankColor + '55', backgroundColor: rankColor + '15' }]}>
              <Text style={[styles.lbRankText, { color: rankColor }]}>{entry.rank}</Text>
            </View>

            {/* Avatar + name */}
            <View style={styles.lbAngler}>
              <View style={[styles.lbAvatar, { backgroundColor: entry.color + '33', borderColor: entry.color + '55' }]}>
                <Text style={[styles.lbAvatarText, { color: entry.color }]}>{entry.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbName, entry.isMe && { color: colors.primary }]} numberOfLines={1}>
                  {entry.name}
                  {entry.isMe ? ' (You)' : ''}
                </Text>
                <View style={styles.lbLevelBadge}>
                  <Text style={styles.lbLevelText}>Lvl {entry.level}</Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <Text style={styles.lbStat}>{entry.catches}</Text>
            <Text style={styles.lbStat}>{entry.weightKg.toFixed(1)}kg</Text>
            <Text style={[styles.lbStat, { color: colors.primary }]}>{entry.xp}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Catches Tab ──────────────────────────────────────────────────────────────

function CatchesTab() {
  return (
    <View style={{ paddingTop: spacing.md }}>
      <Text style={styles.lbSubtitle}>Last 10 catches shared to the club</Text>
      {CLUB_CATCHES.map((item) => {
        const rarityColor = RARITY_COLORS[item.rarity] ?? '#9CA3AF';
        return (
          <View key={item.id} style={styles.clubCatchRow}>
            <View style={[styles.clubCatchDot, { backgroundColor: rarityColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.clubCatchMain}>
                <Text style={item.who === 'You' ? { color: colors.primary } : {}}>{item.who}</Text>
                {' caught '}
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.weightKg.toFixed(1)}kg {item.species}</Text>
              </Text>
              <Text style={styles.clubCatchSub}>{item.ago}</Text>
            </View>
            <View style={[styles.clubCatchRarity, { backgroundColor: rarityColor + '22', borderColor: rarityColor + '44' }]}>
              <Text style={[styles.clubCatchRarityText, { color: rarityColor }]}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Club Card Content ────────────────────────────────────────────────────────

function ClubCardContent({
  club,
  isJoined,
  onViewLeaderboard,
}: {
  club: Club;
  isJoined: boolean;
  onViewLeaderboard: () => void;
}) {
  return (
    <View>
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

      {/* View Leaderboard link */}
      <TouchableOpacity
        style={styles.viewLbRow}
        onPress={(e) => { e.stopPropagation?.(); onViewLeaderboard(); }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="trophy-outline" size={13} color={colors.primary} />
        <Text style={styles.viewLbText}>View Leaderboard</Text>
        <MaterialCommunityIcons name="chevron-right" size={13} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <MaterialCommunityIcons name={icon as any} size={14} color={colors.primary} />
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // View Leaderboard row at bottom of card
  viewLbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(0,212,170,0.04)',
  },
  viewLbText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.primary },

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

  // Detail modal
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  detailName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  detailRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  typePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  typePillText: { fontSize: 11, fontWeight: '700' },
  privatePill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.surface2, borderRadius: radius.full },
  privatePillText: { fontSize: 10, color: colors.textSecondary },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    padding: 3,
    marginBottom: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    ...elevation.raised,
  },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabBtnTextActive: { color: colors.textPrimary },

  // Overview tab
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

  // Leaderboard tab
  lbSubtitle: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm },
  lbHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 },
  lbHeaderCell: { fontSize: 10, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  lbHeaderRight: { width: 56, textAlign: 'right' },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    marginBottom: 4,
    gap: 8,
  },
  lbRowMe: {
    backgroundColor: 'rgba(0,212,170,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  lbRowFirst: {
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  lbRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  lbRankText: { fontSize: 12, fontWeight: '800' },
  lbAngler: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  lbAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  lbAvatarText: { fontSize: 10, fontWeight: '800' },
  lbName: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  lbLevelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  lbLevelText: { fontSize: 9, fontWeight: '700', color: colors.textSecondary },
  lbStat: { width: 56, textAlign: 'right', fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  // Catches tab
  clubCatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clubCatchDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  clubCatchMain: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  clubCatchSub: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  clubCatchRarity: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  clubCatchRarityText: { fontSize: 10, fontWeight: '700' },

  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.md, marginHorizontal: 0 },
  joinBtnLeave: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: colors.danger },
  joinBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0E1A' },
});
