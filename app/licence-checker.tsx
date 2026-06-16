import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../constants/theme';

const SPECIES_SIZES: Record<string, { min: number; unit: string; notes: string }> = {
  'Carp': { min: 0, unit: 'cm', notes: 'No minimum size limit in England & Wales' },
  'Pike': { min: 0, unit: 'cm', notes: 'Recommended to return fish over 65cm for conservation' },
  'Perch': { min: 0, unit: 'cm', notes: 'No minimum size limit, but practise conservation' },
  'Barbel': { min: 0, unit: 'cm', notes: 'Handle with extreme care — very sensitive to stress' },
  'Tench': { min: 0, unit: 'cm', notes: 'No minimum size limit in England & Wales' },
  'Bream': { min: 0, unit: 'cm', notes: 'No minimum size limit in England & Wales' },
  'Roach': { min: 0, unit: 'cm', notes: 'No minimum size limit, return small fish' },
  'Salmon': { min: 40, unit: 'cm', notes: 'Mandatory catch & release in many rivers — check local byelaws' },
  'Sea Trout': { min: 25, unit: 'cm', notes: 'Season and size limits vary by river' },
  'Brown Trout': { min: 25, unit: 'cm', notes: 'Most rivers require 25-30cm minimum — check locally' },
};

const CLOSED_SEASONS = [
  { species: 'Coarse Fish (Rivers)', period: '15 March – 15 June', isOpen: true, notes: 'Rivers only. Stillwaters have no mandatory close season.' },
  { species: 'Salmon (general)', period: 'October – February', isOpen: false, notes: 'Exact dates vary by river catchment. Mandatory C&R in many areas.' },
  { species: 'Migratory Trout', period: 'October – February', isOpen: false, notes: 'Season dates vary widely by region and river.' },
  { species: 'Brown Trout', period: 'October – February', isOpen: false, notes: 'Rivers: Oct–Feb closed on most. Stillwaters often open year-round.' },
  { species: 'Rainbow Trout', period: 'Varies by fishery', isOpen: true, notes: 'Stocked stillwater fisheries are typically open all year.' },
];

const BYELAWS = [
  { region: 'Thames Region', rules: ['Barbel: Handle with wet hands only, no keepnets', 'No keepnets on many chalk streams', 'Some rivers have night fishing bans'] },
  { region: 'Anglian Region', rules: ['Pike: Return immediately with wet hands', 'No keepnets for pike anywhere', 'Zander must be returned on some drains'] },
  { region: 'Severn & Wye', rules: ['Salmon: Catch & release only on many beats', 'Grayling close season applies on many rivers', 'No wading on some chalk streams'] },
  { region: 'Northern Region', rules: ['Salmon & sea trout: check individual river rules', 'Trout season typically 25 Mar – 30 Sep', 'Barbel rules as per national guidelines'] },
];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const currentMonth = new Date().getMonth();

function isSeasonOpen(period: string): boolean {
  // Simplified check
  const m = currentMonth;
  if (period.includes('March') && period.includes('June')) {
    return !(m >= 2 && m <= 5);
  }
  if (period.includes('October') && period.includes('February')) {
    return m >= 2 && m <= 8;
  }
  return true;
}

export default function LicenceCheckerScreen() {
  const router = useRouter();
  const [licenceStep, setLicenceStep] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [inputLength, setInputLength] = useState('');
  const [tab, setTab] = useState<'licence' | 'seasons' | 'sizes' | 'byelaws'>('licence');

  const speciesSize = SPECIES_SIZES[selectedSpecies];
  const measuredLength = parseFloat(inputLength) || 0;
  const isLegal = !speciesSize || speciesSize.min === 0 || measuredLength >= speciesSize.min;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(239,68,68,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Licence & Regulations</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {(['licence', 'seasons', 'sizes', 'byelaws'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'licence' ? '📄 Licence' : t === 'seasons' ? '📅 Seasons' : t === 'sizes' ? '📏 Size Limits' : '⚖️ Byelaws'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'licence' && (
          <View style={styles.content}>
            <View style={styles.licenceCard}>
              <Text style={styles.licenceTitle}>Do I need a licence?</Text>
              <View style={styles.answerCard}>
                <MaterialCommunityIcons name="check-circle" size={32} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.answerYes}>Yes — in England & Wales</Text>
                  <Text style={styles.answerText}>You need an EA rod licence to fish for salmon, trout, freshwater fish, smelt or eel in England and Wales.</Text>
                </View>
              </View>

              <Text style={styles.licenceSubTitle}>Licence Types</Text>
              {[
                { type: 'Trout & Coarse, 1 rod', price: '£6', period: '1 day' },
                { type: 'Trout & Coarse, 1 rod', price: '£12', period: '8 days' },
                { type: 'Trout & Coarse, 1 rod', price: '£35', period: '12 months' },
                { type: 'Trout & Coarse, 2 rods', price: '£52', period: '12 months' },
                { type: 'Salmon & Sea Trout', price: '£82', period: '12 months' },
                { type: 'Junior (under 16)', price: 'FREE', period: 'Year-round' },
              ].map(l => (
                <View key={l.type + l.period} style={styles.licenceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.licenceType}>{l.type}</Text>
                    <Text style={styles.licencePeriod}>{l.period}</Text>
                  </View>
                  <Text style={[styles.licencePrice, l.price === 'FREE' && { color: colors.success }]}>{l.price}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => Linking.openURL('https://www.gov.uk/get-a-fishing-licence')}
              >
                <MaterialCommunityIcons name="open-in-new" size={18} color="#0A0E1A" />
                <Text style={styles.buyBtnText}>Buy EA Rod Licence</Text>
              </TouchableOpacity>
            </View>

            {/* Am I Legal today? */}
            <View style={styles.legalCard}>
              <Text style={styles.legalTitle}>Am I Legal Today?</Text>
              <Text style={styles.legalDate}>Checking for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
              {CLOSED_SEASONS.map(cs => {
                const open = isSeasonOpen(cs.period);
                return (
                  <View key={cs.species} style={styles.legalRow}>
                    <MaterialCommunityIcons name={open ? 'check-circle' : 'close-circle'} size={20} color={open ? colors.success : colors.danger} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legalSpecies}>{cs.species}</Text>
                      <Text style={styles.legalPeriod}>{cs.period}</Text>
                    </View>
                    <Text style={[styles.legalStatus, { color: open ? colors.success : colors.danger }]}>
                      {open ? 'OPEN' : 'CLOSED'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {tab === 'seasons' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Closed Season Overview</Text>
            {CLOSED_SEASONS.map(cs => {
              const open = isSeasonOpen(cs.period);
              return (
                <View key={cs.species} style={[styles.seasonCard, { borderLeftColor: open ? colors.success : colors.danger }]}>
                  <View style={styles.seasonHeader}>
                    <MaterialCommunityIcons name={open ? 'check-circle' : 'close-circle'} size={20} color={open ? colors.success : colors.danger} />
                    <Text style={styles.seasonSpecies}>{cs.species}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: open ? colors.success + '22' : colors.danger + '22' }]}>
                      <Text style={[styles.statusText, { color: open ? colors.success : colors.danger }]}>
                        {open ? 'IN SEASON' : 'CLOSED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.seasonPeriod}>🗓 Closed: {cs.period}</Text>
                  <Text style={styles.seasonNotes}>{cs.notes}</Text>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'sizes' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Size Limit Checker</Text>
            <Text style={styles.subTitle}>Select species and enter length to check if it's legal to retain</Text>

            <View style={styles.speciesGrid}>
              {Object.keys(SPECIES_SIZES).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speciesBtn, selectedSpecies === s && styles.speciesBtnActive]}
                  onPress={() => setSelectedSpecies(selectedSpecies === s ? '' : s)}
                >
                  <Text style={[styles.speciesBtnText, selectedSpecies === s && styles.speciesBtnTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedSpecies && (
              <View style={styles.sizeChecker}>
                <Text style={styles.sizeTitle}>{selectedSpecies}</Text>
                <Text style={styles.sizeRule}>
                  Minimum size: {speciesSize?.min === 0 ? 'None specified' : `${speciesSize?.min}${speciesSize?.unit}`}
                </Text>
                <Text style={styles.sizeNotes}>{speciesSize?.notes}</Text>
                <View style={[styles.resultCard, { backgroundColor: isLegal ? colors.success + '22' : colors.danger + '22', borderColor: isLegal ? colors.success + '44' : colors.danger + '44' }]}>
                  <MaterialCommunityIcons name={isLegal ? 'check-circle' : 'close-circle'} size={28} color={isLegal ? colors.success : colors.danger} />
                  <Text style={[styles.resultText, { color: isLegal ? colors.success : colors.danger }]}>
                    {speciesSize?.min === 0 ? 'No size restriction' : isLegal ? `${measuredLength}cm ✓ Legal to keep` : `${measuredLength}cm — Under minimum. Must return.`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {tab === 'byelaws' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Regional Byelaws</Text>
            <Text style={styles.subTitle}>Key rules by EA region — always check local notices at the fishery</Text>
            {BYELAWS.map(b => (
              <View key={b.region} style={styles.byelawCard}>
                <Text style={styles.byelawRegion}>{b.region}</Text>
                {b.rules.map(r => (
                  <View key={r} style={styles.byelawRow}>
                    <Text style={styles.byelawBullet}>•</Text>
                    <Text style={styles.byelawRule}>{r}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={styles.disclaimer}>
              <MaterialCommunityIcons name="information-outline" size={16} color={colors.warning} />
              <Text style={styles.disclaimerText}>Rules change regularly. Always verify current regulations with the EA or your fishery before fishing.</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabsScroll: { marginBottom: spacing.sm },
  tabsContent: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  activeTab: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: colors.primary },
  content: { paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm },
  subTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  licenceCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  licenceTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  answerCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  answerYes: { fontSize: 16, fontWeight: '700', color: colors.success, marginBottom: 4 },
  answerText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  licenceSubTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  licenceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  licenceType: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  licencePeriod: { fontSize: 11, color: colors.textSecondary },
  licencePrice: { fontSize: 16, fontWeight: '800', color: colors.primary },
  buyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.sm + 4, marginTop: spacing.md },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: '#0A0E1A' },
  legalCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  legalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  legalDate: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
  legalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  legalSpecies: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  legalPeriod: { fontSize: 11, color: colors.textSecondary },
  legalStatus: { fontSize: 11, fontWeight: '800' },
  seasonCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border },
  seasonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  seasonSpecies: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  seasonPeriod: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  seasonNotes: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  speciesBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  speciesBtnActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  speciesBtnText: { fontSize: 13, color: colors.textSecondary },
  speciesBtnTextActive: { color: colors.primary, fontWeight: '600' },
  sizeChecker: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  sizeTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  sizeRule: { fontSize: 14, color: colors.textPrimary, marginBottom: 4 },
  sizeNotes: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md, fontStyle: 'italic' },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1 },
  resultText: { fontSize: 15, fontWeight: '700', flex: 1 },
  byelawCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  byelawRegion: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  byelawRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 4 },
  byelawBullet: { color: colors.textSecondary },
  byelawRule: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  disclaimer: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', marginBottom: spacing.md },
  disclaimerText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
});
