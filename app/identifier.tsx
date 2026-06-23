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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFishIdentifier } from '../hooks/useFishIdentifier';
import { colors, radius, spacing, typography, fonts } from '../constants/theme';
import { useCatchStore } from '../store/catchStore';
import { useLocationStore } from '../store/locationStore';
import { useWeather } from '../hooks/useWeather';
import { useSolunar } from '../hooks/useSolunar';
import { useAuthStore } from '../store/authStore';

const HISTORY_KEY = '@cast_fish_id_history';
const SCAN_COUNT_KEY = 'cast_scan_count_month';
const FREE_SCAN_LIMIT = 5;

interface HistoryItem {
  id: string;
  species: string;
  confidence: number;
  date: string;
}

export default function IdentifierScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMediaType, setImageMediaType] = useState('image/jpeg');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recorded, setRecorded] = useState(false);
  const [recordedData, setRecordedData] = useState<{ species: string; weight: string; length: string } | null>(null);
  const { identify, loading, result, error, reset } = useFishIdentifier();
  const { addCatch } = useCatchStore();
  const location = useLocationStore((s) => s.location);
  const { weather } = useWeather(location?.latitude, location?.longitude);
  const solunar = useSolunar(location?.latitude ?? 51.5, location?.longitude ?? -0.1);
  const { user } = useAuthStore();
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => { loadHistory(); loadScanCount(); }, []);
  useEffect(() => {
    if (result) saveToHistory(result);
  }, [result]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  };

  const loadScanCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(SCAN_COUNT_KEY);
      if (stored) {
        const data: { count: number; month: string } = JSON.parse(stored);
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        if (data.month === currentMonth) {
          setScanCount(data.count);
        } else {
          // New month — reset
          setScanCount(0);
          await AsyncStorage.setItem(SCAN_COUNT_KEY, JSON.stringify({ count: 0, month: currentMonth }));
        }
      }
    } catch {}
  };

  const incrementScanCount = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newCount = scanCount + 1;
    setScanCount(newCount);
    try {
      await AsyncStorage.setItem(SCAN_COUNT_KEY, JSON.stringify({ count: newCount, month: currentMonth }));
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
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.55, base64: true, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.55, base64: true, allowsEditing: false });

    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      if (!asset.base64) {
        Alert.alert('Photo unavailable', 'CAST Lens could not read that photo. Please try again.');
        return;
      }

      // Check scan limit for free users
      if (!user?.isPro && scanCount >= FREE_SCAN_LIMIT) {
        Alert.alert(
          'Scan Limit Reached',
          'Free plan includes 5 AI scans per month. Upgrade to Pro for unlimited scanning.',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Upgrade to Pro →', onPress: () => router.push('/pro' as any) },
          ]
        );
        return;
      }

      setImageUri(asset.uri);
      setImageBase64(asset.base64);
      setImageMediaType(asset.mimeType || 'image/jpeg');
      setRecorded(false);
      setRecordedData(null);
      reset();
      await incrementScanCount();
      await identify(asset.base64, asset.mimeType || 'image/jpeg');
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setImageBase64(null);
    setRecorded(false);
    setRecordedData(null);
    reset();
  };

  const parseMidpoint = (str: string): string => {
    const nums = str.match(/\d+\.?\d*/g);
    if (!nums || nums.length === 0) return '';
    if (nums.length === 1) return nums[0];
    const a = parseFloat(nums[0]);
    const b = parseFloat(nums[1]);
    const mid = (a + b) / 2;
    return Number.isInteger(mid) ? mid.toFixed(0) : mid.toFixed(1);
  };

  const handleRecordCatch = () => {
    if (!result) return;
    const weightStr = parseMidpoint(result.estimatedWeight);
    const lengthStr = parseMidpoint(result.estimatedLength);
    const weightNum = weightStr ? parseFloat(weightStr) : undefined;
    const lengthNum = lengthStr ? parseFloat(lengthStr) : undefined;
    const photoUri = imageUri ?? undefined;

    // Map weather pressureTrend ('stable' from API) to store type ('steady')
    let pressureTrend: 'rising' | 'falling' | 'steady' | undefined;
    if (weather?.pressureTrend === 'rising') pressureTrend = 'rising';
    else if (weather?.pressureTrend === 'falling') pressureTrend = 'falling';
    else if (weather?.pressureTrend) pressureTrend = 'steady';

    addCatch({
      species: result.commonName,
      weight: weightNum ?? 0,
      length: lengthNum,
      location: location?.name,
      photo: photoUri,
      pressure: weather?.pressure,
      pressureTrend,
      moonPhase: solunar.moonPhase,
      hourOfDay: new Date().getHours(),
    });

    setRecordedData({ species: result.commonName, weight: weightStr, length: lengthStr });
    setRecorded(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CAST LENS</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Scan frame */}
        {!imageUri ? (
          <TouchableOpacity style={styles.scanFrame} onPress={() => pickImage(true)} activeOpacity={0.85}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <MaterialCommunityIcons name="camera-iris" size={44} color="rgba(0,212,170,0.4)" />
            <Text style={styles.scanPlaceholderTitle}>POINT AT YOUR CATCH</Text>
            <Text style={styles.scanPlaceholderSub}>Best results: whole fish, side-on, good light</Text>
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

        {/* Scan count indicator */}
        <Text style={styles.scanCountText}>
          {user?.isPro
            ? 'Unlimited scans'
            : `${scanCount} / ${FREE_SCAN_LIMIT} scans used this month`}
        </Text>

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
            <Text style={styles.loadingText}>Checking body shape, fins and markings…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondary} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Success state */}
        {recorded && recordedData && (
          <View style={styles.successCard}>
            <Text style={styles.successCardLabel}>CATCH RECORDED</Text>
            <View style={styles.successIconWrap}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#00D4AA" />
            </View>
            <Text style={styles.successTitle}>Catch Recorded!</Text>
            <Text style={styles.successSpecies}>{recordedData.species}</Text>
            <View style={styles.successMeasures}>
              {recordedData.length ? (
                <View style={styles.measureChip}>
                  <Text style={styles.measureChipLabel}>LENGTH</Text>
                  <Text style={styles.measureChipValue}>{recordedData.length} cm</Text>
                </View>
              ) : null}
              {recordedData.weight ? (
                <View style={styles.measureChip}>
                  <Text style={styles.measureChipLabel}>WEIGHT</Text>
                  <Text style={styles.measureChipValue}>{recordedData.weight} kg</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={styles.scanAnotherBtn} onPress={handleReset}>
              <MaterialCommunityIcons name="camera-iris" size={16} color={colors.primary} />
              <Text style={styles.scanAnotherText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result */}
        {result && !recorded && (
          <View style={styles.resultCard}>
            <View style={styles.idTagRow}>
              <MaterialCommunityIcons name="check-decagram" size={12} color={colors.accentBlue} />
              <Text style={styles.idTag}>Identified</Text>
            </View>
            <View style={styles.resultHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultSpecies}>{result.commonName}</Text>
                <Text style={styles.resultLatin}>{result.latinName}</Text>
              </View>
              <View style={styles.matchBadge}>
                <MaterialCommunityIcons name="target" size={11} color={colors.accentBlue} />
                <Text style={styles.matchBadgeText}>{result.confidence}%</Text>
              </View>
            </View>

            <View style={[styles.statusChip, result.legalSize > 0 && result.isLegal ? styles.statusChipLegal : styles.statusChipWarn]}>
              <MaterialCommunityIcons
                name={result.legalSize > 0 && result.isLegal ? 'check-circle-outline' : 'information-outline'}
                size={14}
                color={result.legalSize > 0 && result.isLegal ? colors.primary : colors.secondary}
              />
              <Text style={[styles.statusChipText, { color: result.legalSize > 0 && result.isLegal ? colors.primary : colors.secondary }]}>
                {result.legalSize > 0
                  ? (result.isLegal ? `Legal to keep · min ${result.legalSize}cm` : `Check regulations · min ${result.legalSize}cm`)
                  : 'Check current local regulations before keeping'}
              </Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>LENGTH</Text>
                <Text style={styles.statChipValue}>{result.estimatedLength}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>WEIGHT</Text>
                <Text style={styles.statChipValue}>{result.estimatedWeight}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>MATCH</Text>
                <Text style={[styles.statChipValue, { color: colors.accentBlue }]}>{result.confidence}%</Text>
              </View>
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
              <TouchableOpacity style={styles.scanAgainBtn} onPress={handleReset}>
                <Text style={styles.scanAgainText}>Scan Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recordBtn} onPress={handleRecordCatch}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#031A12" />
                <Text style={styles.recordBtnText}>RECORD CATCH</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* History */}
        {history.length > 0 && !recorded && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.cardLabel}>Recent Identifications</Text>
              <TouchableOpacity onPress={clearHistory}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
            </View>
            {history.map((item, idx) => (
              <View key={item.id} style={[styles.historyItem, idx > 0 && styles.historyDivider]}>
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
  container: { flex: 1, backgroundColor: '#050A12' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  headerTitle: { fontSize: 13, fontWeight: '800', color: colors.primary, letterSpacing: 2 },
  content: { padding: spacing.lg, paddingTop: spacing.sm },

  scanFrame: {
    width: '100%', height: 320,
    backgroundColor: '#020810',
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.15)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative', marginBottom: spacing.md,
  },
  scanPlaceholderTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: 'rgba(0,212,170,0.5)', marginTop: spacing.md },
  scanPlaceholderSub: { ...typography.bodySmall, marginTop: 4, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl },
  scanImage: { width: '100%', height: '100%' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#00D4AA', shadowColor: '#00D4AA', shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 },
  cornerTL: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.sm },
  cornerTR: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.sm },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.sm },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.sm },
  scanBadge: {
    position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(5,10,18,0.88)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
  },
  scanDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  scanBadgeText: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 1.2 },
  removeImage: { position: 'absolute', top: spacing.sm, right: spacing.sm },

  scanCountText: { fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.sm },
  pickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  pickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  pickBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  loadingText: { ...typography.bodySmall },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
    padding: spacing.sm, marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontSize: 12, color: colors.secondary, lineHeight: 17 },

  // Success state
  successCard: {
    backgroundColor: 'rgba(0,212,170,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
    padding: spacing.xl,
    alignItems: 'center', gap: 10,
    marginBottom: spacing.lg,
  },
  successCardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#00D4AA' },
  successIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0,212,170,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
  },
  successTitle: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.3 },
  successSpecies: { fontSize: 16, fontWeight: '700', color: '#00D4AA' },
  successMeasures: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  measureChip: {
    backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center',
  },
  measureChipLabel: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 1.5, marginBottom: 3 },
  measureChipValue: { fontSize: 16, fontWeight: '900', color: colors.textPrimary },
  scanAnotherBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
    paddingHorizontal: 24, paddingVertical: 12,
  },
  scanAnotherText: { fontSize: 14, fontWeight: '700', color: colors.primary },

  // Result card
  resultCard: {
    backgroundColor: '#060E18',
    borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  idTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  idTag: { fontSize: 10, fontWeight: '800', color: colors.accentBlue, letterSpacing: 1.2, textTransform: 'uppercase' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  resultSpecies: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  resultLatin: { fontSize: 13, fontWeight: '500', color: '#00D4AA', marginBottom: spacing.md, fontStyle: 'italic' },
  matchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(45,212,255,0.1)', borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(45,212,255,0.3)',
  },
  matchBadgeText: { fontSize: 11, fontWeight: '800', color: '#2DD4FF' },

  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 10,
    borderWidth: 1, marginBottom: spacing.md,
  },
  statusChipLegal: { backgroundColor: 'rgba(0,212,170,0.08)', borderColor: 'rgba(0,212,170,0.25)' },
  statusChipWarn: { backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' },
  statusChipText: { fontSize: 12, fontFamily: fonts.bodySemi },

  // Stats row
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.1)',
    marginBottom: spacing.md,
  },
  statChip: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statChipLabel: { fontSize: 8, fontWeight: '800', color: colors.textTertiary, letterSpacing: 1.5, marginBottom: 4 },
  statChipValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(0,212,170,0.12)' },

  aboutLabel: { fontSize: 10, fontWeight: '800', color: colors.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  aboutText: { ...typography.bodySmall, lineHeight: 19, marginBottom: spacing.md },
  tipRow: {
    flexDirection: 'row', gap: spacing.sm,
    backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: radius.md,
    padding: spacing.sm, marginBottom: spacing.md, alignItems: 'flex-start',
  },
  tipText: { flex: 1, fontSize: 12, color: colors.secondary, lineHeight: 17 },
  altChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  altChip: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  altChipText: { fontSize: 12, color: colors.textSecondary },

  resultActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  scanAgainBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  scanAgainText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  recordBtn: {
    flex: 1.6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 18, borderRadius: radius.md,
    backgroundColor: '#00D4AA',
  },
  recordBtnText: { fontSize: 14, fontWeight: '900', color: '#031A12', letterSpacing: 2 },

  // History
  historySection: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.12)',
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cardLabel: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase' },
  clearText: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  historyDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  historyIcon: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: 'rgba(0,212,170,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  historySpecies: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyDate: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  historyConfidence: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
