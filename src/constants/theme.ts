import designTokens from "./designTokens.json";
import { appFont } from "./fonts";

/**
 * 디자인 시스템 v2 토큰(ADR 0007). designTokens.json 은
 * scripts/sync-design-tokens.mjs 가 design-system/tokens.json 에서 만든다.
 */
const ds = designTokens;
const c = ds.colors;

const colors = c;

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
  duration: ds.duration,
  /**
   * 디자인 시스템 motion.md 곡선(cubic-bezier 4값).
   * fast: 빠름(120ms) ease-out · standard: 보통·느림 · exit: 닫힘·사라짐.
   */
  easing: {
    fast: [0, 0, 0.58, 1],
    standard: [0.2, 0, 0, 1],
    exit: [0.4, 0, 1, 1],
  },
  /** 퇴장 시간 = 등장 시간 × 0.6 */
  exitRatio: 0.6,
  distance: {
    xs: 4,
    /** 기본 등장 거리(8px 아래에서 떠오름) */
    sm: 8,
    md: 12,
    /** 토스트 등장 거리 */
    lg: 16,
    /** 로그인 실패 흔들기 좌우 거리 */
    shake: 6,
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
 * v2 그림자는 sm·md·lg·sheet 네 가지(ADR 0007 2.4). fab 만 디자인 시스템 Fab 규격의
 * 부품 전용 값(0 8 12 rgba(25,31,40,.16))이다.
 */
const shadow = {
  ...ds.shadow,
  fab: {
    shadowColor: "rgb(25,31,40)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 5,
  },
};

export const theme = {
  colors,
  spacing: ds.spacing,
  radius: ds.radius,
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
