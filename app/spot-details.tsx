import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image, TextInput, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WORLD_SPOTS } from '../data/worldSpots';
import { getSpotImage } from '../constants/spotImages';
import { colors, radius, spacing, elevation } from '../constants/theme';
import { useSessionStore } from '../store/sessionStore';
import { useLocationStore } from '../store/locationStore';
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
  reservoir: 'water-pump', ocean: 'sail-boat', estuary: 'water-outline', private: 'lock',
};

const FISH_ICONS: Record<string, string> = {
  Carp: 'fish', Pike: 'fish', Perch: 'fish', Bream: 'fish', Tench: 'fish',
  Barbel: 'fish', Trout: 'fish', Salmon: 'fish', Bass: 'fish', Zander: 'fish',
};

function getBestTimes(spot: any) {
  const times = [
    { icon: 'weather-sunset-up', label: 'Dawn', time: '05:30 – 07:30' },
    { icon: 'weather-sunset-down', label: 'Dusk', time: '18:30 – 20:00' },
  ];
  return times;
}

const DEMO_USERNAMES = ['@CarpKing22', '@RiverRat_UK', '@PikePete', '@TenchFanatic', '@BassBuster'];
const WATER_CLARITY_OPTIONS = ['Crystal Clear', 'Slightly Coloured', 'Coloured', 'Murky'] as const;
type WaterClarity = typeof WATER_CLARITY_OPTIONS[number];

function getWaterClarityDefault(spotId: string): WaterClarity {
  const hash = spotId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return WATER_CLARITY_OPTIONS[hash % 4];
}

function getReporterUsername(spotId: string): string {
  const hash = spotId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DEMO_USERNAMES[hash % DEMO_USERNAMES.length];
}

function getReportedAgo(spotId: string): string {
  const hash = spotId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hours = (hash % 23) + 1;
  return hours === 1 ? '1h ago' : `${hours}h ago`;
}

const PARK_OPTIONS = [
  'Main car park 200m north',
  'Lay-by on the B-road',
  'National Trust car park (£2/day)',
  'Farm track — park on verge',
];

function getAccessInfo(spot: any) {
  const hash = spot.id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const walkMin = (hash % 15) + 2;
  const parkAt = PARK_OPTIONS[hash % PARK_OPTIONS.length];
  const accessNotes: Record<string, string> = {
    river: 'Follow the footpath downstream. Bankside can be muddy after rain.',
    lake: 'Follow the lake path clockwise from the car park.',
    sea: 'Rocky coastal path. Wear sturdy footwear.',
    reservoir: 'Access via the designated anglers\' gate at the dam end.',
  };
  const accessNote = accessNotes[spot.type] ?? 'Follow the marked fishing trail from the main entrance.';
  return { walkMin, parkAt, accessNote };
}

export default function SpotDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = WORLD_SPOTS.find((s) => s.id === id);
  const { activeSession, startSession } = useSessionStore();
  const { setLocation } = useLocationStore();
  const { getSpotNote, setSpotNote } = useSpotStore();
  const [saved, setSaved] = useState(false);
  const [waterClarity, setWaterClarity] = useState<WaterClarity | null>(null);
  const [notes, setNotes] = useState('');
  const [savedConfirm, setSavedConfirm] = useState(false);
  const savedFadeAnim = useRef(new Animated.Value(0)).current;

  const reviewCount = spot
    ? 20 + (spot.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 200)
    : 0;

  useEffect(() => {
    if (spot) {
      setWaterClarity(getWaterClarityDefault(spot.id));
      setNotes(getSpotNote(spot.id));
    }
  }, [spot?.id]);

  const handleSaveNotes = async () => {
    if (!spot) return;
    await setSpotNote(spot.id, notes);
    setSavedConfirm(true);
    Animated.sequence([
      Animated.timing(savedFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(savedFadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setSavedConfirm(false));
  };

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
  const bestTimes = getBestTimes(spot);
  const accessInfo = getAccessInfo(spot);
  const reporterUsername = getReporterUsername(spot.id);
  const reportedAgo = getReportedAgo(spot.id);

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

  const overflowCount = spot.species.length > 4 ? spot.species.length - 4 : 0;

  return (
    <View style={s.safe}>
      {/* Hero */}
      <View style={s.heroContainer}>
        <Image
          source={{ uri: getSpotImage(spot.id) }}
          style={s.heroPhoto}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(10,14,26,0.3)', 'rgba(10,14,26,0.7)']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Nav overlay */}
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
        {/* Type icon badge */}
        <View style={s.heroTypeBadge}>
          <MaterialCommunityIcons
            name={TYPE_ICONS[spot.type] as any}
            size={20} color={colors.primary}
          />
          <Text style={s.heroTypeText}>{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Name + meta */}
        <View style={s.nameSection}>
          <Text style={s.spotName}>{spot.name}</Text>
          <View style={s.metaRow}>
            <Text style={s.metaType}>
              {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)} · Freshwater
            </Text>
            <View style={s.ratingChip}>
              <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
              <Text style={s.ratingText}>{spot.rating} ({reviewCount})</Text>
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
          <View style={s.speciesRow}>
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
          </View>
        </View>

        <View style={s.divider} />

        {/* Best Times */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Best Times</Text>
          <View style={s.timesRow}>
            {bestTimes.map((t) => (
              <View key={t.label} style={s.timeCard}>
                <MaterialCommunityIcons name={t.icon as any} size={18} color={colors.secondary} />
                <Text style={s.timeText}>{t.time}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.divider} />

        {/* Conditions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Conditions</Text>
          <View style={s.condRow}>
            <View style={s.condItem}>
              <MaterialCommunityIcons name="thermometer" size={18} color={colors.accentBlue} />
              <Text style={s.condValue}>18°C</Text>
              <Text style={s.condLabel}>Water Temp</Text>
            </View>
            <View style={s.condItem}>
              <MaterialCommunityIcons name="weather-windy" size={18} color={colors.accentBlue} />
              <Text style={s.condValue}>Calm</Text>
              <Text style={s.condLabel}>Wind</Text>
            </View>
            <View style={s.condItem}>
              <MaterialCommunityIcons name="gauge" size={18} color={colors.accentBlue} />
              <Text style={s.condValue}>Good</Text>
              <Text style={s.condLabel}>Pressure</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* Notes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <Text style={s.notesText}>{spot.description}</Text>
          {spot.tips ? <Text style={[s.notesText, { marginTop: 8, color: colors.textSecondary }]}>{spot.tips}</Text> : null}
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
  heroContainer: { height: 260, position: 'relative' },
  heroPhoto: { width: '100%', height: 260 },
  heroNav: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  heroBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  heroTypeBadge: {
    position: 'absolute', bottom: spacing.md, left: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
  },
  heroTypeText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

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
