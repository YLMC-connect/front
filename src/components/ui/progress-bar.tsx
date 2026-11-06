import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { motionEasing } from "./motion";

export type ProgressBarTone = "primary" | "success" | "danger";

/** 채움 색: 보통 primary, 완료 success-icon, 기한 지남 danger-icon. */
const fillColors: Record<ProgressBarTone, string> = {
  primary: theme.colors.primary,
  success: theme.colors.successIcon,
  danger: theme.colors.dangerIcon,
};

/**
 * 진행 막대(디자인 시스템 ProgressBar). 위 줄에 이름과 값을 함께 보여 주어
 * 색만으로 상태를 전하지 않는다. 값이 바뀌면(처음에는 0에서) 300ms 동안 늘어난다.
 */
export function ProgressBar({
  value,
  label,
  valueText,
  tone = "primary",
  style,
  testID,
}: {
  /** 0~100. 범위를 벗어나면 잘라 쓴다. */
  value: number;
  label?: string;
  /** 오른쪽 값 글자("완료", "37% · 지연"). 없으면 반올림한 퍼센트("64%"). */
  valueText?: string;
  tone?: ProgressBarTone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const width = useSharedValue(reduceMotion ? clamped : 0);
  const shownValue = valueText ?? `${Math.round(clamped)}%`;

  useEffect(() => {
    width.set(
      reduceMotion
        ? clamped
        : withTiming(clamped, {
            duration: theme.motion.duration.slow,
            easing: motionEasing.standard,
          }),
    );
  }, [clamped, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped),
        text: shownValue,
      }}
    >
      <View style={styles.header}>
        <AppText
          variant="caption"
          weight="semibold"
          numberOfLines={1}
          style={styles.label}
        >
          {label ?? ""}
        </AppText>
        <AppText variant="caption" tone="muted">
          {shownValue}
        </AppText>
      </View>
      <View style={styles.track}>
        <Animated.View
          testID={testID ? `${testID}-fill` : undefined}
          style={[
            styles.fill,
            { backgroundColor: fillColors[tone] },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing["2"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["2"],
  },
  label: {
    flex: 1,
  },
  track: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.full,
  },
});
