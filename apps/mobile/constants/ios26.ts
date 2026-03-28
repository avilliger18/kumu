/**
 * Light-mode design tokens matched to the web app theme.
 * Colors derived from apps/web/src/app/globals.css (light :root vars).
 */
export const ios26Colors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg: "#F5F6FA",                // web --background  oklch(0.9785 0.0045 258.3245)
  surface: "#FFFFFF",           // web --card        oklch(1 0 0)
  surfaceElevated: "#EEF2F9",   // slightly elevated light blue-tinted surface
  surfaceHigh: "#E3E8F0",       // further elevated
  sheet: "#FFFFFF",

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: "#152E4F",       // web --foreground  oklch(0.3421 0.069 251.7764) dark navy
  textSecondary: "#152E4F99",   // 60% opacity navy
  textMuted: "#6A6A6A",         // web --muted-foreground oklch(0.556 0 0)

  // ── Separators ───────────────────────────────────────────────────────────
  separator: "rgba(21,46,79,0.12)",
  separatorStrong: "rgba(21,46,79,0.08)",

  // ── Accents ──────────────────────────────────────────────────────────────
  accent: "#152E4F",            // web --primary dark navy
  accentStrong: "#152E4F",

  // ── Semantic ─────────────────────────────────────────────────────────────
  success: "#1A9E5A",
  warning: "#E6AE00",
  danger: "#E6000F",            // web --destructive oklch(0.577 0.245 27.325)
} as const;

export const ios26Radii = {
  sm: 8,
  md: 12,
  card: 16,
  pill: 100,
} as const;
