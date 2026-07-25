import designTokens from "./designTokens.json";
import { appFont } from "./fonts";

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
  /** One strong page lead — bold, not extrabold (calmer product tone). */
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeight.bold,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: fontWeight.bold,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: fontWeight.semibold,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: fontWeight.semibold,
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
  /** Inner padding for list cards (density pass: slightly tighter than 16). */
  cardPadding: 12,
  contentGap: 8,
  listGap: 12,
  /** Square thumb on market/group list rows. */
  listThumb: 88,
  touchTarget: 44,
} as const;

const motion = {
  duration: {
    fast: 140,
    base: 200,
    overlay: 220,
    /** Soft screen enter — a bit longer than base so fade-up reads calmly. */
    enter: 280,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 12,
  },
  scale: {
    pressed: 0.97,
    tabIcon: 1.12,
    enterFrom: 0.92,
    popFrom: 0.9,
  },
  /** Gap between staggered enter blocks (logo → title → form → cta). */
  stagger: 60,
  spring: {
    damping: 18,
    stiffness: 260,
    mass: 0.8,
  },
} as const;

const shadow = {
  /** List cards use border only; keep a near-flat token for rare call sites. */
  card: {
    shadowColor: "rgba(20,30,18,0.12)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  raised: {
    shadowColor: "rgba(20,30,18,0.18)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  float: {
    shadowColor: "rgba(20,30,18,0.22)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  fab: {
    shadowColor: "rgba(20,30,18,0.28)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  primary: {
    shadowColor: "rgba(91,122,176,0.35)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
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
  font: appFont,
  typography,
  layout,
  motion,
  shadow,
} as const;
