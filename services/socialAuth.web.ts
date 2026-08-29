/**
 * Web stub for social sign-in. The provider SDKs are native modules, so this
 * file is what Metro bundles for the web build. The web app uses email sign-in.
 */
export type SocialResult =
  | { ok: true; idToken: string; name?: string }
  | { ok: false; cancelled: boolean; error?: string };

export async function appleAvailable(): Promise<boolean> { return false; }
export function googleAvailable(): boolean { return false; }
export async function signInWithApple(): Promise<SocialResult> {
  return { ok: false, cancelled: false, error: 'Sign in with Apple is only available in the app.' };
}
export async function signInWithGoogle(): Promise<SocialResult> {
  return { ok: false, cancelled: false, error: 'Sign in with Google is only available in the app.' };
}
