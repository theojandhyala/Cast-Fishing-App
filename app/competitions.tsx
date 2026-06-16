import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COMPETITIONS, PAST_RESULTS, COMMUNITY_MATCH_LEADERBOARD } from '../data/competitionsData';
import { colors, radius, spacing } from '../constants/theme';

export default function CompetitionsScreen() {
  const [tab, setTab] = useState<'upcoming' | 'community' | 'past'>('upcoming');
  const upcoming = COMPETITIONS.filter(c => !c.isPast && c.id !== 'comp10');
  const community = COMPETITIONS.find(c => c.id === 'comp10');

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'community', 'past'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'community' ? 'CAST Match' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'upcoming' && upcoming.map(comp => (
          <View key={comp.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.compName}>{comp.name}</Text>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="calendar" size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{new Date(comp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
              </View>
              <View style={styles.entryFeeBadge}>
                <Text style={styles.entryFeeText}>{comp.entryFee === 0 ? 'Free' : `£${comp.entryFee}`}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
              <Text style={styles.locationText}>{comp.location}</Text>
            </View>
            <Text style={styles.description}>{comp.description}</Text>
            <View style={styles.infoGrid}>
              <InfoItem icon="fish" label="Species" value={comp.species} />
              <InfoItem icon="trophy" label="Prize" value={comp.prize} />
              <InfoItem icon="account" label="Organiser" value={comp.organiser} />
              <InfoItem icon="account-group" label="Entrants" value={`${comp.currentEntrants}/${comp.maxEntrants}`} />
            </View>
            <TouchableOpacity
              style={[styles.enterBtn, comp.currentEntrants >= comp.maxEntrants && styles.enterBtnFull]}
              onPress={() => Alert.alert(
                comp.currentEntrants >= comp.maxEntrants ? 'Full' : 'Enter Competition',
                comp.currentEntrants >= comp.maxEntrants
                  ? 'This competition is now full. Check back for updates.'
                  : `Register for ${comp.name}?\n\nEntry fee: ${comp.entryFee === 0 ? 'Free' : '£' + comp.entryFee}\nPrize: ${comp.prize}`,
                comp.currentEntrants >= comp.maxEntrants
                  ? [{ text: 'OK' }]
                  : [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Enter Now', onPress: () => Alert.alert('Entered!', 'You have been registered. Good luck!') },
                    ]
              )}
            >
              <Text style={[styles.enterBtnText, comp.currentEntrants >= comp.maxEntrants && styles.enterBtnTextFull]}>
                {comp.currentEntrants >= comp.maxEntrants ? 'Full — Waitlist' : 'Enter Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {tab === 'community' && community && (
          <View>
            <View style={styles.communityHero}>
              <Text style={styles.communityTitle}>🏆 CAST Community Match</Text>
              <Text style={styles.communitySubtitle}>Monthly virtual competition</Text>
              <Text style={styles.communityDesc}>{community.description}</Text>
              <View style={styles.communityMeta}>
                <Text style={styles.communityMetaItem}>📅 Ends {new Date(community.date).toLocaleDateString('en-GB')}</Text>
                <Text style={styles.communityMetaItem}>👥 {community.currentEntrants} entered</Text>
                <Text style={styles.communityMetaItem}>🎁 {community.prize}</Text>
              </View>
            </View>
            <Text style={styles.lbTitle}>June Leaderboard</Text>
            {COMMUNITY_MATCH_LEADERBOARD.map((entry, i) => {
              const isUser = entry.name === 'You';
              const gap = i > 0 && entry.rank !== COMMUNITY_MATCH_LEADERBOARD[i - 1].rank + 1;
              return (
                <View key={entry.rank}>
                  {gap && <Text style={styles.gapText}>• • •</Text>}
                  <View style={[styles.lbRow, isUser && styles.lbRowUser]}>
                    <Text style={[styles.lbRank, entry.rank <= 3 && { color: ['#FFD700', '#C0C0C0', '#CD7F32'][entry.rank - 1] }]}>#{entry.rank}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.lbName, isUser && { color: colors.primary }]}>{entry.name}</Text>
                      <Text style={styles.lbSub}>{entry.species} — {new Date(entry.date).toLocaleDateString('en-GB')}</Text>
                    </View>
                    <Text style={styles.lbWeight}>{entry.weight}kg</Text>
                  </View>
                </View>
              );
            })}
            <TouchableOpacity style={styles.submitBtn} onPress={() => Alert.alert('Submit Catch', 'Your biggest catch this month will be automatically tracked from your catch log!')}>
              <Text style={styles.submitBtnText}>Submit My Catch</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'past' && (
          <View>
            <Text style={styles.pastHint}>Past competition results</Text>
            {PAST_RESULTS.map((r, i) => (
              <View key={i} style={styles.pastCard}>
                <View style={styles.pastHeader}>
                  <Text style={styles.pastName}>{r.competitionName}</Text>
                  <Text style={styles.pastDate}>{new Date(r.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</Text>
                </View>
                <View style={styles.pastWinner}>
                  <Text style={styles.pastWinnerLabel}>🥇 Winner: </Text>
                  <Text style={styles.pastWinnerName}>{r.winner}</Text>
                </View>
                <Text style={styles.pastCatch}>{r.winningCatch} — {r.weight}kg</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <MaterialCommunityIcons name={icon as any} size={12} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}: </Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#0A0E1A' },
  content: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  compName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  entryFeeBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  entryFeeText: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: colors.primary },
  description: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  infoGrid: { gap: 4 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: 12, color: colors.textSecondary },
  infoValue: { fontSize: 12, color: colors.textPrimary, fontWeight: '500', flex: 1 },
  enterBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.sm + 4, alignItems: 'center' },
  enterBtnFull: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  enterBtnText: { fontSize: 14, fontWeight: '700', color: '#0A0E1A' },
  enterBtnTextFull: { color: colors.textSecondary },
  communityHero: { backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)', padding: spacing.lg, marginBottom: spacing.lg },
  communityTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  communitySubtitle: { fontSize: 13, color: colors.primary, marginTop: 2, marginBottom: spacing.sm },
  communityDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  communityMeta: { gap: 4 },
  communityMetaItem: { fontSize: 13, color: colors.textSecondary },
  lbTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  lbRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  lbRowUser: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.06)' },
  lbRank: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, minWidth: 32 },
  lbName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  lbSub: { fontSize: 12, color: colors.textSecondary },
  lbWeight: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  gapText: { textAlign: 'center', color: colors.textSecondary, marginVertical: spacing.sm, fontSize: 14 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#0A0E1A' },
  pastHint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  pastCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, gap: 4 },
  pastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pastName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  pastDate: { fontSize: 12, color: colors.textSecondary },
  pastWinner: { flexDirection: 'row', alignItems: 'center' },
  pastWinnerLabel: { fontSize: 13, color: colors.textSecondary },
  pastWinnerName: { fontSize: 13, color: colors.secondary, fontWeight: '700' },
  pastCatch: { fontSize: 12, color: colors.textSecondary },
});
