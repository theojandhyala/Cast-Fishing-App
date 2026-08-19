/**
 * Web stub for the in-app purchase layer.
 *
 * react-native-purchases is a native module with no web support, so Metro
 * resolves this file for the web bundle instead of `purchases.ts`. The web
 * app sells CAST Pro through the existing Stripe checkout, which is permitted
 * outside the App Store, so every function here is an inert no-op.
 */
export const PRO_ENTITLEMENT = 'pro';

export type PurchasesPackage = never;

export function purchasesConfigurable(): boolean { return false; }
export async function initPurchases(): Promise<boolean> { return false; }
export async function getProPackages(): Promise<PurchasesPackage[]> { return []; }
export async function purchaseProPackage(): Promise<{ ok: boolean; cancelled: boolean; error?: string }> {
  return { ok: false, cancelled: false, error: 'In-app purchases are not available on the web.' };
}
export async function restoreProPurchases(): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: 'In-app purchases are not available on the web.' };
}
export async function isProActiveOnDevice(): Promise<boolean> { return false; }
export async function identifyPurchaser(): Promise<void> {}
export const purchasesPlatform = 'web';
