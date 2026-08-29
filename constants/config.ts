export const CONFIG = {
  // Secure AI proxy (Cloudflare Worker). The Anthropic key lives on the
  // Worker as a secret and is never shipped to the client.
  AI_WORKER_URL: process.env.EXPO_PUBLIC_AI_WORKER_URL || 'https://cast-ai.theojandhyala.workers.dev',
  API_URL: process.env.EXPO_PUBLIC_CAST_API_URL || 'https://cast-ai.theojandhyala.workers.dev',

  // Direct keys (optional, native/dev only — do NOT use on the public web build).
  ANTHROPIC_API_KEY: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  // RevenueCat public SDK keys. The Apple key starts `appl_`, Google `goog_`.
  // A platform only sells through the store when ITS key is present.
  REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
  REVENUECAT_API_KEY_ANDROID: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '',
  // Google OAuth client IDs. Sign in with Google only appears when set.
  GOOGLE_CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
  GOOGLE_CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
  GOOGLE_CLIENT_ID_WEB: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '',
};
