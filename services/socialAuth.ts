/**
 * One-tap sign-in with Apple and Google.
 *
 * Both providers hand us an identity token, which the CAST worker verifies
 * before issuing our own session token. The provider modules are native, so a
 * web stub lives in `socialAuth.web.ts` and Metro resolves that for the web
 * bundle.
 *
 * Apple requires Sign in with Apple to be offered wherever another third-party
 * sign-in is offered (App Store Review Guideline 4.8), which is why the Apple
 * button is shown first on iOS.
 */
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { CONFIG } from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

export type SocialResult =
  | { ok: true; idToken: string; name?: string }
  | { ok: false; cancelled: boolean; error?: string };

/** Apple only exists on iOS 13+; never render the button elsewhere. */
export async function appleAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try { return await AppleAuthentication.isAvailableAsync(); } catch { return false; }
}

export function googleAvailable(): boolean {
  return Boolean(CONFIG.GOOGLE_CLIENT_ID_IOS || CONFIG.GOOGLE_CLIENT_ID_WEB);
}

export async function signInWithApple(): Promise<SocialResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) return { ok: false, cancelled: false, error: 'Apple did not return an identity token.' };
    // Apple only sends the name on the very first authorisation.
    const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ') || undefined;
    return { ok: true, idToken: credential.identityToken, name };
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED' || e?.code === 'ERR_CANCELED') return { ok: false, cancelled: true };
    return { ok: false, cancelled: false, error: e?.message || 'Sign in with Apple failed.' };
  }
}

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export async function signInWithGoogle(): Promise<SocialResult> {
  const clientId = Platform.OS === 'ios'
    ? (CONFIG.GOOGLE_CLIENT_ID_IOS || CONFIG.GOOGLE_CLIENT_ID_WEB)
    : (CONFIG.GOOGLE_CLIENT_ID_ANDROID || CONFIG.GOOGLE_CLIENT_ID_WEB);
  if (!clientId) return { ok: false, cancelled: false, error: 'Google sign-in is not configured.' };

  try {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'cast' });
    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: { nonce: String(Date.now()) },
    });
    const result = await request.promptAsync(GOOGLE_DISCOVERY);
    if (result.type === 'cancel' || result.type === 'dismiss') return { ok: false, cancelled: true };
    if (result.type !== 'success') return { ok: false, cancelled: false, error: 'Google sign-in did not complete.' };
    const idToken = (result.params as any)?.id_token;
    if (!idToken) return { ok: false, cancelled: false, error: 'Google did not return an identity token.' };
    return { ok: true, idToken };
  } catch (e: any) {
    return { ok: false, cancelled: false, error: e?.message || 'Sign in with Google failed.' };
  }
}
