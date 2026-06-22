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
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  hasError,
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
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
      hasError ? 'rgba(239,68,68,0.8)' : 'rgba(0,212,170,0.7)',
    ],
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
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    height: 52,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, authError, clearAuthError } = useAuthStore();
  const router = useRouter();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { if (authError) clearAuthError(); }, [email, password]);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);
    if (success) router.replace('/(tabs)');
  };

  const handleGuest = async () => {
    const guestEmail = 'guest@castapp.local';
    const guestPass = 'guest_pass_cast';
    await register('Guest Angler', guestEmail, guestPass);
    clearAuthError();
    const ok = await login(guestEmail, guestPass);
    if (ok) router.replace('/(tabs)');
  };

  const isValid = email.trim().length > 0 && password.length > 0;

  return (
    <View style={styles.root}>
      {/* Atmospheric background */}
      <LinearGradient
        colors={['rgba(0,212,170,0.18)', 'rgba(0,212,170,0.04)', 'transparent']}
        style={styles.bgGradient}
      />
      <View style={styles.bgOrb} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.inner, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

              {/* Brand */}
              <View style={styles.brand}>
                <View style={styles.logoWrap}>
                  <View style={styles.logoGlow} />
                  <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.appName}>CAST</Text>
                <Text style={styles.tagline}>Your Premium Fishing Companion</Text>
              </View>

              {/* Heading */}
              <View style={styles.headingWrap}>
                <Text style={styles.heading}>Welcome back</Text>
                <Text style={styles.sub}>Sign in to continue fishing</Text>
              </View>

              {/* Error */}
              {authError ? (
                <View style={styles.errorBanner}>
                  <Icon name="alert-circle-outline" size={16} color="#F87171" />
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              {/* Inputs */}
              <InputField
                icon="email-outline"
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="angler@example.com"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
                hasError={!!authError}
              />

              <InputField
                icon="lock-outline"
                label="PASSWORD"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                hasError={!!authError}
                rightEl={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity style={styles.forgotRow} hitSlop={8}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Sign In */}
              <TouchableOpacity
                style={[styles.signInBtn, !isValid && styles.signInBtnOff]}
                onPress={handleLogin}
                disabled={loading || !isValid}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={isValid ? ['#00D4AA', '#00B891'] : ['rgba(0,212,170,0.35)', 'rgba(0,184,145,0.35)']}
                  style={styles.signInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#0A0E1A" />
                    : <Text style={styles.signInText}>Sign In</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>or</Text>
                <View style={styles.divLine} />
              </View>

              {/* Guest */}
              <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} activeOpacity={0.75}>
                <Icon name="account-outline" size={17} color={colors.textSecondary} />
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>No account? </Text>
                <TouchableOpacity onPress={() => { clearAuthError(); router.push('/(auth)/register'); }}>
                  <Text style={styles.footerLink}>Sign up free →</Text>
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

  bgGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: SCREEN_H * 0.55,
  },
  bgOrb: {
    position: 'absolute',
    top: -120,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(0,212,170,0.06)',
  },

  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },
  inner: { flex: 1 },

  brand: { alignItems: 'center', marginBottom: 40, marginTop: 16 },
  logoWrap: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,212,170,0.12)',
  },
  logo: { width: 70, height: 70 },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 10,
    fontFamily: fonts.display,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.3,
    fontFamily: fonts.body,
  },

  headingWrap: { marginBottom: 28 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, fontFamily: fonts.display },
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

  forgotRow: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 28 },
  forgotText: { fontSize: 13, color: colors.primary, fontFamily: fonts.bodySemi },

  signInBtn: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: 20 },
  signInBtnOff: { opacity: 0.5 },
  signInGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  signInText: { fontSize: 16, fontWeight: '700', color: '#0A0E1A', letterSpacing: 0.3, fontFamily: fonts.bodyBold },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  divText: { fontSize: 12, color: colors.textTertiary, fontFamily: fonts.body },

  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    height: 50,
    marginBottom: 32,
  },
  guestText: { fontSize: 15, color: colors.textSecondary, fontFamily: fonts.bodySemi },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body },
  footerLink: { fontSize: 14, color: colors.primary, fontFamily: fonts.bodyBold },
});
