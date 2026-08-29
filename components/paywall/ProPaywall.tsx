import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Icon } from '../ui/Icon';
import { CastButton } from '../ui/CastButton';
import { castApi } from '../../services/castApi';
import { useAuthStore, User } from '../../store/authStore';
import { colors, elevation, fonts, radius, spacing } from '../../constants/theme';
import { canPurchaseOnThisPlatform, LEGAL_LINKS } from '../../constants/purchases';
import * as IAP from '../../services/purchases';

type BillingPlan = 'monthly' | 'annual';
interface BillingStatus {
  stripeConfigured: boolean;
  isPro: boolean;
  status: string;
  plan: BillingPlan | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canManage: boolean;
}

const PRO_FEATURES = [
  { icon: 'camera-iris', title: 'Unlimited CAST Lens', detail: 'AI identification with alternatives, confidence and catch autofill.' },
  { icon: 'weather-partly-cloudy', title: 'Pro conditions', detail: 'Long-range weather, pressure, tide and solunar planning in one timeline.' },
  { icon: 'chart-timeline-variant-shimmer', title: 'Catch intelligence', detail: 'Discover which spots, baits and conditions produce your best sessions.' },
  { icon: 'bell-ring-outline', title: 'Smart bite alerts', detail: 'Personal alerts for pressure shifts, tidal windows and target species.' },
  { icon: 'cloud-lock-outline', title: 'Secure cloud backup', detail: 'Keep catches, photos, trips and personal records synced across devices.' },
  { icon: 'map-marker-star-outline', title: 'Advanced spot tools', detail: 'Saved collections, private notes, route planning and offline-ready packs.' },
];

const COMPARISON = [
  ['Fish identification', '3 / month', 'Unlimited'],
  ['Forecast horizon', 'Current', '7 days'],
  ['Catch analytics', 'Overview', 'Full patterns'],
  ['Tide & bite alerts', '—', 'Personalised'],
  ['Cloud backup', 'Basic', 'Full history'],
] as const;

const statusLabel = (status: string) => ({
  active: 'Active', trialing: 'Free trial', past_due: 'Payment issue', canceled: 'Cancelled', free: 'Free plan',
}[status] || status.replaceAll('_', ' '));

export function ProPaywall({ onClose, welcome = false }: { onClose?: () => void; welcome?: boolean }) {
  const { checkout, session_id: sessionId } = useLocalSearchParams<{ checkout?: string; session_id?: string }>();
  const user = useAuthStore((state) => state.user);
  const loadUser = useAuthStore((state) => state.loadUser);
  const [billing, setBilling] = useState<BillingPlan>('annual');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const handledSession = useRef(false);
  // Native builds sell CAST Pro through the store (App Store guideline 3.1.2);
  // the web build keeps the existing Stripe checkout.
  const useStore = Platform.OS !== 'web' && IAP.purchasesConfigurable();
  const [storePackages, setStorePackages] = useState<any[]>([]);
  const [storePro, setStorePro] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!user) return;
    try {
      const next = await castApi<BillingStatus>('/billing/status');
      setStatus(next);
    } catch {}
  }, [user]);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  useEffect(() => {
    if (!useStore) return;
    let alive = true;
    (async () => {
      if (user?.id) await IAP.identifyPurchaser(user.id);
      const [pkgs, active] = await Promise.all([IAP.getProPackages(), IAP.isProActiveOnDevice()]);
      if (!alive) return;
      setStorePackages(pkgs);
      setStorePro(active);
    })();
    return () => { alive = false; };
  }, [useStore, user?.id]);

  useEffect(() => {
    if (checkout !== 'success' || !sessionId || handledSession.current) return;
    handledSession.current = true;
    setLoading(true);
    castApi<{ user: User }>('/billing/confirm', { method: 'POST', body: JSON.stringify({ sessionId }) })
      .then(async () => {
        await loadUser();
        await refreshStatus();
        Alert.alert('CAST Pro is active', 'Your seven-day trial has started. Welcome aboard.');
      })
      .catch((error) => Alert.alert('Confirming your subscription', error?.message || 'Your payment is still being confirmed. Pull to refresh shortly.'))
      .finally(() => setLoading(false));
  }, [checkout, loadUser, refreshStatus, sessionId]);

  /** The store's own intro/trial offer for the selected plan, if any. */
  const introOffer = () => {
    const pkg = storePackages.find((p) => p?.packageType === (billing === 'monthly' ? 'MONTHLY' : 'ANNUAL'));
    const intro = pkg?.product?.introPrice;
    if (!intro) return null;
    const n = intro.periodNumberOfUnits;
    const unit = String(intro.periodUnit || '').toLowerCase().replace(/s$/, '');
    return n && unit ? `${n}-${unit} free trial` : 'free trial';
  };

  /** Localised store price (Apple requires the real price, not a hardcoded one). */
  const priceFor = (period: 'MONTHLY' | 'ANNUAL', fallback: string) => {
    const pkg = storePackages.find((p) => p?.packageType === period);
    return pkg?.product?.priceString || fallback;
  };

  /** Pick the store package matching the selected billing period. */
  const selectedPackage = () => {
    if (!storePackages.length) return null;
    const want = billing === 'monthly' ? 'MONTHLY' : 'ANNUAL';
    return storePackages.find((p) => p?.packageType === want) ?? storePackages[0];
  };

  const restore = async () => {
    if (!useStore) { await refreshStatus(); return; }
    setLoading(true);
    try {
      const res = await IAP.restoreProPurchases();
      setStorePro(res.ok);
      await refreshStatus();
      Alert.alert(res.ok ? 'Membership restored' : 'Nothing to restore',
        res.ok ? 'CAST Pro is active on this device.' : res.error || 'No previous purchase was found for this Apple ID.');
    } finally { setLoading(false); }
  };

  const subscribe = async () => {
    // In-app purchase path (iOS/Android). Required by App Store guideline 3.1.2.
    if (useStore) {
      const pkg = selectedPackage();
      if (!pkg) { Alert.alert('Plans unavailable', 'Subscription options could not be loaded. Please try again shortly.'); return; }
      setLoading(true);
      try {
        const res = await IAP.purchaseProPackage(pkg);
        if (res.cancelled) return;
        if (res.ok) {
          setStorePro(true);
          await Promise.all([loadUser(), refreshStatus()]);
          Alert.alert('CAST Pro is active', 'Welcome aboard. Your premium tools are unlocked.');
        } else {
          Alert.alert('Purchase not completed', res.error || 'The purchase could not be completed.');
        }
      } finally { setLoading(false); }
      return;
    }
    // Defence in depth: never open an external checkout where App Store rules
    // require In-App Purchase, even if some other path calls this.
    if (!canPurchaseOnThisPlatform()) return;
    if (!user) { Alert.alert('Almost there', 'Create a free CAST account so your Pro access follows you between devices.'); return; }
    if (status && !status.stripeConfigured) {
      Alert.alert('Checkout unavailable', 'Secure checkout is not connected yet. Please try again later.');
      return;
    }
    setLoading(true);
    try {
      const { checkoutUrl } = await castApi<{ checkoutUrl: string }>('/billing/checkout', {
        method: 'POST', body: JSON.stringify({ plan: billing }),
      });
      await Linking.openURL(checkoutUrl);
    } catch (error: any) {
      Alert.alert('CAST Pro checkout', error?.message || 'Secure checkout could not open.');
    } finally { setLoading(false); }
  };

  const manageBilling = async () => {
    if (!canPurchaseOnThisPlatform()) return;
    setLoading(true);
    try {
      const { portalUrl } = await castApi<{ portalUrl: string }>('/billing/portal', { method: 'POST' });
      await Linking.openURL(portalUrl);
    } catch (error: any) {
      Alert.alert('Manage billing', error?.message || 'The billing portal could not open.');
    } finally { setLoading(false); }
  };

  const isPro = Boolean(status?.isPro || user?.isPro || storePro);
  const renewal = status?.currentPeriodEnd
    ? new Date(status.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <ScrollView className="flex-1 bg-cast-950" style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0D3B42', '#071A24', colors.background]} style={styles.hero}>
        {onClose ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close CAST Pro" onPress={onClose} style={styles.close}><Icon name="close" size={22} color={colors.textPrimary} /></TouchableOpacity> : null}
        <View style={styles.proMark}><Icon name="crown-outline" size={26} color={colors.background} /></View>
        <Text style={styles.eyebrow}>CAST PRO</Text>
        <Text style={styles.heroTitle}>Read the water.{`\n`}Own the session.</Text>
        <Text style={styles.heroSubtitle}>Turn live conditions and your catch history into decisions you can use at the bank.</Text>
        <View className="mt-7 flex-row items-center rounded-card border border-white/10 bg-cast-950/60 p-3.5" style={styles.metrics}>
          <View style={styles.metric}><Text style={styles.metricValue}>10K+</Text><Text style={styles.metricLabel}>SPOTS</Text></View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}><Text style={styles.metricValue}>300+</Text><Text style={styles.metricLabel}>SPECIES</Text></View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}><Text style={styles.metricValue}>24/7</Text><Text style={styles.metricLabel}>CAST LENS</Text></View>
        </View>
      </LinearGradient>

      {isPro ? (
        <View className="mx-5 mt-5 rounded-card border border-cast-aqua bg-cast-aqua/10 p-5" style={styles.activeCard}>
          <View style={styles.activeTop}><View style={styles.liveDot} /><Text style={styles.activeTitle}>CAST Pro · {statusLabel(status?.status || user?.proStatus || 'active')}</Text></View>
          <Text style={styles.activeCopy}>{renewal ? `${status?.cancelAtPeriodEnd ? 'Access ends' : 'Next billing date'} ${renewal}.` : 'Your premium fishing tools are unlocked.'}</Text>
          {status?.canManage && canPurchaseOnThisPlatform() ? <CastButton title="Manage billing" onPress={manageBilling} loading={loading} variant="ghost" fullWidth /> : null}
        </View>
      ) : null}

      <View className="mt-7 px-5" style={styles.section}>
        <Text style={styles.sectionKicker}>BUILT FOR BETTER DECISIONS</Text>
        <Text style={styles.sectionTitle}>A serious toolkit, not a badge.</Text>
        <View style={styles.featureList}>
          {PRO_FEATURES.map((feature) => (
            <View key={feature.title} className="flex-row gap-3 rounded-card border border-white/10 bg-cast-900 p-3.5" style={styles.feature}>
              <View style={styles.featureIcon}><Icon name={feature.icon} size={21} color={colors.primary} /></View>
              <View style={styles.featureCopy}><Text style={styles.featureTitle}>{feature.title}</Text><Text style={styles.featureDetail}>{feature.detail}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-7 px-5" style={styles.section}>
        <Text style={styles.sectionKicker}>FREE VS PRO</Text>
        <View className="mt-3 overflow-hidden rounded-card border border-white/10 bg-cast-900" style={styles.table}>
          <View style={styles.tableHeader}><Text style={styles.tableFeature}>FEATURE</Text><Text style={styles.tableCell}>FREE</Text><Text style={[styles.tableCell, styles.proCell]}>PRO</Text></View>
          {COMPARISON.map(([feature, free, pro]) => <View key={feature} style={styles.tableRow}><Text style={styles.tableFeatureText}>{feature}</Text><Text style={styles.tableCellText}>{free}</Text><Text style={[styles.tableCellText, styles.proCellText]}>{pro}</Text></View>)}
        </View>
      </View>

      {!isPro ? <View className="mt-7 px-5" style={styles.section}>
        <Text style={styles.sectionKicker}>{canPurchaseOnThisPlatform() ? 'CHOOSE YOUR PLAN' : 'CAST PRO'}</Text>
        {canPurchaseOnThisPlatform() ? (
        <View style={styles.plans}>
          <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: billing === 'monthly' }} onPress={() => setBilling('monthly')} style={[styles.plan, billing === 'monthly' && styles.planSelected]}>
            <View style={styles.trialBadge}><Text style={styles.trialBadgeText}>7-DAY FREE TRIAL</Text></View>
            <Text style={styles.planName}>Monthly</Text><Text style={styles.price}>{priceFor('MONTHLY', '£4.99')}</Text><Text style={styles.priceDetail}>per month</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: billing === 'annual' }} onPress={() => setBilling('annual')} style={[styles.plan, billing === 'annual' && styles.planSelected]}>
            <View style={styles.bestValue}><Text style={styles.bestValueText}>BEST VALUE · SAVE 50%</Text></View>
            <Text style={styles.planName}>Annual</Text><Text style={styles.price}>{priceFor('ANNUAL', '£29.99')}</Text><Text style={styles.priceDetail}>billed yearly</Text>
          </TouchableOpacity>
        </View>
        ) : null}
        {canPurchaseOnThisPlatform() ? (
          <View className="mt-3 rounded-card border border-white/10 bg-cast-900 p-3.5" style={styles.checkoutCard}>
            <View style={styles.secureRow}><Icon name="shield-lock-outline" size={17} color={colors.primary} /><Text style={styles.secureText}>Secure checkout and billing</Text></View>
            <CastButton
              title={
                useStore
                  ? (storePackages.length === 0 ? 'Loading plans…' : (introOffer() ? `Start ${introOffer()}` : 'Subscribe'))
                  : (status?.stripeConfigured === false ? 'Checkout unavailable' : 'Start 7-day free trial')
              }
              onPress={subscribe}
              loading={loading}
              disabled={useStore ? storePackages.length === 0 : status?.stripeConfigured === false}
              fullWidth
              size="lg"
            />
            <Text style={styles.terms}>{billing === 'monthly' ? `CAST Pro Monthly — ${priceFor('MONTHLY', '£4.99')} per month` : `CAST Pro Annual — ${priceFor('ANNUAL', '£29.99')} per year`}, auto-renewing until cancelled.{useStore ? (introOffer() ? ` Includes a ${introOffer()} for eligible new subscribers; cancel any time before it ends and you will not be charged. Payment is charged to your Apple ID and renews unless auto-renew is turned off at least 24 hours before the period ends. Manage or cancel in your Apple ID settings.` : ' Payment is charged to your Apple ID and renews unless auto-renew is turned off at least 24 hours before the period ends. Manage or cancel in your Apple ID settings.') : ' A seven-day free trial is included for eligible new subscribers; cancel any time before it ends and you will not be charged.'}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={restore} style={styles.restore}><Text style={styles.restoreText}>Restore membership</Text></TouchableOpacity>
          </View>
        ) : (
          <View className="mt-3 rounded-card border border-white/10 bg-cast-900 p-3.5" style={styles.checkoutCard}>
            <View style={styles.secureRow}><Icon name="information-outline" size={17} color={colors.primary} /><Text style={styles.secureText}>CAST Pro is not yet available to buy in this app</Text></View>
            <Text style={styles.terms}>Everything below is free to use right now. If you already have CAST Pro, sign in with the same account and it unlocks automatically.</Text>
            <TouchableOpacity accessibilityRole="button" onPress={restore} style={styles.restore}><Text style={styles.restoreText}>Restore membership</Text></TouchableOpacity>
          </View>
        )}

        {welcome ? (
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.laterBtn} activeOpacity={0.7}>
            <Text style={styles.laterText}>Maybe later</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.legalRow}>
          <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(LEGAL_LINKS.terms)}><Text style={styles.legalLink}>Terms of Use</Text></TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(LEGAL_LINKS.privacy)}><Text style={styles.legalLink}>Privacy Policy</Text></TouchableOpacity>
        </View>
      </View> : null}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: { paddingHorizontal: spacing.lg, paddingTop: 48, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  close: { position: 'absolute', right: spacing.lg, top: spacing.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(2,11,17,0.55)', alignItems: 'center', justifyContent: 'center' },
  proMark: { width: 52, height: 52, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  eyebrow: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.4 },
  heroTitle: { color: colors.textPrimary, fontFamily: fonts.display, fontSize: 38, lineHeight: 42, letterSpacing: -1.1, marginTop: spacing.sm },
  heroSubtitle: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, maxWidth: 520, marginTop: spacing.md },
  metrics: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, padding: spacing.md, backgroundColor: 'rgba(2,11,17,0.55)', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: colors.textPrimary, fontFamily: fonts.monoBold, fontSize: 20 },
  metricLabel: { color: colors.textTertiary, fontFamily: fonts.bodyBold, fontSize: 8, letterSpacing: 1.3, marginTop: 2 },
  metricDivider: { width: 1, height: 30, backgroundColor: colors.border },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionKicker: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 },
  sectionTitle: { color: colors.textPrimary, fontFamily: fonts.display, fontSize: 24, lineHeight: 30, marginTop: spacing.sm, marginBottom: spacing.md },
  featureList: { gap: spacing.sm },
  feature: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...elevation.card },
  featureIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: 'rgba(68,210,203,0.10)', alignItems: 'center', justifyContent: 'center' },
  featureCopy: { flex: 1 },
  featureTitle: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14 },
  featureDetail: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 3 },
  table: { marginTop: spacing.md, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tableHeader: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: 10, backgroundColor: colors.surface2 },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  tableFeature: { flex: 1, color: colors.textTertiary, fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1 },
  tableCell: { width: 72, textAlign: 'center', color: colors.textTertiary, fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1 },
  tableFeatureText: { flex: 1, color: colors.textSecondary, fontFamily: fonts.bodySemi, fontSize: 12 },
  tableCellText: { width: 72, textAlign: 'center', color: colors.textSecondary, fontFamily: fonts.body, fontSize: 11 },
  proCell: { color: colors.primary }, proCellText: { color: colors.primary, fontFamily: fonts.bodyBold },
  plans: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  plan: { flex: 1, minHeight: 130, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', position: 'relative' },
  planSelected: { borderColor: colors.primary, backgroundColor: 'rgba(68,210,203,0.08)' },
  bestValue: { position: 'absolute', top: -9, left: 10, right: 10, alignItems: 'center' },
  bestValueText: { overflow: 'hidden', color: colors.background, backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3, fontFamily: fonts.bodyBold, fontSize: 8, letterSpacing: 0.5 },
  planName: { color: colors.textSecondary, fontFamily: fonts.bodySemi, fontSize: 13 },
  price: { color: colors.textPrimary, fontFamily: fonts.monoBold, fontSize: 27, marginTop: 6 },
  priceDetail: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  checkoutCard: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: spacing.md },
  secureText: { color: colors.textSecondary, fontFamily: fonts.bodySemi, fontSize: 11 },
  terms: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: spacing.sm },
  restore: { alignSelf: 'center', padding: spacing.md },
  trialBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(0,212,170,0.14)',
    borderColor: 'rgba(0,212,170,0.35)', borderWidth: 1,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
  },
  trialBadgeText: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  laterBtn: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 24, minHeight: 44, justifyContent: 'center', marginTop: spacing.sm },
  laterText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.sm },
  legalLink: { color: colors.textSecondary, fontFamily: fonts.bodySemi, fontSize: 12, textDecorationLine: 'underline' },
  legalDot: { color: colors.textTertiary, fontSize: 12 },
  restoreText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: 12 },
  configNotice: { color: colors.warning, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, textAlign: 'center', padding: spacing.sm, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: radius.sm },
  activeCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, backgroundColor: 'rgba(68,210,203,0.08)', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.lg },
  activeTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  activeTitle: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 16 },
  activeCopy: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: spacing.sm, marginBottom: spacing.md },
});

