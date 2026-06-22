import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, fonts } from '../../constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');

function InputField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  returnKeyType,
  onSubmitEditing,
  rightEl,
  hint,
  hintError,
}: {
  icon: string;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoComplete?: any;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
  rightEl?: React.ReactNode;
  hint?: string;
  hintError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [focused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.1)', 'rgba(0,212,170,0.7)'],
  });

  return (
    <View style={iStyles.wrap}>
      <Text style={iStyles.label}>{label}</Text>
      <Animated.View style={[iStyles.row, { borderColor }]}>
        <Icon name={icon} size={18} color={focused ? colors.primary : colors.textTertiary} />
        <TextInput
          style={iStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightEl}
      </Animated.View>
      {hint ? (
        <Text style={[iStyles.hint, hintError && iStyles.hintError]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const iStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, letterSpacing: 0.6, fontFamily: fonts.bodySemi },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 52,
  },
  input: { flex: 1, fontSize: 16, color: colors.textPrimary, fontFamily: fonts.body, height: 52 },
  hint: { fontSize: 11, color: colors.textSecondary, marginTop: 5, fontFamily: fonts.body },
  hintError: { color: '#F87171' },
});

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, authError, clearAuthError } = useAuthStore();
  const router = useRouter();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 11, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (authError || localError) { clearAuthError(); setLocalError(null); }
  }, [name, email, password, confirmPassword]);

  const displayError = authError || localError;

  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const passwordTooShort = password.length > 0 && password.length < 6;

  const handleRegister = async () => {
    if (!name.trim()) { setLocalError('Please enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { setLocalError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match.'); return; }

    setLoading(true);
    const success = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (success) router.replace('/(auth)/onboarding');
  };

  const isValid = name.trim().length > 0 && email.includes('@') && password.length >= 6 && confirmPassword === password;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(0,212,170,0.14)', 'rgba(0,212,170,0.03)', 'transparent']}
        style={styles.bgGradient}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>

              <TouchableOpacity onPress={() => { clearAuthError(); router.back(); }} style={styles.backBtn} hitSlop={12}>
                <Icon name="chevron-left" size={22} color={colors.primary} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.headingWrap}>
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.sub}>Join thousands of anglers on CAST</Text>
              </View>

              {displayError ? (
                <View style={styles.errorBanner}>
                  <Icon name="alert-circle-outline" size={16} color="#F87171" />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              ) : null}

              <InputField
                icon="account-outline"
                label="FULL NAME"
                value={name}
                onChangeText={setName}
                placeholder="John Fisher"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />

              <InputField
                icon="email-outline"
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />

              <InputField
                icon="lock-outline"
                label="PASSWORD"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
                hint={passwordTooShort ? 'At least 6 characters required' : undefined}
                hintError={passwordTooShort}
                rightEl={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                }
              />

              <InputField
                icon="lock-check-outline"
                label="CONFIRM PASSWORD"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                hint={passwordMismatch ? "Passwords don't match" : undefined}
                hintError={passwordMismatch}
              />

              <TouchableOpacity
                style={[styles.registerBtn, !isValid && styles.registerBtnOff]}
                onPress={handleRegister}
                disabled={loading || !isValid}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={isValid ? ['#00D4AA', '#00B891'] : ['rgba(0,212,170,0.35)', 'rgba(0,184,145,0.35)']}
                  style={styles.registerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#0A0E1A" />
                    : <Text style={styles.registerBtnText}>Create Account</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.terms}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </Text>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => { clearAuthError(); router.push('/(auth)/login'); }}>
                  <Text style={styles.footerLink}>Sign in →</Text>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: SCREEN_H * 0.45 },

  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40 },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 32, alignSelf: 'flex-start' },
  backText: { fontSize: 15, color: colors.primary, fontFamily: fonts.bodySemi },

  headingWrap: { marginBottom: 28 },
  heading: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, fontFamily: fonts.display },
  sub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, fontFamily: fonts.body },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 20,
  },
  errorText: { flex: 1, fontSize: 13, color: '#F87171', fontFamily: fonts.body, lineHeight: 18 },

  registerBtn: { borderRadius: radius.lg, overflow: 'hidden', marginTop: 4, marginBottom: 16 },
  registerBtnOff: { opacity: 0.5 },
  registerGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  registerBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0E1A', letterSpacing: 0.3, fontFamily: fonts.bodyBold },

  terms: { fontSize: 12, color: colors.textTertiary, textAlign: 'center', lineHeight: 18, marginBottom: 28, fontFamily: fonts.body },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body },
  footerLink: { fontSize: 14, color: colors.primary, fontFamily: fonts.bodyBold },
});
