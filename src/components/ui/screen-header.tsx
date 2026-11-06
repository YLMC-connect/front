import type { ReactNode, RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { GlassBackdrop } from "./glass-backdrop";

export const SCREEN_HEADER_HEIGHT = 89;
export const SCREEN_HEADER_COMPACT_HEIGHT = 60;
export const SCREEN_HEADER_VERTICAL_PADDING = 20;
export const SCREEN_HEADER_COMPACT_VERTICAL_PADDING = 15;
const SCREEN_HEADER_ACTION_TOP =
  (SCREEN_HEADER_HEIGHT - theme.layout.touchTarget) / 2;

export function ScreenHeader({
  title,
  subtitle,
  right,
  blurTarget,
  topInset = 0,
  compact = false,
  testID = "screen-header",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  blurTarget?: RefObject<View | null>;
  topInset?: number;
  compact?: boolean;
  testID?: string;
}) {
  const headerHeight = compact
    ? SCREEN_HEADER_COMPACT_HEIGHT
    : SCREEN_HEADER_HEIGHT;
  const verticalPadding = compact
    ? SCREEN_HEADER_COMPACT_VERTICAL_PADDING
    : SCREEN_HEADER_VERTICAL_PADDING;
  const actionTop = compact
    ? (SCREEN_HEADER_COMPACT_HEIGHT - theme.layout.touchTarget) / 2
    : SCREEN_HEADER_ACTION_TOP;

  return (
    <View
      testID={testID}
      style={[
        styles.header,
        {
          height: headerHeight + topInset,
          paddingTop: verticalPadding + topInset,
          paddingBottom: verticalPadding,
        },
      ]}
    >
      <GlassBackdrop blurTarget={blurTarget} testID={testID} />
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
