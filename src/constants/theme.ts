import designTokens from "./designTokens.json";

const { colors, spacing, radius } = designTokens;

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
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

const typography = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeight.extrabold,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: fontWeight.extrabold,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: fontWeight.bold,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: fontWeight.bold,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: fontWeight.medium,
  },
} as const;

const layout = {
  screenX: 20,
  sectionGap: 32,
  cardPadding: 16,
  contentGap: 8,
  listGap: 12,
  touchTarget: 44,
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
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  fab: {
    shadowColor: "rgba(20,30,18,0.30)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
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
  typography,
  layout,
  motion,
  shadow,
} as const;
