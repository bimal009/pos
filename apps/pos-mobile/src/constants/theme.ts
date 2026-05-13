/**
 * App theme configuration
 * OKLCH converted to HEX values
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Base
    background: "#ffffff",
    foreground: "#171717",

    // Aliases
    text: "#171717",
    textSecondary: "#737373",
    backgroundElement: "#f5f5f5",
    backgroundSelected: "#f4f4f5",

    // Semantic tokens
    card: "#ffffff",
    cardForeground: "#171717",

    popover: "#ffffff",
    popoverForeground: "#171717",

    primary: "#dc2626",
    primaryForeground: "#fef2f2",

    secondary: "#f4f4f5",
    secondaryForeground: "#3f3f46",

    muted: "#f5f5f5",
    mutedForeground: "#737373",

    accent: "#f5f5f5",
    accentForeground: "#262626",

    destructive: "#e11d48",
    destructiveSubtle: "rgba(220, 38, 38, 0.06)",

    success: "#10b981",

    border: "#e5e5e5",
    input: "#e5e5e5",
    ring: "#a3a3a3",

    selectedCardBackground: "#f0f5ff",

    // Charts
    chart1: "#fca5a5",
    chart2: "#ef4444",
    chart3: "#dc2626",
    chart4: "#b91c1c",
    chart5: "#991b1b",

    // Sidebar
    sidebar: "#fafafa",
    sidebarForeground: "#171717",

    sidebarPrimary: "#dc2626",
    sidebarPrimaryForeground: "#fef2f2",

    sidebarAccent: "#f5f5f5",
    sidebarAccentForeground: "#262626",

    sidebarBorder: "#e5e5e5",
    sidebarRing: "#a3a3a3",

    // Radius
    radius: 10,
  },

  dark: {
    // Base
    background: "#171717",
    foreground: "#fafafa",

    // Aliases
    text: "#fafafa",
    textSecondary: "#a3a3a3",
    backgroundElement: "#404040",
    backgroundSelected: "#3f3f46",

    // Semantic tokens
    card: "#262626",
    cardForeground: "#fafafa",

    popover: "#262626",
    popoverForeground: "#fafafa",

    primary: "#991b1b",
    primaryForeground: "#fef2f2",

    secondary: "#3f3f46",
    secondaryForeground: "#fafafa",

    muted: "#404040",
    mutedForeground: "#a3a3a3",

    accent: "#404040",
    accentForeground: "#fafafa",

    destructive: "#fb7185",
    destructiveSubtle: "rgba(239, 68, 68, 0.12)",

    success: "#34d399",

    border: "rgba(255,255,255,0.1)",
    input: "rgba(255,255,255,0.15)",
    ring: "#737373",

    selectedCardBackground: "#2a181a",

    // Charts
    chart1: "#fca5a5",
    chart2: "#ef4444",
    chart3: "#dc2626",
    chart4: "#b91c1c",
    chart5: "#991b1b",

    // Sidebar
    sidebar: "#3f3f46",
    sidebarForeground: "#fafafa",

    sidebarPrimary: "#ef4444",
    sidebarPrimaryForeground: "#fef2f2",

    sidebarAccent: "#404040",
    sidebarAccentForeground: "#fafafa",

    sidebarBorder: "rgba(255,255,255,0.1)",
    sidebarRing: "#737373",

    // Radius
    radius: 10,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Translucent accents for icon illustrations (e.g. doors/windows on glyphs). */
export const IconOverlays = {
  onLightFillStrong: "rgba(0,0,0,0.25)",
  onLightFillSoft: "rgba(0,0,0,0.2)",
  onDarkFillStrong: "rgba(255,255,255,0.35)",
  onDarkFillSoft: "rgba(255,255,255,0.3)",
} as const;

/** Shared UI primitives not tied to light/dark palettes. */
export const Ui = {
  shadowColor: "#000000",
} as const;

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
    sans: "var(--font-sans)",
    serif: "var(--font-serif)",
    rounded: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
});

export const Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;
