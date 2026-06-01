import React, { useState, useRef } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFishIdentifier } from '../hooks/useFishIdentifier';
import { CastButton } from '../components/ui/CastButton';
import { colors, radius, spacing } from '../constants/theme';

export default function IdentifierScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const { identify, loading, result, error, reset } = useFishIdentifier();

  const pickImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }

    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });

    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 || null);
      reset();
    }
  };

  const handleIdentify = async () => {
    if (!imageBase64) {
      Alert.alert('No image', 'Please take or select a photo first');
      return;
    }
    await identify(imageBase64);
  };

  const handleReset = () => {
    setImageUri(null);
    setImageBase64(null);
    reset();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(245,158,11,0.12)', 'transparent']}
        style={styles.hero}
      >
        <MaterialCommunityIcons name="camera-iris" size={48} color={colors.secondary} />
        <Text style={styles.heroTitle}>Fish Identifier</Text>
        <Text style={styles.heroSubtitle}>
          Take or upload a photo of any fish and our AI will identify it instantly
        </Text>
      </LinearGradient>

      {/* Image area */}
      {!imageUri ? (
        <View style={styles.imagePlaceholder}>
          <View style={styles.imagePlaceholderInner}>
            <MaterialCommunityIcons name="image-area" size={48} color={colors.textSecondary} />
            <Text style={styles.placeholderText}>No image selected</Text>
            <Text style={styles.placeholderSubtext}>Take a photo or upload from gallery</Text>
          </View>
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {!loading && !result && (
            <TouchableOpacity style={styles.removeImage} onPress={handleReset}>
              <MaterialCommunityIcons name="close-circle" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!result && !loading && (
          <>
            <View style={styles.pickButtons}>
              <CastButton
                title="Camera"
                onPress={() => pickImage(true)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <CastButton
                title="Gallery"
                onPress={() => pickImage(false)}
                variant="ghost"
                style={{ flex: 1 }}
              />
            </View>
            {imageUri && (
              <CastButton
                title="Identify Fish"
                onPress={handleIdentify}
                loading={loading}
                fullWidth
                size="lg"
                style={{ marginTop: spacing.sm }}
              />
            )}
          </>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Identifying your fish...</Text>
            <Text style={styles.loadingSubtext}>This takes a few seconds</Text>
          </View>
        )}
      </View>

      {/* Result */}
      {result && (
        <View style={styles.result}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultSpecies}>{result.species}</Text>
              <Text style={styles.resultLatin}>{result.latinName}</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{result.confidence}%</Text>
              <Text style={styles.confidenceLabel}>match</Text>
            </View>
          </View>

          <View style={styles.resultStats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.legalSize}cm</Text>
              <Text style={styles.statLabel}>Legal Size</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.estimatedWeight}</Text>
              <Text style={styles.statLabel}>Est. Weight</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.estimatedLength}</Text>
              <Text style={styles.statLabel}>Est. Length</Text>
            </View>
            <View style={[styles.statBox, { borderColor: result.isLegal ? colors.success + '44' : colors.danger + '44' }]}>
              <Text style={[styles.statValue, { color: result.isLegal ? colors.success : colors.danger }]}>
                {result.isLegal ? '✓' : '✗'}
              </Text>
              <Text style={styles.statLabel}>Legal</Text>
            </View>
          </View>

          <View style={styles.resultNotes}>
            <Text style={styles.notesTitle}>Identification Notes</Text>
            <Text style={styles.notesText}>{result.notes}</Text>
          </View>

          <View style={styles.resultTip}>
            <MaterialCommunityIcons name="lightbulb" size={14} color={colors.secondary} />
            <Text style={styles.tipText}>{result.tips}</Text>
          </View>

          {result.alternatives.length > 0 && (
            <View style={styles.alternatives}>
              <Text style={styles.altTitle}>Could also be:</Text>
              <View style={styles.altChips}>
                {result.alternatives.map((alt) => (
                  <View key={alt} style={styles.altChip}>
                    <Text style={styles.altChipText}>{alt}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <CastButton
            title="Identify Another Fish"
            onPress={handleReset}
            variant="ghost"
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  imagePlaceholder: {
    marginHorizontal: spacing.lg,
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  imagePlaceholderInner: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  imageContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: radius.xl,
  },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  pickButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  result: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  resultSpecies: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  resultLatin: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 3,
  },
  confidenceBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  confidenceText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  confidenceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  resultStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  resultNotes: {
    marginBottom: spacing.md,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  resultTip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  alternatives: {
    marginBottom: spacing.sm,
  },
  altTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  altChips: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  altChip: {
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  altChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
