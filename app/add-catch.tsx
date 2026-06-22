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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useLocationStore } from '../store/locationStore';
import { useWeather } from '../hooks/useWeather';
import { useTides } from '../hooks/useTides';
import { useSolunar } from '../hooks/useSolunar';
import { species as SPECIES_LIST } from '../data/species';
import { colors, radius, spacing, elevation, fonts, typography } from '../constants/theme';

const SPECIES_OPTIONS = SPECIES_LIST.map((s) => ({ id: s.id, name: s.name || s.commonName }));

const BAIT_OPTIONS = [
  'Boilies', 'Sweetcorn', 'Maggots', 'Worms', 'Deadbait (Mackerel)', 'Deadbait (Roach)',
  'Lure (Soft Plastic)', 'Lure (Hard)', 'Spinner', 'Spinnerbait', 'Fly (Dry)', 'Fly (Nymph)',
  'Pellets', 'Hemp', 'Bread', 'Cheese Paste', 'Feeder Mix', 'Zig Rig', 'Pop-up', 'Tiger Nuts',
];

function ConditionPill({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={s.condPill}>
      <MaterialCommunityIcons name={icon} size={13} color={colors.primary} />
      <View>
        <Text style={s.condPillLabel}>{label}</Text>
        <Text style={s.condPillValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function AddCatchScreen() {
  const params = useLocalSearchParams<{
    species?: string;
    weight?: string;
    length?: string;
    scanned?: string;
  }>();
  const router = useRouter();
  const { addCatch } = useCatchStore();
  const { location } = useLocationStore();

  // Coordinates for live condition hooks
  const locWithCoords = location as (typeof location & { coords?: { latitude: number; longitude: number } }) | null;
  const lat = locWithCoords?.coords?.latitude;
  const lng = locWithCoords?.coords?.longitude;

  // Live conditions — auto-captured at logging time
  const { weather } = useWeather(lat, lng);
  const tideData = useTides(lat, lng);
  const solunar = useSolunar(lat ?? 52.5, lng ?? -1.5);

  const prefill = params.species
    ? SPECIES_OPTIONS.find((s) => s.name.toLowerCase() === params.species!.toLowerCase())
    : null;

  const [selectedSpecies, setSelectedSpecies] = useState(prefill?.name || '');
  const [weight, setWeight] = useState(params.weight || '');
  const [length, setLength] = useState(params.length || '');
  const [bait, setBait] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [speciesPicker, setSpeciesPicker] = useState(false);
  const [baitPicker, setBaitPicker] = useState(false);
  const [baitSearch, setBaitSearch] = useState('');

  useEffect(() => {
    if (params.scanned !== '1') return;
    let active = true;
    AsyncStorage.getItem('@cast_pending_scan_photo')
      .then((pendingPhoto) => {
        if (active && pendingPhoto) setPhotoUri(pendingPhoto);
        return AsyncStorage.removeItem('@cast_pending_scan_photo');
      })
      .catch(() => {});
    return () => { active = false; };
  }, [params.scanned]);

  const spotName = location?.name || 'Current Location';
  const now = new Date();
  const timeStr = `Today, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const handlePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to add a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!selectedSpecies) { Alert.alert('Select a species', 'Please choose the species you caught.'); return; }
    addCatch({
      species: selectedSpecies,
      weight: parseFloat(weight) || 0,
      length: parseFloat(length) || undefined,
      location: spotName,
      latitude: lat,
      longitude: lng,
      bait: bait || undefined,
      notes: notes || undefined,
      photo: photoUri || undefined,
      // Auto-captured conditions
      weather: weather
        ? { temp: weather.temp, description: weather.description, wind: weather.wind }
        : undefined,
      pressure: weather?.pressure,
      pressureTrend: weather?.pressureTrend === 'stable' ? 'steady' : weather?.pressureTrend,
      tideHeight: tideData?.loading ? undefined : tideData?.currentHeight,
      moonPhase: solunar?.moonPhase,
      hourOfDay: now.getHours(),
    });
    router.back();
  };

  const filteredBaits = baitSearch
    ? BAIT_OPTIONS.filter((b) => b.toLowerCase().includes(baitSearch.toLowerCase()))
    : BAIT_OPTIONS;

  // Format tide trend label
  const trendLabel = tideData?.trend === 'rising' ? '▲ Rising' : tideData?.trend === 'falling' ? '▼ Falling' : '~ Slack';

  const moonPct = solunar ? Math.round(solunar.moonIllumination) : null;

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
            style={s.scanCatchCta}
            onPress={() => router.push({ pathname: '/identifier', params: { mode: 'catch' } } as any)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Scan fish to autofill catch details"
          >
            <View style={s.scanCatchIcon}>
              <MaterialCommunityIcons name="line-scan" size={24} color={colors.background} />
            </View>
            <View style={s.scanCatchCopy}>
              <Text style={s.scanCatchTitle}>Scan to autofill</Text>
              <Text style={s.scanCatchSub}>Species, estimated size, weight and photo</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
          </TouchableOpacity>

          {/* Photo upload */}
          <View style={s.photoWrap}>
            <TouchableOpacity
              style={[s.photoBox, photoUri ? s.photoBoxFilled : null]}
              onPress={handleCamera}
              activeOpacity={0.85}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={s.photoImage} />
              ) : (
                <>
                  <View style={s.photoIcon}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={32} color={colors.primary} />
                  </View>
                  <Text style={s.photoLabel}>Add Photo</Text>
                  <Text style={s.photoSub}>Camera or Gallery</Text>
                </>
              )}
            </TouchableOpacity>
            {!photoUri && (
              <TouchableOpacity style={s.galleryBtn} onPress={handlePhoto}>
                <MaterialCommunityIcons name="image-outline" size={18} color={colors.textSecondary} />
                <Text style={s.galleryBtnText}>Gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Auto-captured conditions banner */}
          <View style={s.condBanner}>
            <View style={s.condBannerHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.primary} />
              <Text style={s.condBannerTitle}>Auto-Captured Conditions</Text>
            </View>
            <View style={s.condPills}>
              {weather && (
                <>
                  <ConditionPill
                    icon="thermometer"
                    label="Temp"
                    value={`${weather.temp}°C`}
                  />
                  <ConditionPill
                    icon="gauge"
                    label="Pressure"
                    value={`${weather.pressure} ${weather.pressureTrend === 'rising' ? '↑' : weather.pressureTrend === 'falling' ? '↓' : '→'}`}
                  />
                  <ConditionPill
                    icon="weather-windy"
                    label="Wind"
                    value={`${weather.wind} km/h`}
                  />
                </>
              )}
              {!tideData.loading && (
                <ConditionPill
                  icon="waves"
                  label="Tide"
                  value={`${tideData.currentHeight.toFixed(1)}m ${trendLabel}`}
                />
              )}
              {solunar && moonPct !== null && (
                <ConditionPill
                  icon="moon-waning-crescent"
                  label="Moon"
                  value={`${solunar.moonPhaseName} ${moonPct}%`}
                />
              )}
              {!weather && !solunar && (
                <Text style={s.condNone}>Conditions will be captured when you save</Text>
              )}
            </View>
          </View>

          {/* Form */}
          <View style={s.form}>
            {/* Species */}
            <TouchableOpacity style={s.formRow} onPress={() => setSpeciesPicker(true)} activeOpacity={0.85}>
              <View style={s.formLabelRow}>
                <MaterialCommunityIcons name="fish" size={16} color={colors.primary} />
                <Text style={s.formLabel}>Species</Text>
              </View>
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
                <View style={s.formLabelRow}>
                  <MaterialCommunityIcons name="scale-balance" size={14} color={colors.primary} />
                  <Text style={s.formLabel}>Weight</Text>
                </View>
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
                <View style={s.formLabelRow}>
                  <MaterialCommunityIcons name="ruler" size={14} color={colors.primary} />
                  <Text style={s.formLabel}>Length</Text>
                </View>
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
              <View style={s.formLabelRow}>
                <MaterialCommunityIcons name="hook" size={16} color={colors.primary} />
                <Text style={s.formLabel}>Bait / Lure</Text>
              </View>
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
              <View style={s.formLabelRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                <Text style={s.formLabel}>Location</Text>
              </View>
              <Text style={s.formValue}>{spotName}</Text>
            </View>
            <View style={s.sep} />

            {/* Time */}
            <View style={s.formRow}>
              <View style={s.formLabelRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                <Text style={s.formLabel}>Time Caught</Text>
              </View>
              <Text style={s.formValue}>{timeStr}</Text>
            </View>
            <View style={s.sep} />

            {/* Notes */}
            <View style={s.notesRow}>
              <View style={[s.formLabelRow, { marginBottom: 8 }]}>
                <MaterialCommunityIcons name="note-text-outline" size={16} color={colors.primary} />
                <Text style={s.formLabel}>Notes</Text>
              </View>
              <TextInput
                style={s.notesInput}
                placeholder="Rig setup, spot details, story..."
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
            <MaterialCommunityIcons name="content-save-check" size={18} color="#0A0E1A" />
            <Text style={s.saveBtnText}>SAVE CATCH</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Species picker modal */}
      <Modal visible={speciesPicker} transparent animationType="slide" onRequestClose={() => setSpeciesPicker(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setSpeciesPicker(false)} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Select Species</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {SPECIES_OPTIONS.map((sp) => (
              <TouchableOpacity
                key={sp.id}
                style={s.sheetRow}
                onPress={() => { setSelectedSpecies(sp.name); setSpeciesPicker(false); }}
              >
                <Text style={s.sheetRowText}>{sp.name}</Text>
                {selectedSpecies === sp.name && <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Bait picker modal */}
      <Modal visible={baitPicker} transparent animationType="slide" onRequestClose={() => setBaitPicker(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setBaitPicker(false)} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Select Bait / Lure</Text>
          <View style={s.searchRow}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
            <TextInput
              style={s.searchInput}
              placeholder="Search baits..."
              placeholderTextColor={colors.textTertiary}
              value={baitSearch}
              onChangeText={setBaitSearch}
            />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
            {filteredBaits.map((b) => (
              <TouchableOpacity key={b} style={s.sheetRow} onPress={() => { setBait(b); setBaitPicker(false); setBaitSearch(''); }}>
                <Text style={s.sheetRowText}>{b}</Text>
                {bait === b && <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />}
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
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.bodyBold },

  scanCatchCta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    padding: spacing.md, borderRadius: radius.md,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.35)',
  },
  scanCatchIcon: {
    width: 42, height: 42, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
  },
  scanCatchCopy: { flex: 1 },
  scanCatchTitle: { fontSize: 15, color: colors.textPrimary, fontFamily: fonts.bodyBold },
  scanCatchSub: { marginTop: 2, fontSize: 12, color: colors.textSecondary, fontFamily: fonts.body },

  photoWrap: { margin: spacing.lg, marginBottom: spacing.md },
  photoBox: {
    height: 160, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    overflow: 'hidden',
  },
  photoBoxFilled: { borderStyle: 'solid', borderColor: 'transparent' },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoIcon: {
    width: 60, height: 60, borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.bodyBold },
  photoSub: { fontSize: 12, color: colors.textSecondary },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: spacing.sm, paddingVertical: spacing.xs,
  },
  galleryBtnText: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.bodySemi },

  condBanner: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: 'rgba(0,212,170,0.06)',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    borderRadius: radius.md, padding: spacing.md,
  },
  condBannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  condBannerTitle: { fontSize: 12, fontWeight: '600', color: colors.primary, letterSpacing: 0.5, fontFamily: fonts.bodySemi },
  condPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  condPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface2, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  condPillLabel: { fontSize: 9, color: colors.textTertiary, fontFamily: fonts.bodySemi, letterSpacing: 0.5 },
  condPillValue: { fontSize: 12, color: colors.textPrimary, fontFamily: fonts.mono, marginTop: 1 },
  condNone: { fontSize: 12, color: colors.textTertiary },

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
  formLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  formRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', fontFamily: fonts.bodySemi },
  formValue: { fontSize: 14, color: colors.textSecondary },
  placeholder: { color: colors.textTertiary },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },

  formRowInline: { flexDirection: 'row', alignItems: 'center' },
  inlineLeft: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14 },
  inlineRight: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14 },
  inlineDivider: { width: 1, height: 48, backgroundColor: colors.border },
  inlineInput: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  inlineText: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.monoBold },
  unit: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.mono },

  notesRow: { paddingHorizontal: spacing.md, paddingTop: 14, paddingBottom: 14 },
  notesInput: { fontSize: 14, color: colors.textPrimary, marginTop: 4, minHeight: 64, fontFamily: fonts.body },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: 32,
  },
  saveBtn: { borderRadius: radius.full, overflow: 'hidden', ...elevation.glow },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#0A0E1A', letterSpacing: 1.5, fontFamily: fonts.bodyBold },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, paddingBottom: 48,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, fontFamily: fonts.display },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sheetRowText: { fontSize: 15, color: colors.textPrimary, fontFamily: fonts.body },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface2, borderRadius: radius.md,
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, height: 40, fontSize: 15, color: colors.textPrimary, fontFamily: fonts.body },
});
