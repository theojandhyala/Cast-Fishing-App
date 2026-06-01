import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { CastButton } from '../../components/ui/CastButton';
import { colors, radius, spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SPECIES = [
  { id: 'carp', name: 'Carp', emoji: '🐟' },
  { id: 'pike', name: 'Pike', emoji: '🦷' },
  { id: 'perch', name: 'Perch', emoji: '🎣' },
  { id: 'tench', name: 'Tench', emoji: '🌿' },
  { id: 'bream', name: 'Bream', emoji: '🫧' },
  { id: 'roach', name: 'Roach', emoji: '🔴' },
  { id: 'barbel', name: 'Barbel', emoji: '💪' },
  { id: 'chub', name: 'Chub', emoji: '🌊' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟' },
  { id: 'seabass', name: 'Sea Bass', emoji: '🌊' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const { completeOnboarding, user } = useAuthStore();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const goToStep = (s: number) => {
    setStep(s);
    scrollRef.current?.scrollTo({ x: s * width, animated: true });
  };

  const toggleSpecies = (id: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    const finalName = name.trim() || user?.name || 'Angler';
    completeOnboarding(finalName, selectedSpecies);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.slides}
      >
        {/* Slide 1: Welcome */}
        <View style={[styles.slide, { width }]}>
          <LinearGradient
            colors={['rgba(0,212,170,0.2)', 'transparent']}
            style={styles.slideGradient}
          />
          <Text style={styles.slideEmoji}>🎣</Text>
          <Text style={styles.slideTitle}>Welcome to CAST</Text>
          <Text style={styles.slideSubtitle}>
            Your premium fishing companion for UK waters. Track catches, identify fish, find spots, and improve your angling.
          </Text>
          <View style={styles.features}>
            {[
              { icon: '📍', text: 'Discover 500+ UK fishing spots' },
              { icon: '🐟', text: 'AI fish identification' },
              { icon: '📊', text: 'Track your catch history' },
              { icon: '🪢', text: 'Master essential knots' },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
          <CastButton title="Get Started" onPress={() => goToStep(1)} fullWidth size="lg" style={styles.slideBtn} />
        </View>

        {/* Slide 2: Your Name */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.slideEmoji}>👋</Text>
          <Text style={styles.slideTitle}>What's your name?</Text>
          <Text style={styles.slideSubtitle}>
            We'll personalise your experience with your name.
          </Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder={user?.name || 'Your name...'}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            autoFocus={step === 1}
          />
          <View style={styles.slideActions}>
            <CastButton
              title="Back"
              onPress={() => goToStep(0)}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <CastButton
              title="Next"
              onPress={() => goToStep(2)}
              style={{ flex: 2 }}
            />
          </View>
        </View>

        {/* Slide 3: Species */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.slideEmoji}>🐠</Text>
          <Text style={styles.slideTitle}>Target Species</Text>
          <Text style={styles.slideSubtitle}>
            Select the fish you love to catch. We'll tailor tips and alerts for you.
          </Text>
          <View style={styles.speciesGrid}>
            {SPECIES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.speciesChip,
                  selectedSpecies.includes(s.id) && styles.speciesChipActive,
                ]}
                onPress={() => toggleSpecies(s.id)}
              >
                <Text style={styles.speciesEmoji}>{s.emoji}</Text>
                <Text style={[styles.speciesName, selectedSpecies.includes(s.id) && styles.speciesNameActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.slideActions}>
            <CastButton
              title="Back"
              onPress={() => goToStep(1)}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <CastButton
              title="Start Fishing!"
              onPress={handleComplete}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slides: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  slideGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  slideEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  slideBtn: {
    width: '100%',
  },
  nameInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 20,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.primary + '44',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  slideActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    justifyContent: 'center',
  },
  speciesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  speciesChipActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: colors.primary,
  },
  speciesEmoji: {
    fontSize: 16,
  },
  speciesName: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  speciesNameActive: {
    color: colors.primary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface2,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
