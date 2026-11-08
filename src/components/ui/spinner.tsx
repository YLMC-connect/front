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
const SPINNER_STROKE = 2.5;
/** 한 바퀴 도는 시간. */
const SPINNER_TURN = 800;

/**
 * 디자인 시스템 PullToRefresh 스피너. `primary-subtle` 고리 위에 `primary` 한 조각이 돈다.
 * 동작 줄이기 설정이면 멈춘 모습으로 둔다.
 */
export function Spinner({
  animating = true,
  testID,
}: {
  /** false 면 돌지 않고 멈춘 모습(당기는 중). 다시 돌 때는 멈춘 각도에서 이어서 돈다. */
  animating?: boolean;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !animating) {
      cancelAnimation(rotation);
      return;
    }
    const from = rotation.get();
    rotation.set(
      withRepeat(
        withTiming(from + 360, {
          duration: SPINNER_TURN,
          easing: Easing.linear,
        }),
        -1,
      ),
    );
    return () => cancelAnimation(rotation);
  }, [animating, reduceMotion, rotation]);

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.spinner, arcStyle]}
      testID={testID}
    />
  );
}

/**
 * 당겨서 새로고침 표시(디자인 시스템 `.ylmc-refresh`). 스피너 24 아래에
 * "새로고침하는 중" 12/600 `text-muted`(간격 8). 당기는 동안은 멈춘 스피너만 보인다.
 */
export function RefreshIndicator({
  refreshing = true,
  testID,
}: {
  refreshing?: boolean;
  testID?: string;
}) {
  return (
    <View
      accessible={refreshing}
      accessibilityLabel={refreshing ? "새로고침하는 중" : undefined}
      accessibilityLiveRegion="polite"
      style={styles.refresh}
      testID={testID}
    >
      <Spinner animating={refreshing} />
      <Text style={[styles.label, refreshing ? null : styles.labelHidden]}>
        새로고침하는 중
      </Text>
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
    borderRadius: SPINNER_SIZE / 2,
    borderWidth: SPINNER_STROKE,
    borderColor: theme.colors.primarySubtle,
    borderTopColor: theme.colors.primary,
  },
  refresh: {
    alignItems: "center",
    gap: theme.spacing["2"],
    paddingVertical: theme.spacing["1"],
  },
  label: {
    ...theme.typography.caption,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.textMuted,
  },
  labelHidden: {
    opacity: 0,
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
