import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFishingSpotById } from '../utils/fishingSpotLookup';
import { colors, radius, spacing, elevation } from '../constants/theme';
import { useSessionStore } from '../store/sessionStore';
import { useLocationStore } from '../store/locationStore';
import { useWeather } from '../hooks/useWeather';
import { useMarineConditions } from '../hooks/useMarineConditions';
import { SpotPhoto } from '../components/map/SpotPhoto';
import { useSpotStore } from '../store/spotStore';

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
  reservoir: 'water-pump', ocean: 'sail-boat', estuary: 'water-outline', private: 'lock', fishery: 'fish',
};

const FISH_ICONS: Record<string, string> = {
  Carp: 'fish', Pike: 'fish', Perch: 'fish', Bream: 'fish', Tench: 'fish',
  Barbel: 'fish', Trout: 'fish', Salmon: 'fish', Bass: 'fish', Zander: 'fish',
};

export default function SpotDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = getFishingSpotById(id);
  const { activeSession, startSession } = useSessionStore();
  const { setLocation } = useLocationStore();
  const { isSpotSaved, toggleSavedSpot } = useSpotStore();
  const saved = spot ? isSpotSaved(spot.id) : false;
  const isMarineSpot = !!spot && ['sea', 'ocean', 'estuary'].includes(spot.type);
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(spot?.latitude, spot?.longitude);
  const { marine, loading: marineLoading, error: marineError } = useMarineConditions(spot?.latitude, spot?.longitude, isMarineSpot);

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
  const handleStartSession = () => {
    if (activeSession) {
      Alert.alert('Session in progress', `You already have an active session at ${activeSession.spotName}.`, [{ text: 'OK' }]);
      return;
    }
    setLocation({ name: spot.name, query: spot.name, latitude: spot.latitude, longitude: spot.longitude });
    startSession(spot.name, { spotQuery: spot.name, latitude: spot.latitude, longitude: spot.longitude });
    router.push('/session' as any);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Unable to open maps'));
  };

  const overflowCount = spot.species.length > 4 ? spot.species.length - 4 : 0;

  return (
    <View style={s.safe}>
      {/* Hero */}
      <SpotPhoto spot={spot} variant="hero" style={s.hero}>
        {/* Nav overlay */}
        <SafeAreaView edges={['top']} style={s.heroNav}>
          <TouchableOpacity onPress={() => router.back()} style={s.heroBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleSavedSpot(spot.id)} style={s.heroBtn} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved spots' : 'Save spot'}>
            <MaterialCommunityIcons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22} color="#fff"
            />
          </TouchableOpacity>
        </SafeAreaView>
      </SpotPhoto>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Name + meta */}
        <View style={s.nameSection}>
          <Text style={s.spotName}>{spot.name}</Text>
          <View style={s.metaRow}>
            <Text style={s.metaType}>
              {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)} · {spot.country}
            </Text>
            <View style={s.ratingChip}>
              <MaterialCommunityIcons name={spot.verification === 'verified' ? 'check-decagram' : 'alert-circle-outline'} size={12} color={spot.verification === 'verified' ? colors.primary : colors.secondary} />
              <Text style={s.ratingText}>{spot.verification === 'verified' ? 'Verified source' : spot.verification === 'partially_verified' ? 'Partially verified' : 'Unverified demo'}</Text>
            </View>
            {saved && (
              <View style={s.savedChip}>
                <Text style={s.savedText}>Saved</Text>
              </View>
            )}
          </View>
        </View>

        {/* Species */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Species</Text>
          {spot.species.length ? <View style={s.speciesRow}>
            {spot.species.slice(0, 4).map((sp: string) => (
              <View key={sp} style={s.speciesItem}>
                <View style={s.speciesCircle}>
                  <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
                </View>
                <Text style={s.speciesName} numberOfLines={1}>{sp}</Text>
              </View>
            ))}
            {overflowCount > 0 && (
              <View style={s.speciesItem}>
                <View style={[s.speciesCircle, { backgroundColor: colors.surface2 }]}>
                  <Text style={s.overflowText}>+{overflowCount}</Text>
                </View>
              </View>
            )}
          </View> : <UnknownField text="Species have not been independently verified for this mapped fishing feature." />}
        </View>

        <View style={s.divider} />

        {/* Coordinate-specific live conditions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Live local conditions</Text>
          <View style={s.condRow}>
            <View style={s.condItem}>
              <MaterialCommunityIcons name="gauge" size={18} color={colors.primary} />
              <Text style={s.condValue}>{weatherLoading ? '…' : weather ? `${weather.pressure} hPa` : '—'}</Text>
              <Text style={s.condLabel}>{weather?.pressureTrend ?? 'Pressure'}</Text>
            </View>
            <View style={s.condItem}>
              <MaterialCommunityIcons name="weather-windy" size={18} color={colors.primary} />
              <Text style={s.condValue}>{weatherLoading ? '…' : weather ? `${weather.wind} km/h` : '—'}</Text>
              <Text style={s.condLabel}>Wind</Text>
            </View>
            <View style={s.condItem}>
              <MaterialCommunityIcons name="thermometer" size={18} color={colors.primary} />
              <Text style={s.condValue}>{weatherLoading ? '…' : weather ? `${weather.temp}°C` : '—'}</Text>
              <Text style={s.condLabel}>{weather?.description ?? 'Weather'}</Text>
            </View>
          </View>
          {weatherError ? <Text style={s.sourceNote}>{weatherError}; coordinate-seeded offline estimates are shown.</Text> : <Text style={s.sourceNote}>Coordinate-specific forecast from Open-Meteo · cached for 30 minutes</Text>}

          {isMarineSpot ? <>
            <View style={[s.condRow, { marginTop: 10 }]}>
              <View style={s.condItem}>
                <MaterialCommunityIcons name="swap-vertical" size={18} color={colors.secondary} />
                <Text style={s.condValue}>{marineLoading ? '…' : marine?.seaLevelM != null ? `${marine.seaLevelM.toFixed(2)} m` : '—'}</Text>
                <Text style={s.condLabel}>Tide {marine?.tideTrend ?? ''}</Text>
              </View>
              <View style={s.condItem}>
                <MaterialCommunityIcons name="waves" size={18} color={colors.secondary} />
                <Text style={s.condValue}>{marineLoading ? '…' : marine?.waveHeightM != null ? `${marine.waveHeightM.toFixed(1)} m` : '—'}</Text>
                <Text style={s.condLabel}>Waves</Text>
              </View>
              <View style={s.condItem}>
                <MaterialCommunityIcons name="water-thermometer" size={18} color={colors.secondary} />
                <Text style={s.condValue}>{marineLoading ? '…' : marine?.seaTemperatureC != null ? `${marine.seaTemperatureC.toFixed(1)}°C` : '—'}</Text>
                <Text style={s.condLabel}>Sea temp</Text>
              </View>
            </View>
            {marine?.nextHigh || marine?.nextLow ? <Text style={s.sourceNote}>
              {marine.nextHigh ? `Next modelled high ${new Date(marine.nextHigh.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ` : ''}
              {marine.nextLow ? `Next modelled low ${new Date(marine.nextLow.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </Text> : null}
            <Text style={s.sourceNote}>{marineError ?? 'Marine model: Open-Meteo. Coastal tide values are approximate and not for navigation.'}</Text>
          </> : null}
        </View>

        <View style={s.divider} />

        {/* Season and access */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Season & Access</Text>
          <View style={s.timesRow}>
            <View style={s.timeCard}>
              <MaterialCommunityIcons name="calendar-range" size={18} color={colors.secondary} />
              <Text style={s.timeText}>{spot.bestSeason.length ? spot.bestSeason.join(', ') : 'Season not verified — check local rules'}</Text>
            </View>
          </View>
          <Text style={[s.notesText, { marginTop: 12 }]}>{spot.access.summary}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Bait guidance</Text>
          {spot.bestBait.length ? <View style={s.baitRow}>{spot.bestBait.map((bait) => (
            <View key={bait} style={s.baitChip}><Text style={s.baitText}>{bait}</Text></View>
          ))}</View> : <UnknownField text="No locally sourced bait guidance is attached. Match bait to confirmed local species and regulations." />}
        </View>

        <View style={s.divider} />

        {/* Location precision */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Location</Text>
          <Text style={s.notesText}>This pin is a {spot.coordinatePrecision.replace(/_/g, ' ')}. It may not mark legal bank access, parking or a launch point.</Text>
        </View>

        <View style={s.divider} />

        {/* Notes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <Text style={s.notesText}>{spot.description}</Text>
          {spot.tips ? <Text style={[s.notesText, { marginTop: 8, color: colors.textSecondary }]}>{spot.tips}</Text> : null}
        </View>

        <View style={s.divider} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Verification</Text>
          <Text style={s.notesText}>{spot.verificationNotes}</Text>
          {spot.sources.map((source) => (
            <TouchableOpacity key={source.url} onPress={() => Linking.openURL(source.url)} accessibilityRole="link" style={{ marginTop: 10 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{source.publisher}: {source.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Checked {source.checkedAt}</Text>
            </TouchableOpacity>
          ))}
          {spot.sources.length === 0 ? <Text style={{ color: colors.secondary, marginTop: 10 }}>No authoritative source is attached yet. Treat this record as informational only.</Text> : null}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.dirBtn}
          onPress={handleDirections}
          activeOpacity={0.85}
          accessibilityLabel="Get directions to this spot"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.textSecondary} />
          <Text style={s.dirBtnText}>Get Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.startBtn} onPress={handleStartSession} activeOpacity={0.85}>
          <LinearGradient colors={['#00D4AA', '#00B892']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBtnGrad}>
            <Text style={s.startBtnText}>Start Fishing Here</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { height: 220, justifyContent: 'flex-end', alignItems: 'center' },
  heroNav: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  heroBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  heroIcon: { marginBottom: spacing.lg },

  nameSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  spotName: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaType: { fontSize: 13, color: colors.textSecondary },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, color: colors.secondary, fontWeight: '700' },
  savedChip: {
    backgroundColor: 'rgba(0,212,170,0.15)', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
  },
  savedText: { fontSize: 11, color: colors.primary, fontWeight: '700' },

  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },

  speciesRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  speciesItem: { alignItems: 'center', gap: 5 },
  speciesCircle: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  speciesName: { fontSize: 11, color: colors.textSecondary, maxWidth: 56, textAlign: 'center' },
  overflowText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },

  timesRow: { flexDirection: 'row', gap: 12 },
  timeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },

  condRow: { flexDirection: 'row', gap: 10 },
  condItem: {
    flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  condValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  condLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  sourceNote: { fontSize: 10, color: colors.textSecondary, lineHeight: 15, marginTop: 8 },
  baitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  baitChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  baitText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  unknownField: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.22)' },
  unknownText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },

  notesText: { fontSize: 14, color: colors.textPrimary, lineHeight: 21 },

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
  startBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  startBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0E1A', letterSpacing: 0.5 },
});

function UnknownField({ text }: { text: string }) {
  return <View style={s.unknownField}><MaterialCommunityIcons name="information-outline" size={17} color={colors.secondary} /><Text style={s.unknownText}>{text}</Text></View>;
}
