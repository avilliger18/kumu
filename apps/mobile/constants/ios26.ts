/**
 * iOS 26 dark-mode design tokens.
 * Colors match Apple's UIKit system palette (dark appearance).
 */
export const ios26Colors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg: "#000000",
  surface: "#1C1C1E",           // systemGray6 dark
  surfaceElevated: "#2C2C2E",   // systemGray5 dark
  surfaceHigh: "#3A3A3C",       // systemGray4 dark
  sheet: "#1C1C1E",

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: "#FFFFFF",
  textSecondary: "#EBEBF599",   // label / 60 %
  textMuted: "#8E8E93",         // systemGray

  // ── Separators ───────────────────────────────────────────────────────────
  separator: "rgba(84,84,88,0.65)",
  separatorStrong: "rgba(84,84,88,0.36)",

  // ── Accents ──────────────────────────────────────────────────────────────
  accent: "#0A84FF",
  accentStrong: "#0A84FF",

  // ── Semantic ─────────────────────────────────────────────────────────────
  success: "#30D158",
  warning: "#FF9F0A",
  danger: "#FF453A",
} as const;

export const ios26Radii = {
  sm: 8,
  md: 12,
  card: 16,
  pill: 100,
} as const;
