import { BlurView } from "expo-blur";
import type { ReactNode, RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";

export const SCREEN_HEADER_HEIGHT = 78;
const SCREEN_HEADER_TOP_PADDING = 20;
const SCREEN_HEADER_ACTION_TOP = 13;

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
          paddingTop: SCREEN_HEADER_TOP_PADDING + topInset,
        },
      ]}
    >
      <BlurView
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget}
        intensity={32}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        testID={`${testID}-blur`}
        tint="light"
      />
      <View
        pointerEvents="none"
        style={styles.tint}
        testID={`${testID}-tint`}
      />
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
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.bg,
    opacity: 0.72,
  },
  text: {
    minWidth: 0,
  },
  textWithAction: {
    paddingRight: theme.layout.touchTarget + theme.spacing[2],
  },
  subtitle: {
    marginTop: 2,
  },
  action: {
    position: "absolute",
    right: theme.layout.screenX,
    minWidth: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
