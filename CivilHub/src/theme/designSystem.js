// src/theme/designSystem.js
// -----------------------------------------------------------------------------
// CivilHub Unified Design System
// Ultra-luxurious, state-of-the-art Architectural & Engineering Theme
// -----------------------------------------------------------------------------

export const THEME = {
  colors: {
    // Primary Architectural Palette
    obsidian: "#080e1a",
    navy: "#0f172a",
    slate: "#1e293b",
    slateLight: "#334155",
    slateSubtle: "#475569",

    // Dynamic Accents
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    accentLight: "#3b82f6",
    accentGlow: "rgba(37, 99, 235, 0.25)",

    cyan: "#0284c7",
    cyanLight: "#0ea5e9",
    cyanGlow: "rgba(14, 165, 233, 0.2)",

    emerald: "#059669",
    emeraldLight: "#10b981",
    emeraldSoft: "#ecfdf5",
    emeraldBorder: "#a7f3d0",

    amber: "#d97706",
    amberLight: "#f59e0b",
    amberSoft: "#fffbeb",
    amberBorder: "#fde68a",

    danger: "#dc2626",
    dangerLight: "#ef4444",
    dangerSoft: "#fef2f2",
    dangerBorder: "#fecaca",

    // Backgrounds & Surfaces
    bg: "#f8fafc",
    bgWarm: "#f1f5f9",
    cardBg: "#ffffff",
    cardBgGlass: "rgba(255, 255, 255, 0.95)",
    border: "#e2e8f0",
    borderSubtle: "#f1f5f9",
    borderFocus: "#2563eb",

    // Typography Colors
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    textLight: "#f8fafc",
    textWhite: "#ffffff",
  },

  gradients: {
    hero: ["#070d18", "#0f172a", "#1e293b"],
    heroOverlay: ["rgba(8,14,26,0.45)", "rgba(15,23,42,0.85)", "#0f172a"],
    azure: ["#1e40af", "#2563eb", "#38bdf8"],
    cyan: ["#0369a1", "#0284c7", "#38bdf8"],
    emerald: ["#065f46", "#059669", "#10b981"],
    amber: ["#92400e", "#d97706", "#f59e0b"],
    cardGlow: ["#ffffff", "#f8fafc"],
    darkCard: ["#1e293b", "#0f172a"],
  },

  shadows: {
    sm: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    card: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 4,
    },
    hover: {
      shadowColor: "#2563eb",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
    hero: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 12,
    },
  },

  layout: {
    maxWidth: 1140,
    container: {
      width: "100%",
      maxWidth: 1140,
      alignSelf: "center",
    },
    cardRadius: 20,
    innerRadius: 14,
    pillRadius: 999,
  },
};
