const colors = {
  primary: "#5B7AB0",
  primaryDeep: "#47608E",
  primarySoft: "rgba(91, 122, 176, 0.12)",
  primaryTint: "#ECF0F7",
  bg: "#F6F7F2",
  surface: "#FFFFFF",
  surface2: "#FAFBF7",
  ink: "#1E2920",
  inkSoft: "rgba(30, 41, 32, 0.72)",
  inkMute: "rgba(30, 41, 32, 0.50)",
  inkHint: "rgba(30, 41, 32, 0.30)",
  line: "rgba(30, 41, 32, 0.08)",
  lineStrong: "rgba(30, 41, 32, 0.14)",
  ring: "rgba(20, 30, 18, 0.04)",
  glass: "rgba(255,255,255,0.82)",
  glassBorder: "rgba(255,255,255,0.60)",
  overlay: "rgba(20,22,28,0.50)",
  sheetOverlay: "rgba(20,22,28,0.45)",
  toast: "rgba(28,38,30,0.94)",
  warn: "#D2A24C",
  danger: "#C97C6E",
  success: "#6B9F5C",
  white: "#FFFFFF",
  amberSoft: "#F3EFE5",
  sage: "#8FA882",
  sageSoft: "#E0E9DE",
  taupe: "#C7B89D",
  taupeSoft: "#F3E8D7",
};

const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
};

const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  pill: 9999,
};

const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  "2xl": 22,
  display: 28,
};

const lineHeight = {
  xs: 14,
  sm: 17,
  md: 20,
  body: 21,
  lg: 22,
  xl: 24,
  "2xl": 28,
  display: 34,
};

const fontWeight = {
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

const motion = {
  duration: {
    fast: 140,
    base: 200,
    overlay: 220,
  },
  distance: {
    xs: 4,
    sm: 8,
  },
  scale: {
    pressed: 0.97,
    tabIcon: 1.12,
  },
  spring: {
    damping: 18,
    stiffness: 260,
    mass: 0.8,
  },
} as const;

const shadow = {
  card: {
    shadowColor: "rgba(20,30,18,0.18)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  raised: {
    shadowColor: "rgba(20,30,18,0.18)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  float: {
    shadowColor: "rgba(20,30,18,0.22)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  fab: {
    shadowColor: "rgba(20,30,18,0.30)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: "rgba(107,130,96,0.60)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  dialog: {
    shadowColor: "rgba(0,0,0,0.40)",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  sheet: {
    shadowColor: "rgba(0,0,0,0.18)",
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },
  toast: {
    shadowColor: "rgba(0,0,0,0.35)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
  motion,
  shadow,
} as const;
