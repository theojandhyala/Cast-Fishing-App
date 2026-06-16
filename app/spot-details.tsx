import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WORLD_SPOTS } from '../data/worldSpots';
import { colors, radius, spacing, typography, fonts } from '../constants/theme';
import { CastButton } from '../components/ui/CastButton';
import { useSessionStore } from '../store/sessionStore';
import { useLocationStore } from '../store/locationStore';

const typeIcons: Record<string, string> = {
  river: 'waves',
  lake: 'water',
  sea: 'anchor',
  reservoir: 'water-pump',
  ocean: 'sail-boat',
  estuary: 'water-outline',
  private: 'lock',
};

const difficultyColors: Record<string, string> = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

const TABS = ['Overview', 'Activity', 'Catches', 'Tips'] as const;

export default function SpotDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = WORLD_SPOTS.find((s) => s.id === id);
  const [tab, setTab] = useState<typeof TABS[number]>('Overview');
  const { activeSession, startSession } = useSessionStore();
  const { setLocation } = useLocationStore();

  if (!spot) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Spot not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStartSession = () => {
    if (activeSession) {
      Alert.alert('Session in progress', `You already have an active session at ${activeSession.spotName}. End it before starting a new one.`, [{ text: 'OK' }]);
      return;
    }
    setLocation({ name: spot.name, query: spot.name });
    startSession(spot.name, { spotQuery: spot.name, latitude: spot.latitude, longitude: spot.longitude });
    router.push('/session');
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Unable to open maps'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{spot.name}</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="bookmark-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero image area */}
        <View style={styles.heroArea}>
          <MaterialCommunityIcons name={typeIcons[spot.type] as any} size={56} color={colors.primary} />
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={13} color={colors.secondary} />
            <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{spot.name}</Text>
            <Text style={styles.location}>{spot.country} · {spot.region}</Text>
          </View>
          <View style={[styles.diffBadge, { borderColor: difficultyColors[spot.difficulty] }]}>
            <Text style={[styles.diffText, { color: difficultyColors[spot.difficulty] }]}>{spot.difficulty.toUpperCase()}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'Overview' && (
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-range" size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Best Season</Text>
              <Text style={styles.infoValue}>{spot.bestSeason.join(', ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="hook" size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Best Bait</Text>
              <Text style={styles.infoValue}>{spot.bestBait.join(', ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Coordinates</Text>
              <Text style={[styles.infoValue, styles.mono]}>{spot.latitude.toFixed(3)}, {spot.longitude.toFixed(3)}</Text>
            </View>
            {spot.permitRequired && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.danger} />
                <Text style={styles.infoLabel}>Permit</Text>
                <Text style={[styles.infoValue, { color: colors.danger }]}>Required</Text>
              </View>
            )}
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.desc}>{spot.description}</Text>
            <Text style={styles.descTitle}>Species</Text>
            <View style={styles.chips}>
              {spot.species.map((s) => (
                <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
              ))}
            </View>
          </View>
        )}

        {tab === 'Activity' && (
          <View style={styles.section}>
            <Text style={styles.desc}>Recent angler activity for this spot will appear here once community check-ins are enabled.</Text>
          </View>
        )}

        {tab === 'Catches' && (
          <View style={styles.section}>
            <Text style={styles.desc}>Catches logged at this spot will appear here.</Text>
          </View>
        )}

        {tab === 'Tips' && (
          <View style={styles.section}>
            <View style={styles.tipBox}>
              <MaterialCommunityIcons name="lightbulb-outline" size={16} color={colors.secondary} />
              <Text style={styles.tipText}>{spot.tips}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections} activeOpacity={0.85}>
            <MaterialCommunityIcons name="directions" size={18} color={colors.primary} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        <CastButton title="Start Session" onPress={handleStartSession} fullWidth size="lg" style={{ marginTop: spacing.md }} />
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.label, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  content: { paddingHorizontal: spacing.lg },
  heroArea: {
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  ratingText: { ...typography.mono, fontSize: 12, color: colors.textPrimary },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  name: { ...typography.h2 },
  location: { ...typography.caption, marginTop: 4 },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  diffText: { fontSize: 10, fontFamily: fonts.bodySemi, letterSpacing: 0.6 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: radius.sm },
  tabBtnActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: colors.background },
  section: { gap: spacing.sm, marginBottom: spacing.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  infoLabel: { ...typography.caption, flex: 1, textTransform: 'none' },
  infoValue: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, textAlign: 'right', flexShrink: 1 },
  mono: { fontFamily: fonts.mono },
  descTitle: { ...typography.caption, marginTop: spacing.sm },
  desc: { ...typography.body, fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { backgroundColor: colors.surface2, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  chipText: { fontSize: 12, color: colors.primary, fontFamily: fonts.bodySemi },
  tipBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipText: { flex: 1, fontSize: 13, color: colors.secondary, lineHeight: 19 },
  actions: { marginTop: spacing.sm },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  directionsText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  notFoundText: { ...typography.h3 },
});
