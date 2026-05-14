import { Platform } from 'react-native';

// ShepherdVerse Brand Colors
export const Colors = {
  primary: '#2C5F2E',
  primaryLight: '#4A8C4D',
  primaryDark: '#1A3D1C',
  secondary: '#D4AF37',
  background: '#FAFAF7',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textLight: '#FFFFFF',
  border: '#E8E8E0',
  verseHighlight: '#FFF8E7',
  notification: '#C8102E',

  // Dark mode variants (we'll use these in Phase 2)
  dark: {
    primary: '#4A8C4D',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    border: '#2C2C2C',
    verseHighlight: '#2A2510',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Typography = {
  heading1: { fontSize: 28, fontWeight: '700' as const },
  heading2: { fontSize: 22, fontWeight: '600' as const },
  heading3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 26 },
  verse: { fontSize: 17, lineHeight: 28, fontStyle: 'italic' as const },
  caption: { fontSize: 13, lineHeight: 18 },
  reference: { fontSize: 14, fontWeight: '600' as const },
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const BorderRadius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};