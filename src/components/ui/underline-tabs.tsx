import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { MotionPressable, motionEasing } from "./motion";

const TABS_PADDING_X = 18;
const INDICATOR_INSET = 16;

export function UnderlineTabs<T extends string>({
  items,
  active,
  onChange,
  variant = "indicator",
  testIDPrefix,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange?: (key: T) => void;
  variant?: "indicator" | "border";
  testIDPrefix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const tabWidth =
    items.length > 0
      ? Math.max(trackWidth - TABS_PADDING_X * 2, 0) / items.length
      : 0;
  const selectedIndex = Math.max(
    items.findIndex((item) => item.key === active),
    0,
  );
  const indicatorIndex = useSharedValue(selectedIndex);
  const didMount = useRef(false);

  // 밑줄은 고른 탭으로 보통(200ms) 동안 미끄러진다.
  useEffect(() => {
    if (!didMount.current || reduceMotion) {
      indicatorIndex.value = selectedIndex;
      didMount.current = true;
      return;
    }
    indicatorIndex.value = withTiming(selectedIndex, {
      duration: theme.motion.duration.base,
      easing: motionEasing.standard,
    });
  }, [indicatorIndex, reduceMotion, selectedIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: tabWidth > 0 ? 1 : 0,
    width: Math.max(tabWidth - INDICATOR_INSET * 2, 0),
    transform: [
      {
        translateX:
          TABS_PADDING_X + INDICATOR_INSET + indicatorIndex.value * tabWidth,
      },
    ],
  }));

  return (
    <View
      style={[styles.tabs, variant === "border" ? styles.borderTabs : null]}
      testID={testIDPrefix ? `${testIDPrefix}-track` : undefined}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (!Number.isFinite(width) || width <= 0) return;
        setTrackWidth((current) => (current === width ? current : width));
      }}
    >
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <MotionPressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={selected ? { selected: true } : {}}
            disabled={!onChange}
            onPress={() => {
              if (!selected) onChange?.(item.key);
            }}
            style={[
              styles.tab,
              variant === "border" ? styles.borderTab : null,
              variant === "border" && selected ? styles.borderTabOn : null,
            ]}
          >
            <Text style={[styles.text, selected ? styles.textOn : null]}>
              {item.label}
            </Text>
          </MotionPressable>
        );
      })}
      {variant === "indicator" ? (
        <Animated.View
          pointerEvents="none"
          testID={testIDPrefix ? `${testIDPrefix}-indicator` : undefined}
          style={[styles.indicator, indicatorStyle]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: TABS_PADDING_X,
  },
  borderTabs: {
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  borderTab: {
    minHeight: 0,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  borderTabOn: {
    borderBottomColor: theme.colors.primary,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  textOn: {
    color: theme.colors.primaryStrong,
    fontWeight: theme.fontWeight.bold,
  },
  indicator: {
    position: "absolute",
    left: 0,
    bottom: -1,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.primary,
  },
});
