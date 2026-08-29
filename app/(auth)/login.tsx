import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Platform,
  KeyboardAvoidingView, ScrollView, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { CastLogo } from '../../components/ui/CastLogo';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing } from '../../constants/theme';
import { LEGAL_LINKS } from '../../constants/purchases';
import * as Social from '../../services/socialAuth';

const CARD_LINE = 'rgba(255,255,255,0.08)';

export default function WelcomeScreen() {
  const router = useRouter();
  const { login, register, continueAsGuest, signInWithProvider } = useAuthStore();

  const [mode, setMode] = useState<'welcome' | 'email'>('welcome');
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [showApple, setShowApple] = useState(false);

  // Entrance animation — keeps the app feeling alive.
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(rise, { toValue: 0, damping: 15, stiffness: 120, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
    void Social.appleAvailable().then(setShowApple);
  }, []);

  const enter = () => router.replace('/(tabs)');

  const social = async (provider: 'apple' | 'google') => {
    setBusy(provider);
    try {
      const res = provider === 'apple' ? await Social.signInWithApple() : await Social.signInWithGoogle();
      if (!res.ok) {
        if (!res.cancelled && res.error) Alert.alert('Could not sign in', res.error);
        return;
      }
      const ok = await signInWithProvider(provider, res.idToken, res.name);
      if (ok) enter();
      else Alert.alert('Could not sign in', useAuthStore.getState().authError || 'Please try again.');
    } finally { setBusy(null); }
  };

  const emailSubmit = async () => {
    if (!email.trim() || !password) { Alert.alert('Almost there', 'Enter your email and a password.'); return; }
    setBusy('email');
    try {
      const ok = isNew
        ? await register((name.trim() || 'Angler'), email.trim(), password)
        : await login(email.trim(), password);
      if (ok) enter();
      else Alert.alert(isNew ? 'Could not create account' : 'Could not sign in',
        useAuthStore.getState().authError || 'Please check your details.');
    } finally { setBusy(null); }
  };

  const guest = async () => { setBusy('guest'); await continueAsGuest(); setBusy(null); enter(); };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }] }}>

            <View style={s.hero}>
              <CastLogo size="lg" showWordmark />
              <Text style={s.tagline}>Find the water. Read the day. Log the catch.</Text>
            </View>

            {mode === 'welcome' ? (
              <View style={s.actions}>
                {showApple && (
                  <TouchableOpacity style={[s.btn, s.apple]} onPress={() => social('apple')} activeOpacity={0.85} disabled={!!busy}>
                    {busy === 'apple' ? <ActivityIndicator color="#000" /> : (
                      <><MaterialCommunityIcons name="apple" size={20} color="#000" /><Text style={s.appleText}>Continue with Apple</Text></>
                    )}
                  </TouchableOpacity>
                )}

                {Social.googleAvailable() && (
                  <TouchableOpacity style={[s.btn, s.google]} onPress={() => social('google')} activeOpacity={0.85} disabled={!!busy}>
                    {busy === 'google' ? <ActivityIndicator color="#000" /> : (
                      <><MaterialCommunityIcons name="google" size={19} color="#1F1F1F" /><Text style={s.googleText}>Continue with Google</Text></>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[s.btn, s.email]} onPress={() => setMode('email')} activeOpacity={0.85} disabled={!!busy}>
                  <MaterialCommunityIcons name="email-outline" size={19} color={colors.primary} />
                  <Text style={s.emailText}>Continue with email</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.guestBtn} onPress={guest} activeOpacity={0.7} disabled={!!busy}>
                  {busy === 'guest'
                    ? <ActivityIndicator color={colors.textSecondary} />
                    : <Text style={s.guestText}>Just look around</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.form}>
                <View style={s.switchRow}>
                  <TouchableOpacity onPress={() => setIsNew(false)} style={[s.switchTab, !isNew && s.switchTabActive]}>
                    <Text style={[s.switchText, !isNew && s.switchTextActive]}>Sign in</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsNew(true)} style={[s.switchTab, isNew && s.switchTabActive]}>
                    <Text style={[s.switchText, isNew && s.switchTextActive]}>Create account</Text>
                  </TouchableOpacity>
                </View>

                {isNew && (
                  <TextInput style={s.input} placeholder="Your name" placeholderTextColor={colors.textTertiary}
                    value={name} onChangeText={setName} autoCapitalize="words" />
                )}
                <TextInput style={s.input} placeholder="Email" placeholderTextColor={colors.textTertiary}
                  value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
                <TextInput style={s.input} placeholder="Password" placeholderTextColor={colors.textTertiary}
                  value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />

                <TouchableOpacity style={s.primaryBtn} onPress={emailSubmit} activeOpacity={0.88} disabled={!!busy}>
                  <LinearGradient colors={['#00E9BC', '#00B78F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.primaryGrad}>
                    {busy === 'email'
                      ? <ActivityIndicator color={colors.bg} />
                      : <Text style={s.primaryText}>{isNew ? 'Create account' : 'Sign in'}</Text>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode('welcome')} style={s.backBtn} activeOpacity={0.7}>
                  <Text style={s.backText}>← Other ways to sign in</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={s.legal}>
              By continuing you agree to our{' '}
              <Text style={s.legalLink} onPress={() => Linking.openURL(LEGAL_LINKS.terms)}>Terms</Text>
              {' '}and{' '}
              <Text style={s.legalLink} onPress={() => Linking.openURL(LEGAL_LINKS.privacy)}>Privacy Policy</Text>.
            </Text>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },

  hero: { alignItems: 'center', marginBottom: 40 },
  tagline: { marginTop: 14, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },

  actions: { gap: 12 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 54, borderRadius: radius.lg,
  },
  apple: { backgroundColor: '#FFFFFF' },
  appleText: { color: '#000', fontSize: 16, fontWeight: '600' },
  google: { backgroundColor: '#FFFFFF' },
  googleText: { color: '#1F1F1F', fontSize: 16, fontWeight: '600' },
  email: { backgroundColor: colors.surface, borderWidth: 1, borderColor: CARD_LINE },
  emailText: { color: colors.primary, fontSize: 16, fontWeight: '600' },

  guestBtn: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  guestText: { color: colors.textSecondary, fontSize: 15, fontWeight: '500', textDecorationLine: 'underline' },

  form: { gap: 12 },
  switchRow: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full,
    padding: 4, borderWidth: 1, borderColor: CARD_LINE, marginBottom: 4,
  },
  switchTab: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  switchTabActive: { backgroundColor: colors.primary },
  switchText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  switchTextActive: { color: colors.bg, fontWeight: '700' },

  input: {
    height: 54, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: CARD_LINE, paddingHorizontal: 16,
    fontSize: 16, color: colors.textPrimary,
  },
  primaryBtn: {
    borderRadius: radius.lg, overflow: 'hidden', marginTop: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
  },
  primaryGrad: { height: 54, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.bg, fontSize: 16, fontWeight: '700' },
  backBtn: { alignSelf: 'center', paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  backText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },

  legal: { marginTop: 28, fontSize: 12, lineHeight: 18, color: colors.textTertiary, textAlign: 'center' },
  legalLink: { color: colors.textSecondary, textDecorationLine: 'underline' },
});
