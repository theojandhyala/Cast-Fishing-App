import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { colors, radius, spacing } from '../constants/theme';
import { getFishById, RARITY_COLOURS } from '../data/fishDatabase';
import { FishPhoto } from '../components/fish/FishPhoto';

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const fish = id ? getFishById(id) : null;

  if (!fish) {
    return <SafeAreaView style={styles.screen}><View style={styles.notFound}><Icon name="fish-off" size={48} color={colors.border} /><Text style={styles.title}>Species not found</Text><TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Go back</Text></TouchableOpacity></View></SafeAreaView>;
  }

  const accent = RARITY_COLOURS[fish.rarity];
  const recordValue = fish.record.weightKg != null ? `${fish.record.weightKg} kg` : fish.record.lengthCm != null ? `${fish.record.lengthCm} cm` : 'Not displayed';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><Icon name="chevron-left" size={28} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Species profile</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { borderColor: `${accent}55` }]}>
          <FishPhoto scientificName={fish.scientificName} commonName={fish.commonName} accent={accent} variant="hero" />
          <Text style={styles.title}>{fish.commonName}</Text>
          <Text style={styles.latin}>{fish.scientificName}</Text>
          <View style={styles.badges}>
            <Badge text={fish.rarity} colour={accent} />
            <Badge text={`${fish.xp} XP`} colour={accent} />
            <Badge text={fish.waterType} colour={colors.primary} />
          </View>
        </View>

        <Section title="Range">
          <ChipList values={fish.regions} />
        </Section>
        <Section title="Habitats">
          <ChipList values={fish.habitats} />
        </Section>
        <Section title="Best baits">
          <ChipList values={fish.bestBaits} />
        </Section>
        <Section title="Seasons">
          <ChipList values={fish.seasons} />
          <Text style={styles.caveat}>Season guidance is general. Closed seasons and protected stocks always take priority.</Text>
        </Section>

        <Section title="Conservation">
          <View style={styles.infoRow}><Icon name="leaf" size={19} color={colors.success} /><View style={styles.infoBody}><Text style={styles.infoValue}>{fish.conservationStatus}</Text><Text style={styles.infoCaption}>{fish.conservationAssessment.authority ?? 'No assessment citation bundled'}</Text></View></View>
        </Section>

        <Section title="World record">
          <View style={styles.recordCard}>
            <Icon name={fish.record.status === 'verified' ? 'check-decagram' : 'shield-alert-outline'} size={25} color={fish.record.status === 'verified' ? colors.success : colors.secondary} />
            <View style={styles.infoBody}>
              <Text style={styles.infoValue}>{recordValue}</Text>
              <Text style={styles.infoCaption}>{fish.record.status.toUpperCase()} · {fish.record.authority ?? 'No cited authority'}</Text>
              {!!fish.record.note && <Text style={styles.recordNote}>{fish.record.note}</Text>}
            </View>
          </View>
          {!!fish.record.sourceUrl && <SourceLink label="Open record source" url={fish.record.sourceUrl} />}
        </Section>

        <Section title="Data provenance">
          <Text style={styles.quality}>Profile quality: {fish.dataQuality.replace('-', ' ')}</Text>
          {!!fish.notes && <Text style={styles.body}>{fish.notes}</Text>}
          {fish.sources.length ? fish.sources.map((source) => source.url
            ? <SourceLink key={`${source.label}-${source.scope}`} label={`${source.label} · ${source.scope}`} url={source.url} />
            : <Text key={`${source.label}-${source.scope}`} style={styles.sourceText}>{source.label} · {source.scope}</Text>
          ) : <Text style={styles.body}>No source links are bundled for this legacy profile yet.</Text>}
        </Section>
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function ChipList({ values }: { values: readonly string[] }) {
  return <View style={styles.chips}>{values.map((value) => <View key={value} style={styles.chip}><Text style={styles.chipText}>{value}</Text></View>)}</View>;
}

function Badge({ text, colour }: { text: string; colour: string }) {
  return <View style={[styles.badge, { borderColor: `${colour}88`, backgroundColor: `${colour}15` }]}><Text style={[styles.badgeText, { color: colour }]}>{text}</Text></View>;
}

function SourceLink({ label, url }: { label: string; url: string }) {
  return <TouchableOpacity style={styles.source} onPress={() => Linking.openURL(url)}><Icon name="open-in-new" size={15} color={colors.primary} /><Text style={styles.link}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { height: 54, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  content: { paddingHorizontal: spacing.lg },
  hero: { alignItems: 'center', backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1 },
  heroIcon: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { color: colors.textPrimary, fontSize: 27, fontWeight: '800', textAlign: 'center' },
  latin: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: spacing.md },
  badge: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  section: { marginTop: spacing.xl },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { color: colors.textSecondary, fontSize: 12, textTransform: 'capitalize' },
  caveat: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: spacing.sm },
  infoRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  infoBody: { flex: 1 },
  infoValue: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  infoCaption: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  recordCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  recordNote: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 8 },
  quality: { color: colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 7 },
  body: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  sourceText: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.sm },
  link: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
