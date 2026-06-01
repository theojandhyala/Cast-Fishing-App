import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { species } from '../data/species';
import { colors, radius, spacing } from '../constants/theme';

const TABS = ['Overview', 'Bait & Rigs', 'Regulations', 'Tips'];

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const fish = species.find((s) => s.id === id);

  if (!fish) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Species not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(0,212,170,0.12)', 'transparent']}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>{fish.emoji}</Text>
        <Text style={styles.heroName}>{fish.name}</Text>
        <Text style={styles.heroLatin}>{fish.latinName}</Text>
        <View style={styles.heroBadges}>
          <View style={[styles.badge, { backgroundColor: difficultyColors[fish.difficulty] + '22' }]}>
            <Text style={[styles.badgeText, { color: difficultyColors[fish.difficulty] }]}>
              {fish.difficulty}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{fish.type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(0,212,170,0.15)' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>UK Record: {fish.recordWeight}kg</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fish.legalSize}cm</Text>
          <Text style={styles.statLabel}>Legal Size</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fish.averageWeight}</Text>
          <Text style={styles.statLabel}>Avg Weight</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fish.averageLength}</Text>
          <Text style={styles.statLabel}>Avg Length</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabs}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === i && styles.tabActive]}
              onPress={() => setActiveTab(i)}
            >
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === 0 && (
          <View>
            <Section title="Habitat">
              <Text style={styles.bodyText}>{fish.habitat}</Text>
            </Section>
            <Section title="Behaviour">
              <Text style={styles.bodyText}>{fish.behaviour}</Text>
            </Section>
            <Section title="Best Weather">
              <Text style={styles.bodyText}>{fish.bestWeather}</Text>
            </Section>
            <Section title="Best Seasons">
              <View style={styles.chips}>
                {fish.bestSeasons.map((s) => (
                  <View key={s} style={styles.seasonChip}>
                    <Text style={styles.seasonText}>{s}</Text>
                  </View>
                ))}
              </View>
            </Section>
          </View>
        )}

        {activeTab === 1 && (
          <View>
            <Section title="Best Baits">
              {fish.baits.map((bait) => (
                <View key={bait.name} style={styles.baitRow}>
                  <Text style={styles.baitName}>{bait.name}</Text>
                  <View style={styles.effectivenessBar}>
                    <View style={[styles.effectivenessFill, { width: `${bait.effectiveness * 10}%` }]} />
                  </View>
                  <Text style={styles.effectivenessNum}>{bait.effectiveness}/10</Text>
                </View>
              ))}
            </Section>
            <Section title="Recommended Rigs">
              {fish.rigs.map((rig) => (
                <View key={rig.name} style={styles.rigCard}>
                  <Text style={styles.rigName}>{rig.name}</Text>
                  <Text style={styles.rigDesc}>{rig.description}</Text>
                </View>
              ))}
            </Section>
            <Section title="Hook Sizes">
              <View style={styles.chips}>
                {fish.hookSizes.map((h) => (
                  <View key={h} style={styles.chip}>
                    <Text style={styles.chipText}>Size {h}</Text>
                  </View>
                ))}
              </View>
            </Section>
            <Section title="Line Weight">
              <Text style={styles.bodyText}>{fish.lineWeight}</Text>
            </Section>
          </View>
        )}

        {activeTab === 2 && (
          <View>
            <View style={styles.legalSizeCard}>
              <MaterialCommunityIcons name="ruler" size={20} color={colors.primary} />
              <View style={styles.legalSizeText}>
                <Text style={styles.legalSizeValue}>{fish.legalSize}cm minimum</Text>
                <Text style={styles.legalSizeNote}>UK legal retention size. Always measure before keeping.</Text>
              </View>
            </View>
            <Section title="Record Weight">
              <Text style={styles.bodyText}>UK Record: {fish.recordWeight}kg</Text>
            </Section>
            <Section title="Conservation">
              <Text style={styles.bodyText}>
                Always practice good fish care. Wet your hands before handling, minimise air time, use an unhooking mat for larger fish, and revive fully before release.
              </Text>
            </Section>
            <Section title="Licensing">
              <Text style={styles.bodyText}>
                An EA Rod Licence is required to fish for all freshwater fish in England and Wales. Salmon and sea trout require an additional migratory licence. Always check local byelaws.
              </Text>
            </Section>
          </View>
        )}

        {activeTab === 3 && (
          <View>
            {fish.tips.map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroLatin: {
    fontSize: 15,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  seasonChip: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  seasonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  baitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  baitName: {
    fontSize: 14,
    color: colors.textPrimary,
    width: 120,
  },
  effectivenessBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  effectivenessFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  effectivenessNum: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  rigCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rigName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  rigDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  legalSizeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  legalSizeText: {
    flex: 1,
  },
  legalSizeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  legalSizeNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,212,170,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
