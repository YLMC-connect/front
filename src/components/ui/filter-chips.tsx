import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
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
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

type FilterChipLayout = {
  width: number;
  x: number;
};

export function FilterChips<T extends string>({
  items,
  active,
  onChange,
  style,
  testIDPrefix,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
  testIDPrefix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<Partial<Record<T, FilterChipLayout>>>(
    {},
  );
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const didPlaceIndicator = useRef(false);
  const previousActive = useRef(active);
  const ready =
    items.length > 0 && items.every((item) => layouts[item.key] !== undefined);

  useEffect(() => {
    const activeLayout = layouts[active];
    if (!ready || !activeLayout) return;

    const shouldAnimate =
      didPlaceIndicator.current &&
      previousActive.current !== active &&
      !reduceMotion;
    const duration = theme.motion.duration.base;

    indicatorX.value = shouldAnimate
      ? withTiming(activeLayout.x, { duration })
      : activeLayout.x;
    indicatorWidth.value = shouldAnimate
      ? withTiming(activeLayout.width, { duration })
      : activeLayout.width;
    didPlaceIndicator.current = true;
    previousActive.current = active;
  }, [active, indicatorWidth, indicatorX, layouts, ready, reduceMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: ready ? 1 : 0,
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      testID={testIDPrefix ? `${testIDPrefix}-scroll` : undefined}
    >
      <View
        style={styles.track}
        testID={testIDPrefix ? `${testIDPrefix}-track` : undefined}
      >
        {ready
          ? items.map((item) => {
              const layout = layouts[item.key];
              return layout ? (
                <View
                  key={`surface-${item.key}`}
                  pointerEvents="none"
                  style={[
                    styles.surface,
                    { left: layout.x, width: layout.width },
                  ]}
                />
              ) : null;
            })
          : null}
        <Animated.View
          pointerEvents="none"
          testID={testIDPrefix ? `${testIDPrefix}-indicator` : undefined}
          style={[styles.indicator, indicatorStyle]}
        />
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <MotionPressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.key}
              onLayout={(event) => {
                const { width, x } = event.nativeEvent.layout;
                setLayouts((current) => {
                  const previous = current[item.key];
                  if (previous?.width === width && previous.x === x) {
                    return current;
                  }
                  return { ...current, [item.key]: { width, x } };
                });
              }}
              onPress={() => {
                if (!selected) onChange(item.key);
              }}
              style={[
                styles.chip,
                ready ? styles.chipReady : null,
                !ready && selected ? styles.chipSelected : null,
              ]}
              testID={testIDPrefix ? `${testIDPrefix}-${item.key}` : undefined}
            >
              <Text
                style={[styles.text, selected ? styles.textSelected : null]}
              >
                {item.label}
              </Text>
            </MotionPressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.layout.screenX,
  },
  track: {
    position: "relative",
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: theme.spacing[2],
  },
  surface: {
    position: "absolute",
    top: 0,
    height: theme.layout.touchTarget,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  indicator: {
    position: "absolute",
    top: 0,
    height: theme.layout.touchTarget,
    zIndex: 1,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ink,
  },
  chip: {
    minHeight: theme.layout.touchTarget,
    zIndex: 2,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  chipReady: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  chipSelected: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
  },
  text: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  textSelected: {
    color: theme.colors.white,
  },
});
