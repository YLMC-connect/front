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
  const [prevRefreshing, setPrevRefreshing] = useState(refreshing);
  if (refreshing !== prevRefreshing) {
    setPrevRefreshing(refreshing);
    if (!refreshing) {
      setIsPullRefreshing(false);
    }
  }
  // 위로 더 당긴 거리(px). 당기는 동안 RefreshIndicator 를 보여 주는 데 쓴다.
  const [pullDistance, setPullDistance] = useState(0);
  const lastScrollY = useRef(0);
  const downwardDistance = useRef(0);
  const upwardDistance = useRef(0);
  const hasStickyControls = Boolean(stickyControls && stickyControlsHeight > 0);
  const hideThreshold = Math.max(stickyControlsInset, stickyControlsHeight, 1);

  const handlePullRefresh = () => {
    setIsPullRefreshing(true);
    onRefresh?.();
  };

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
      const pull = Math.round(Math.max(-event.nativeEvent.contentOffset.y, 0));
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
                  refreshing={Boolean(refreshing && isPullRefreshing)}
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
        {(refreshing && isPullRefreshing) || pullDistance > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.refreshIndicatorBar,
              {
                top: totalTopPadding,
                // 당기는 동안은 64px 에 닿을수록 진해지고, 새로고침 중에는 그대로 보인다.
                opacity:
                  refreshing && isPullRefreshing
                    ? 1
                    : Math.min(pullDistance / PULL_TO_REFRESH_DISTANCE, 1),
              },
            ]}
          >
            <RefreshIndicator
              refreshing={Boolean(refreshing && isPullRefreshing)}
              testID={`${testID}-refresh-indicator`}
            />
          </View>
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
