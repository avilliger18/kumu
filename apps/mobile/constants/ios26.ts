import { DarkTheme, type Theme } from "@react-navigation/native";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const ios26Colors = {
  background: "#050507",
  chrome: "#111214",
  chromeSoft: "rgba(17,18,20,0.88)",
  sheet: "#151619",
  surface: "#1B1D21",
  surfaceElevated: "#23262C",
  surfaceMuted: "#2B2F36",
  separator: "rgba(255,255,255,0.08)",
  separatorStrong: "rgba(255,255,255,0.14)",
  textPrimary: "#F5F7FA",
  textSecondary: "#98A2B3",
  textMuted: "#6C7280",
  accent: "#4DA3FF",
  accentStrong: "#0A84FF",
  success: "#30D158",
  warning: "#FF9F0A",
  danger: "#FF5F57",
  overlay: "rgba(0,0,0,0.34)",
} as const;

export const ios26Radii = {
  card: 22,
  pill: 999,
  sheet: 32,
} as const;

export const ios26BlurEffect = "systemChromeMaterialDark" as const;

export const ios26NavigationTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: ios26Colors.accentStrong,
    background: ios26Colors.background,
    card: ios26Colors.chrome,
    border: ios26Colors.separator,
    notification: ios26Colors.danger,
    text: ios26Colors.textPrimary,
  },
};

export const ios26StackScreenOptions: NativeStackNavigationOptions = {
  headerTintColor: ios26Colors.textPrimary,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: ios26Colors.background,
  },
  headerTitleStyle: {
    color: ios26Colors.textPrimary,
    fontWeight: "600",
  },
  contentStyle: {
    backgroundColor: ios26Colors.background,
  },
};

export const ios26GlassHeaderOptions: NativeStackNavigationOptions = {
  ...ios26StackScreenOptions,
  headerTransparent: true,
  headerBlurEffect: ios26BlurEffect,
};

export const ios26SheetOptions: NativeStackNavigationOptions = {
  presentation: "formSheet",
  headerShown: false,
  contentStyle: {
    backgroundColor: ios26Colors.sheet,
  },
  sheetAllowedDetents: [0.5, 1],
  sheetInitialDetentIndex: 0,
  sheetGrabberVisible: true,
  sheetCornerRadius: ios26Radii.sheet,
  sheetExpandsWhenScrolledToEdge: true,
  sheetLargestUndimmedDetentIndex: 0,
};
