import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { Text } from "./text";

const SPINNER_SIZE = 24;
const SPINNER_STROKE = 3;
/** 한 바퀴 도는 시간. */
const SPINNER_TURN = 800;

/**
 * 디자인 시스템 PullToRefresh 스피너. `primary-subtle` 고리 위에 `primary` 한 조각이 돈다.
 * 동작 줄이기 설정이면 멈춘 모습으로 둔다.
 */
export function Spinner({ testID }: { testID?: string }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(rotation);
      rotation.set(0);
      return;
    }
    rotation.set(
      withRepeat(
        withTiming(360, { duration: SPINNER_TURN, easing: Easing.linear }),
        -1,
      ),
    );
    return () => cancelAnimation(rotation);
  }, [reduceMotion, rotation]);

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.spinner}
      testID={testID}
    >
      <View style={styles.ring} />
      <Animated.View style={[styles.ring, styles.arc, arcStyle]} />
    </View>
  );
}

/** 당겨서 새로고침하는 동안 목록 맨 위에 두는 줄: 스피너 + "새로고침하는 중". */
export function RefreshIndicator({ testID }: { testID?: string }) {
  return (
    <View
      accessible
      accessibilityLabel="새로고침하는 중"
      accessibilityLiveRegion="polite"
      style={styles.row}
      testID={testID}
    >
      <Spinner />
      <Text style={styles.label}>새로고침하는 중</Text>
    </View>
  );
}

export type LoadMoreState = "idle" | "loading" | "error" | "end";

/**
 * 목록 끝 표시(디자인 시스템 LoadMore). 불러오는 중이면 스피너,
 * 실패하면 "다시 시도" 글자 버튼, 더 없으면 "마지막 글이에요".
 */
export function LoadMoreFooter({
  state,
  onRetry,
  endText = "마지막 글이에요",
  testID,
}: {
  state: LoadMoreState;
  onRetry?: () => void;
  endText?: string;
  testID?: string;
}) {
  if (state === "idle") return null;
  return (
    <View style={styles.footer} testID={testID}>
      {state === "loading" ? (
        <View accessible accessibilityLabel="더 불러오는 중">
          <Spinner testID={testID ? `${testID}-spinner` : undefined} />
        </View>
      ) : state === "error" ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onRetry}
          style={styles.retry}
          testID={testID ? `${testID}-retry` : undefined}
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      ) : (
        <Text style={styles.label}>{endText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: SPINNER_SIZE / 2,
    borderWidth: SPINNER_STROKE,
    borderColor: theme.colors.primarySubtle,
  },
  arc: {
    borderColor: "transparent",
    borderTopColor: theme.colors.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing["2"],
    paddingVertical: theme.spacing["3"],
  },
  label: {
    ...theme.typography.caption,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.textMuted,
  },
  footer: {
    minHeight: theme.size.buttonHeightSm,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["4"],
  },
  retry: {
    minHeight: theme.size.buttonHeightSm,
    justifyContent: "center",
    paddingHorizontal: theme.spacing["4"],
  },
  retryText: {
    ...theme.typography.label,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.primaryStrong,
  },
});
