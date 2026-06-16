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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { CastButton } from '../../components/ui/CastButton';
import { colors, radius, spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 5;

const SPECIES = [
  { id: 'carp', name: 'Carp', icon: 'fish' },
  { id: 'pike', name: 'Pike', icon: 'fish' },
  { id: 'perch', name: 'Perch', icon: 'fish' },
  { id: 'tench', name: 'Tench', icon: 'fish' },
  { id: 'bream', name: 'Bream', icon: 'fish' },
  { id: 'roach', name: 'Roach', icon: 'fish' },
  { id: 'barbel', name: 'Barbel', icon: 'fish' },
  { id: 'chub', name: 'Chub', icon: 'fish' },
  { id: 'salmon', name: 'Salmon', icon: 'fish' },
  { id: 'seabass', name: 'Sea Bass', icon: 'fish' },
  { id: 'trout', name: 'Trout', icon: 'fish' },
  { id: 'zander', name: 'Zander', icon: 'fish' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out or less than 1 year fishing', icon: 'sprout' },
  { id: 'intermediate', label: 'Intermediate', desc: '1–5 years, comfortable with most techniques', icon: 'fish' },
  { id: 'expert', label: 'Expert', desc: '5+ years, advanced angler', icon: 'trophy' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [hasLicence, setHasLicence] = useState('');
  const [fishingSpot, setFishingSpot] = useState('');
  const { completeOnboarding, user } = useAuthStore();
  const { setLocation } = useLocationStore();
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
    if (fishingSpot.trim()) {
      setLocation({ name: fishingSpot.trim(), query: fishingSpot.trim() });
    }
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
        scrollEnabled={true}
        style={styles.slides}
        onMomentumScrollEnd={(e) => {
          const newStep = Math.round(e.nativeEvent.contentOffset.x / width);
          if (newStep !== step) {
            setStep(newStep);
            animateIn();
            animateDots(newStep);
          }
        }}
      >
        {/* Slide 1: Welcome */}
        <View style={[styles.slide, { width }]}>
          <LinearGradient colors={['rgba(0,212,170,0.25)', 'transparent']} style={styles.slideGradient} />
          <Animated.View style={{ transform: [{ translateY: fishBounce }] }}>
            <MaterialCommunityIcons name="fish" size={64} color={colors.primary} style={styles.slideIcon} />
          </Animated.View>
          <Text style={styles.slideTitle}>Welcome to CAST</Text>
          <Text style={styles.slideSubtitle}>
            The UK's most advanced fishing companion. Track catches, plan trips, get AI advice, and become a better angler.
          </Text>
          <View style={styles.features}>
            {[
              { icon: 'robot', text: 'AI Fishing Advisor — ask anything' },
              { icon: 'map-marker', text: '500+ UK fishing spots' },
              { icon: 'weather-night', text: 'Solunar times & moon phases' },
              { icon: 'trophy', text: 'Track PBs vs UK records' },
              { icon: 'hook', text: '20 essential knots with guides' },
              { icon: 'bug', text: 'Full bait guide & matcher' },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <MaterialCommunityIcons name={f.icon as any} size={20} color={colors.primary} style={styles.featureIcon} />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
          <Animated.View style={[styles.slideBtn, { transform: [{ scale: btnPulse }] }]}>
            <CastButton title="Get Started →" onPress={() => goToStep(1)} fullWidth size="lg" />
          </Animated.View>
        </View>

        {/* Slide 2: Where do you fish? */}
        <View style={[styles.slide, { width }]}>
          <MaterialCommunityIcons name="map-marker" size={64} color={colors.primary} style={styles.slideIcon} />
          <Text style={styles.slideTitle}>Where do you fish?</Text>
          <Text style={styles.slideSubtitle}>
            Tell us your usual fishing spot — a lake, river, coast or town. We'll show local weather, conditions and what's biting.
          </Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Your fishing location</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="e.g. Port de Sóller, River Wye, Chesil Beach..."
              placeholderTextColor="#4B5563"
              value={fishingSpot}
              onChangeText={setFishingSpot}
              returnKeyType="done"
            />
            <Text style={styles.locationSkip}>You can change this anytime from the home screen</Text>
          </View>
          <View style={styles.slideActions}>
            <CastButton title="Back" onPress={() => goToStep(0)} variant="ghost" style={{ flex: 1 }} />
            <CastButton title="Next →" onPress={() => goToStep(2)} style={{ flex: 2 }} />
          </View>
        </View>

        {/* Slide 3: Species */}
        <View style={[styles.slide, { width }]}>
          <MaterialCommunityIcons name="fish" size={64} color={colors.primary} style={styles.slideIcon} />
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
                <MaterialCommunityIcons name={s.icon as any} size={16} color={selectedSpecies.includes(s.id) ? colors.primary : colors.textSecondary} />
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
          <MaterialCommunityIcons name="medal" size={64} color={colors.primary} style={styles.slideIcon} />
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
                <MaterialCommunityIcons name={l.icon as any} size={32} color={selectedLevel === l.id ? colors.primary : colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.levelLabel, selectedLevel === l.id && { color: colors.primary }]}>{l.label}</Text>
                  <Text style={styles.levelDesc}>{l.desc}</Text>
                </View>
                {selectedLevel === l.id && (
                  <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
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
          <MaterialCommunityIcons name="file-document" size={64} color={colors.primary} style={styles.slideIcon} />
          <Text style={styles.slideTitle}>Rod Licence</Text>
          <Text style={styles.slideSubtitle}>
            In England & Wales, you need an EA rod licence to fish for freshwater fish. Do you have one?
          </Text>
          <View style={styles.licenceOptions}>
            {[
              { id: 'yes', label: 'Yes, I have a licence', icon: 'check-circle', desc: 'Great — you\'re legal to fish!' },
              { id: 'no', label: 'No, not yet', icon: 'close-circle', desc: 'You\'ll need one before fishing' },
              { id: 'notsure', label: 'Not sure', icon: 'help-circle', desc: 'We\'ll help you check' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.licenceOption, hasLicence === opt.id && styles.licenceOptionActive]}
                onPress={() => setHasLicence(opt.id)}
              >
                <MaterialCommunityIcons name={opt.icon as any} size={28} color={hasLicence === opt.id ? colors.primary : colors.textSecondary} />
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
                A 1-day licence costs just £6. Buy at gov.uk/get-a-fishing-licence or through the free NI Angler app.
              </Text>
            </View>
          )}
          <View style={styles.slideActions}>
            <CastButton title="Back" onPress={() => goToStep(3)} variant="ghost" style={{ flex: 1 }} />
            <CastButton title="Start Fishing!" onPress={handleComplete} style={{ flex: 2 }} />
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
  slideIcon: {
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
    width: 20,
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
  locationInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
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
