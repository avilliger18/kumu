/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Light mode palette matched to web app (apps/web/src/app/globals.css)
export const Colors = {
  light: {
    // Core
    background: '#F5F6FA',       // oklch(0.9785 0.0045 258.3245) — soft blueish white
    foreground: '#152E4F',       // oklch(0.3421 0.069 251.7764)  — dark navy
    card: '#FFFFFF',             // oklch(1 0 0)
    cardForeground: '#152E4F',

    // Interactive
    primary: '#152E4F',          // oklch(0.3421 0.069 251.7764)
    primaryForeground: '#FAFAFA',// oklch(0.985 0 0)
    secondary: '#CCDDEF',        // oklch(0.8999 0.029 249.7768)  — light blue
    secondaryForeground: '#152E4F',

    // Muted / accent
    muted: '#F3F3F3',            // oklch(0.97 0 0)
    mutedForeground: '#6A6A6A',  // oklch(0.556 0 0)
    accent: '#F3F3F3',           // oklch(0.97 0 0)
    accentForeground: '#0F0F0F', // oklch(0.205 0 0)

    // Status
    destructive: '#E6000F',      // oklch(0.577 0.245 27.325)     — vivid red

    // Borders & inputs
    border: '#E3E3E3',           // oklch(0.922 0 0)
    input: '#E3E3E3',            // oklch(0.922 0 0)
    ring: '#9A9A9A',             // oklch(0.708 0 0)

    // Navigation / legacy aliases
    text: '#152E4F',
    tint: '#152E4F',
    icon: '#6A6A6A',
    tabIconDefault: '#6A6A6A',
    tabIconSelected: '#152E4F',
  },
  dark: {
    background: '#151718',
    foreground: '#ECEDEE',
    card: '#1E2022',
    cardForeground: '#ECEDEE',
    primary: '#ECEDEE',
    primaryForeground: '#1E2022',
    secondary: '#2A2D2F',
    secondaryForeground: '#ECEDEE',
    muted: '#2A2D2F',
    mutedForeground: '#9BA1A6',
    accent: '#2A2D2F',
    accentForeground: '#ECEDEE',
    destructive: '#FF4444',
    border: '#3A3D3F',
    input: '#3A3D3F',
    ring: '#687076',
    text: '#ECEDEE',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
