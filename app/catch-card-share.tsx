import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCatchStore } from '../store/catchStore';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing } from '../constants/theme';

export default function CatchCardShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catches } = useCatchStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const catchItem = id ? catches.find((c) => c.id === id) : catches[0];

  if (!catchItem) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>No catch to share</Text>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getLevelTitle = (level: number): string => {
    if (level >= 20) return 'Master Angler';
    if (level >= 10) return 'Expert Angler';
    if (level >= 5) return 'Intermediate';
    return 'Novice Angler';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Just caught a ${catchItem.weight}kg ${catchItem.species} at ${catchItem.location || 'a secret spot'}! Caught with CAST — the UK's best fishing app. #CaughtWithCAST #Fishing`,
        title: `${catchItem.species} Catch — CAST`,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not open share sheet');
    }
  };

  const handleSaveToPhotos = () => {
    Alert.alert('Saved!', 'Catch card saved to your photo library. (Mock — implement with expo-media-library in production)', [{ text: 'OK' }]);
  };

  const level = user?.level || 1;
  const levelTitle = getLevelTitle(level);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Share Your Catch</Text>
        <Text style={styles.pageSubtitle}>Preview your catch card below</Text>

        {/* Catch Card Preview */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#0D1B2A', '#0A0E1A', '#0D1F1A']}
            style={styles.card}
          >
            {/* CAST Branding */}
            <View style={styles.cardHeader}>
              <Text style={styles.castLogo}>CAST</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="fish" size={12} color={colors.textSecondary} />
                <Text style={styles.castTagline}>UK Fishing</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Fish Emoji */}
            <MaterialCommunityIcons name="fish" size={72} color={colors.primary} style={styles.fishEmoji} />

            {/* Species & Weight */}
            <Text style={styles.speciesName}>{catchItem.species}</Text>
            <View style={styles.statsRow}>
              {catchItem.weight > 0 && (
                <View style={styles.statPill}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <MaterialCommunityIcons name="scale-balance" size={11} color={colors.textSecondary} />
                    <Text style={styles.statPillLabel}>Weight</Text>
                  </View>
                  <Text style={styles.statPillValue}>{catchItem.weight}kg</Text>
                </View>
              )}
              {catchItem.length && (
                <View style={styles.statPill}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <MaterialCommunityIcons name="ruler" size={11} color={colors.textSecondary} />
                    <Text style={styles.statPillLabel}>Length</Text>
                  </View>
                  <Text style={styles.statPillValue}>{catchItem.length}cm</Text>
                </View>
              )}
            </View>

            {/* Details */}
            <View style={styles.detailsGrid}>
              {catchItem.location && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} />
                  <Text style={styles.detailText}>{catchItem.location}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={14} color={colors.primary} />
                <Text style={styles.detailText}>{formatDate(catchItem.date)}</Text>
              </View>
              {catchItem.bait && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="hook" size={14} color={colors.primary} />
                  <Text style={styles.detailText}>Bait: {catchItem.bait}</Text>
                </View>
              )}
            </View>

            {/* Weather if available */}
            {catchItem.weather && (
              <View style={styles.weatherRow}>
                <View style={styles.weatherItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <MaterialCommunityIcons name="thermometer" size={10} color={colors.textSecondary} />
                    <Text style={styles.weatherLabel}>Temp</Text>
                  </View>
                  <Text style={styles.weatherValue}>{catchItem.weather.temp}°C</Text>
                </View>
                <View style={styles.weatherItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <MaterialCommunityIcons name="weather-windy" size={10} color={colors.textSecondary} />
                    <Text style={styles.weatherLabel}>Wind</Text>
                  </View>
                  <Text style={styles.weatherValue}>{catchItem.weather.wind}km/h</Text>
                </View>
                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons name="weather-cloudy" size={14} color={colors.textSecondary} />
                  <Text style={styles.weatherValue}>{catchItem.weather.description}</Text>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Angler Info */}
            <View style={styles.anglerRow}>
              <View style={styles.anglerLeft}>
                <Text style={styles.anglerName}>{user?.name || 'Angler'}</Text>
                <View style={styles.levelBadge}>
                  <MaterialCommunityIcons name="fish" size={10} color={colors.primary} />
                  <Text style={styles.levelBadgeText}>Level {level} · {levelTitle}</Text>
                </View>
              </View>
              <Text style={styles.anglerXp}>{user?.xp || 0} XP</Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerAccent} />
              <Text style={styles.footerText}>Caught with </Text>
              <Text style={styles.footerCast}>CAST</Text>
              <Text style={styles.footerText}> · castfishing.app</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#0A0E1A" />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToPhotos}>
            <MaterialCommunityIcons name="download" size={20} color={colors.primary} />
            <Text style={styles.saveBtnText}>Save to Photos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back to Catch</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  cardWrapper: {
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  castLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 4,
  },
  castTagline: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: spacing.md,
  },
  fishEmoji: {
    fontSize: 72,
    marginBottom: spacing.sm,
  },
  speciesName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statPill: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  statPillLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statPillValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  detailsGrid: {
    width: '100%',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  weatherRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
    gap: 2,
  },
  weatherLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  weatherValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  anglerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  anglerLeft: {
    gap: 4,
  },
  anglerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  anglerXp: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: spacing.sm,
  },
  footerAccent: {
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginRight: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerCast: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  shareBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  backBtn: {
    paddingVertical: spacing.sm,
  },
  backBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
