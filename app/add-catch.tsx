import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useLocationStore } from '../store/locationStore';
import { species } from '../data/species';
import { CastButton } from '../components/ui/CastButton';
import { colors, radius, spacing, typography, fonts, elevation } from '../constants/theme';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

const RARITY_CELEBRATION: Record<Rarity, { title: string; subtitle: string; color: string; xp: number; icon: string } | null> = {
  common: null,
  uncommon: null,
  rare: { title: 'Rare Catch!', subtitle: 'Nice one! A rare fish on the line.', color: '#3B82F6', xp: 50, icon: 'circle' },
  epic: { title: 'Epic Catch!', subtitle: 'Incredible fish! Outstanding catch.', color: '#8B5CF6', xp: 150, icon: 'hexagon' },
  legendary: { title: 'LEGENDARY!', subtitle: 'An extraordinary catch. You\'ll be telling this story forever.', color: '#F59E0B', xp: 500, icon: 'trophy' },
  mythic: { title: 'MYTHIC CATCH!', subtitle: 'You\'ve caught something extraordinary. A fish most anglers will never see in their lifetime.', color: '#EC4899', xp: 1000, icon: 'star-four-points' },
};

const SPECIES_OPTIONS = species.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji }));

export default function AddCatchScreen() {
  const params = useLocalSearchParams<{ species?: string; weight?: string }>();
  const prefillSpecies = params.species
    ? SPECIES_OPTIONS.find((s) => s.name.toLowerCase() === params.species!.toLowerCase())?.id || ''
    : '';
  const [selectedSpecies, setSelectedSpecies] = useState(prefillSpecies);
  const [weight, setWeight] = useState(params.weight ? String(params.weight) : '');
  const [length, setLength] = useState('');
  const [bait, setBait] = useState('');
  const [notes, setNotes] = useState('');
  const { location: manualLocation } = useLocationStore();
  const [location, setLocation] = useState(manualLocation?.name || '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [celebrationData, setCelebrationData] = useState<typeof RARITY_CELEBRATION['rare'] | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const { addCatch } = useCatchStore();
  const router = useRouter();

  const selectedSpeciesData = SPECIES_OPTIONS.find((s) => s.id === selectedSpecies);

  const pickPhoto = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }

    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!res.canceled && res.assets[0]) {
      setPhoto(res.assets[0].uri);
    }
  };

  const handleAutoLocation = () => {
    if (manualLocation) {
      setLocation(manualLocation.name);
    } else {
      Alert.alert('Location', 'No fishing location set. Please enter manually.');
    }
  };

  const handleSave = async () => {
    if (!selectedSpecies) {
      Alert.alert('Missing info', 'Please select a species');
      return;
    }
    if (!weight) {
      Alert.alert('Missing info', 'Please enter the fish weight');
      return;
    }

    setSaving(true);
    await addCatch({
      species: selectedSpeciesData?.name || selectedSpecies,
      weight: parseFloat(weight),
      length: length ? parseFloat(length) : undefined,
      location: location || undefined,
      bait: bait || undefined,
      notes: notes || undefined,
      photo: photo || undefined,
      emoji: selectedSpeciesData?.emoji || 'fish',
    });
    setSaving(false);

    // Check rarity and show celebration
    const fullSpeciesData = species.find((s) => s.id === selectedSpecies) as any;
    const rarity: Rarity = fullSpeciesData?.rarity || 'common';
    const celebration = RARITY_CELEBRATION[rarity];
    if (celebration) {
      setCelebrationData(celebration);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      router.back();
    }
  };

  return (
    <>
    {/* Rarity Celebration Modal */}
    <Modal visible={!!celebrationData} transparent animationType="fade">
      <Animated.View style={[styles.celebrationOverlay, {
        opacity: flashAnim,
        backgroundColor: celebrationData ? celebrationData.color + '33' : 'transparent',
      }]}>
        <View style={[styles.celebrationCard, { borderColor: celebrationData?.color || colors.primary }]}>
          <MaterialCommunityIcons
            name={(celebrationData?.icon as any) || 'trophy'}
            size={64}
            color={celebrationData?.color || colors.primary}
            style={styles.celebrationIcon}
          />
          <Text style={[styles.celebrationTitle, { color: celebrationData?.color || colors.primary }]}>
            {celebrationData?.title}
          </Text>
          <Text style={styles.celebrationSubtitle}>{celebrationData?.subtitle}</Text>
          <View style={[styles.xpBadge, { borderColor: celebrationData?.color || colors.primary }]}>
            <Text style={[styles.xpText, { color: celebrationData?.color || colors.primary }]}>
              +{celebrationData?.xp} XP
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.celebrationBtn, { backgroundColor: celebrationData?.color || colors.primary }]}
            onPress={() => { setCelebrationData(null); router.back(); }}
          >
            <Text style={styles.celebrationBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo</Text>
        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
              <MaterialCommunityIcons name="close-circle" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(true)} activeOpacity={0.85}>
              <View style={styles.photoBtnIconWrap}>
                <MaterialCommunityIcons name="camera-outline" size={26} color={colors.primary} />
              </View>
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(false)} activeOpacity={0.85}>
              <View style={styles.photoBtnIconWrap}>
                <MaterialCommunityIcons name="image-outline" size={26} color={colors.primary} />
              </View>
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Catch details card */}
      <View style={styles.card}>
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Species *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
          >
            {selectedSpeciesData ? (
              <View style={styles.selectedSpecies}>
                <MaterialCommunityIcons name="fish" size={20} color={colors.primary} />
                <Text style={styles.selectedName}>{selectedSpeciesData.name}</Text>
              </View>
            ) : (
              <Text style={styles.pickerPlaceholder}>Select species...</Text>
            )}
            <MaterialCommunityIcons
              name={showSpeciesPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showSpeciesPicker && (
            <View style={styles.picker}>
              {SPECIES_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.pickerItem, selectedSpecies === s.id && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedSpecies(s.id);
                    setShowSpeciesPicker(false);
                  }}
                >
                  <MaterialCommunityIcons name="fish" size={20} color={selectedSpecies === s.id ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.pickerName, selectedSpecies === s.id && { color: colors.primary }]}>
                    {s.name}
                  </Text>
                  {selectedSpecies === s.id && (
                    <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />

        <View style={[styles.cardSection, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Weight (kg) *</Text>
            <TextInput
              style={[styles.input, styles.inputMono]}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 3.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.sectionTitle}>Length (cm)</Text>
            <TextInput
              style={[styles.input, styles.inputMono]}
              value={length}
              onChangeText={setLength}
              placeholder="e.g. 45"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location..."
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.gpsBtn} onPress={handleAutoLocation}>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Bait Used</Text>
          <TextInput
            style={styles.input}
            value={bait}
            onChangeText={setBait}
            placeholder="e.g. Boilies, Worms..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.cardDivider} />

        <View style={[styles.cardSection, { marginBottom: 0 }]}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Conditions, techniques, anything memorable..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.saveBtn}>
        <CastButton
          title="Save Catch"
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.card,
  },
  cardSection: {
    marginBottom: spacing.md,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: radius.lg,
    ...elevation.card,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
  },
  removePhoto: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    gap: spacing.sm,
    ...elevation.raised,
  },
  photoBtnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,212,170,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pickerButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
  },
  selectedSpecies: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  pickerItemActive: {
    backgroundColor: 'rgba(0,212,170,0.08)',
  },
  pickerName: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMono: {
    fontFamily: fonts.mono,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsBtn: {
    width: 46,
    height: 46,
    backgroundColor: 'rgba(45,212,255,0.1)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,212,255,0.3)',
  },
  saveBtn: {
    marginTop: spacing.md,
  },
  celebrationOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  celebrationCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center',
    borderWidth: 2, width: '100%',
  },
  celebrationIcon: { marginBottom: spacing.md },
  celebrationTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: spacing.sm },
  celebrationSubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  xpBadge: {
    borderWidth: 2, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  xpText: { fontSize: 24, fontWeight: '900' },
  celebrationBtn: {
    borderRadius: radius.xl, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, minWidth: 150, alignItems: 'center',
  },
  celebrationBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
