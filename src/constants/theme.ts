const colors = {
  primary: "#5B7AB0",
  primaryDeep: "#47608E",
  primarySoft: "rgba(91, 122, 176, 0.14)",
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

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
} as const;
