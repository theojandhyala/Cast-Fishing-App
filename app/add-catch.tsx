import React, { useEffect, useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useLocationStore } from '../store/locationStore';
import { species as SPECIES_LIST } from '../data/species';
import { colors, radius, spacing, elevation } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPECIES_OPTIONS = SPECIES_LIST.map((s) => ({ id: s.id, name: s.name || s.commonName }));

export default function AddCatchScreen() {
  const params = useLocalSearchParams<{ species?: string; weight?: string; length?: string; photo?: string; confidence?: string; scanned?: string }>();
  const router = useRouter();
  const { addCatch } = useCatchStore();
  const { location } = useLocationStore();

  const prefill = params.species
    ? SPECIES_OPTIONS.find((s) => s.name.toLowerCase() === params.species!.toLowerCase())
    : null;

  const [selectedSpecies, setSelectedSpecies] = useState(prefill?.name || params.species || '');
  const [weight, setWeight] = useState(params.weight || '');
  const [length, setLength] = useState(params.length || '');
  const [bait, setBait] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(params.photo || null);
  const [speciesPicker, setSpeciesPicker] = useState(false);
  const [baitPicker, setBaitPicker] = useState(false);

  useEffect(() => {
    if (params.scanned !== '1') return;
    let active = true;
    AsyncStorage.getItem('@cast_pending_scan_photo').then((stored) => {
      if (active && stored) setPhotoUri(stored);
      return AsyncStorage.removeItem('@cast_pending_scan_photo');
    }).catch(() => {});
    return () => { active = false; };
  }, [params.scanned]);

  const spotName = location?.name || 'Pine Lake';
  const now = new Date();
  const timeStr = `Today, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const handlePhoto = async (source: 'camera' | 'library') => {
    const { status } = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to add a photo.');
      return;
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.65, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.65, base64: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
    }
  };

  const handleSave = async () => {
    if (!selectedSpecies) { Alert.alert('Select a species'); return; }
    await addCatch({
      species: selectedSpecies,
      weight: (parseFloat(weight) || 0) as number,
      length: parseFloat(length) || undefined,
      location: spotName,
      bait: bait || undefined,
      notes: notes || undefined,
      photo: photoUri || undefined,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
    router.back();
  };

  return (
    <View style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Log a Catch</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          <TouchableOpacity
            style={s.lensButton}
            onPress={() => router.push({ pathname: '/identifier', params: { mode: 'catch' } } as any)}
            activeOpacity={0.85}
          >
            <View style={s.lensIcon}>
              <MaterialCommunityIcons name="camera-iris" size={24} color={colors.background} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.lensTitle}>Scan with CAST Lens</Text>
              <Text style={s.lensSub}>Scan one photo to pre-fill species, estimated weight and length for review</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.background} />
          </TouchableOpacity>

          {/* Photo upload */}
          <View style={s.photoBox}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.photoImage} />
            ) : (
              <>
                <View style={s.photoIcon}>
                  <MaterialCommunityIcons name="camera-outline" size={32} color={colors.textSecondary} />
                </View>
                <Text style={s.photoLabel}>Add Photo</Text>
                <Text style={s.photoSub}>Use the camera or choose from your library below</Text>
              </>
            )}
          </View>
          <View style={s.photoActions}>
            <TouchableOpacity style={s.photoAction} onPress={() => handlePhoto('camera')} accessibilityRole="button">
              <MaterialCommunityIcons name="camera-outline" size={17} color={colors.primary} />
              <Text style={s.photoActionText}>{photoUri ? 'Retake' : 'Camera'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.photoAction} onPress={() => handlePhoto('library')} accessibilityRole="button">
              <MaterialCommunityIcons name="image-outline" size={17} color={colors.primary} />
              <Text style={s.photoActionText}>{photoUri ? 'Replace' : 'Choose photo'}</Text>
            </TouchableOpacity>
            {photoUri ? <TouchableOpacity style={s.photoAction} onPress={() => setPhotoUri(null)} accessibilityRole="button"><MaterialCommunityIcons name="delete-outline" size={17} color={colors.danger} /><Text style={[s.photoActionText, { color: colors.danger }]}>Remove</Text></TouchableOpacity> : null}
          </View>

          {params.scanned === '1' ? (
            <View style={s.scanReview}>
              <MaterialCommunityIcons name="check-decagram-outline" size={19} color={colors.primary} />
              <Text style={s.scanReviewText}>Lens filled this form with a {params.confidence || '—'}% species match and estimated measurements. Check the values before saving.</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={s.form}>
            {/* Species */}
            <TouchableOpacity style={s.formRow} onPress={() => setSpeciesPicker(true)} activeOpacity={0.85}>
              <Text style={s.formLabel}>Species</Text>
              <View style={s.formRight}>
                <Text style={[s.formValue, !selectedSpecies && s.placeholder]}>
                  {selectedSpecies || 'Select species'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
            <View style={s.sep} />

            {/* Weight + Length */}
            <View style={s.formRowInline}>
              <View style={s.inlineLeft}>
                <Text style={s.formLabel}>Weight</Text>
                <View style={s.inlineInput}>
                  <TextInput
                    style={s.inlineText}
                    placeholder="0.0"
                    placeholderTextColor={colors.textTertiary}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                  <Text style={s.unit}>kg</Text>
                </View>
              </View>
              <View style={s.inlineDivider} />
              <View style={s.inlineRight}>
                <Text style={s.formLabel}>Length</Text>
                <View style={s.inlineInput}>
                  <TextInput
                    style={s.inlineText}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    value={length}
                    onChangeText={setLength}
                    keyboardType="decimal-pad"
                  />
                  <Text style={s.unit}>cm</Text>
                </View>
              </View>
            </View>
            <View style={s.sep} />

            {/* Bait */}
            <TouchableOpacity style={s.formRow} onPress={() => setBaitPicker(true)} activeOpacity={0.85}>
              <Text style={s.formLabel}>Bait / Lure</Text>
              <View style={s.formRight}>
                <Text style={[s.formValue, !bait && s.placeholder]}>
                  {bait || 'Select bait or lure'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
            <View style={s.sep} />

            {/* Spot */}
            <View style={s.formRow}>
              <Text style={s.formLabel}>Selected Spot</Text>
              <Text style={s.formValue}>{spotName}</Text>
            </View>
            <View style={s.sep} />

            {/* Time */}
            <View style={s.formRow}>
              <Text style={s.formLabel}>Time Caught</Text>
              <Text style={s.formValue}>{timeStr}</Text>
            </View>
            <View style={s.sep} />

            {/* Notes */}
            <View style={s.notesRow}>
              <Text style={s.formLabel}>Notes</Text>
              <TextInput
                style={s.notesInput}
                placeholder="Add notes..."
                placeholderTextColor={colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <LinearGradient colors={['#00D4AA', '#00B892']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGrad}>
            <Text style={s.saveBtnText}>SAVE CATCH</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Species picker modal */}
      <Modal visible={speciesPicker} transparent animationType="slide" onRequestClose={() => setSpeciesPicker(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setSpeciesPicker(false)} />
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>Select Species</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {SPECIES_OPTIONS.map((sp) => (
              <TouchableOpacity
                key={sp.id}
                style={s.sheetRow}
                onPress={() => { setSelectedSpecies(sp.name); setSpeciesPicker(false); }}
              >
                <Text style={s.sheetRowText}>{sp.name}</Text>
                {selectedSpecies === sp.name && <MaterialCommunityIcons name="check" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Bait picker modal */}
      <Modal visible={baitPicker} transparent animationType="slide" onRequestClose={() => setBaitPicker(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setBaitPicker(false)} />
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>Select Bait / Lure</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {['Boilies', 'Sweetcorn', 'Maggots', 'Worms', 'Deadbait', 'Lure', 'Spinner', 'Fly', 'Pellets', 'Hemp', 'Bread', 'Cheese', 'Feeder', 'Zig rig'].map((b) => (
              <TouchableOpacity key={b} style={s.sheetRow} onPress={() => { setBait(b); setBaitPicker(false); }}>
                <Text style={s.sheetRowText}>{b}</Text>
                {bait === b && <MaterialCommunityIcons name="check" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },

  lensButton: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md,
    ...elevation.glow,
  },
  lensIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,14,26,0.16)' },
  lensTitle: { fontSize: 15, fontWeight: '800', color: colors.background },
  lensSub: { fontSize: 11, lineHeight: 16, color: 'rgba(10,14,26,0.72)', marginTop: 2 },

  photoBox: {
    margin: spacing.lg,
    height: 160, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoIcon: {
    width: 56, height: 56, borderRadius: radius.full,
    backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  photoSub: { fontSize: 12, color: colors.textSecondary },
  photoActions: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: -spacing.md, marginBottom: spacing.md },
  photoAction: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  photoActionText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  scanReview: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(68,210,203,0.3)', backgroundColor: 'rgba(68,210,203,0.08)' },
  scanReviewText: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },

  form: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    ...elevation.raised,
  },
  formRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  formRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  formValue: { fontSize: 14, color: colors.textSecondary },
  placeholder: { color: colors.textTertiary },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },

  formRowInline: { flexDirection: 'row', alignItems: 'center' },
  inlineLeft: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14 },
  inlineRight: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14 },
  inlineDivider: { width: 1, height: 40, backgroundColor: colors.border },
  inlineInput: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  inlineText: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  unit: { fontSize: 13, color: colors.textSecondary },

  notesRow: { paddingHorizontal: spacing.md, paddingTop: 14, paddingBottom: 14 },
  notesInput: { fontSize: 14, color: colors.textPrimary, marginTop: 8, minHeight: 60 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: 32,
  },
  saveBtn: { borderRadius: radius.full, overflow: 'hidden', ...elevation.glow },
  saveBtnGrad: { alignItems: 'center', paddingVertical: 16 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#0A0E1A', letterSpacing: 1.5 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sheetRowText: { fontSize: 15, color: colors.textPrimary },
});
