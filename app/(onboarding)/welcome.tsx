import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { colors, fonts, spacing, radius } from '../../constants/theme';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: 'map-marker-multiple' as const, label: '10,000+ Spots' },
  { icon: 'robot' as const, label: 'AI Fish ID' },
  { icon: 'chart-line-variant' as const, label: 'Track & Level Up' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const pillsAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(taglineAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(pillsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(ctaAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  });

  return (
    <LinearGradient
      colors={['#0A0E1A', '#051A10']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          {/* Logo */}
          <Animated.View style={[styles.logoWrap, fadeSlide(logoAnim)]}>
            <Text style={styles.logo}>CAST</Text>
            <View style={styles.logoDot} />
          </Animated.View>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, fadeSlide(taglineAnim)]}>
            The world's finest{'\n'}fishing companion
          </Animated.Text>

          {/* Feature pills */}
          <Animated.View style={[styles.pills, fadeSlide(pillsAnim)]}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.pill}>
                <Icon name={f.icon} size={16} color={colors.primary} />
                <Text style={styles.pillText}>{f.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.cta, fadeSlide(ctaAnim)]}>
            <TouchableOpacity
              onPress={() => router.push('/(onboarding)/username')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#00D4AA', '#00B892']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                <Text style={styles.btnText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(onboarding)/username')}
              style={styles.secondaryBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>I already have an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 72,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: -8,
  },
  tagline: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing.xl,
    opacity: 0.9,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderColor: 'rgba(0,212,170,0.3)',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.primary,
  },
  cta: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: radius.lg,
    minWidth: 240,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#0A0E1A',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
