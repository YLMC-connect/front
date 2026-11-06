import designTokens from "./designTokens.json";
import { appFont } from "./fonts";

/**
 * 디자인 시스템 v2 토큰(ADR 0007). designTokens.json 은
 * scripts/sync-design-tokens.mjs 가 design-system/tokens.json 에서 만든다.
 */
const ds = designTokens;
const c = ds.colors;

/**
 * 옛 색 이름 → v2 값. 도메인 화면을 옮기는 동안만 두고 정리 PR(#236)에서 지운다.
 * 새 코드는 v2 이름만 쓴다. 쓰임새로 갈리는 이름은 가장 가까운 v2 값으로 임시로 둔다(ADR 0007 2.2).
 */
const legacyColors = {
  ink: c.text,
  textPrimary: c.text,
  inkSoft: c.neutral700, // 쓰임새로 text / textMuted 로 나눈다
  textSecondary: c.neutral700,
  inkMute: c.textMuted,
  inkHint: c.neutral400, // placeholder → textMuted, 비활성 → textDisabled
  primaryDeep: c.primaryStrong,
  primarySoft: c.primarySubtle,
  primaryTint: c.primary50, // primarySubtle 또는 infoSubtle
  surface2: c.neutral50, // 입력창 → surface, 나머지 → surfaceSubtle
  surfaceMuted: c.surfaceSubtle,
  line: c.border,
  lineStrong: c.border, // 컨트롤 → borderStrong, Outline 버튼 → borderButton
  ring: c.border,
  glass: c.barGlass,
  overlay: c.sheetOverlay,
  toast: c.neutral900, // 컴포넌트 PR 에서 흰 토스트로
  warn: c.warningText,
  danger: c.dangerText,
  success: c.successText,
  white: c.onPrimary,
  amberSoft: c.warningSubtle,
  sage: c.success400, // 아바타 → avatar1~6
} as const;

const colors = { ...c, ...legacyColors };

const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

type FontWeight = (typeof fontWeight)[keyof typeof fontWeight];
type TextRole = {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
};

/** JSON 의 fontWeight 는 string 이라 RN 이 받는 값으로 좁힌다. */
const t = ds.typography as Record<keyof typeof ds.typography, TextRole>;

/** 디자인 시스템 글자 6단계. 카드 제목은 body 에 fontWeight 600. */
const typography = t;

/** 옛 글자 크기 이름 → v2 6단계. 도메인 PR 에서 typography 로 옮긴다. */
const fontSize = {
  xs: t.caption.fontSize,
  sm: t.caption.fontSize,
  md: t.label.fontSize,
  base: t.body.fontSize,
  lg: t.body.fontSize,
  xl: t.heading.fontSize,
  "2xl": t.title.fontSize,
  display: t.display.fontSize,
};

const lineHeight = {
  xs: t.caption.lineHeight,
  sm: t.caption.lineHeight,
  md: t.label.lineHeight,
  body: t.body.lineHeight,
  lg: t.body.lineHeight,
  xl: t.heading.lineHeight,
  "2xl": t.title.lineHeight,
  display: t.display.lineHeight,
};

const layout = {
  screenX: ds.spacing["5"],
  sectionGap: ds.spacing["8"],
  cardPadding: ds.spacing["4"],
  contentGap: ds.spacing["2"],
  listGap: ds.spacing["3"],
  /** Square thumb on market/group list rows. */
  listThumb: 88,
  touchTarget: ds.size.buttonHeightSm,
} as const;

const motion = {
  duration: {
    ...ds.duration,
    // 옛 이름 별칭
    overlay: ds.duration.base,
    enter: ds.duration.slow,
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
  stagger: ds.duration.stagger,
  spring: {
    damping: 18,
    stiffness: 260,
    mass: 0.8,
  },
} as const;

/**
 * v2 그림자는 sm·md·lg·sheet 네 가지. 아래 옛 이름은 컴포넌트 PR(#228)에서
 * v2 이름으로 옮기거나 지운다(ADR 0007 2.4).
 */
const shadow = {
  ...ds.shadow,
  /** 목록 카드 — v2 는 shadow.sm 만 쓰지만 Card 의 테두리를 빼는 #228 까지 그대로 둔다. */
  card: {
    shadowColor: "rgba(25,31,40,0.12)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  raised: {
    shadowColor: "rgba(25,31,40,0.18)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  float: {
    shadowColor: "rgba(25,31,40,0.22)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  /** 디자인 시스템 Fab 규격 그림자(0 8 12 rgba(25,31,40,.16)) — 토큰 목록 밖의 부품 전용 값. */
  fab: {
    shadowColor: "rgb(25,31,40)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 5,
  },
  primary: {
    shadowColor: "rgba(62,104,200,0.32)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  dialog: ds.shadow.lg,
  toast: ds.shadow.lg,
};

export const theme = {
  colors,
  spacing: ds.spacing,
  radius: ds.radius,
  fontSize,
  lineHeight,
  fontWeight,
  font: appFont,
  typography,
  layout,
  motion,
  shadow,
  size: ds.size,
  zIndex: ds.zIndex,
  opacity: ds.opacity,
} as const;
