import type { ReactNode, RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { GlassBackdrop } from "./glass-backdrop";

export const SCREEN_HEADER_HEIGHT = 89;
export const SCREEN_HEADER_VERTICAL_PADDING = 20;
const SCREEN_HEADER_ACTION_TOP =
  (SCREEN_HEADER_HEIGHT - theme.layout.touchTarget) / 2;

export function ScreenHeader({
  title,
  subtitle,
  right,
  blurTarget,
  topInset = 0,
  testID = "screen-header",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  blurTarget?: RefObject<View | null>;
  topInset?: number;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      style={[
        styles.header,
        {
          height: SCREEN_HEADER_HEIGHT + topInset,
          paddingTop: SCREEN_HEADER_VERTICAL_PADDING + topInset,
          paddingBottom: SCREEN_HEADER_VERTICAL_PADDING,
        },
      ]}
    >
      <GlassBackdrop blurTarget={blurTarget} testID={testID} />
      <View style={[styles.text, right ? styles.textWithAction : null]}>
        <AppText variant="screenTitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? (
        <View
          style={[styles.action, { top: SCREEN_HEADER_ACTION_TOP + topInset }]}
        >
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
