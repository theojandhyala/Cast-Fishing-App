import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { colors, fonts, spacing, radius } from '../../constants/theme';

export let pendingAvatarUri: string | null = null;
export function setPendingAvatarUri(v: string | null) { pendingAvatarUri = v; }

export default function AvatarScreen() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to choose a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    setPendingAvatarUri(avatarUri);
    router.push('/(onboarding)/region');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Icon name="arrow-left" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.step}>Step 2 of 4</Text>
        <Text style={styles.title}>Add a profile photo</Text>
        <Text style={styles.subtitle}>Help other anglers put a face to the name.</Text>

        {/* Avatar preview */}
        <TouchableOpacity onPress={pickFromLibrary} style={styles.avatarWrap} activeOpacity={0.8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="fish" size={48} color={colors.primary} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Icon name="camera" size={16} color="#0A0E1A" />
          </View>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={takePhoto} style={styles.optionBtn} activeOpacity={0.8}>
            <Icon name="camera" size={20} color={colors.primary} />
            <Text style={styles.optionBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickFromLibrary} style={styles.optionBtn} activeOpacity={0.8}>
            <Icon name="image-multiple" size={20} color={colors.primary} />
            <Text style={styles.optionBtnText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        {/* Next */}
        <TouchableOpacity onPress={handleNext} style={styles.btn} activeOpacity={0.85}>
          <Text style={styles.btnText}>{avatarUri ? 'Next' : 'Next'}</Text>
          <Icon name="arrow-right" size={18} color="#0A0E1A" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: 40 },
  back: { marginTop: spacing.md, marginBottom: spacing.lg },
  step: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  btnRow: {
    gap: spacing.md,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
  },
  optionBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textPrimary,
  },
  spacer: { flex: 1 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#0A0E1A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
