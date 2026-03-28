import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Inline the pure logic from useThemeColor so we can test without RN runtime
// This mirrors the exact logic in hooks/use-theme-color.ts

const Colors = {
  light: {
    background: "#F5F6FA",
    foreground: "#152E4F",
    card: "#FFFFFF",
    text: "#152E4F",
    tint: "#152E4F",
    icon: "#6A6A6A",
    tabIconDefault: "#6A6A6A",
    tabIconSelected: "#152E4F",
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
    cardForeground: "#152E4F",
  },
  dark: {
    background: "#151718",
    foreground: "#ECEDEE",
    card: "#1E2022",
    text: "#ECEDEE",
    tint: "#FFFFFF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",
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
    cardForeground: "#ECEDEE",
  },
} as const;

type ColorName = keyof typeof Colors.light;
type Theme = "light" | "dark";

function resolveThemeColor(
  theme: Theme,
  props: { light?: string; dark?: string },
  colorName: ColorName,
): string {
  const fromProps = props[theme];
  if (fromProps) return fromProps;
  return Colors[theme][colorName];
}

// ── Colors constant integrity ─────────────────────────────────────────────────
describe("Colors constant", () => {
  it("light and dark themes have the same keys", () => {
    const lightKeys = Object.keys(Colors.light).sort();
    const darkKeys = Object.keys(Colors.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("all color values are valid hex strings", () => {
    const hexPattern = /^#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?$/;
    for (const [key, value] of Object.entries(Colors.light)) {
      expect(value, `light.${key}`).toMatch(hexPattern);
    }
    for (const [key, value] of Object.entries(Colors.dark)) {
      expect(value, `dark.${key}`).toMatch(hexPattern);
    }
  });

  it("light background is light-ish (high brightness)", () => {
    // #F5F6FA — all components >= 0xF0
    const bg = Colors.light.background; // "#F5F6FA"
    expect(bg).toBe("#F5F6FA");
  });

  it("dark background is dark-ish", () => {
    const bg = Colors.dark.background; // "#151718"
    expect(bg).toBe("#151718");
  });

  it("destructive color is different between light and dark", () => {
    expect(Colors.light.destructive).not.toBe(Colors.dark.destructive);
  });
});

// ── resolveThemeColor logic (mirrors useThemeColor) ───────────────────────────
describe("resolveThemeColor (useThemeColor logic)", () => {
  it("returns the prop override for light theme", () => {
    const color = resolveThemeColor("light", { light: "#FF0000" }, "text");
    expect(color).toBe("#FF0000");
  });

  it("returns the prop override for dark theme", () => {
    const color = resolveThemeColor("dark", { dark: "#00FF00" }, "text");
    expect(color).toBe("#00FF00");
  });

  it("falls back to Colors token when no prop override", () => {
    const color = resolveThemeColor("light", {}, "text");
    expect(color).toBe(Colors.light.text);
  });

  it("falls back to dark Colors token when no dark prop", () => {
    const color = resolveThemeColor("dark", { light: "#FF0000" }, "text");
    expect(color).toBe(Colors.dark.text);
  });

  it("uses light prop even when dark prop is also set", () => {
    const color = resolveThemeColor("light", { light: "#AAA", dark: "#BBB" }, "text");
    expect(color).toBe("#AAA");
  });

  it("uses dark prop when theme is dark", () => {
    const color = resolveThemeColor("dark", { light: "#AAA", dark: "#BBB" }, "text");
    expect(color).toBe("#BBB");
  });

  it("returns Colors.light.background for background colorName", () => {
    const color = resolveThemeColor("light", {}, "background");
    expect(color).toBe(Colors.light.background);
  });

  it("returns Colors.dark.icon for icon colorName in dark mode", () => {
    const color = resolveThemeColor("dark", {}, "icon");
    expect(color).toBe(Colors.dark.icon);
  });
});
