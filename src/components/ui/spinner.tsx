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
export function Spinner({
  animating = true,
  angle = 0,
  testID,
}: {
  /** false 면 돌지 않고 `angle` 에 멈춘 모습(당기는 중). */
  animating?: boolean;
  /** 멈춰 있을 때의 각도(도). 돌기 시작하면 이 각도에서 이어서 돈다. */
  angle?: number;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(angle);

  useEffect(() => {
    if (reduceMotion || !animating) {
      cancelAnimation(rotation);
      rotation.set(angle);
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
  }, [animating, angle, reduceMotion, rotation]);

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

/**
 * 당겨서 새로고침 표시. 당기는 동안은 당긴 만큼(`progress`) 스피너가 돌아가 있고,
 * 놓아서 새로고침이 시작되면 그 각도에서 이어서 돌며 "새로고침하는 중"이 붙는다.
 * 스피너는 늘 가운데 같은 자리에 있고 글자는 그 오른쪽에 붙는다.
 */
export function RefreshIndicator({
  refreshing = true,
  progress = 1,
  testID,
}: {
  refreshing?: boolean;
  /** 당긴 정도 0~1. 멈춘 스피너의 각도를 정한다. */
  progress?: number;
  testID?: string;
}) {
  return (
    <View
      accessible={refreshing}
      accessibilityLabel={refreshing ? "새로고침하는 중" : undefined}
      accessibilityLiveRegion="polite"
      style={styles.row}
      testID={testID}
    >
      <Spinner animating={refreshing} angle={Math.min(progress, 1) * 270} />
      {refreshing ? (
        <Text style={styles.refreshLabel}>새로고침하는 중</Text>
      ) : null}
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
    alignSelf: "stretch",
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
  refreshLabel: {
    ...theme.typography.caption,
    position: "absolute",
    left: "50%",
    marginLeft: SPINNER_SIZE / 2 + theme.spacing["2"],
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
