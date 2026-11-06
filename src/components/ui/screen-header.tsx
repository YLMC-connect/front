import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode, RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { useScaleHeightForFont } from "../../lib/fontScale";
import { AppText } from "./app-text";
import { GlassBackdrop } from "./glass-backdrop";

export const SCREEN_HEADER_HEIGHT = 89;
export const SCREEN_HEADER_COMPACT_HEIGHT = 60;
export const SCREEN_HEADER_VERTICAL_PADDING = 20;
export const SCREEN_HEADER_COMPACT_VERTICAL_PADDING = 15;
const BOTTOM_FADE_HEIGHT = 16;
/** 아래 가장자리 그라데이션 끝 색(bg 투명). 디자인 시스템에 토큰이 없는 값. */
const BOTTOM_FADE_COLORS = [
  theme.colors.barGlass,
  "rgba(246,247,249,0)",
] as const;
/** 머리글 높이. 글자 크기 설정이 크면 함께 커진다(StickyHeaderScreen 계산도 이 값을 쓴다). */
export function useScreenHeaderHeight(compact = false) {
  const scale = useScaleHeightForFont();
  return scale(compact ? SCREEN_HEADER_COMPACT_HEIGHT : SCREEN_HEADER_HEIGHT);
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  blurTarget,
  topInset = 0,
  compact = false,
  bottomFade = false,
  testID = "screen-header",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  blurTarget?: RefObject<View | null>;
  topInset?: number;
  compact?: boolean;
  /**
   * 아래 가장자리 그라데이션(16)으로 내용과 이어 준다. 바로 아래에 고정 컨트롤(세그먼트·칩)이
   * 붙는 화면은 그 컨트롤 아래에 그라데이션이 와야 하므로 끈 채로 둔다.
   */
  bottomFade?: boolean;
  testID?: string;
}) {
  const headerHeight = useScreenHeaderHeight(compact);
  const verticalPadding = compact
    ? SCREEN_HEADER_COMPACT_VERTICAL_PADDING
    : SCREEN_HEADER_VERTICAL_PADDING;
  const actionTop = (headerHeight - theme.layout.touchTarget) / 2;

  return (
    <View
      testID={testID}
      style={[
        styles.header,
        bottomFade ? styles.headerWithFade : null,
        {
          height: headerHeight + topInset,
          paddingTop: verticalPadding + topInset,
          paddingBottom: verticalPadding,
        },
      ]}
    >
      <GlassBackdrop blurTarget={blurTarget} testID={testID} />
      {bottomFade ? (
        <LinearGradient
          colors={BOTTOM_FADE_COLORS}
          pointerEvents="none"
          style={styles.bottomFade}
          testID={`${testID}-fade`}
        />
      ) : null}
      <View style={[styles.text, right ? styles.textWithAction : null]}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? (
        <View style={[styles.action, { top: actionTop + topInset }]}>
          {right}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.layout.screenX,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    overflow: "hidden",
    justifyContent: "center",
  },
  // 그라데이션이 머리글 아래로 나가야 하므로 그때만 자르지 않는다.
  headerWithFade: {
    overflow: "visible",
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    height: BOTTOM_FADE_HEIGHT,
  },
  text: {
    minWidth: 0,
  },
  textWithAction: {
    // Room for home "내 정보" chip (avatar + label), not icon-only 44px.
    paddingRight: 120,
  },
  subtitle: {
    marginTop: 2,
  },
  action: {
    position: "absolute",
    right: theme.layout.screenX,
    minWidth: theme.layout.touchTarget,
    minHeight: theme.layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
