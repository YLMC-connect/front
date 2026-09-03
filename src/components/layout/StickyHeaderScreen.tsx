import { BlurTargetView } from "expo-blur";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
import { SCREEN_HEADER_HEIGHT, ScreenHeader } from "../ui/screen-header";
import { GlassBackdrop } from "../ui/glass-backdrop";
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

export function StickyHeaderScreen({
  title,
  subtitle,
  right,
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
  shouldHandleScroll,
  contentContainerStyle,
  testID,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
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
  shouldHandleScroll?: () => boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID: string;
}) {
  const localBlurTarget = useRef<View | null>(null);
  const sharedBlurTarget = useTabBlurTarget();
  const blurTarget = sharedBlurTarget ?? localBlurTarget;
  const insets = useSafeAreaInsets();
  const topInset = insets.top;
  const [controlsHidden, setControlsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const downwardDistance = useRef(0);
  const upwardDistance = useRef(0);
  const hasStickyControls = Boolean(stickyControls && stickyControlsHeight > 0);
  const hideThreshold = Math.max(stickyControlsInset, stickyControlsHeight, 1);

  useEffect(() => {
    if (stickyControlsRevealKey === undefined) return;

    downwardDistance.current = 0;
    upwardDistance.current = 0;
    setControlsHidden(false);
  }, [stickyControlsRevealKey]);

  useEffect(() => {
    if (scrollStateResetKey === undefined) return;

    lastScrollY.current = 0;
    downwardDistance.current = 0;
    upwardDistance.current = 0;
    setControlsHidden(false);
  }, [scrollStateResetKey]);

  useEffect(() => {
    if (stickyControlsHideMode === "never") {
      setControlsHidden(false);
    }
  }, [stickyControlsHideMode]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
  };

  return (
    <Screen applyTopInset={false} scroll={false} padded={false} testID={testID}>
      <View style={styles.root}>
        <BlurTargetView ref={blurTarget} style={styles.target}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.content,
              contentContainerStyle,
              {
                paddingTop:
                  SCREEN_HEADER_HEIGHT +
                  topInset +
                  (hasStickyControls ? stickyControlsInset : 0),
              },
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            testID={`${testID}-scroll`}
          >
            {children}
          </ScrollView>
          {overlay}
        </BlurTargetView>
        {hasStickyControls ? (
          <StickyControlsLayer
            blurTarget={blurTarget}
            collapsedHeight={stickyControlsCollapsedHeight}
            height={stickyControlsHeight}
            heightProgress={stickyControlsHeightProgress}
            hidden={controlsHidden && !stickyControlsAlwaysVisible}
            resetKey={scrollStateResetKey}
            testID={`${testID}-sticky-controls`}
            top={SCREEN_HEADER_HEIGHT + topInset}
          >
            {stickyControls}
          </StickyControlsLayer>
        ) : null}
        <ScreenHeader
          blurTarget={blurTarget}
          right={right}
          subtitle={subtitle}
          title={title}
          topInset={topInset}
        />
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
    translateY.value = 0;
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
    paddingTop: SCREEN_HEADER_HEIGHT,
  },
  stickyControls: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 19,
    overflow: "hidden",
  },
});
