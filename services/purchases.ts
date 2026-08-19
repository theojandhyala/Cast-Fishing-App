/**
 * Apple/Google In-App Purchase layer (RevenueCat).
 *
 * Guideline 3.1.2 requires digital subscriptions inside the iOS app to be sold
 * through In-App Purchase. This module is the ONLY place that talks to the
 * store. A web-only stub lives in `purchases.web.ts`, which Metro resolves for
 * the web bundle so the native module is never pulled into it.
 */
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { CONFIG } from '../constants/config';

/** Entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = 'pro';

let configured = false;

/** The RevenueCat key for the platform we are running on. */
function apiKeyForPlatform(): string {
  if (Platform.OS === 'android') return CONFIG.REVENUECAT_API_KEY_ANDROID || '';
  if (Platform.OS === 'ios') return CONFIG.REVENUECAT_API_KEY || '';
  return '';
}

/** True when THIS platform has a key, i.e. store purchases can actually work. */
export function purchasesConfigurable(): boolean {
  return Boolean(apiKeyForPlatform());
}

/** Configure the SDK once. Safe to call repeatedly. */
export async function initPurchases(appUserId?: string): Promise<boolean> {
  if (configured) return true;
  const apiKey = apiKeyForPlatform();
  if (!apiKey) return false;
  try {
    if (__DEV__) void Purchases.setLogLevel(LOG_LEVEL.WARN);
    // configure() is synchronous (returns void), not a promise.
    Purchases.configure({ apiKey, appUserID: appUserId ?? null });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

/** Packages available to buy, newest offering first. Empty if unavailable. */
export async function getProPackages(): Promise<PurchasesPackage[]> {
  if (!(await initPurchases())) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

function hasPro(info: CustomerInfo | null | undefined): boolean {
  return Boolean(info?.entitlements?.active?.[PRO_ENTITLEMENT]);
}

/** Buy a package. Returns whether Pro is active afterwards. */
export async function purchaseProPackage(pkg: PurchasesPackage): Promise<{ ok: boolean; cancelled: boolean; error?: string }> {
  if (!(await initPurchases())) return { ok: false, cancelled: false, error: 'Purchases are unavailable right now.' };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: hasPro(customerInfo), cancelled: false };
  } catch (e: any) {
    if (e?.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, cancelled: false, error: e?.message || 'The purchase could not be completed.' };
  }
}

/** Apple requires a way to restore previous purchases. */
export async function restoreProPurchases(): Promise<{ ok: boolean; error?: string }> {
  if (!(await initPurchases())) return { ok: false, error: 'Purchases are unavailable right now.' };
  try {
    const info = await Purchases.restorePurchases();
    return { ok: hasPro(info) };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Could not restore purchases.' };
  }
}

/** Current entitlement state from the store, independent of our own backend. */
export async function isProActiveOnDevice(): Promise<boolean> {
  if (!(await initPurchases())) return false;
  try {
    return hasPro(await Purchases.getCustomerInfo());
  } catch {
    return false;
  }
}

/** Tie store purchases to the signed-in CAST account. */
export async function identifyPurchaser(appUserId: string): Promise<void> {
  if (!(await initPurchases(appUserId))) return;
  try { await Purchases.logIn(appUserId); } catch {}
}

export const purchasesPlatform = Platform.OS;
