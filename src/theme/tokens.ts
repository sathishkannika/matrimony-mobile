/** Design tokens ported from matrimony-ui/src/index.css. No hex literals outside this file. */
export const colors = {
  primary: '#800000',
  primaryForeground: '#FBF8EF',
  maroonDeep: '#5C0000',
  accent: '#D4AF37',
  accentForeground: '#FFFFFF',
  goldForeground: '#1F1414',
  background: '#FCFAF8',
  foreground: '#251818',
  card: '#FFFFFF',
  secondary: '#F5F0E0',
  secondaryForeground: '#5F1111',
  muted: '#F4F1EC',
  mutedForeground: '#705C5C',
  border: '#E2DED4',
  input: '#EBE7E0',
  destructive: '#C52020',
  overlay: 'rgba(0,0,0,0.4)',
  goldLight: '#E8C547',
  goldDark: '#B8942A',
  sidebarStart: '#4A0000',
  sidebarEnd: '#5C0000',
  warningBg: '#FFF3CD',
  warningText: '#856404',
} as const;

export const gradients = {
  sidebarRoyal: [colors.sidebarStart, colors.primary, colors.sidebarEnd] as const,
  cardPremium: [colors.primary, colors.accent, colors.primary] as const,
  btnGold: [colors.goldLight, colors.accent, colors.goldDark] as const,
} as const;

export const spacing = { sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;

export const fonts = {
  heading: 'PlayfairDisplay-Bold',
  headingExtra: 'PlayfairDisplay-ExtraBold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemibold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
  tamil: 'NotoSansTamil-Regular',
} as const;

export const type = {
  h1: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 32, color: colors.foreground },
  h2: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 28, color: colors.primary },
  h3: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24, color: colors.primary },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.foreground },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.mutedForeground },
  micro: { fontFamily: fonts.bodySemibold, fontSize: 10, lineHeight: 14, color: colors.mutedForeground },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 18, color: colors.foreground },
} as const;

export const shadow = {
  card: {
    shadowColor: colors.goldForeground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
