/**
 * App theme configuration
 * Palette matched to the "Task Management & To-Do List" UI kit (violet accent)
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
    backgroundSelected: "#ede9fe",

    // Semantic tokens
    card: "#ffffff",
    cardForeground: "#171717",

    popover: "#ffffff",
    popoverForeground: "#171717",

    primary: "#6f48e4",
    primaryForeground: "#ffffff",

    secondary: "#ede9fe",
    secondaryForeground: "#4c1d95",

    muted: "#f5f5f5",
    mutedForeground: "#737373",

    accent: "#ede9fe",
    accentForeground: "#4c1d95",

    destructive: "#e11d48",
    destructiveSubtle: "rgba(225, 29, 72, 0.06)",

    success: "#10b981",

    border: "#e5e5e5",
    input: "#e5e5e5",
    ring: "#a3a3a3",

    selectedCardBackground: "#f3f0ff",

    // Charts
    chart1: "#c4b5fd",
    chart2: "#a78bfa",
    chart3: "#8b5cf6",
    chart4: "#7c3aed",
    chart5: "#6d28d9",

    // Sidebar
    sidebar: "#fafafa",
    sidebarForeground: "#171717",

    sidebarPrimary: "#6f48e4",
    sidebarPrimaryForeground: "#ffffff",

    sidebarAccent: "#ede9fe",
    sidebarAccentForeground: "#4c1d95",

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
    backgroundSelected: "#2e2a44",

    // Semantic tokens
    card: "#262626",
    cardForeground: "#fafafa",

    popover: "#262626",
    popoverForeground: "#fafafa",

    primary: "#7c5cf0",
    primaryForeground: "#ffffff",

    secondary: "#2e2a44",
    secondaryForeground: "#ede9fe",

    muted: "#404040",
    mutedForeground: "#a3a3a3",

    accent: "#2e2a44",
    accentForeground: "#ede9fe",

    destructive: "#fb7185",
    destructiveSubtle: "rgba(251, 113, 133, 0.12)",

    success: "#34d399",

    border: "rgba(255,255,255,0.1)",
    input: "rgba(255,255,255,0.15)",
    ring: "#737373",

    selectedCardBackground: "#241d3a",

    // Charts
    chart1: "#c4b5fd",
    chart2: "#a78bfa",
    chart3: "#8b5cf6",
    chart4: "#7c3aed",
    chart5: "#6d28d9",

    // Sidebar
    sidebar: "#3f3f46",
    sidebarForeground: "#fafafa",

    sidebarPrimary: "#8b5cf6",
    sidebarPrimaryForeground: "#ffffff",

    sidebarAccent: "#2e2a44",
    sidebarAccentForeground: "#ede9fe",

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
