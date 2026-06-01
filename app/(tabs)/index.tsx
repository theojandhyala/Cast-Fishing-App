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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
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
