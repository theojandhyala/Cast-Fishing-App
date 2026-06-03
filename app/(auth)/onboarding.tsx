import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { CastButton } from '../../components/ui/CastButton';
import { colors, radius, spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 5;

const SPECIES = [
  { id: 'carp', name: 'Carp', emoji: '🐟' },
  { id: 'pike', name: 'Pike', emoji: '🦷' },
  { id: 'perch', name: 'Perch', emoji: '🎣' },
  { id: 'tench', name: 'Tench', emoji: '🌿' },
  { id: 'bream', name: 'Bream', emoji: '🫧' },
  { id: 'roach', name: 'Roach', emoji: '🔴' },
  { id: 'barbel', name: 'Barbel', emoji: '💪' },
  { id: 'chub', name: 'Chub', emoji: '🌊' },
  { id: 'salmon', name: 'Salmon', emoji: '🐠' },
  { id: 'seabass', name: 'Sea Bass', emoji: '🌊' },
  { id: 'trout', name: 'Trout', emoji: '🌈' },
  { id: 'zander', name: 'Zander', emoji: '🦈' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out or less than 1 year fishing', emoji: '🌱' },
  { id: 'intermediate', label: 'Intermediate', desc: '1–5 years, comfortable with most techniques', emoji: '🎣' },
  { id: 'expert', label: 'Expert', desc: '5+ years, advanced angler', emoji: '🏆' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [hasLicence, setHasLicence] = useState('');
  const { completeOnboarding, user } = useAuthStore();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // Animations
  const fishBounce = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;
  const dotScales = useRef(Array.from({ length: TOTAL_STEPS }, () => new Animated.Value(1))).current;

  useEffect(() => {
    // Fish bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(fishBounce, { toValue: -12, duration: 600, useNativeDriver: true }),
        Animated.timing(fishBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Button pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnPulse, { toValue: 0.92, duration: 900, useNativeDriver: true }),
        Animated.timing(btnPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    animateIn();
  }, []);

  const animateIn = () => {
    slideAnim.setValue(30);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const animateDots = (newStep: number) => {
    dotScales.forEach((scale, i) => {
      Animated.spring(scale, {
        toValue: i === newStep ? 1.4 : 1,
        useNativeDriver: true,
        bounciness: 8,
      }).start();
    });
  };

  const goToStep = (s: number) => {
    setStep(s);
    scrollRef.current?.scrollTo({ x: s * width, animated: true });
    animateIn();
    animateDots(s);
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
          <LinearGradient colors={['rgba(0,212,170,0.25)', 'transparent']} style={styles.slideGradient} />
          <Animated.Text style={[styles.slideEmoji, { transform: [{ translateY: fishBounce }] }]}>🎣</Animated.Text>
          <Text style={styles.slideTitle}>Welcome to CAST</Text>
          <Text style={styles.slideSubtitle}>
            The UK's most advanced fishing companion. Track catches, plan trips, get AI advice, and become a better angler.
          </Text>
          <View style={styles.features}>
            {[
              { icon: '🤖', text: 'AI Fishing Advisor — ask anything' },
              { icon: '📍', text: '500+ UK fishing spots' },
              { icon: '🌙', text: 'Solunar times & moon phases' },
              { icon: '🏆', text: 'Track PBs vs UK records' },
              { icon: '🪢', text: '20 essential knots with guides' },
              { icon: '🐛', text: 'Full bait guide & matcher' },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
          <Animated.View style={[styles.slideBtn, { transform: [{ scale: btnPulse }] }]}>
            <CastButton title="Get Started →" onPress={() => goToStep(1)} fullWidth size="lg" />
          </Animated.View>
        </View>

        {/* Slide 2: Location */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.slideEmoji}>📍</Text>
          <Text style={styles.slideTitle}>Your Location</Text>
          <Text style={styles.slideSubtitle}>
            CAST uses your location to find local fishing spots, give you relevant weather, and show tide times for your area.
          </Text>
          <View style={styles.locationCard}>
            <MaterialIcon name="map-marker-radius" />
            <Text style={styles.locationTitle}>Location Benefits</Text>
            {[
              '🗺 Find spots within 10 miles of you',
              '🌤 Local weather & conditions',
              '🌊 Tide times for your coast',
              '🎣 "What\'s biting near me" AI answers',
            ].map(t => (
              <Text key={t} style={styles.locationBenefit}>{t}</Text>
            ))}
          </View>
          <View style={styles.locationButtons}>
            <TouchableOpacity style={styles.enableBtn}>
              <Text style={styles.enableBtnText}>📍 Enable Location</Text>
            </TouchableOpacity>
            <Text style={styles.locationSkip}>You can enable this later in Settings</Text>
          </View>
          <View style={styles.slideActions}>
            <CastButton title="Back" onPress={() => goToStep(0)} variant="ghost" style={{ flex: 1 }} />
            <CastButton title="Next →" onPress={() => goToStep(2)} style={{ flex: 2 }} />
          </View>
        </View>

        {/* Slide 3: Species */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.slideEmoji}>🐠</Text>
          <Text style={styles.slideTitle}>What do you fish for?</Text>
          <Text style={styles.slideSubtitle}>
            Select your target species — we'll personalise tips, alerts and conditions for you.
          </Text>
          <View style={styles.speciesGrid}>
            {SPECIES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.speciesChip, selectedSpecies.includes(s.id) && styles.speciesChipActive]}
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
            <CastButton title="Back" onPress={() => goToStep(1)} variant="ghost" style={{ flex: 1 }} />
            <CastButton title="Next →" onPress={() => goToStep(3)} style={{ flex: 2 }} />
          </View>
        </View>

        {/* Slide 4: Experience level */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.slideEmoji}>🎖</Text>
          <Text style={styles.slideTitle}>Your Experience</Text>
          <Text style={styles.slideSubtitle}>
            This helps us tailor tips, rig complexity, and species suggestions to your skill level.
          </Text>
          <View style={styles.levelCards}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.levelCard, selectedLevel === l.id && styles.levelCardActive]}
                onPress={() => setSelectedLevel(l.id)}
              >
                <Text style={styles.levelEmoji}>{l.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.levelLabel, selectedLevel === l.id && { color: colors.primary }]}>{l.label}</Text>
                  <Text style={styles.levelDesc}>{l.desc}</Text>
                </View>
                {selectedLevel === l.id && (
                  <Text style={styles.levelCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.slideActions}>
            <CastButton title="Back" onPress={() => goToStep(2)} variant="ghost" style={{ flex: 1 }} />
            <CastButton title="Next →" onPress={() => goToStep(4)} style={{ flex: 2 }} />
          </View>
        </View>

        {/* Slide 5: Licence */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.slideEmoji}>📄</Text>
          <Text style={styles.slideTitle}>Rod Licence</Text>
          <Text style={styles.slideSubtitle}>
            In England & Wales, you need an EA rod licence to fish for freshwater fish. Do you have one?
          </Text>
          <View style={styles.licenceOptions}>
            {[
              { id: 'yes', label: 'Yes, I have a licence', emoji: '✅', desc: 'Great — you\'re legal to fish!' },
              { id: 'no', label: 'No, not yet', emoji: '❌', desc: 'You\'ll need one before fishing' },
              { id: 'notsure', label: 'Not sure', emoji: '🤔', desc: 'We\'ll help you check' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.licenceOption, hasLicence === opt.id && styles.licenceOptionActive]}
                onPress={() => setHasLicence(opt.id)}
              >
                <Text style={styles.licenceEmoji}>{opt.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.licenceLabel, hasLicence === opt.id && { color: colors.primary }]}>{opt.label}</Text>
                  <Text style={styles.licenceDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {(hasLicence === 'no' || hasLicence === 'notsure') && (
            <View style={styles.licenceAlert}>
              <Text style={styles.licenceAlertText}>
                🇬🇧 A 1-day licence costs just £6. Buy at gov.uk/get-a-fishing-licence or through the free NI Angler app.
              </Text>
            </View>
          )}
          <View style={styles.slideActions}>
            <CastButton title="Back" onPress={() => goToStep(3)} variant="ghost" style={{ flex: 1 }} />
            <CastButton title="Start Fishing! 🎣" onPress={handleComplete} style={{ flex: 2 }} />
          </View>
        </View>
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToStep(i)}>
            <Animated.View
              style={[
                styles.dot,
                step === i && styles.dotActive,
                { transform: [{ scale: dotScales[i] }] },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Simple wrapper to avoid importing just for one icon
function MaterialIcon({ name }: { name: string }) {
  return null;
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
    paddingTop: 60,
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slideSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  slideBtn: {
    marginTop: 'auto' as any,
  },
  slideActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: 'auto' as any,
  },
  // Location slide
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationBenefit: {
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 3,
  },
  locationButtons: {
    width: '100%',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  enableBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  enableBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  locationSkip: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Species
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  speciesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '500',
  },
  speciesNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Level
  levelCards: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  levelCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0,212,170,0.08)',
  },
  levelEmoji: {
    fontSize: 32,
  },
  levelLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  levelDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  levelCheck: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '800',
  },
  // Licence
  licenceOptions: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  licenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  licenceOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0,212,170,0.08)',
  },
  licenceEmoji: {
    fontSize: 28,
  },
  licenceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  licenceDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  licenceAlert: {
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    width: '100%',
  },
  licenceAlertText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
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
