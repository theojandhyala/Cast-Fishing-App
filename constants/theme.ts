export const colors = {
  // Backgrounds — deep navy, layered
  bg: '#07111F',
  surface: '#0D1A2D',
  surface2: '#122036',
  surface3: '#172845',
  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.18)',
  // Brand
  primary: '#00D4AA',
  primaryDim: 'rgba(0,212,170,0.12)',
  secondary: '#4DA3FF',
  secondaryDim: 'rgba(77,163,255,0.12)',
  accent: '#F59E0B',
  accentDim: 'rgba(245,158,11,0.12)',
  // Text
  textPrimary: '#EFF6FF',
  textSecondary: '#7A9BB5',
  textTertiary: '#4A6580',
  // Status
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  // Compat aliases so existing screens don't break
  background: '#07111F',
  background2: '#0D1A2D',
  primaryDimColor: 'rgba(0,212,170,0.12)',
  accentBlue: '#4DA3FF',
  line: 'rgba(0,212,170,0.2)',
};

// 8pt spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  '2': 2, '4': 4, '6': 6, '8': 8, '12': 12, '16': 16, '20': 20, '24': 24, '32': 32, '40': 40, '48': 48, '64': 64,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Depth through shadow only — no gradients
export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
};

export const typography = {
  display: { fontSize: 56, fontWeight: '800' as const, letterSpacing: -1.5 },
  h1: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMed: { fontSize: 15, fontWeight: '500' as const },
  bodySemi: { fontSize: 15, fontWeight: '600' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  micro: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.8 },
  mono: { fontSize: 15, fontWeight: '500' as const },
  monoLarge: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  // Backwards compat aliases for screens not yet migrated
  bodyBold: { fontSize: 15, fontWeight: '700' as const },
  monoBold: { fontSize: 15, fontWeight: '700' as const },
  displaySemi: { fontSize: 56, fontWeight: '700' as const, letterSpacing: -1.5 },
  h4: { fontSize: 16, fontWeight: '600' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  label2: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};

// Backwards compat — some screens import `fonts` from theme
export const fonts = typography;
