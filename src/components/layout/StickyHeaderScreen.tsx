import { BlurTargetView } from "expo-blur";
import { useNavigation, useScrollToTop } from "expo-router";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBlurTarget } from "./TabBlurTargetContext";
import {
  SCREEN_HEADER_HEIGHT,
  ScreenHeader,
  useScreenHeaderHeight,
} from "../ui/screen-header";
import { GlassBackdrop } from "../ui/glass-backdrop";
import { OfflineBanner } from "../ui/offline-banner";
import { RefreshIndicator } from "../ui/spinner";
import { theme } from "../../constants/theme";
import { Screen } from "./Screen";

const HIDE_SCROLL_DISTANCE = 12;
const SHOW_SCROLL_DISTANCE = 4;

/**
 * sticky 컨트롤 스크롤 숨김 방식
 * - direction: 짧은 아래로 스크롤 시 hide (레거시)
 * - past-inset: sticky 영역(높이)을 지나 리스트로 들어갔을 때만 hide
 * - never: 스크롤로 숨기지 않음 (검색 pin / 도킹형 탭)
 */
export type StickyControlsHideMode = "direction" | "past-inset" | "never";

/** 디자인 시스템 PullToRefresh: 64px 이상 당겼다 놓으면 새로고침. */
const PULL_TO_REFRESH_DISTANCE = 64;
/** 새로고침 표시를 보여 주는 최소 시간. 응답이 빨라도 스피너가 한 바퀴(0.8초)는 돌게. */
const PULL_REFRESH_MIN_MS = 800;

export function StickyHeaderScreen({
  title,
  subtitle,
  right,
  compact = false,
  children,
  overlay,
  stickyControls,
  stickyControlsCollapsedHeight,
  stickyControlsHeight = 0,
  stickyControlsHeightProgress,
  stickyControlsInset = stickyControlsHeight,
  stickyControlsAlwaysVisible = false,
  stickyControlsHideMode = "direction",
  stickyControlsRevealKey,
  scrollStateResetKey,
  onScrollOffsetChange,
  scrollRef,
  resetScrollOnFocus = false,
  shouldHandleScroll,
  contentContainerStyle,
  testID,
  refreshing,
  onRefresh,
  onEndReached,
  onEndReachedThreshold,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  compact?: boolean;
  children: ReactNode;
  overlay?: ReactNode;
  stickyControls?: ReactNode;
  stickyControlsCollapsedHeight?: number;
  stickyControlsHeight?: number;
  stickyControlsHeightProgress?: SharedValue<number>;
  stickyControlsInset?: number;
  stickyControlsAlwaysVisible?: boolean;
  stickyControlsHideMode?: StickyControlsHideMode;
  stickyControlsRevealKey?: string | number;
  scrollStateResetKey?: string | number;
  onScrollOffsetChange?: (offsetY: number) => void;
  scrollRef?: RefObject<ScrollView | null>;
  resetScrollOnFocus?: boolean;
  shouldHandleScroll?: () => boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID: string;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}) {
  const navigation = useNavigation();
  const localScrollRef = useRef<ScrollView | null>(null);
  const effectiveScrollRef = scrollRef ?? localScrollRef;
  // 이미 보고 있는 탭을 다시 누르면 맨 위로 올린다.
  useScrollToTop(effectiveScrollRef);
  const localBlurTarget = useRef<View | null>(null);
  const sharedBlurTarget = useTabBlurTarget();
  const blurTarget = sharedBlurTarget ?? localBlurTarget;
  const insets = useSafeAreaInsets();
  const topInset = insets.top;
  const [controlsHidden, setControlsHidden] = useState(false);
  const [seenRevealKey, setSeenRevealKey] = useState(stickyControlsRevealKey);
  const [seenScrollResetKey, setSeenScrollResetKey] =
    useState(scrollStateResetKey);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  // 응답이 빨라도 새로고침 표시를 최소 PULL_REFRESH_MIN_MS 동안 보여 준다.
  const [pullHoldDone, setPullHoldDone] = useState(true);
  if (isPullRefreshing && pullHoldDone && !refreshing) {
    setIsPullRefreshing(false);
  }
  const isPullRefreshVisible = isPullRefreshing;
  // 위로 더 당긴 거리(px, 4px 단위·64 까지). 당기는 동안 RefreshIndicator 를 보여 주는 데 쓴다.
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastScrollY = useRef(0);
  const downwardDistance = useRef(0);
  const upwardDistance = useRef(0);
  const hasStickyControls = Boolean(stickyControls && stickyControlsHeight > 0);
  const hideThreshold = Math.max(stickyControlsInset, stickyControlsHeight, 1);

  const handlePullRefresh = () => {
    if (isPullRefreshing) return;
    setIsPullRefreshing(true);
    setPullHoldDone(false);
    onRefresh?.();
  };

  useEffect(() => {
    if (pullHoldDone) return;
    const timer = setTimeout(() => setPullHoldDone(true), PULL_REFRESH_MIN_MS);
    return () => clearTimeout(timer);
  }, [pullHoldDone]);

  useEffect(() => {
    if (!resetScrollOnFocus) return;
    const unsubscribe = navigation?.addListener?.("focus", () => {
      effectiveScrollRef.current?.scrollTo({ y: 0, animated: false });
      lastScrollY.current = 0;
      downwardDistance.current = 0;
      upwardDistance.current = 0;
      setControlsHidden(false);
      onScrollOffsetChange?.(0);
    });
    return unsubscribe;
  }, [
    navigation,
    resetScrollOnFocus,
    effectiveScrollRef,
    onScrollOffsetChange,
  ]);

  useEffect(() => {
    if (stickyControlsRevealKey === undefined) return;
    downwardDistance.current = 0;
    upwardDistance.current = 0;
  }, [stickyControlsRevealKey]);

  useEffect(() => {
    if (scrollStateResetKey === undefined) return;
    lastScrollY.current = 0;
    downwardDistance.current = 0;
    upwardDistance.current = 0;
  }, [scrollStateResetKey]);

  if (
    stickyControlsRevealKey !== undefined &&
    stickyControlsRevealKey !== seenRevealKey
  ) {
    setSeenRevealKey(stickyControlsRevealKey);
    setControlsHidden(false);
  }

  if (
    scrollStateResetKey !== undefined &&
    scrollStateResetKey !== seenScrollResetKey
  ) {
    setSeenScrollResetKey(scrollStateResetKey);
    setControlsHidden(false);
  }

  if (stickyControlsHideMode === "never" && controlsHidden) {
    setControlsHidden(false);
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (onRefresh) {
      // 매 프레임 다시 그리지 않도록 4px 단위로, 다 진해지는 64 까지만 센다.
      const pull = Math.min(
        Math.round(Math.max(-event.nativeEvent.contentOffset.y, 0) / 4) * 4,
        PULL_TO_REFRESH_DISTANCE,
      );
      if (pull !== pullDistance) setPullDistance(pull);
    }
    const offsetY = Math.max(event.nativeEvent.contentOffset.y, 0);
    if (shouldHandleScroll && !shouldHandleScroll()) {
      lastScrollY.current = offsetY;
      onScrollOffsetChange?.(offsetY);
      return;
    }

    if (stickyControlsAlwaysVisible || stickyControlsHideMode === "never") {
      setControlsHidden(false);
      lastScrollY.current = offsetY;
      onScrollOffsetChange?.(offsetY);
      return;
    }

    if (stickyControlsHideMode === "past-inset") {
      // 필터/세그먼트 예약 높이를 지나 리스트로 들어갔을 때만 숨김.
      // 영역 안에서는 항상 표시 (살짝 스크롤해도 사라지지 않음).
      setControlsHidden(offsetY >= hideThreshold);
      lastScrollY.current = offsetY;
      onScrollOffsetChange?.(offsetY);
      return;
    }

    // direction mode (default)
    const delta = offsetY - lastScrollY.current;

    if (offsetY <= 1) {
      downwardDistance.current = 0;
      upwardDistance.current = 0;
      setControlsHidden(false);
    } else if (delta > 0) {
      downwardDistance.current += delta;
      upwardDistance.current = 0;
      if (downwardDistance.current >= HIDE_SCROLL_DISTANCE) {
        setControlsHidden(true);
        downwardDistance.current = 0;
      }
    } else if (delta < 0) {
      upwardDistance.current += -delta;
      downwardDistance.current = 0;
      if (upwardDistance.current >= SHOW_SCROLL_DISTANCE) {
        setControlsHidden(false);
        upwardDistance.current = 0;
      }
    }

    lastScrollY.current = offsetY;
    onScrollOffsetChange?.(offsetY);

    const { layoutMeasurement, contentSize } = event.nativeEvent;
    const threshold = onEndReachedThreshold ?? 160;
    if (
      onEndReached &&
      contentSize?.height != null &&
      layoutMeasurement?.height != null &&
      contentSize.height > layoutMeasurement.height &&
      layoutMeasurement.height + offsetY >= contentSize.height - threshold
    ) {
      onEndReached();
    }
  };

  const headerHeight = useScreenHeaderHeight(compact);

  const totalTopPadding =
    headerHeight + topInset + (hasStickyControls ? stickyControlsInset : 0);

  return (
    <Screen applyTopInset={false} scroll={false} padded={false} testID={testID}>
      <View style={styles.root}>
        <BlurTargetView ref={blurTarget} style={styles.target}>
          <ScrollView
            ref={effectiveScrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={isPullRefreshVisible}
                  onRefresh={handlePullRefresh}
                  // 기본 스피너는 숨기고 디자인 시스템 RefreshIndicator 를 위에 띄운다.
                  tintColor="transparent"
                  colors={["transparent"]}
                  progressBackgroundColor="transparent"
                  progressViewOffset={totalTopPadding + 10}
                />
              ) : undefined
            }
            contentContainerStyle={[
              styles.content,
              contentContainerStyle,
              {
                paddingTop: totalTopPadding,
              },
            ]}
            onScroll={handleScroll}
            // iOS 기본 새로고침은 훨씬 길게 당겨야 시작돼서, 64px 이상 당겼다 놓으면 직접 시작한다.
            onScrollBeginDrag={() => setIsDragging(true)}
            onScrollEndDrag={(event) => {
              setIsDragging(false);
              if (
                onRefresh &&
                -event.nativeEvent.contentOffset.y >= PULL_TO_REFRESH_DISTANCE
              ) {
                handlePullRefresh();
              }
            }}
            scrollEventThrottle={16}
            testID={`${testID}-scroll`}
          >
            <Pressable
              accessible={false}
              onPress={Keyboard.dismiss}
              style={styles.scrollInner}
            >
              <OfflineBanner testID={`${testID}-offline-banner`} />
              {children}
            </Pressable>
          </ScrollView>
        </BlurTargetView>
        {onRefresh ? (
          <PullRefreshLayer
            dragging={isDragging}
            pullDistance={pullDistance}
            refreshing={isPullRefreshVisible}
            testID={`${testID}-refresh-indicator`}
            top={totalTopPadding}
          />
        ) : null}
        {hasStickyControls ? (
          <StickyControlsLayer
            blurTarget={blurTarget}
            collapsedHeight={stickyControlsCollapsedHeight}
            height={stickyControlsHeight}
            heightProgress={stickyControlsHeightProgress}
            hidden={controlsHidden && !stickyControlsAlwaysVisible}
            resetKey={scrollStateResetKey}
            testID={`${testID}-sticky-controls`}
            top={headerHeight + topInset}
          >
            {stickyControls}
          </StickyControlsLayer>
        ) : null}
        <ScreenHeader
          blurTarget={blurTarget}
          compact={compact}
          right={right}
          subtitle={subtitle}
          title={title}
          topInset={topInset}
        />
        {overlay ? (
          <View
            pointerEvents="box-none"
            style={styles.overlay}
            testID={`${testID}-overlay`}
          >
            {overlay}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

/** 새로고침 표시가 다 내려왔을 때 sticky 영역 아래 여백. */
const PULL_INDICATOR_REST = theme.spacing["2"];
/** 숨었을 때 sticky 영역 뒤로 올라가 있는 거리(표시 높이 정도). */
const PULL_INDICATOR_HIDE = 56;

/**
 * 디자인 시스템 PullToRefresh 움직임: 당기는 만큼 스피너가 sticky 영역 아래에서 내려오고,
 * 놓으면 0.8초 주기로 돌다가 끝나면 위로 올라가며 사라진다.
 */
function PullRefreshLayer({
  dragging,
  pullDistance,
  refreshing,
  testID,
  top,
}: {
  dragging: boolean;
  pullDistance: number;
  refreshing: boolean;
  testID: string;
  top: number;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const exitDuration = theme.motion.duration.base * theme.motion.exitRatio;
  // 끝난 뒤 위로 사라지는 동안에도 스피너는 계속 돌고 문구도 남긴다.
  const [exiting, setExiting] = useState(false);
  const [wasRefreshing, setWasRefreshing] = useState(refreshing);
  if (refreshing !== wasRefreshing) {
    setWasRefreshing(refreshing);
    setExiting(!refreshing);
  }
  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => setExiting(false), exitDuration);
    return () => clearTimeout(timer);
  }, [exiting, exitDuration]);
  const target = refreshing
    ? 1
    : dragging
      ? Math.min(pullDistance / PULL_TO_REFRESH_DISTANCE, 1)
      : 0;

  useEffect(() => {
    // 당기는 동안은 손가락을 바로 따라가고, 놓은 뒤 사라질 때만 퇴장 시간으로 물러난다.
    progress.set(
      dragging || reduceMotion
        ? target
        : withTiming(target, {
            duration: target === 0 ? exitDuration : theme.motion.duration.fast,
          }),
    );
  }, [dragging, exitDuration, progress, reduceMotion, target]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY:
          PULL_INDICATOR_REST - PULL_INDICATOR_HIDE * (1 - progress.value),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.refreshIndicatorBar, { top }, animatedStyle]}
    >
      <RefreshIndicator
        refreshing={refreshing || exiting}
        // 새로고침할 만큼 당겼으면 놓기 전부터 돌고, 놓으면 그 각도에서 이어서 돈다.
        spinning={
          refreshing ||
          exiting ||
          (dragging && pullDistance >= PULL_TO_REFRESH_DISTANCE)
        }
        testID={testID}
      />
    </Animated.View>
  );
}

function StickyControlsLayer({
  blurTarget,
  children,
  height,
  collapsedHeight = height,
  heightProgress,
  hidden,
  resetKey,
  testID,
  top,
}: {
  blurTarget: RefObject<View | null>;
  children: ReactNode;
  collapsedHeight?: number;
  height: number;
  heightProgress?: SharedValue<number>;
  hidden: boolean;
  resetKey?: string | number;
  testID: string;
  top: number;
}) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const previousHeight = useRef(height);

  useEffect(() => {
    const heightChanged = previousHeight.current !== height;
    previousHeight.current = height;
    const nextValue = hidden ? -height : 0;
    // Height-only changes while already hidden: snap to new offset.
    // Visibility changes: animate (unless reduce motion).
    translateY.value =
      reduceMotion || (hidden && heightChanged)
        ? nextValue
        : withTiming(nextValue, { duration: theme.motion.duration.base });
  }, [height, hidden, reduceMotion, translateY]);

  useEffect(() => {
    if (resetKey === undefined) return;

    cancelAnimation(translateY);
    translateY.set(0);
  }, [resetKey, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightProgress
      ? collapsedHeight + (height - collapsedHeight) * heightProgress.value
      : height,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
      pointerEvents={hidden ? "none" : "auto"}
      style={[styles.stickyControls, { height, top }, animatedStyle]}
      testID={testID}
    >
      <GlassBackdrop blurTarget={blurTarget} testID={`${testID}-glass`} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  target: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: SCREEN_HEADER_HEIGHT,
  },
  scrollInner: {
    flexGrow: 1,
  },
  stickyControls: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 19,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 25,
  },
  refreshIndicatorBar: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
});
