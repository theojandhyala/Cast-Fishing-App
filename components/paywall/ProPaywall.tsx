import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, elevation } from '../../constants/theme';

const PRO_BENEFITS = [
  {
    icon: 'robot' as const,
    title: 'Unlimited AI Fishing Advisor',
    subtitle: 'Ask unlimited questions, get expert advice 24/7',
  },
  {
    icon: 'camera' as const,
    title: 'Unlimited Fish ID Scans',
    subtitle: 'Identify any fish instantly, no limits',
  },
  {
    icon: 'map-marker-multiple' as const,
    title: '2,000+ Worldwide Spots',
    subtitle: 'Every spot unlocked, with offline access',
  },
  {
    icon: 'chart-line' as const,
    title: 'Advanced Catch Analytics',
    subtitle: 'Trends, heatmaps, species breakdown over time',
  },
  {
    icon: 'bell-ring' as const,
    title: 'Smart Bite Alerts',
    subtitle: 'Get notified when conditions peak for your target species',
  },
  {
    icon: 'cloud-sync' as const,
    title: 'Cloud Backup & Sync',
    subtitle: 'Your catches safe forever, sync across devices',
  },
  {
    icon: 'weather-lightning' as const,
    title: 'Pro Weather Dashboard',
    subtitle: 'Hour-by-hour fishing forecasts, pressure trends',
  },
  {
    icon: 'trophy' as const,
    title: 'Pro Leaderboards',
    subtitle: 'Compete in Pro-only weekly challenges',
  },
  {
    icon: 'crown' as const,
    title: 'Pro Profile Badge',
    subtitle: 'Gold ring, Pro badge, exclusive avatar frames',
  },
  {
    icon: 'cancel' as const,
    title: 'Ad-Free Experience',
    subtitle: 'Clean, distraction-free fishing companion',
  },
];

interface ProPaywallProps {
  onClose?: () => void;
}

export function ProPaywall({ onClose }: ProPaywallProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    Alert.alert(
      'Pro Activated!',
      'Welcome to CAST Pro! Enjoy all premium features.',
      [{ text: "Let's Go!", onPress: onClose }]
    );
  };

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Hero ── */}
      <LinearGradient colors={['#0A1628', '#0D2416']} style={s.hero}>
        <View style={s.crownCircle}>
          <MaterialCommunityIcons name="crown" size={40} color="#F59E0B" />
        </View>
        <Text style={s.heroTitle}>CAST Pro</Text>
        <Text style={s.heroTagline}>Fish smarter. Catch more. Every session.</Text>
      </LinearGradient>

      {/* ── Usage nudge banner ── */}
      <View style={s.nudgeBanner}>
        <View style={s.nudgeLeft}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#F59E0B" />
          <Text style={s.nudgeText}>You're on the free plan · 3 Fish IDs & 5 AI questions per month</Text>
        </View>
        <Text style={s.nudgeLink}>See what you're missing →</Text>
      </View>

      {/* ── Benefits list ── */}
      <View style={s.benefitsSection}>
        <Text style={s.sectionLabel}>EVERYTHING IN PRO</Text>
        {PRO_BENEFITS.map((b) => (
          <View key={b.title} style={s.benefitRow}>
            <View style={s.benefitIconWrap}>
              <MaterialCommunityIcons name={b.icon} size={20} color={colors.primary} />
            </View>
            <View style={s.benefitText}>
              <Text style={s.benefitTitle}>{b.title}</Text>
              <Text style={s.benefitSubtitle}>{b.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Social proof ── */}
      <View style={s.socialRow}>
        {[
          { icon: 'account-group' as const, label: '2,000+ Anglers' },
          { icon: 'star' as const, label: '4.8 Rating' },
          { icon: 'gift-outline' as const, label: '7-Day Trial' },
        ].map((pill) => (
          <View key={pill.label} style={s.socialPill}>
            <MaterialCommunityIcons name={pill.icon} size={14} color={colors.primary} />
            <Text style={s.socialPillText}>{pill.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Pricing ── */}
      <View style={s.pricingSection}>
        <Text style={s.sectionLabel}>CHOOSE YOUR PLAN</Text>
        <View style={s.pricingRow}>
          {/* Monthly */}
          <TouchableOpacity
            style={[s.pricingCard, billing === 'monthly' && s.pricingCardActive]}
            onPress={() => setBilling('monthly')}
            activeOpacity={0.85}
          >
            <Text style={s.planLabel}>Monthly</Text>
            <Text style={[s.planPrice, billing === 'monthly' && s.planPriceActive]}>£3.99</Text>
            <Text style={s.planPer}>per month</Text>
          </TouchableOpacity>

          {/* Annual */}
          <TouchableOpacity
            style={[s.pricingCard, billing === 'annual' && s.pricingCardActive]}
            onPress={() => setBilling('annual')}
            activeOpacity={0.85}
          >
            <View style={s.bestValueBadge}>
              <Text style={s.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={s.planLabel}>Annual</Text>
            <Text style={[s.planPrice, billing === 'annual' && s.planPriceActive]}>£24.99</Text>
            <Text style={s.planPer}>£2.08/mo</Text>
            <View style={s.savePill}>
              <Text style={s.saveText}>Save 48%</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CTA ── */}
      <View style={s.ctaSection}>
        <TouchableOpacity
          style={[s.ctaBtn, loading && s.ctaBtnLoading]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.88}
        >
          <LinearGradient colors={['#00D4AA', '#00B88A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaGrad}>
            {loading ? (
              <Text style={s.ctaBtnText}>Activating...</Text>
            ) : (
              <>
                <MaterialCommunityIcons name="crown" size={18} color="#031A12" />
                <Text style={s.ctaBtnText}>Start 7-Day Free Trial</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={s.ctaNote}>Cancel anytime · No commitment</Text>

        <TouchableOpacity
          onPress={() => Alert.alert('Restore Purchases', 'No previous purchases found.')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={s.restoreLink}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...elevation.raised,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },

  // Nudge banner
  nudgeBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  nudgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nudgeText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(245,158,11,0.9)',
    lineHeight: 18,
  },
  nudgeLink: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '700',
    marginLeft: 24,
  },

  // Benefits
  benefitsSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  benefitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  benefitSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },

  // Social proof
  socialRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  socialPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 9,
    paddingHorizontal: 10,
    ...elevation.raised,
  },
  socialPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Pricing
  pricingSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    ...elevation.raised,
  },
  pricingCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0,212,170,0.06)',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#031A12',
    letterSpacing: 0.8,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  planPriceActive: {
    color: colors.primary,
  },
  planPer: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  savePill: {
    marginTop: 4,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  saveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },

  // CTA
  ctaSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaBtn: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaBtnLoading: {
    opacity: 0.7,
  },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#031A12',
    letterSpacing: 0.3,
  },
  ctaNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  restoreLink: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});
