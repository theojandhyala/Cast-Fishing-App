import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { colors, fonts, spacing, radius } from '../../constants/theme';

// Persisted across screens via module-level var (same nav session)
export let pendingUsername = '';
export let pendingDisplayName = '';
export let pendingBio = '';

export function setPendingUsername(v: string) { pendingUsername = v; }
export function setPendingDisplayName(v: string) { pendingDisplayName = v; }
export function setPendingBio(v: string) { pendingBio = v; }

function validateUsername(u: string): string | null {
  if (u.length < 3) return 'At least 3 characters';
  if (u.length > 20) return 'Max 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Only letters, numbers, underscore';
  return null;
}

export default function UsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [touched, setTouched] = useState(false);

  const usernameError = validateUsername(username);
  const isValid = !usernameError && displayName.trim().length > 0;

  const handleNext = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }
    setPendingUsername(username.trim());
    setPendingDisplayName(displayName.trim());
    setPendingBio(bio.trim());
    router.push('/(onboarding)/avatar');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Icon name="arrow-left" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.step}>Step 1 of 4</Text>
          <Text style={styles.title}>Choose your{'\n'}angler name</Text>
          <Text style={styles.subtitle}>
            This is how other anglers will find and recognise you.
          </Text>

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                touched && usernameError ? styles.inputError : null,
                !usernameError && username.length >= 3 ? styles.inputSuccess : null,
              ]}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setTouched(true);
              }}
              placeholder="e.g. big_catch_99"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            {touched && username.length > 0 && (
              <View style={styles.validationIcon}>
                {usernameError ? (
                  <Icon name="close-circle" size={20} color={colors.danger} />
                ) : (
                  <Icon name="check-circle" size={20} color={colors.success} />
                )}
              </View>
            )}
          </View>
          {touched && usernameError && (
            <Text style={styles.errorText}>{usernameError}</Text>
          )}

          {/* Display name */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your full name (shown publicly)"
            placeholderTextColor={colors.textTertiary}
            maxLength={50}
          />

          {/* Bio */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>
            Bio{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell anglers about yourself..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={150}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/150</Text>

          {/* Next */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={[styles.btn, !isValid && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>Next</Text>
            <Icon name="arrow-right" size={18} color="#0A0E1A" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  back: { marginBottom: spacing.lg },
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
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optional: {
    fontFamily: fonts.body,
    color: colors.textTertiary,
    fontSize: 12,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputSuccess: {
    borderColor: colors.success,
  },
  bioInput: {
    height: 90,
    paddingTop: 14,
  },
  validationIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  charCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#0A0E1A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
