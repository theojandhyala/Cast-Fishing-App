import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, FlatList, Modal, TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { colors, spacing, radius, elevation } from '../../constants/theme';
import { FISHING_SPOTS, loadAllFishingSpots } from '../../data/fishingSpots';
import { FishingSpotRecord } from '../../types/fishingSpot';
import { haversineKm, formatDistance } from '../../utils/distance';
import { SpotPhoto } from '../../components/map/SpotPhoto';
import { useLocationStore } from '../../store/locationStore';
import { FishSpeciesPhoto } from '../../components/fish/FishSpeciesPhoto';
import { fishingWindowLabel, fishingWindowQuality, selectPrimaryFishingWindow } from '../../utils/fishingWindows';
import { CastLogo } from '../../components/ui/CastLogo';

type SpotWithDist = FishingSpotRecord & { _distKm?: number };

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return 'Yesterday';
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#00D4AA';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number) {
  if (score >= 80) return { label: 'EXCELLENT', color: '#00D4AA' };
  if (score >= 60) return { label: 'GOOD', color: '#10B981' };
  if (score >= 40) return { label: 'FAIR', color: '#F59E0B' };
  return { label: 'POOR', color: '#EF4444' };
}

function formatNextWindow(isoTime: string) {
  const d = new Date(isoTime);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : `Tomorrow ${time}`;
}

const FISHING_TIPS = [
  'Fish move into shallow margins at dawn — this is your best chance for specimen fish.',
  'A rising barometer signals improved feeding activity across most freshwater species.',
  'Wind from the west or south-west brings insects onto the water, triggering surface feeding.',
  'After rain, rivers carry extra colour and food — fish the inside of bends where current slows.',
  'Full moon nights improve tidal patterns for sea fishing — plan sessions around it.',
  'In cold water, slow your retrieve to a crawl. Fish are lethargic and won\'t chase fast lures.',
  'Pre-baiting a swim for two days before fishing can dramatically increase your catch rate.',
  'Overcast days reduce light penetration — fish feel safer feeding in open water.',
];

function getTipOfDay(): string {
  const day = new Date().getDate();
  return FISHING_TIPS[day % FISHING_TIPS.length];
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const catches = useCatchStore(s => s.catches);
  const router = useRouter();
  const { location: gpsLocation, permissionGranted } = useLocation();
  const setDataLocation = useLocationStore((state) => state.setLocation);

  const [selectedSpot, setSelectedSpot] = useState<FishingSpotRecord | null>(FISHING_SPOTS[0] ?? null);
  const [spotPickerOpen, setSpotPickerOpen] = useState(false);
  const [spotSearch, setSpotSearch] = useState('');
  const [spotCatalog, setSpotCatalog] = useState<FishingSpotRecord[]>(() => [...FISHING_SPOTS]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    if (!spotPickerOpen || spotCatalog.length >= 10_000) return;
    let active = true;
    setCatalogLoading(true);
    loadAllFishingSpots()
      .then((spots) => { if (active) setSpotCatalog([...spots]); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, [spotCatalog.length, spotPickerOpen]);

  const spotResults = useMemo(() => {
    const query = spotSearch.trim().toLowerCase();
    if (!query) return spotCatalog.slice(0, 80);
    return spotCatalog.filter((spot) =>
      [spot.name, spot.country, spot.region, ...spot.species]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    ).slice(0, 80);
  }, [spotCatalog, spotSearch]);

  const chooseSpot = (spot: FishingSpotRecord) => {
    setSelectedSpot(spot);
    setDataLocation({ name: spot.name, query: spot.name, latitude: spot.latitude, longitude: spot.longitude });
    setSpotPickerOpen(false);
    setSpotSearch('');
  };

  const { weather, loading: weatherLoading, error: weatherError, refresh, updatedAt } = useWeather(
    selectedSpot?.latitude,
    selectedSpot?.longitude
  );

  const firstName = user?.name?.split(' ')[0] || 'Angler';
  const recentCatches = catches.slice(0, 3);
  const tip = getTipOfDay();

  const spots: SpotWithDist[] = useMemo(() => {
    if (!gpsLocation || !permissionGranted) return spotCatalog.slice(0, 6);
    return spotCatalog
      .map(s => ({ ...s, _distKm: haversineKm(gpsLocation.latitude, gpsLocation.longitude, s.latitude, s.longitude) }))
      .sort((a, b) => a._distKm! - b._distKm!)
      .slice(0, 6);
  }, [gpsLocation, permissionGranted, spotCatalog]);

  const nearMe = !!gpsLocation && permissionGranted;

  const w = weather;
  const primaryWindow = w ? selectPrimaryFishingWindow(w.solunarTimes) : null;
  const scoreColor = w ? getScoreColor(w.fishingScore) : '#F59E0B';
  const scoreInfo = w ? getScoreLabel(w.fishingScore) : { label: 'UNKNOWN', color: '#F59E0B' };

  // Catch streak
  const catchStreak = useMemo(() => {
    if (!catches.length) return 0;
    const days = new Set(catches.map(c => new Date(c.date).toDateString()));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) streak++; else break;
    }
    return streak;
  }, [catches]);

  // Next solunar window from solunarTimes array
  const nextMajorWindow = useMemo(() => {
    if (!w?.solunarTimes?.length) return null;
    const major = w.solunarTimes.find(t => t.type === 'major');
    return major ? major.start : null;
  }, [w]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={s.header}>
          <CastLogo size="sm" />
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={s.bellWrap}
            onPress={() => router.push('/notifications' as any)}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={s.greet}>
          <Text style={s.greetLine}>
            {getGreeting()}, <Text style={s.greetLineName}>{firstName}</Text>
          </Text>
          <Text style={s.greetSub}>Here's your fishing brief</Text>
          {catchStreak > 0 && (
            <View style={s.streakChip}>
              <MaterialCommunityIcons name="fire" size={12} color={colors.secondary} />
              <Text style={s.streakText}>{catchStreak} day streak</Text>
            </View>
          )}
        </View>

        {/* ── Weather Alert Banner ── */}
        {(w?.wind ?? 0) > 25 && (
          <View style={s.alertBanner}>
            <MaterialCommunityIcons name="weather-windy" size={14} color={colors.secondary} />
            <Text style={s.alertText}>High winds {w!.wind} km/h — use caution on open water</Text>
          </View>
        )}

        {/* ── Conditions Hero Card ── */}
        {selectedSpot && (
          <View style={s.condHeroWrap}>
            <LinearGradient colors={['#0D1F2D', '#071318']} style={s.condHero}>
              {/* Score left + stats right */}
              {w ? (
                <View style={s.condBody}>
                  <View style={s.scoreCol}>
                    <Text style={[s.scoreNum, { color: scoreColor }]}>{w.fishingScore}</Text>
                    <Text style={[s.scoreLabel, { color: scoreInfo.color }]}>{scoreInfo.label}</Text>
                    {/* Next bite window */}
                    {nextMajorWindow && (
                      <View style={s.nextBiteRow}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={colors.primary} />
                        <Text style={s.nextBiteLabel}>Next bite: </Text>
                        <Text style={s.nextBiteTime}>{formatNextWindow(nextMajorWindow)}</Text>
                        <View style={s.bitePill}><Text style={s.bitePillText}>MAJOR</Text></View>
                      </View>
                    )}
                  </View>
                  <View style={s.condStatsCol}>
                    {[
                      { icon: 'thermometer', label: 'Temp', value: `${w.temp}°C` },
                      { icon: 'weather-windy', label: 'Wind', value: `${w.wind} km/h` },
                      { icon: 'gauge', label: 'Pressure', value: `${w.pressure}` },
                    ].map(item => (
                      <View key={item.label} style={s.condStatItem}>
                        <MaterialCommunityIcons name={item.icon as any} size={14} color={colors.textTertiary} />
                        <View>
                          <Text style={s.condStatVal}>{item.value}</Text>
                          <Text style={s.condStatLabel}>{item.label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={s.condLoadRow}>
                  <Text style={s.condLoadText}>Loading conditions…</Text>
                </View>
              )}

              {/* Window row - plain, no amber background */}
              <View style={s.condWindowStrip}>
                <MaterialCommunityIcons name="chart-timeline-variant" size={13} color={colors.secondary} />
                <Text style={s.condWindowText} numberOfLines={1}>
                  {primaryWindow
                    ? `Major bite window: ${primaryWindow.start}–${primaryWindow.end}`
                    : 'Calculating solunar windows…'}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/conditions' as any)}
                  style={s.condFullLink}
                >
                  <Text style={s.condFullLinkText}>Full Conditions</Text>
                  <MaterialCommunityIcons name="arrow-right" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Spot Selector Row ── */}
        <View style={s.spotSelectorRow}>
          <Text style={s.spotSelectorLabel}>FISHING AT:</Text>
          <TouchableOpacity
            style={s.spotSelectorName}
            onPress={() => setSpotPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Change fishing spot"
          >
            <Text style={s.spotSelectorNameText} numberOfLines={1}>
              {selectedSpot ? selectedSpot.name.split(',')[0] : 'Choose a spot'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={refresh} disabled={weatherLoading} style={s.refreshBtn}>
            <MaterialCommunityIcons name="refresh" size={15} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <View style={s.spotSelectorDivider} />

        {/* ── AI Advisor Banner ── */}
        <TouchableOpacity
          style={s.advisorBanner}
          onPress={() => router.push('/ai-advisor' as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#0D2420', '#071510']}
            style={s.advisorBannerInner}
          >
            <View style={s.advisorIcon}>
              <MaterialCommunityIcons name="robot-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.advisorTitle}>Ask the AI Advisor</Text>
              <Text style={s.advisorSub}>Get personalised fishing tips for today</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Quick Actions 2×2 ── */}
        <View style={s.quickActionsGrid}>
          {[
            { icon: 'camera-iris', label: 'Scan Fish', route: '/identifier' },
            { icon: 'weather-partly-cloudy', label: 'Conditions', route: '/conditions' },
            { icon: 'chart-line', label: 'My Stats', route: '/my-stats' },
            { icon: 'play-circle-outline', label: 'Start Session', route: '/(tabs)/map' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={s.quickActionCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={s.quickActionIconWrap}>
                <MaterialCommunityIcons name={item.icon as any} size={40} color={colors.primary} />
              </View>
              <Text style={s.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Nearby Spots ── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>{nearMe ? 'SPOTS NEAR YOU' : 'RECOMMENDED SPOTS'}</Text>
            {nearMe && (
              <View style={s.nearBadge}>
                <MaterialCommunityIcons name="map-marker" size={10} color={colors.primary} />
                <Text style={s.nearBadgeText}>GPS</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/map' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.spotsScroll}>
          {spots.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={[s.spotCard, selectedSpot?.id === spot.id && s.spotCardSelected]}
              onPress={() => chooseSpot(spot)}
              accessibilityRole="button"
              accessibilityLabel={`Show conditions for ${spot.name}`}
              activeOpacity={0.85}
            >
              <SpotPhoto spot={spot} variant="featured" style={StyleSheet.absoluteFillObject} />
              <LinearGradient
                colors={['transparent', 'rgba(3,8,18,0.92)']}
                style={StyleSheet.absoluteFillObject}
              />
              {spot._distKm !== undefined && (
                <View style={s.distBadge}>
                  <MaterialCommunityIcons name="map-marker" size={9} color={colors.secondary} />
                  <Text style={s.distBadgeText}>{formatDistance(spot._distKm)}</Text>
                </View>
              )}
              {selectedSpot?.id === spot.id && (
                <View style={s.spotSelectedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
                </View>
              )}
              <View style={s.spotInfo}>
                <Text style={s.spotName} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
                <View style={s.spotTypeRow}>
                  <Text style={s.spotTypeChip}>{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={s.spotHint}>Tap a spot to preview conditions. Does not start a session.</Text>

        {/* ── Tip of the Day ── */}
        <View style={s.tipCard}>
          <View style={s.tipAccent} />
          <View style={s.tipIconWrap}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tipLabel}>DAILY TIP</Text>
            <Text style={s.tipText}>{tip}</Text>
          </View>
        </View>

        {/* ── Recent Catches ── */}
        <View style={s.sectionHead}>
          <View style={s.sectionBar} />
          <Text style={s.sectionTitle}>RECENT CATCHES</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/catches' as any)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentCatches.length === 0 ? (
          <View style={s.emptyCatches}>
            <LinearGradient colors={['rgba(0,212,170,0.06)', 'transparent']} style={s.emptyCatchesGrad}>
              <MaterialCommunityIcons name="fish" size={40} color="rgba(0,212,170,0.25)" />
              <Text style={s.emptyTitle}>No catches logged yet</Text>
              <Text style={s.emptySub}>Every great fishing story starts with the first cast.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-catch' as any)}>
                <Text style={s.emptyBtnText}>Log a Catch</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={s.catchList}>
            {recentCatches.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[s.catchRow, i > 0 && s.catchDivider]}
                onPress={() => router.push({ pathname: '/catch-detail', params: { id: c.id } } as any)}
                activeOpacity={0.85}
              >
                <FishSpeciesPhoto species={c.species} photo={c.photo} style={s.catchThumb} />
                <View style={s.catchInfo}>
                  <Text style={s.catchSpecies}>{c.species}</Text>
                  <Text style={s.catchMeta}>
                    {[c.weight ? `${c.weight} kg` : null, c.location].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={s.catchTime}>{timeAgo(c.date)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      <Modal visible={spotPickerOpen} transparent animationType="slide" onRequestClose={() => setSpotPickerOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.spotSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle}>Choose conditions location</Text>
                <Text style={s.sheetSubtitle}>This previews the spot. It never starts a fishing session.</Text>
              </View>
              <TouchableOpacity onPress={() => setSpotPickerOpen(false)} style={s.sheetClose} accessibilityLabel="Close spot picker">
                <MaterialCommunityIcons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={s.searchBox}>
              <MaterialCommunityIcons name="magnify" size={19} color={colors.textTertiary} />
              <TextInput
                autoFocus
                value={spotSearch}
                onChangeText={setSpotSearch}
                placeholder="Search town, water or species"
                placeholderTextColor={colors.textTertiary}
                style={s.searchInput}
              />
              {spotSearch ? <TouchableOpacity onPress={() => setSpotSearch('')}><MaterialCommunityIcons name="close-circle" size={18} color={colors.textTertiary} /></TouchableOpacity> : null}
            </View>
            {catalogLoading ? <Text style={s.catalogLoading}>Loading the worldwide spot index…</Text> : null}
            <FlatList
              data={spotResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity style={[s.resultRow, selectedSpot?.id === item.id && s.resultRowSelected]} onPress={() => chooseSpot(item)}>
                  <SpotPhoto spot={item} variant="card" style={s.resultThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.resultMeta} numberOfLines={1}>{[item.region, item.country, item.species.slice(0, 2).join(' · ')].filter(Boolean).join(' · ')}</Text>
                  </View>
                  {selectedSpot?.id === item.id ? <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} /> : <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={s.noResults}>No matching spots. Try a nearby town or species.</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050A12' },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 6,
  },
  bellWrap: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // ── Greeting ──
  greet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  greetLine: {
    fontSize: 26, fontWeight: '800', color: colors.textPrimary,
  },
  greetLineName: { color: '#00D4AA' },
  greetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 5 },

  // Streak chip
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, alignSelf: 'flex-start', marginTop: 4,
  },
  streakText: { fontSize: 11, fontWeight: '700', color: colors.secondary },

  // Alert banner
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginBottom: 8,
    backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: radius.sm,
    padding: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  alertText: { fontSize: 12, color: colors.secondary, flex: 1 },

  // ── Conditions Hero Card ──
  condHeroWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: 16,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.22)',
  },
  condHero: {
    borderRadius: radius.lg,
  },
  condBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 20,
  },
  scoreCol: {
    alignItems: 'flex-start',
  },
  scoreNum: {
    fontSize: 48, fontWeight: '800', lineHeight: 56,
  },
  scoreLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2,
  },
  // Next bite row
  nextBiteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  nextBiteLabel: { fontSize: 12, color: colors.textSecondary },
  nextBiteTime: { fontSize: 12, fontWeight: '700', color: colors.primary },
  bitePill: { backgroundColor: 'rgba(0,212,170,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bitePillText: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },

  condStatsCol: {
    flex: 1, gap: 10,
  },
  condStatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  condStatVal: {
    fontSize: 13, fontWeight: '700', color: colors.textPrimary,
  },
  condStatLabel: {
    fontSize: 10, color: colors.textTertiary,
  },
  condLoadRow: {
    padding: 24, alignItems: 'center',
  },
  condLoadText: { fontSize: 13, color: colors.textTertiary },
  condWindowStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  condWindowText: {
    flex: 1, fontSize: 12, fontWeight: '600', color: colors.secondary,
  },
  condFullLink: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  condFullLinkText: {
    fontSize: 11, fontWeight: '700', color: colors.primary,
  },

  // ── Spot Selector Row ──
  spotSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 8,
    gap: 8,
  },
  spotSelectorLabel: {
    fontSize: 10, fontWeight: '800', color: colors.textTertiary,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  spotSelectorName: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  spotSelectorNameText: {
    fontSize: 14, fontWeight: '800', color: '#00D4AA',
  },
  refreshBtn: {
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  spotSelectorDivider: {
    height: 1, backgroundColor: colors.border,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },

  // ── AI Advisor Banner ──
  advisorBanner: { marginHorizontal: spacing.lg, marginBottom: 12 },
  advisorBannerInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  advisorIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: 'rgba(0,212,170,0.12)', alignItems: 'center', justifyContent: 'center' },
  advisorTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  advisorSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // ── Quick Actions 2x2 ──
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickActionCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 10,
  },
  quickActionIconWrap: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: 'rgba(0,212,170,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  quickActionLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center',
  },

  // ── Nearby Spots ──
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: 14,
  },
  sectionBar: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: colors.textSecondary,
  },
  nearBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  nearBadgeText: { fontSize: 9, color: colors.primary, fontWeight: '700' },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  spotsScroll: { paddingHorizontal: spacing.lg, gap: 10, paddingBottom: 4, marginBottom: 8 },
  spotHint: {
    marginHorizontal: spacing.lg, marginBottom: 28,
    color: colors.textTertiary, fontSize: 10, lineHeight: 15,
  },
  spotCard: {
    width: 160, height: 120, borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    justifyContent: 'space-between',
  },
  spotCardSelected: {
    borderColor: colors.primary, borderWidth: 2,
  },
  distBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-end', margin: 8,
    backgroundColor: 'rgba(3,8,18,0.75)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  distBadgeText: { fontSize: 9, color: colors.secondary, fontWeight: '700' },
  spotSelectedBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(3,8,18,0.7)', borderRadius: radius.full, padding: 2,
  },
  spotInfo: { padding: 10 },
  spotName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 4 },
  spotTypeRow: { flexDirection: 'row' },
  spotTypeChip: {
    fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize',
  },

  // ── Tip of the Day ──
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: spacing.lg, marginBottom: 28,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderLeftWidth: 3, borderLeftColor: colors.secondary,
    padding: spacing.md, overflow: 'hidden',
  },
  tipAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, backgroundColor: colors.secondary,
    borderTopLeftRadius: radius.md, borderBottomLeftRadius: radius.md,
  },
  tipIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
    marginLeft: 8,
  },
  tipLabel: {
    fontSize: 9, fontWeight: '800', color: '#F59E0B',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5,
  },
  tipText: { fontSize: 13, color: '#ffffff', lineHeight: 19 },

  // ── Recent Catches ──
  emptyCatches: {
    marginHorizontal: spacing.lg, marginBottom: 28,
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
  },
  emptyCatchesGrad: { alignItems: 'center', padding: 32, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  emptyBtn: {
    marginTop: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 11,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  catchList: {
    marginHorizontal: spacing.lg, marginBottom: 28,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    overflow: 'hidden',
  },
  catchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.md, paddingVertical: 15,
  },
  catchDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  catchThumb: {
    width: 44, height: 44, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  catchInfo: { flex: 1 },
  catchSpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  catchMeta: { fontSize: 12, color: colors.textSecondary },
  catchTime: { fontSize: 12, color: colors.textTertiary },

  // ── Modal ──
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,6,10,0.72)' },
  spotSheet: { height: '84%', backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.borderStrong, paddingTop: spacing.sm },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: 'center', marginBottom: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: spacing.lg, gap: spacing.md },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sheetSubtitle: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginTop: 3 },
  sheetClose: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surface },
  searchBox: { margin: spacing.lg, marginBottom: spacing.sm, height: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  resultsList: { paddingHorizontal: spacing.lg, paddingBottom: 36 },
  resultRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultRowSelected: { backgroundColor: 'rgba(68,210,203,0.07)' },
  resultThumb: { width: 54, height: 48, borderRadius: radius.sm, overflow: 'hidden' },
  resultName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  resultMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  noResults: { color: colors.textSecondary, textAlign: 'center', paddingTop: spacing.xxl },
  catalogLoading: { color: colors.textSecondary, fontSize: 11, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});
