import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFishIdentifier } from '../hooks/useFishIdentifier';
import { CastButton } from '../components/ui/CastButton';
import { colors, radius, spacing, typography, fonts, elevation } from '../constants/theme';

const HISTORY_KEY = '@cast_fish_id_history';

interface HistoryItem {
  id: string;
  species: string;
  confidence: number;
  date: string;
}

export default function IdentifierScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { identify, loading, result, error, reset } = useFishIdentifier();

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => {
    if (result) saveToHistory(result);
  }, [result]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  };

  const saveToHistory = async (r: any) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      species: r.species,
      confidence: r.confidence,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const updated = [item, ...(await getHistory())].slice(0, 5);
    setHistory(updated);
    try { await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
  };

  const getHistory = async (): Promise<HistoryItem[]> => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const clearHistory = async () => {
    Alert.alert('Clear History', 'Remove all recent identifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        setHistory([]);
        try { await AsyncStorage.removeItem(HISTORY_KEY); } catch {}
      }},
    ]);
  };

  const pickImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }

    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });

    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 || null);
      reset();
      await identify(res.assets[0].base64 || '');
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setImageBase64(null);
    reset();
  };

  const parseMidpoint = (str: string): string => {
    const nums = str.match(/\d+\.?\d*/g);
    if (!nums || nums.length === 0) return '';
    if (nums.length === 1) return nums[0];
    const a = parseFloat(nums[0]);
    const b = parseFloat(nums[1]);
    const mid = (a + b) / 2;
    // If both numbers are integers and mid is whole, return no decimals
    return Number.isInteger(mid) ? mid.toFixed(0) : mid.toFixed(1);
  };

  const handleSaveCatch = () => {
    if (!result) return;
    const weight = parseMidpoint(result.estimatedWeight);
    const length = parseMidpoint(result.estimatedLength);
    router.push({ pathname: '/add-catch', params: { species: result.commonName, weight, length } } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fish ID</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Scan frame */}
        {!imageUri ? (
          <TouchableOpacity style={styles.scanFrame} onPress={() => pickImage(true)} activeOpacity={0.85}>
            <MaterialCommunityIcons name="camera-outline" size={44} color={colors.textSecondary} />
            <Text style={styles.scanPlaceholderTitle}>Identify Any Fish</Text>
            <Text style={styles.scanPlaceholderSub}>Snap a photo and AI does the rest</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.scanFrame}>
            <Image source={{ uri: imageUri }} style={styles.scanImage} />
            {loading && (
              <View style={styles.scanBadge}>
                <View style={styles.scanDot} />
                <Text style={styles.scanBadgeText}>AI SCANNING</Text>
              </View>
            )}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {!loading && !result && (
              <TouchableOpacity style={styles.removeImage} onPress={handleReset}>
                <MaterialCommunityIcons name="close-circle" size={26} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {!imageUri && (
          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
              <MaterialCommunityIcons name="camera" size={18} color={colors.primary} />
              <Text style={styles.pickBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
              <MaterialCommunityIcons name="image-outline" size={18} color={colors.primary} />
              <Text style={styles.pickBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Identifying your fish...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="wifi-off" size={16} color={colors.secondary} />
            <Text style={styles.errorText}>AI service unavailable — showing best match from database</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.idTagRow}>
              <MaterialCommunityIcons name="check-decagram" size={12} color={colors.accentBlue} />
              <Text style={styles.idTag}>Identified</Text>
            </View>
            <View style={styles.resultHeader}>
              <Text style={styles.resultSpecies}>{result.commonName}</Text>
              <View style={styles.matchBadge}>
                <MaterialCommunityIcons name="target" size={11} color={colors.accentBlue} />
                <Text style={styles.matchBadgeText}>{result.confidence}% Match</Text>
              </View>
            </View>
            <Text style={styles.resultLatin}>{result.latinName}</Text>

            <View style={[styles.statusChip, result.isLegal ? styles.statusChipLegal : styles.statusChipWarn]}>
              <MaterialCommunityIcons
                name={result.isLegal ? 'check-circle-outline' : 'alert-circle-outline'}
                size={14}
                color={result.isLegal ? colors.primary : colors.secondary}
              />
              <Text style={[styles.statusChipText, { color: result.isLegal ? colors.primary : colors.secondary }]}>
                {result.isLegal ? `Legal to keep · min ${result.legalSize}cm` : `Check regulations · min ${result.legalSize}cm`}
              </Text>
            </View>

            <View style={styles.idRows}>
              <View style={styles.idRow}><Text style={styles.idRowLabel}>Length</Text><Text style={styles.idRowValue}>{result.estimatedLength}</Text></View>
              <View style={styles.idRow}><Text style={styles.idRowLabel}>Weight</Text><Text style={styles.idRowValue}>{result.estimatedWeight}</Text></View>
              <View style={styles.idRow}><Text style={styles.idRowLabel}>Legal Size</Text><Text style={styles.idRowValue}>{result.legalSize}cm</Text></View>
            </View>

            <Text style={styles.aboutLabel}>About</Text>
            <Text style={styles.aboutText}>{result.notes}</Text>

            <View style={styles.tipRow}>
              <MaterialCommunityIcons name="lightbulb-outline" size={14} color={colors.secondary} />
              <Text style={styles.tipText}>{result.tips}</Text>
            </View>

            {result.alternatives.length > 0 && (
              <View style={styles.altChips}>
                {result.alternatives.map((alt) => (
                  <View key={alt} style={styles.altChip}><Text style={styles.altChipText}>{alt}</Text></View>
                ))}
              </View>
            )}

            <View style={styles.resultActions}>
              <CastButton title="Scan Again" onPress={handleReset} variant="ghost" style={{ flex: 1 }} />
              <CastButton title="Log as Catch →" onPress={handleSaveCatch} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.cardLabel}>Recent Identifications</Text>
              <TouchableOpacity onPress={clearHistory}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
            </View>
            {history.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyIcon}><MaterialCommunityIcons name="fish" size={16} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historySpecies}>{item.species}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyConfidence}>{item.confidence}%</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  headerTitle: { ...typography.label, fontSize: 15 },
  content: { padding: spacing.lg, paddingTop: spacing.sm },

  scanFrame: {
    height: 280, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative', marginBottom: spacing.md,
    ...elevation.card,
  },
  scanPlaceholderTitle: { ...typography.h3, marginTop: spacing.md },
  scanPlaceholderSub: { ...typography.bodySmall, marginTop: 4 },
  scanImage: { width: '100%', height: '100%' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.accentBlue },
  cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.sm },
  cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.sm, borderColor: colors.primary },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.sm, borderColor: colors.primary },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.sm },
  scanBadge: {
    position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(10,14,26,0.85)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.borderStrong,
  },
  scanDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  scanBadgeText: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  removeImage: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  pickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  pickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong,
  },
  pickBtnText: { ...typography.label, color: colors.primary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  loadingText: { ...typography.bodySmall },

  resultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...elevation.card },
  idTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  idTag: { ...typography.caption, color: colors.accentBlue },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultSpecies: { ...typography.h2, fontSize: 24 },
  resultLatin: { ...typography.bodySmall, fontStyle: 'italic', marginTop: 2, marginBottom: spacing.md },
  matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(45,212,255,0.12)', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(45,212,255,0.3)' },
  matchBadgeText: { fontSize: 11, fontWeight: '800', color: colors.accentBlue },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 10,
    borderWidth: 1, marginBottom: spacing.md,
  },
  statusChipLegal: { backgroundColor: 'rgba(0,212,170,0.08)', borderColor: 'rgba(0,212,170,0.25)' },
  statusChipWarn: { backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' },
  statusChipText: { fontSize: 12, fontFamily: fonts.bodySemi },
  idRows: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginBottom: spacing.md },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  idRowLabel: { fontSize: 13, color: colors.textSecondary },
  idRowValue: { ...typography.mono, fontSize: 13 },
  aboutLabel: { ...typography.caption, marginBottom: 4 },
  aboutText: { ...typography.bodySmall, lineHeight: 19, marginBottom: spacing.md },
  tipRow: { flexDirection: 'row', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 12, color: colors.secondary, lineHeight: 17 },
  altChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  altChip: { backgroundColor: colors.surface2, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  altChipText: { fontSize: 12, color: colors.textSecondary },
  resultActions: { flexDirection: 'row', gap: spacing.sm },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
    padding: spacing.sm, marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontSize: 12, color: colors.secondary, lineHeight: 17 },

  historySection: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...elevation.raised },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  cardLabel: { ...typography.caption },
  clearText: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  historyIcon: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center' },
  historySpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyDate: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  historyConfidence: { ...typography.mono, fontSize: 13, color: colors.primary },
});
