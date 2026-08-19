import { Platform } from 'react-native';

/**
 * Apple App Store Review Guideline 3.1.2 requires that digital subscriptions
 * sold inside an iOS app go through Apple In-App Purchase. Linking out to an
 * external checkout (our Stripe flow) is a rejection — CAST 1.0 was rejected
 * for exactly this.
 *
 * Until StoreKit / RevenueCat is wired up and shipped in a native build, the
 * iOS app must not offer, price, or link to any external purchase. Web and
 * Android keep the existing Stripe checkout, which is permitted there.
 *
 * To turn purchasing back on for iOS: implement the IAP provider, then flip
 * this flag to true in the same release. Nothing else needs to change.
 */
export const IOS_IAP_READY = false;

/** Whether this platform may present an in-app purchase flow at all. */
export const canPurchaseOnThisPlatform = () => Platform.OS !== 'ios' || IOS_IAP_READY;

/**
 * Apple also requires functional Terms of Use (EULA) and Privacy Policy links
 * wherever an auto-renewable subscription is presented.
 */
export const LEGAL_LINKS = {
  terms: 'https://castfishingapp.com/terms.html',
  privacy: 'https://castfishingapp.com/privacy.html',
};
