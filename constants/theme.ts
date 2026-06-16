export const colors = {
  primary: '#00D4AA',
  primaryDim: '#0B5F4F',
  accentBlue: '#2DD4FF',
  secondary: '#F59E0B',
  background: '#0A0E1A',
  surface: '#101827',
  surface2: '#121C2D',
  textPrimary: '#F9FAFB',
  textSecondary: '#8B95A7',
  textTertiary: '#4B5566',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  line: 'rgba(0,212,170,0.35)',
};

// Soft, layered elevation for a premium "glass" surface feel — used on cards
// that should sit above the background rather than blend flat into it.
export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  glow: {
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Soft, rounded corner system for a premium, modern card-based feel.
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const fonts = {
  body: 'Inter_400Regular',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  display: 'Syne_700Bold',
  displaySemi: 'Syne_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '700' as const, color: '#F9FAFB', fontFamily: fonts.display, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: '#F9FAFB', fontFamily: fonts.display, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, color: '#F9FAFB', fontFamily: fonts.bodySemi },
  h4: { fontSize: 16, fontWeight: '600' as const, color: '#F9FAFB', fontFamily: fonts.bodySemi },
  body: { fontSize: 15, fontWeight: '400' as const, color: '#F9FAFB', fontFamily: fonts.body },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: '#8B95A7', fontFamily: fonts.body },
  caption: { fontSize: 11, fontWeight: '600' as const, color: '#8B95A7', fontFamily: fonts.bodySemi, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  label: { fontSize: 13, fontWeight: '600' as const, color: '#F9FAFB', fontFamily: fonts.bodySemi },
  // Tabular/technical numerals for stats, timers, scores.
  mono: { fontSize: 15, fontWeight: '500' as const, color: '#F9FAFB', fontFamily: fonts.mono },
  monoLarge: { fontSize: 28, fontWeight: '700' as const, color: '#F9FAFB', fontFamily: fonts.monoBold },
};
