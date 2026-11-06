import { useEffect, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { motionEasing, motionExitDuration } from "./motion";

/**
 * 접는 목록 한 줄(디자인 시스템 Accordion). 제목 줄을 누르면 답이 펼쳐지고
 * 화살표가 아래→위로 돈다(펼칠 때 200ms, 닫을 때 120ms, 동작 줄이기면 바로).
 * 행 아래에 1px border 선이 있어 여러 개를 그냥 쌓으면 된다.
 */
export function Accordion({
  title,
  children,
  defaultExpanded = false,
  style,
  testID,
}: {
  title: string;
  /** 답. 문자열이면 14/22 text-muted 로 그린다. */
  children: ReactNode;
  defaultExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(defaultExpanded ? 1 : 0);

  useEffect(() => {
    const target = expanded ? 1 : 0;
    progress.set(
      reduceMotion
        ? target
        : withTiming(
            target,
            expanded
              ? {
                  duration: theme.motion.duration.base,
                  easing: motionEasing.standard,
                }
              : {
                  duration: motionExitDuration(theme.motion.duration.base),
                  easing: motionEasing.exit,
                },
          ),
    );
  }, [expanded, progress, reduceMotion]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
  }));
  // chevron-right 를 90°(아래)에서 -90°(위)로 돌린다.
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${90 - progress.value * 180}deg` }],
  }));

  const onContentLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  return (
    <View testID={testID} style={[styles.item, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <AppText variant="body" weight="semibold" style={styles.title}>
          {title}
        </AppText>
        <Animated.View style={chevronStyle}>
          <AppIcon
            name="chevron-right"
            size={20}
            color={theme.colors.textMuted}
          />
        </Animated.View>
      </Pressable>
      <Animated.View
        style={[styles.body, bodyStyle]}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      >
        <View style={styles.content} onLayout={onContentLayout}>
          {typeof children === "string" ? (
            <AppText variant="label" tone="muted" style={styles.answer}>
              {children}
            </AppText>
          ) : (
            children
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
    paddingVertical: theme.spacing["3"],
  },
  title: {
    flex: 1,
  },
  body: {
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: theme.spacing["4"],
  },
  answer: {
    lineHeight: 22,
    fontWeight: theme.fontWeight.regular,
  },
});
