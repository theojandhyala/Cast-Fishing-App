export const CONFIG = {
  // Secure AI proxy (Cloudflare Worker). The Anthropic key lives on the
  // Worker as a secret and is never shipped to the client.
  AI_WORKER_URL: process.env.EXPO_PUBLIC_AI_WORKER_URL || 'https://cast-ai.theoj.workers.dev',

  // Direct keys (optional, native/dev only — do NOT use on the public web build).
  ANTHROPIC_API_KEY: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
};
