# UI/UX Pro Max - Design Intelligence Skill

## Overview

UI/UX Pro Max is a comprehensive design intelligence system for web and mobile applications. It provides:

- **50+ UI styles** (glassmorphism, minimalism, brutalism, dark mode, etc.)
- **161 color palettes** organized by product type
- **57 font pairings** for consistent typography
- **161 product types** with reasoning rules
- **99 UX guidelines** across 10 priority categories
- **25 chart types** with accessibility standards
- Support for **10 technology stacks** (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, HTML/CSS)

## When to Use This Skill

**Must use** when tasks involve UI structure, visual design decisions, interaction patterns, or UX quality control. Key triggers include designing new pages, creating UI components, choosing color schemes, reviewing code for UX, or implementing navigation.

**Skip** for backend logic, API design, infrastructure work, or non-visual automation tasks.

## Core Rule Categories (Priority 1-10)

The skill organizes best practices into 10 priority tiers:

1. **Accessibility** (CRITICAL) — "Minimum 4.5:1 contrast ratio for text; visible focus rings; descriptive alt text"
2. **Touch & Interaction** (CRITICAL) — "Minimum 44×44pt touch targets with 8px+ spacing between them"
3. **Performance** (HIGH) — "WebP/AVIF images, lazy loading, layout shift prevention"
4. **Style Selection** (HIGH) — "Match style to product; use SVG icons, not emojis; maintain consistency"
5. **Layout & Responsive** (HIGH) — "Mobile-first design, no horizontal scroll, systematic breakpoints"
6. **Typography & Color** (MEDIUM) — "Base 16px, 1.5 line-height, semantic color tokens"
7. **Animation** (MEDIUM) — "150–300ms duration, motion conveys meaning, respect reduced-motion"
8. **Forms & Feedback** (MEDIUM) — "Visible labels, errors near fields, progressive disclosure"
9. **Navigation Patterns** (HIGH) — "Bottom nav ≤5 items, predictable back, deep linking support"
10. **Charts & Data** (LOW) — "Accessible color palettes, legends, tooltips, table alternatives"

## Workflow

### Step 1: Analyze Requirements
Extract product type, target audience, style keywords, and technology stack.

### Step 2: Generate Design System (REQUIRED)
Apply recommendations: pattern, style, colors, typography, effects, and anti-patterns based on product type and audience.

### Step 3: Supplement with Domain Knowledge
Draw from available domains: product type, style, typography, color, landing patterns, charts, UX, and stack-specific guidelines.

### Step 4: Stack Guidelines
Apply React Native / Expo-specific conventions: SafeAreaView, TouchableOpacity 44pt targets, FlatList for large lists, Platform.OS branching, elevation shadows on Android, hairlineWidth borders.

## Key Accessibility Rules

- Contrast: 4.5:1 minimum for body text, 3:1 for large text
- Focus states: Visible 2–4px rings on interactive elements
- Touch targets: 44×44pt minimum (iOS) / 48×48dp (Android)
- Labels: Visible per input field, never placeholder-only
- Keyboard navigation: Full support with logical tab order
- Color: Never convey information by color alone; include text or icons

## Common Anti-Patterns to Avoid

- Icon-only buttons without descriptive labels
- Mixing flat and skeuomorphic styles randomly
- Using emojis as structural UI icons
- Placeholder-only form labels
- Layout shifts during content loading (CLS issues)
- No focus indicators
- Reliance on hover-only interactions
- Tiny touch targets (<44pt)
- Animating width/height (use transform instead)
- Gray-on-gray text with poor contrast

## Pre-Delivery Checklist

- No emoji icons (use SVG/MaterialCommunityIcons)
- Touch targets ≥44×44pt with clear pressed feedback
- 4.5:1 text contrast in both light and dark modes
- Safe areas respected for headers and bottom bars
- 4/8dp spacing rhythm maintained
- Reduced motion and dynamic text scaling supported
- All interactive elements have screen reader labels
- Form errors appear near relevant fields with recovery paths

## React Native / Expo Specifics (CAST App Stack)

- Use `SafeAreaView` from `react-native-safe-area-context` with explicit `edges`
- `TouchableOpacity` with `activeOpacity={0.85}` for all interactive elements
- `MaterialCommunityIcons` from `@expo/vector-icons` — never emoji as UI icons
- `LinearGradient` from `expo-linear-gradient` for accent surfaces
- `elevation` tokens from `constants/theme` (`card`, `raised`, `glow`) for depth
- `radius` tokens: `xs:6 sm:10 md:14 lg:18 xl:24 full:9999` — soft, rounded scale
- Color tokens from `constants/theme`: `primary #00D4AA`, `secondary #F59E0B`, `accentBlue #2DD4FF`, `background #0A0E1A`, `surface #101827`, `surface2 #121C2D`
- Bottom tab bar: ≤5 items, 64px height, `paddingBottom:10`
- FlatList over ScrollView + map for lists >10 items
- `KeyboardAvoidingView` on all forms with `behavior: Platform.OS === 'ios' ? 'padding' : undefined`
