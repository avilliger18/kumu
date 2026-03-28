import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#F5F6FA",
    foreground: "#152E4F",
    card: "#FFFFFF",
    cardForeground: "#152E4F",

    primary: "#152E4F",
    primaryForeground: "#FAFAFA",
    secondary: "#CCDDEF",
    secondaryForeground: "#152E4F",

    muted: "#F3F3F3",
    mutedForeground: "#6A6A6A",
    accent: "#F3F3F3",
    accentForeground: "#0F0F0F",

    destructive: "#E6000F",

    border: "#E3E3E3",
    input: "#E3E3E3",
    ring: "#9A9A9A",

    text: "#152E4F",
    tint: "#152E4F",
    icon: "#6A6A6A",
    tabIconDefault: "#6A6A6A",
    tabIconSelected: "#152E4F",
  },
  dark: {
    background: "#151718",
    foreground: "#ECEDEE",
    card: "#1E2022",
    cardForeground: "#ECEDEE",
    primary: "#ECEDEE",
    primaryForeground: "#1E2022",
    secondary: "#2A2D2F",
    secondaryForeground: "#ECEDEE",
    muted: "#2A2D2F",
    mutedForeground: "#9BA1A6",
    accent: "#2A2D2F",
    accentForeground: "#ECEDEE",
    destructive: "#FF4444",
    border: "#3A3D3F",
    input: "#3A3D3F",
    ring: "#687076",
    text: "#ECEDEE",
    tint: "#FFFFFF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",

    serif: "ui-serif",

    rounded: "ui-rounded",

    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
