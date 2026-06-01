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
import { knots } from '../data/knots';
import { KnotStep } from '../components/knots/KnotStep';
import { useUserStore } from '../store/userStore';
import { colors, radius, spacing } from '../constants/theme';

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export default function KnotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const { bookmarkKnot, unbookmarkKnot, isKnotBookmarked } = useUserStore();

  const knot = knots.find((k) => k.id === id);

  if (!knot) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Knot not found</Text>
      </View>
    );
  }

  const isBookmarked = isKnotBookmarked(knot.id);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(0,212,170,0.12)', 'transparent']}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <Text style={styles.heroEmoji}>{knot.emoji}</Text>
          <TouchableOpacity
            onPress={() => isBookmarked ? unbookmarkKnot(knot.id) : bookmarkKnot(knot.id)}
            style={styles.bookmarkBtn}
          >
            <MaterialCommunityIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isBookmarked ? colors.secondary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.heroName}>{knot.name}</Text>
        <Text style={styles.heroUseCase}>{knot.useCase}</Text>

        <View style={styles.heroBadges}>
          <View style={[styles.badge, { backgroundColor: difficultyColors[knot.difficulty] + '22' }]}>
            <Text style={[styles.badgeText, { color: difficultyColors[knot.difficulty] }]}>
              {knot.difficulty}
            </Text>
          </View>
          <View style={styles.strengthBadge}>
            <Text style={styles.strengthLabel}>Strength</Text>
            <View style={styles.strengthDots}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: i < knot.strengthRating ? colors.primary : colors.surface2 }]}
                />
              ))}
            </View>
            <Text style={styles.strengthValue}>{knot.strengthRating}/10</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Used for */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Used For</Text>
        <View style={styles.chips}>
          {knot.usedFor.map((use) => (
            <View key={use} style={styles.chip}>
              <Text style={styles.chipText}>{use}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Step by step */}
      <View style={styles.section}>
        <View style={styles.stepsHeader}>
          <Text style={styles.sectionTitle}>Step-by-Step Guide</Text>
          <Text style={styles.stepCount}>Step {currentStep + 1} of {knot.steps.length}</Text>
        </View>

        {knot.steps.map((step, i) => (
          <TouchableOpacity key={i} onPress={() => setCurrentStep(i)}>
            <KnotStep step={step} number={i + 1} isActive={currentStep === i} />
          </TouchableOpacity>
        ))}

        {/* Navigation buttons */}
        <View style={styles.nav}>
          <TouchableOpacity
            style={[styles.navBtn, currentStep === 0 && styles.navBtnDisabled]}
            onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={currentStep === 0 ? colors.surface2 : colors.primary} />
            <Text style={[styles.navBtnText, currentStep === 0 && { color: colors.surface2 }]}>Previous</Text>
          </TouchableOpacity>

          <View style={styles.navProgress}>
            {knot.steps.map((_, i) => (
              <View
                key={i}
                style={[styles.progressDot, currentStep === i && styles.progressDotActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.navBtn, currentStep === knot.steps.length - 1 && styles.navBtnDisabled]}
            onPress={() => setCurrentStep(Math.min(knot.steps.length - 1, currentStep + 1))}
            disabled={currentStep === knot.steps.length - 1}
          >
            <Text style={[styles.navBtnText, currentStep === knot.steps.length - 1 && { color: colors.surface2 }]}>
              Next
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={currentStep === knot.steps.length - 1 ? colors.surface2 : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {currentStep === knot.steps.length - 1 && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedText}>Knot complete! Practice makes perfect.</Text>
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroEmoji: {
    fontSize: 48,
  },
  bookmarkBtn: {
    padding: spacing.xs,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroUseCase: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.textSecondary,
  },
  strengthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  strengthLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  strengthDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strengthValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  chipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  navProgress: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface2,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
  completedBanner: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
    gap: spacing.sm,
  },
  completedEmoji: {
    fontSize: 36,
  },
  completedText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});
