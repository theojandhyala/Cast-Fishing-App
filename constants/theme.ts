export const colors = {
  primary: '#00D4AA',
  primaryDim: '#0B5F4F',
  secondary: '#F59E0B',
  background: '#0A0E1A',
  surface: '#0E1320',
  surface2: '#161D2E',
  textPrimary: '#F9FAFB',
  textSecondary: '#8B95A7',
  textTertiary: '#4B5566',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  line: 'rgba(0,212,170,0.35)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Sharper, more technical corner system - no soft "bubbly" radii.
export const radius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
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
