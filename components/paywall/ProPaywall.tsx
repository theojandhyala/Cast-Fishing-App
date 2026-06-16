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
import { CastButton } from '../ui/CastButton';
import { colors, radius, spacing } from '../../constants/theme';

const proFeatures = [
  { icon: 'camera', title: 'Unlimited Fish ID', subtitle: 'Identify any fish with AI' },
  { icon: 'weather-cloudy', title: 'Premium Weather', subtitle: '7-day detailed forecasts' },
  { icon: 'map-search', title: 'All Fishing Spots', subtitle: 'Access 500+ UK spots' },
  { icon: 'chart-line', title: 'Advanced Analytics', subtitle: 'Catch trends and patterns' },
  { icon: 'bell', title: 'Tidal Alerts', subtitle: 'Get notified of peak windows' },
  { icon: 'cloud-sync', title: 'Cloud Backup', subtitle: 'Never lose your catches' },
  { icon: 'star', title: 'Species Library', subtitle: 'Full database access' },
  { icon: 'cancel', title: 'Ad-Free', subtitle: 'Clean, distraction-free app' },
];

const freeFeatures = [
  { icon: 'fish', title: '10 Catches per month', included: true },
  { icon: 'camera', title: '3 Fish IDs per month', included: true },
  { icon: 'map-marker', title: '20 UK fishing spots', included: true },
  { icon: 'book-open', title: 'Basic knot library', included: true },
  { icon: 'weather-cloudy', title: 'Basic weather', included: true },
  { icon: 'chart-line', title: 'Advanced analytics', included: false },
  { icon: 'cloud-sync', title: 'Cloud backup', included: false },
  { icon: 'bell', title: 'Tidal alerts', included: false },
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
      [{ text: 'Let\'s Go!', onPress: onClose }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['rgba(0,212,170,0.2)', 'rgba(0,212,170,0.05)', 'transparent']}
        style={styles.hero}
      >
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.heroTitle}>CAST Pro</Text>
        <Text style={styles.heroSubtitle}>
          Everything you need to become a better angler
        </Text>
      </LinearGradient>

      {/* Feature Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pro Features</Text>
        <View style={styles.featureGrid}>
          {proFeatures.map((f) => (
            <View key={f.title} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name={f.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Free vs Pro</Text>
        {freeFeatures.map((f) => (
          <View key={f.title} style={styles.compareRow}>
            <MaterialCommunityIcons name={f.icon as any} size={16} color={colors.textSecondary} />
            <Text style={styles.compareText}>{f.title}</Text>
            <MaterialCommunityIcons
              name={f.included ? 'check-circle' : 'close-circle'}
              size={18}
              color={f.included ? colors.success : colors.surface2}
            />
            <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
          </View>
        ))}
        <View style={styles.compareHeader}>
          <View style={{ flex: 1 }} />
          <Text style={styles.compareHeaderText}>Free</Text>
          <Text style={[styles.compareHeaderText, { color: colors.primary }]}>Pro</Text>
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <View style={styles.pricingRow}>
          <TouchableOpacity
            style={[styles.pricingCard, billing === 'monthly' && styles.pricingCardActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={styles.pricingPeriod}>Monthly</Text>
            <Text style={styles.pricingAmount}>£4.99</Text>
            <Text style={styles.pricingPer}>per month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pricingCard, billing === 'annual' && styles.pricingCardActive]}
            onPress={() => setBilling('annual')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 50%</Text>
            </View>
            <Text style={styles.pricingPeriod}>Annual</Text>
            <Text style={styles.pricingAmount}>£29.99</Text>
            <Text style={styles.pricingPer}>£2.50/month</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cta}>
        <CastButton
          title={`Start 7-Day Free Trial`}
          onPress={handleSubscribe}
          loading={loading}
          fullWidth
          size="lg"
        />
        <Text style={styles.ctaNote}>
          Then {billing === 'monthly' ? '£4.99/month' : '£29.99/year'}. Cancel anytime.
        </Text>
        <TouchableOpacity onPress={() => Alert.alert('Restore Purchases', 'No previous purchases found.')}>
          <Text style={styles.restore}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

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
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  crown: {
    fontSize: 52,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '47%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  compareText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  compareHeader: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  compareHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 18,
    textAlign: 'center',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  pricingCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0,212,170,0.08)',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A0E1A',
    letterSpacing: 0.5,
  },
  pricingPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pricingAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pricingPer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cta: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  restore: {
    fontSize: 13,
    color: colors.primary,
    marginTop: spacing.md,
    textDecorationLine: 'underline',
  },
});
