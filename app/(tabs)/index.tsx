import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCatchStore } from '../../store/catchStore';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { ConditionsWidget } from '../../components/home/ConditionsWidget';
import { FishingWindows } from '../../components/home/FishingWindows';
import { QuickActions } from '../../components/home/QuickActions';
import { TipOfDay } from '../../components/home/TipOfDay';
import { CatchCard } from '../../components/catches/CatchCard';
import { colors, spacing, radius } from '../../constants/theme';
import { species } from '../../data/species';
import { SPECIES_ACTIVITY_BY_HOUR, MONTHLY_ACTIVITY, getMoonPhase, getTimePeriodLabel } from '../../data/fishingTimes';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function getTopSpeciesNow(count: number) {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  return [...species]
    .map(s => ({
      ...s,
      score: (SPECIES_ACTIVITY_BY_HOUR[s.id]?.[hour] ?? 5) + (MONTHLY_ACTIVITY[s.id]?.[month] ?? 5),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

function getDailyBriefText(): string {
  const now = new Date();
  const hour = now.getHours();
  const top = getTopSpeciesNow(2);
  const timePeriod = getTimePeriodLabel();
  const names = top.map(s => s.commonName).join(' and ');
  const tip = top[0]?.catchingTips?.[0] ?? top[0]?.tips?.[0] ?? 'fish with confidence in the right conditions';
  return `${timePeriod.emoji} ${timePeriod.label}: Target ${names}. ${tip}`;
}

function DailyBriefCard({ onPress }: { onPress: () => void }) {
  const brief = getDailyBriefText();
  const moon = getMoonPhase(new Date());
  return (
    <TouchableOpacity style={homeStyles.briefCard} onPress={onPress} activeOpacity={0.8}>
      <View style={homeStyles.briefHeader}>
        <Text style={homeStyles.briefTitle}>Daily Fishing Brief</Text>
        <Text style={homeStyles.briefMoon}>{moon.emoji} {moon.name}</Text>
      </View>
      <Text style={homeStyles.briefText}>{brief}</Text>
      <Text style={homeStyles.briefCta}>Tap for full tips & times →</Text>
    </TouchableOpacity>
  );
}

function WhatsBitingNow() {
  const router = useRouter();
  const now = new Date();
  const timePeriod = getTimePeriodLabel();
  const top3 = getTopSpeciesNow(3);

  const getActivityLabel = (score: number): { label: string; color: string } => {
    if (score >= 16) return { label: 'Peak time',  color: colors.primary };
    if (score >= 12) return { label: 'Good time',  color: colors.success };
    return { label: 'Fair time', color: colors.secondary };
  };

  return (
    <View>
      <Text style={homeStyles.bitingSubtitle}>Based on {timePeriod.description.toLowerCase()}</Text>
      <View style={homeStyles.bitingGrid}>
        {top3.map(fish => {
          const { label, color } = getActivityLabel(fish.score);
          return (
            <TouchableOpacity
              key={fish.id}
              style={homeStyles.bitingCard}
              onPress={() => router.push({ pathname: '/species-detail', params: { id: fish.id } })}
              activeOpacity={0.75}
            >
              <Text style={homeStyles.bitingEmoji}>{fish.emoji}</Text>
              <Text style={homeStyles.bitingName}>{fish.commonName}</Text>
              <View style={[homeStyles.bitingBadge, { backgroundColor: color + '22' }]}>
                <Text style={[homeStyles.bitingBadgeText, { color }]}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { catches, getStats } = useCatchStore();
  const { location } = useLocation();
  const { weather, loading: weatherLoading } = useWeather(location?.latitude, location?.longitude);
  const router = useRouter();
  const stats = getStats();

  const xpProgress = user ? (user.xp % 1000) / 1000 : 0;
  const level = user ? user.level : 1;

  const recentCatches = catches.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(0,212,170,0.08)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Angler'} 👑
              </Text>
              <Text style={styles.subGreeting}>
                {stats.total} catches logged • Level {level}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.proButton}
              onPress={() => router.push('/pro')}
            >
              {user?.isPro ? (
                <MaterialCommunityIcons name="crown" size={22} color={colors.secondary} />
              ) : (
                <Text style={styles.proText}>Pro</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* XP Bar */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{user?.xp || 0} XP</Text>
          </View>

          {/* Streak */}
          {(user?.streak || 0) > 0 && (
            <View style={styles.streak}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{user?.streak} day streak</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Conditions Widget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Conditions</Text>
            {weather ? (
              <ConditionsWidget weather={weather} loading={weatherLoading} />
            ) : (
              <ConditionsWidget
                weather={{
                  temp: 14,
                  feelsLike: 12,
                  description: 'Partly Cloudy',
                  icon: '⛅',
                  wind: 12,
                  windDirection: 225,
                  humidity: 72,
                  pressure: 1016,
                  pressureTrend: 'rising',
                  moonPhase: 'Waxing Crescent',
                  moonEmoji: '🌒',
                  fishingScore: 7,
                  city: location?.city || 'UK',
                }}
                loading={weatherLoading}
              />
            )}
          </View>

          {/* Fishing Windows */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feeding Windows</Text>
            <FishingWindows />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <QuickActions />
          </View>

          {/* Daily Fishing Brief */}
          <View style={styles.section}>
            <DailyBriefCard onPress={() => router.push('/fish-tips' as any)} />
          </View>

          {/* What's Biting Now */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's Biting Now</Text>
              <TouchableOpacity onPress={() => router.push('/fish-tips' as any)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <WhatsBitingNow />
          </View>

          {/* Tip of the Day */}
          <View style={styles.section}>
            <TipOfDay />
          </View>

          {/* Recent Catches */}
          {recentCatches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Catches</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/catches')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.catchGrid}>
                {recentCatches.map((c) => (
                  <CatchCard key={c.id} item={c} mode="grid" />
                ))}
              </View>
            </View>
          )}

          {/* Empty state if no catches */}
          {catches.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎣</Text>
              <Text style={styles.emptyTitle}>Log Your First Catch!</Text>
              <Text style={styles.emptyText}>Start tracking your fishing journey today</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/add-catch')}
              >
                <Text style={styles.emptyBtnText}>Log a Catch</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  proButton: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  proText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 1,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  xpBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  xpText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  catchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0E1A',
  },
});

const homeStyles = StyleSheet.create({
  briefCard: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
  },
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  briefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  briefMoon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  briefText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  briefCta: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  bitingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  bitingGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bitingCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  bitingEmoji: {
    fontSize: 28,
  },
  bitingName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  bitingBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  bitingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
