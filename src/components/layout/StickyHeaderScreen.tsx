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

export function StickyHeaderScreen({
  title,
  subtitle,
  right,
  children,
  overlay,
  stickyControls,
  stickyControlsHeight = 0,
  stickyControlsInset = stickyControlsHeight,
  stickyControlsAlwaysVisible = false,
  onScrollOffsetChange,
  contentContainerStyle,
  testID,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
  stickyControls?: ReactNode;
  stickyControlsHeight?: number;
  stickyControlsInset?: number;
  stickyControlsAlwaysVisible?: boolean;
  onScrollOffsetChange?: (offsetY: number) => void;
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = Math.max(event.nativeEvent.contentOffset.y, 0);
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
            height={stickyControlsHeight}
            hidden={controlsHidden && !stickyControlsAlwaysVisible}
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
  hidden,
  testID,
  top,
}: {
  blurTarget: RefObject<View | null>;
  children: ReactNode;
  height: number;
  hidden: boolean;
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
    translateY.value =
      reduceMotion || (hidden && heightChanged)
        ? nextValue
        : withTiming(nextValue, { duration: theme.motion.duration.base });
  }, [height, hidden, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
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
