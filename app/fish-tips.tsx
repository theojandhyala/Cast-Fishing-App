import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { species } from '../data/species';
import {
  SPECIES_ACTIVITY_BY_HOUR,
  MONTHLY_ACTIVITY,
  getMoonPhase,
  getTimePeriodLabel,
} from '../data/fishingTimes';
import { colors, radius, spacing, elevation } from '../constants/theme';

const TABS = ['By Species', 'Right Now'];

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

function getTimeOfDayPeriod(): 'dawn' | 'midday' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9)   return 'dawn';
  if (hour >= 9 && hour < 15)  return 'midday';
  if (hour >= 15 && hour < 20) return 'evening';
  return 'night';
}

function getActivityLevel(speciesId: string, hour: number): number {
  const data = SPECIES_ACTIVITY_BY_HOUR[speciesId];
  return data ? data[hour] : 5;
}

function getMonthActivity(speciesId: string): number {
  const data = MONTHLY_ACTIVITY[speciesId];
  if (!data) return 5;
  return data[new Date().getMonth()];
}

const MOON_PHASE_ICONS: Record<string, string> = {
  'New Moon': 'moon-new',
  'Waxing Crescent': 'moon-waxing-crescent',
  'First Quarter': 'moon-first-quarter',
  'Waxing Gibbous': 'moon-waxing-gibbous',
  'Full Moon': 'moon-full',
  'Waning Gibbous': 'moon-waning-gibbous',
  'Last Quarter': 'moon-last-quarter',
  'Waning Crescent': 'moon-waning-crescent',
};

const TIME_PERIOD_ICONS: Record<string, string> = {
  Dawn: 'weather-sunset-up',
  Midday: 'weather-sunny',
  Dusk: 'weather-sunset-down',
  Night: 'weather-night',
};

function ActivityBadge({ level }: { level: number }) {
  let label = 'Low';
  let bg = 'rgba(156,163,175,0.2)';
  let textColor = colors.textSecondary;
  if (level >= 8) { label = 'Peak'; bg = 'rgba(0,212,170,0.2)'; textColor = colors.primary; }
  else if (level >= 6) { label = 'Good'; bg = 'rgba(16,185,129,0.2)'; textColor = colors.success; }
  else if (level >= 4) { label = 'Fair'; bg = 'rgba(245,158,11,0.2)'; textColor = colors.secondary; }

  return (
    <View style={[styles.activityBadge, { backgroundColor: bg }]}>
      <Text style={[styles.activityBadgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function FishTipsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const now = new Date();
  const hour = now.getHours();
  const moon = getMoonPhase(now);
  const timePeriod = getTimePeriodLabel();

  const filtered = useMemo(() =>
    species.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.commonName.toLowerCase().includes(search.toLowerCase())
    ), [search]
  );

  // Sort species by current activity for "Right Now" tab
  const sortedByActivity = useMemo(() =>
    [...species].sort((a, b) => {
      const aActivity = getActivityLevel(a.id, hour) + getMonthActivity(a.id);
      const bActivity = getActivityLevel(b.id, hour) + getMonthActivity(b.id);
      return bActivity - aActivity;
    }), [hour]
  );

  const top5 = sortedByActivity.slice(0, 5);

  const periodLabel = getTimeOfDayPeriod();
  const periodDescriptions: Record<string, string> = {
    dawn:    'Dawn feeders are most active right now. Focus on margins and shallows.',
    midday:  'Activity slows at midday. Target predators and river species.',
    evening: 'Evening feeding period underway. Excellent time for most species.',
    night:   'Nocturnal species active. Target bream, carp, and sea bass.',
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tips & Times</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
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

      {activeTab === 0 ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search species..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.listSection}>
            {filtered.map(fish => {
              const activityNow = getActivityLevel(fish.id, hour);
              return (
                <TouchableOpacity
                  key={fish.id}
                  style={[styles.speciesCard, elevation.raised]}
                  onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })}
                  activeOpacity={0.75}
                >
                  <View style={styles.speciesIconBadge}>
                    <MaterialCommunityIcons name="fish" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.speciesInfo}>
                    <Text style={styles.speciesName}>{fish.commonName}</Text>
                    <Text style={styles.speciesTimeOfDay} numberOfLines={1}>
                      {fish.bestTimes.timeOfDay[0]}
                    </Text>
                  </View>
                  <View style={styles.speciesMeta}>
                    <ActivityBadge level={activityNow} />
                    <View style={[styles.diffBadge, { backgroundColor: difficultyColors[fish.difficulty] + '22' }]}>
                      <Text style={[styles.diffText, { color: difficultyColors[fish.difficulty] }]}>
                        {fish.difficulty}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Time period banner */}
          <View style={[styles.timeBanner, elevation.glow]}>
            <View style={styles.timeBannerIconBadge}>
              <MaterialCommunityIcons name={(TIME_PERIOD_ICONS[timePeriod.label] || 'weather-sunny') as any} size={28} color={colors.primary} />
            </View>
            <View style={styles.timeBannerText}>
              <Text style={styles.timeBannerLabel}>{timePeriod.label} Session</Text>
              <Text style={styles.timeBannerDesc}>{periodDescriptions[periodLabel]}</Text>
            </View>
          </View>

          {/* Moon phase card */}
          <View style={[styles.condCard, elevation.raised]}>
            <View style={styles.condCardRow}>
              <View style={styles.condIconBadge}>
                <MaterialCommunityIcons name={(MOON_PHASE_ICONS[moon.name] || 'moon-full') as any} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.condTitle}>{moon.name}</Text>
                <Text style={styles.condBody}>{moon.tip}</Text>
              </View>
            </View>
          </View>

          {/* Barometric tip card */}
          <View style={[styles.condCard, elevation.raised, { borderColor: 'rgba(245,158,11,0.25)' }]}>
            <View style={styles.condCardRow}>
              <View style={[styles.condIconBadge, styles.condIconBadgeAmber]}>
                <MaterialCommunityIcons name="chart-line" size={22} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.condTitle}>Barometric Tip</Text>
                <Text style={styles.condBody}>
                  Stable or slowly rising pressure is ideal for most species. Rapid pressure drops ahead of storms temporarily suppress feeding. Wait for pressure to stabilise.
                </Text>
              </View>
            </View>
          </View>

          {/* Top 5 Right Now */}
          <Text style={styles.sectionLabel}>Top 5 Species Right Now</Text>
          {top5.map((fish, idx) => {
            const activityNow = getActivityLevel(fish.id, hour);
            const monthActivity = getMonthActivity(fish.id);
            const combined = activityNow + monthActivity;
            const isTop = idx === 0;
            return (
              <TouchableOpacity
                key={fish.id}
                style={[styles.topFishCard, isTop && styles.topFishCardBest, isTop && elevation.glow]}
                onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })}
                activeOpacity={0.75}
              >
                <Text style={[styles.rankNum, isTop && { color: colors.secondary }]}>#{idx + 1}</Text>
                <View style={[styles.topFishIconBadge, isTop && styles.topFishIconBadgeBest]}>
                  <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
                </View>
                <View style={styles.topFishInfo}>
                  <Text style={styles.topFishName}>{fish.commonName}</Text>
                  <Text style={styles.topFishTime} numberOfLines={1}>
                    {fish.bestTimes.timeOfDay[0]}
                  </Text>
                </View>
                <View style={styles.topFishRight}>
                  <ActivityBadge level={activityNow} />
                  <Text style={styles.activityScore}>{combined}/20</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}

          {/* All species activity */}
          <Text style={styles.sectionLabel}>All Species Activity</Text>
          {sortedByActivity.slice(5).map(fish => {
            const activityNow = getActivityLevel(fish.id, hour);
            return (
              <TouchableOpacity
                key={fish.id}
                style={styles.speciesCard}
                onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })}
                activeOpacity={0.75}
              >
                <View style={styles.speciesIconBadge}>
                  <MaterialCommunityIcons name="fish" size={22} color={colors.primary} />
                </View>
                <View style={styles.speciesInfo}>
                  <Text style={styles.speciesName}>{fish.commonName}</Text>
                  <Text style={styles.speciesTimeOfDay} numberOfLines={1}>
                    {fish.bestTimes.season}
                  </Text>
                </View>
                <ActivityBadge level={activityNow} />
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  tabActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  listSection: {
    gap: spacing.xs + 2,
  },
  speciesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  speciesIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesInfo: {
    flex: 1,
  },
  speciesName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  speciesTimeOfDay: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  speciesMeta: {
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  activityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  activityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    marginBottom: spacing.md,
  },
  timeBannerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBannerText: {
    flex: 1,
  },
  timeBannerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  timeBannerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  condCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  condCardRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  condIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  condIconBadgeAmber: {
    backgroundColor: 'rgba(245,158,11,0.14)',
  },
  condTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  condBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  topFishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    marginBottom: spacing.xs + 2,
  },
  rankNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    width: 28,
  },
  topFishCardBest: {
    borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: colors.surface2,
  },
  topFishIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topFishIconBadgeBest: {
    backgroundColor: 'rgba(245,158,11,0.16)',
  },
  topFishInfo: {
    flex: 1,
  },
  topFishName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topFishTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  topFishRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  activityScore: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
