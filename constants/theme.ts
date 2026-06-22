export const colors = {
  primary: '#44D2CB',
  primaryDim: '#15565D',
  accentBlue: '#5ADBD7',
  secondary: '#F4C95D',
  background: '#020B11',
  surface: '#071A24',
  surface2: '#0A2330',
  textPrimary: '#F4FBFB',
  textSecondary: '#91A7AD',
  textTertiary: '#58727A',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: 'rgba(104,160,172,0.20)',
  borderStrong: 'rgba(104,175,185,0.34)',
  line: 'rgba(68,210,203,0.34)',
};

// Soft, layered elevation for a premium "glass" surface feel — used on cards
// that should sit above the background rather than blend flat into it.
export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 3,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  glow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

// Soft, rounded corner system for a premium, modern card-based feel.
export const radius = {
  xs: 4,
  sm: 6,
  md: 9,
  lg: 13,
  xl: 16,
  full: 9999,
};

export const fonts = {
  body: 'Inter_400Regular',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  display: 'Inter_700Bold',
  displaySemi: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '700' as const, color: colors.textPrimary, fontFamily: fonts.display, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary, fontFamily: fonts.display, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary, fontFamily: fonts.bodySemi },
  h4: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary, fontFamily: fonts.bodySemi },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary, fontFamily: fonts.body },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary, fontFamily: fonts.body },
  caption: { fontSize: 11, fontWeight: '600' as const, color: colors.textSecondary, fontFamily: fonts.bodySemi, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textPrimary, fontFamily: fonts.bodySemi },
  // Tabular/technical numerals for stats, timers, scores.
  mono: { fontSize: 15, fontWeight: '500' as const, color: colors.textPrimary, fontFamily: fonts.mono },
  monoLarge: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary, fontFamily: fonts.monoBold },
};
