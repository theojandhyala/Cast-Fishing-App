import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useLocation } from '../hooks/useLocation';
import { species } from '../data/species';
import { CastButton } from '../components/ui/CastButton';
import { colors, radius, spacing } from '../constants/theme';

const SPECIES_OPTIONS = species.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji }));

export default function AddCatchScreen() {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [bait, setBait] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const { addCatch } = useCatchStore();
  const { location: gpsLocation } = useLocation();
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
    if (gpsLocation) {
      setLocation(gpsLocation.city || 'Current Location');
    } else {
      Alert.alert('Location', 'Could not get location. Please enter manually.');
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
      latitude: gpsLocation?.latitude,
      longitude: gpsLocation?.longitude,
      bait: bait || undefined,
      notes: notes || undefined,
      photo: photo || undefined,
      emoji: selectedSpeciesData?.emoji || '🐟',
    });
    setSaving(false);
    router.back();
  };

  return (
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
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(true)}>
              <MaterialCommunityIcons name="camera" size={24} color={colors.primary} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(false)}>
              <MaterialCommunityIcons name="image" size={24} color={colors.primary} />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Species */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Species *</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
        >
          {selectedSpeciesData ? (
            <View style={styles.selectedSpecies}>
              <Text style={styles.selectedEmoji}>{selectedSpeciesData.emoji}</Text>
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
                <Text style={styles.pickerEmoji}>{s.emoji}</Text>
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

      {/* Weight & Length */}
      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 3.5"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.section, { flex: 1, marginLeft: spacing.sm }]}>
          <Text style={styles.sectionTitle}>Length (cm)</Text>
          <TextInput
            style={styles.input}
            value={length}
            onChangeText={setLength}
            placeholder="e.g. 45"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
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

      {/* Bait */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bait Used</Text>
        <TextInput
          style={styles.input}
          value={bait}
          onChangeText={setBait}
          placeholder="e.g. Boilies, Worms..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
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
  photoContainer: {
    position: 'relative',
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
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.xs,
  },
  photoBtnText: {
    fontSize: 14,
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
  selectedEmoji: {
    fontSize: 20,
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
  pickerEmoji: {
    fontSize: 20,
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
