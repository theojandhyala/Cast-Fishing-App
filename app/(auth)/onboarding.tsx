import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { FishPhoto } from '../../components/fish/FishPhoto';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

const TOTAL_STEPS = 5;

const REGIONS = [
  { id: 'uk-ie', label: 'UK & Ireland', icon: 'waves' },
  { id: 'europe', label: 'Europe', icon: 'compass-outline' },
  { id: 'north-america', label: 'North America', icon: 'pine-tree' },
  { id: 'australia', label: 'Australia', icon: 'island' },
  { id: 'new-zealand', label: 'New Zealand', icon: 'terrain' },
  { id: 'south-africa', label: 'South Africa', icon: 'weather-sunny' },
  { id: 'japan', label: 'Japan', icon: 'map-marker-outline' },
  { id: 'brazil-amazon', label: 'Brazil & Amazon', icon: 'forest' },
  { id: 'india', label: 'India', icon: 'water' },
  { id: 'global', label: 'Worldwide', icon: 'earth' },
] as const;

const SPECIES = [
  { id: 'carp', name: 'Carp', group: 'Freshwater', scientificName: 'Cyprinus carpio', accent: '#D7A84A' },
  { id: 'largemouth-bass', name: 'Largemouth Bass', group: 'Freshwater', scientificName: 'Micropterus salmoides', accent: '#73A05B' },
  { id: 'trout', name: 'Brown Trout', group: 'Freshwater', scientificName: 'Salmo trutta', accent: '#8EC5D6' },
  { id: 'salmon', name: 'Atlantic Salmon', group: 'Migratory', scientificName: 'Salmo salar', accent: '#F08A72' },
  { id: 'northern-pike', name: 'Northern Pike', group: 'Predator', scientificName: 'Esox lucius', accent: '#7E9A53' },
  { id: 'catfish', name: 'Wels Catfish', group: 'Freshwater', scientificName: 'Silurus glanis', accent: '#9A8B7A' },
  { id: 'perch', name: 'European Perch', group: 'Freshwater', scientificName: 'Perca fluviatilis', accent: '#E6A83B' },
  { id: 'barramundi', name: 'Barramundi', group: 'Estuary', scientificName: 'Lates calcarifer', accent: '#A9C7D6' },
  { id: 'sea-bass', name: 'European Sea Bass', group: 'Saltwater', scientificName: 'Dicentrarchus labrax', accent: '#82A9B8' },
  { id: 'snapper', name: 'Red Snapper', group: 'Saltwater', scientificName: 'Lutjanus campechanus', accent: '#E7655A' },
  { id: 'tuna', name: 'Bluefin Tuna', group: 'Offshore', scientificName: 'Thunnus thynnus', accent: '#4B7EA8' },
  { id: 'marlin', name: 'Blue Marlin', group: 'Big game', scientificName: 'Makaira nigricans', accent: '#346C9C' },
  { id: 'mahi-mahi', name: 'Mahi-mahi', group: 'Offshore', scientificName: 'Coryphaena hippurus', accent: '#35C5B3' },
  { id: 'tarpon', name: 'Atlantic Tarpon', group: 'Saltwater', scientificName: 'Megalops atlanticus', accent: '#A9B7C3' },
  { id: 'giant-trevally', name: 'Giant Trevally', group: 'Saltwater', scientificName: 'Caranx ignobilis', accent: '#687A86' },
  { id: 'yellowtail', name: 'Yellowtail Kingfish', group: 'Offshore', scientificName: 'Seriola lalandi', accent: '#E2B93B' },
] as const;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entrance = useRef(new Animated.Value(1)).current;
  const authUser = useAuthStore((state) => state.user);
  const completeAuthOnboarding = useAuthStore((state) => state.completeOnboarding);
  const saveProfile = useProfileStore((state) => state.setOnboardingProfile);

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(authUser?.name ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(authUser?.avatar ?? null);
  const [regionId, setRegionId] = useState('');
  const [targetSpecies, setTargetSpecies] = useState<string[]>([]);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const usernameValid = username.trim().length >= 2 && username.trim().length <= 24;
  const canContinue = useMemo(() => {
    if (step === 1) return usernameValid;
    if (step === 3) return Boolean(regionId);
    if (step === 4) return targetSpecies.length > 0;
    return true;
  }, [regionId, step, targetSpecies.length, usernameValid]);

  const animateScreen = () => {
    entrance.setValue(0);
    Animated.spring(entrance, { toValue: 1, damping: 16, stiffness: 150, useNativeDriver: Platform.OS !== 'web' }).start();
  };

  const goTo = (nextStep: number) => {
    const safeStep = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setStep(safeStep);
    animateScreen();
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const toggleSpecies = (speciesId: string) => {
    setTargetSpecies((selected) => selected.includes(speciesId)
      ? selected.filter((id) => id !== speciesId)
      : [...selected, speciesId]);
  };

  const finish = async () => {
    if (!usernameValid || !regionId || targetSpecies.length === 0) return;
    setSaving(true);
    const cleanUsername = username.trim();
    await completeAuthOnboarding(cleanUsername, targetSpecies, { regionId });
    const authState = useAuthStore.getState();
    if (authState.authError || !authState.user?.hasCompletedOnboarding) {
      setSaving(false);
      Alert.alert('Couldn’t finish setup', authState.authError || 'Please try again.');
      return;
    }
    saveProfile({ username: cleanUsername, photoUri, regionId, targetSpecies });
    router.replace('/(tabs)');
  };

  const next = () => {
    if (step === 1) setUsernameTouched(true);
    if (!canContinue) return;
    if (step === TOTAL_STEPS - 1) void finish();
    else goTo(step + 1);
  };

  const animatedStyle = {
    opacity: entrance,
    transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#0B2930', colors.background, colors.background]} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Icon name="fish" size={18} color={colors.background} /></View>
          <Text style={styles.brandText}>CAST</Text>
        </View>
        <Text style={styles.stepLabel}>{step + 1} / {TOTAL_STEPS}</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <View style={styles.pager}>
        <Animated.View style={[styles.page, animatedStyle]}>
          {step === 0 ? (
          <View style={[styles.pageContent, styles.welcomeContent]}>
            <View style={styles.heroVisual}>
              <View style={styles.heroGlow} />
              <View style={styles.heroRing}>
                <Text style={styles.heroScore}>86</Text>
                <Text style={styles.heroScoreLabel}>FISHING SCORE</Text>
              </View>
              <View style={[styles.floatingPill, styles.pillLeft]}><Icon name="map-marker" size={16} color={colors.accentBlue} /><Text style={styles.pillText}>Find waters</Text></View>
              <View style={[styles.floatingPill, styles.pillRight]}><Icon name="trophy-outline" size={16} color={colors.secondary} /><Text style={styles.pillText}>Earn XP</Text></View>
            </View>
            <Text style={styles.kicker}>YOUR WATER. YOUR STORY.</Text>
            <Text style={styles.title}>Every great catch starts with a cast.</Text>
            <Text style={styles.subtitle}>Build your angling profile, discover what’s biting, and turn every session into progress.</Text>
          </View>
          ) : null}

          {step === 1 ? (
          <View style={styles.pageContent}>
            <View style={styles.stepIcon}><Icon name="account-outline" size={28} color={colors.primary} /></View>
            <Text style={styles.kicker}>MAKE IT YOURS</Text>
            <Text style={styles.title}>What should anglers call you?</Text>
            <Text style={styles.subtitle}>This is how your name appears on catches, leaderboards, and shared cards.</Text>
            <View style={[styles.inputShell, usernameTouched && !usernameValid && styles.inputError]}>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                accessibilityLabel="Angler username"
                maxLength={24}
                onBlur={() => setUsernameTouched(true)}
                onChangeText={setUsername}
                onSubmitEditing={next}
                placeholder="e.g. RiverRover"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                style={styles.input}
                value={username}
              />
              <Text style={styles.characterCount}>{username.trim().length}/24</Text>
            </View>
            {usernameTouched && !usernameValid ? <Text style={styles.errorText}>Use between 2 and 24 characters.</Text> : null}
          </View>
          ) : null}

          {step === 2 ? (
          <View style={[styles.pageContent, styles.centeredContent]}>
            <Text style={styles.kicker}>PUT A FACE TO THE CATCH</Text>
            <Text style={styles.title}>Add a profile photo</Text>
            <Text style={styles.subtitle}>Optional, but it makes your catch cards unmistakably yours.</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Choose profile photo" activeOpacity={0.85} onPress={pickPhoto} style={styles.photoButton}>
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <Icon name="camera-plus-outline" size={48} color={colors.primary} />}
              <View style={styles.photoEdit}><Icon name="pencil" size={16} color={colors.background} /></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickPhoto} style={styles.textButton}><Text style={styles.textButtonLabel}>{photoUri ? 'Choose a different photo' : 'Choose from library'}</Text></TouchableOpacity>
            <Text style={styles.optionalText}>You can always add one later.</Text>
          </View>
          ) : null}

          {step === 3 ? (
          <View style={styles.pageContent}>
            <View style={styles.stepIcon}><Icon name="earth" size={28} color={colors.primary} /></View>
            <Text style={styles.kicker}>SET YOUR HOME WATERS</Text>
            <Text style={styles.title}>Where do you fish?</Text>
            <Text style={styles.subtitle}>We’ll tune species, seasons, units, and nearby water recommendations.</Text>
            <ScrollView contentContainerStyle={styles.optionGrid} showsVerticalScrollIndicator={false}>
              {REGIONS.map((region) => {
                const selected = regionId === region.id;
                return (
                  <TouchableOpacity key={region.id} accessibilityRole="radio" accessibilityState={{ selected }} activeOpacity={0.8} onPress={() => setRegionId(region.id)} style={[styles.regionCard, selected && styles.selectedCard]}>
                    <Icon name={region.icon as any} size={22} color={selected ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.regionLabel, selected && styles.selectedText]}>{region.label}</Text>
                    {selected ? <Icon name="check-circle" size={18} color={colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          ) : null}

          {step === 4 ? (
          <View style={styles.pageContent}>
            <View style={styles.stepIcon}><Icon name="target" size={28} color={colors.primary} /></View>
            <Text style={styles.kicker}>CHOOSE YOUR CHASE</Text>
            <Text style={styles.title}>What are you after?</Text>
            <Text style={styles.subtitle}>Pick one or more. Your feed and fishing intel will start here.</Text>
            <ScrollView contentContainerStyle={styles.speciesGrid} showsVerticalScrollIndicator={false}>
              {SPECIES.map((species) => {
                const selected = targetSpecies.includes(species.id);
                return (
                  <TouchableOpacity
                    key={species.id}
                    accessibilityLabel={`${species.name}, ${species.group}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    activeOpacity={0.8}
                    onPress={() => toggleSpecies(species.id)}
                    style={[styles.speciesCard, { borderColor: `${species.accent}42` }, selected && styles.selectedCard]}
                  >
                    <FishPhoto scientificName={species.scientificName} commonName={species.name} accent={species.accent} style={styles.speciesPhoto} />
                    <View style={styles.speciesCopy}><Text style={[styles.speciesName, selected && styles.selectedText]}>{species.name}</Text><Text style={styles.speciesGroup}>{species.group}</Text></View>
                    <View style={[styles.speciesCheck, selected && styles.speciesCheckSelected]}>
                      {selected ? <Icon name="check" size={14} color={colors.background} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          ) : null}
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {step > 0 ? <TouchableOpacity accessibilityRole="button" onPress={() => goTo(step - 1)} style={styles.backButton}><Icon name="arrow-left" size={21} color={colors.textPrimary} /></TouchableOpacity> : null}
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !canContinue || saving, busy: saving }} activeOpacity={0.85} disabled={!canContinue || saving} onPress={next} style={[styles.nextButton, (!canContinue || saving) && styles.nextButtonDisabled]}>
          <Text style={styles.nextButtonText}>{saving ? 'Building profile…' : step === 0 ? 'Start your journey' : step === TOTAL_STEPS - 1 ? 'Build my profile' : step === 2 && !photoUri ? 'Skip for now' : 'Continue'}</Text>
          <Icon name={step === TOTAL_STEPS - 1 ? 'check' : 'arrow-right'} size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: colors.textPrimary, fontFamily: fonts.display, letterSpacing: 2, fontSize: 17 },
  stepLabel: { color: colors.textSecondary, fontFamily: fonts.mono, fontSize: 12 },
  progressTrack: { height: 2, marginHorizontal: spacing.lg, backgroundColor: colors.borderStrong, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  pager: { flex: 1 },
  page: { flex: 1 },
  pageContent: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  welcomeContent: { justifyContent: 'center', paddingBottom: spacing.xxl },
  centeredContent: { alignItems: 'center', paddingTop: 58 },
  heroVisual: { height: 230, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  heroGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,212,170,0.07)' },
  heroRing: { width: 156, height: 156, borderRadius: 78, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,212,170,0.08)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.28)', overflow: 'hidden' },
  heroScore: { color: colors.primary, fontFamily: fonts.display, fontSize: 46, lineHeight: 50, letterSpacing: -2 },
  heroScoreLabel: { color: colors.textSecondary, fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.6, marginTop: 3 },
  floatingPill: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 8 },
  pillLeft: { left: 2, bottom: 38 },
  pillRight: { right: 2, top: 30 },
  pillText: { color: colors.textPrimary, fontFamily: fonts.bodySemi, fontSize: 12 },
  kicker: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.2, marginBottom: spacing.sm },
  title: { color: colors.textPrimary, fontFamily: fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, maxWidth: 500 },
  subtitle: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 500 },
  stepIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(0,212,170,0.09)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  inputShell: { height: 62, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.md },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.textPrimary, fontFamily: fonts.bodySemi, fontSize: 17, height: '100%' },
  characterCount: { color: colors.textTertiary, fontFamily: fonts.mono, fontSize: 11 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.sm },
  photoButton: { width: 174, height: 174, borderRadius: 87, marginTop: 42, backgroundColor: colors.surface, borderWidth: 2, borderColor: 'rgba(0,212,170,0.42)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%', borderRadius: 87 },
  photoEdit: { position: 'absolute', right: 4, bottom: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.background },
  textButton: { padding: spacing.md, marginTop: spacing.md },
  textButtonLabel: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: 14 },
  optionalText: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 12 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  regionCard: { width: '48.5%', minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 12, paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  regionLabel: { flex: 1, color: colors.textSecondary, fontFamily: fonts.bodySemi, fontSize: 13 },
  selectedCard: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.09)' },
  selectedText: { color: colors.textPrimary },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  speciesCard: { width: '48.5%', minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8, paddingRight: 20, position: 'relative', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1 },
  speciesPhoto: { width: 56, height: 56, borderRadius: 14 },
  speciesCopy: { flex: 1, minWidth: 0 },
  speciesName: { color: colors.textSecondary, fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 15 },
  speciesGroup: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  speciesCheck: { position: 'absolute', right: 5, top: 5, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(10,14,26,0.75)', alignItems: 'center', justifyContent: 'center' },
  speciesCheckSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  footer: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.md, paddingHorizontal: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: 'rgba(10,14,26,0.96)' },
  backButton: { width: 54, minHeight: 54, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  nextButton: { flex: 1, minHeight: 54, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  nextButtonDisabled: { opacity: 0.35 },
  nextButtonText: { color: colors.background, fontFamily: fonts.bodyBold, fontSize: 15 },
});
