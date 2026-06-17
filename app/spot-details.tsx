import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WORLD_SPOTS } from '../data/worldSpots';
import { colors, radius, spacing, elevation } from '../constants/theme';
import { getSpotImage } from '../constants/spotImages';
import { getSpotKnowledge } from '../utils/spotKnowledge';
import { useSessionStore } from '../store/sessionStore';
import { useLocationStore } from '../store/locationStore';

const SPOT_GRADIENTS: Record<string, [string, string]> = {
  river:     ['#1a3a2a', '#0d1f16'],
  lake:      ['#1a2a3a', '#0d1620'],
  sea:       ['#132035', '#0a1525'],
  reservoir: ['#1a2535', '#0f1928'],
  ocean:     ['#0f1e30', '#0a1320'],
  estuary:   ['#1a2a20', '#0f1a12'],
  private:   ['#1a1a2a', '#0f0f1a'],
};

const TYPE_ICONS: Record<string, string> = {
  river: 'waves', lake: 'water', sea: 'anchor',
  reservoir: 'water-pump', ocean: 'sail-boat', estuary: 'water-outline', private: 'lock',
};

function KnowledgeBlock({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={s.knowledgeBlock}>
      <View style={s.knowledgeHeader}>
        <View style={s.knowledgeIconWrap}>
          <MaterialCommunityIcons name={icon as any} size={16} color={colors.primary} />
        </View>
        <Text style={s.knowledgeTitle}>{title}</Text>
      </View>
      <Text style={s.knowledgeText}>{text}</Text>
    </View>
  );
}

export default function SpotDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = WORLD_SPOTS.find((s) => s.id === id);
  const { activeSession, startSession } = useSessionStore();
  const { setLocation } = useLocationStore();
  const [saved, setSaved] = useState(false);

  const reviewCount = spot
    ? 20 + (spot.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 200)
    : 0;

  if (!spot) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textPrimary }}>Spot not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const grad = SPOT_GRADIENTS[spot.type] || ['#1a2a3a', '#0f1924'];
  const knowledge = getSpotKnowledge(spot);
  const overflowCount = spot.species.length > 4 ? spot.species.length - 4 : 0;
  const isSaltwater = ['sea', 'ocean', 'estuary'].includes(spot.type);

  const handleStartSession = () => {
    if (activeSession) {
      Alert.alert('Session in progress', `You already have an active session at ${activeSession.spotName}.`, [{ text: 'OK' }]);
      return;
    }
    setLocation({ name: spot.name, query: spot.name });
    startSession(spot.name, { spotQuery: spot.name, latitude: spot.latitude, longitude: spot.longitude });
    router.push('/session' as any);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Unable to open maps'));
  };

  return (
    <View style={s.safe}>
      {/* ── Hero ── */}
      <View style={s.hero}>
        <LinearGradient colors={grad} style={StyleSheet.absoluteFillObject} />
        <Image
          source={{ uri: getSpotImage(spot) }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.65 }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']} style={s.heroNav}>
          <TouchableOpacity onPress={() => router.back()} style={s.heroBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSaved(v => !v)} style={s.heroBtn}>
            <MaterialCommunityIcons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22} color="#fff"
            />
          </TouchableOpacity>
        </SafeAreaView>
        {/* Hero label at bottom */}
        <View style={s.heroLabel}>
          <View style={s.heroTypeBadge}>
            <MaterialCommunityIcons name={TYPE_ICONS[spot.type] as any} size={12} color={colors.primary} />
            <Text style={s.heroTypeBadgeText}>{spot.type.toUpperCase()}</Text>
          </View>
          <Text style={s.heroName} numberOfLines={2}>{spot.name}</Text>
          <Text style={s.heroCountry}>{spot.region}, {spot.country}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Rating + meta ── */}
        <View style={s.metaBar}>
          <View style={s.ratingChip}>
            <MaterialCommunityIcons name="star" size={13} color={colors.secondary} />
            <Text style={s.ratingText}>{spot.rating}</Text>
            <Text style={s.ratingCount}>({reviewCount} reviews)</Text>
          </View>
          <View style={s.metaDot} />
          <Text style={s.metaType}>{isSaltwater ? 'Saltwater' : 'Freshwater'}</Text>
          <View style={s.metaDot} />
          <Text style={[s.metaDifficulty, {
            color: spot.difficulty === 'beginner' ? '#10B981' : spot.difficulty === 'intermediate' ? colors.secondary : '#EF4444'
          }]}>
            {spot.difficulty.charAt(0).toUpperCase() + spot.difficulty.slice(1)}
          </Text>
          {saved && (
            <>
              <View style={s.metaDot} />
              <Text style={s.savedText}>Saved</Text>
            </>
          )}
        </View>

        {/* ── Quick Facts ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.factsScroll}>
          {knowledge.quickFacts.map(f => (
            <View key={f.label} style={s.factCard}>
              <MaterialCommunityIcons name={f.icon as any} size={18} color={colors.primary} />
              <Text style={s.factLabel}>{f.label}</Text>
              <Text style={s.factValue} numberOfLines={2}>{f.value}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Species ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Species</Text>
          <View style={s.speciesRow}>
            {spot.species.slice(0, 5).map((sp: string) => (
              <View key={sp} style={s.speciesItem}>
                <View style={s.speciesCircle}>
                  <MaterialCommunityIcons name="fish" size={18} color={colors.primary} />
                </View>
                <Text style={s.speciesName} numberOfLines={2}>{sp}</Text>
              </View>
            ))}
            {overflowCount > 0 && (
              <View style={s.speciesItem}>
                <View style={[s.speciesCircle, { backgroundColor: colors.surface2 }]}>
                  <Text style={s.overflowText}>+{overflowCount}</Text>
                </View>
                <Text style={s.speciesName}>more</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.divider} />

        {/* ── About this spot ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About this Spot</Text>
          <Text style={s.bodyText}>{knowledge.extendedDescription}</Text>
        </View>

        <View style={s.divider} />

        {/* ── Fishing knowledge ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Fishing Knowledge</Text>
          <KnowledgeBlock
            icon="hook"
            title="Tactics & Technique"
            text={knowledge.tactics}
          />
          <KnowledgeBlock
            icon="waves"
            title="Reading the Water"
            text={knowledge.waterReading}
          />
          <KnowledgeBlock
            icon="calendar-month"
            title="Seasonal Advice"
            text={knowledge.seasonalAdvice}
          />
          <KnowledgeBlock
            icon="signal"
            title="Difficulty Guide"
            text={knowledge.difficultyNote}
          />
          {spot.tips ? (
            <KnowledgeBlock
              icon="lightbulb-on"
              title="Local Tips"
              text={spot.tips}
            />
          ) : null}
        </View>

        <View style={s.divider} />

        {/* ── Best seasons ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Best Seasons</Text>
          <View style={s.seasonsRow}>
            {['Spring', 'Summer', 'Autumn', 'Winter'].map(season => {
              const active = spot.bestSeason.some(s => s.includes(season));
              return (
                <View key={season} style={[s.seasonChip, active && s.seasonChipActive]}>
                  <MaterialCommunityIcons
                    name={season === 'Spring' ? 'flower' : season === 'Summer' ? 'weather-sunny' : season === 'Autumn' ? 'leaf' : 'snowflake'}
                    size={16}
                    color={active ? colors.primary : colors.textTertiary}
                  />
                  <Text style={[s.seasonText, active && s.seasonTextActive]}>{season}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Best bait ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Best Bait</Text>
          <View style={s.baitRow}>
            {spot.bestBait.map(bait => (
              <View key={bait} style={s.baitChip}>
                <MaterialCommunityIcons name="hook" size={12} color={colors.secondary} />
                <Text style={s.baitText}>{bait}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Best times ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Best Times to Fish</Text>
          <View style={s.timesRow}>
            <View style={s.timeCard}>
              <MaterialCommunityIcons name="weather-sunset-up" size={18} color={colors.secondary} />
              <View>
                <Text style={s.timeLabel}>Dawn</Text>
                <Text style={s.timeText}>05:30 – 08:00</Text>
              </View>
            </View>
            <View style={s.timeCard}>
              <MaterialCommunityIcons name="weather-sunset-down" size={18} color={colors.secondary} />
              <View>
                <Text style={s.timeLabel}>Dusk</Text>
                <Text style={s.timeText}>18:00 – 20:30</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Facilities ── */}
        {spot.facilities && spot.facilities.length > 0 && (
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Facilities</Text>
              <View style={s.facilitiesGrid}>
                {spot.facilities.map(f => (
                  <View key={f} style={s.facilityItem}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
                    <Text style={s.facilityText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={s.divider} />
          </>
        )}

        {/* ── Permit / regulations ── */}
        <View style={s.section}>
          <View style={[s.permitBanner, { borderColor: spot.permitRequired ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)' }]}>
            <MaterialCommunityIcons
              name={spot.permitRequired ? 'file-document-outline' : 'check-circle-outline'}
              size={20}
              color={spot.permitRequired ? colors.secondary : '#10B981'}
            />
            <View style={{ flex: 1 }}>
              <Text style={[s.permitTitle, { color: spot.permitRequired ? colors.secondary : '#10B981' }]}>
                {spot.permitRequired ? 'Permit Required' : 'No Permit Required'}
              </Text>
              <Text style={s.permitText}>{knowledge.regulatoryNote}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.dirBtn}
          onPress={handleDirections}
          activeOpacity={0.85}
          accessibilityLabel="Get directions to this spot"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.textSecondary} />
          <Text style={s.dirBtnText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.startBtn} onPress={handleStartSession} activeOpacity={0.85}>
          <LinearGradient colors={['#00D4AA', '#00B892']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBtnGrad}>
            <MaterialCommunityIcons name="fish" size={16} color="#0A0E1A" />
            <Text style={s.startBtnText}>Start Fishing Here</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  hero: { height: 280, justifyContent: 'flex-end', overflow: 'hidden' },
  heroNav: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  heroBtn: {
    width: 38, height: 38, borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  heroLabel: { padding: spacing.lg, paddingBottom: 18 },
  heroTypeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,212,170,0.2)', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.35)', marginBottom: 8,
  },
  heroTypeBadgeText: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 1.5 },
  heroName: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  heroCountry: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },

  metaBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '800', color: colors.secondary },
  ratingCount: { fontSize: 12, color: colors.textTertiary },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textTertiary },
  metaType: { fontSize: 13, color: colors.textSecondary },
  metaDifficulty: { fontSize: 13, fontWeight: '700' },
  savedText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  factsScroll: { paddingHorizontal: spacing.lg, gap: 10, paddingVertical: 14, paddingBottom: 18 },
  factCard: {
    width: 100, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)', padding: 12, gap: 5,
    ...elevation.raised,
  },
  factLabel: { fontSize: 9, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  factValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, lineHeight: 16 },

  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 14, letterSpacing: -0.2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },

  speciesRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  speciesItem: { alignItems: 'center', gap: 6, width: 56 },
  speciesCircle: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.08)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  speciesName: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', lineHeight: 13 },
  overflowText: { fontSize: 13, fontWeight: '800', color: colors.textSecondary },

  bodyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  knowledgeBlock: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    ...elevation.raised,
  },
  knowledgeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  knowledgeIconWrap: {
    width: 28, height: 28, borderRadius: radius.xs,
    backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  knowledgeTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  knowledgeText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  seasonsRow: { flexDirection: 'row', gap: 10 },
  seasonChip: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  seasonChipActive: { backgroundColor: 'rgba(0,212,170,0.08)', borderColor: 'rgba(0,212,170,0.3)' },
  seasonText: { fontSize: 10, fontWeight: '600', color: colors.textTertiary },
  seasonTextActive: { color: colors.primary, fontWeight: '800' },

  baitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  baitChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
    paddingHorizontal: 12, paddingVertical: 7,
  },
  baitText: { fontSize: 12, fontWeight: '600', color: colors.secondary },

  timesRow: { flexDirection: 'row', gap: 12 },
  timeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  timeLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  timeText: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },

  facilitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  facilityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
  facilityText: { fontSize: 13, color: colors.textSecondary },

  permitBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, padding: spacing.md,
  },
  permitTitle: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  permitText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: 32,
  },
  dirBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: 13,
  },
  dirBtnText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  startBtn: { flex: 1, borderRadius: radius.full, overflow: 'hidden', ...elevation.glow },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  startBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A', letterSpacing: 0.3 },
});
