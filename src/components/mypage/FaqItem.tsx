import { useEffect, useState } from "react";
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
import { AppIcon } from "@/components/ui/app-icon";
import { Text } from "@/components/ui/text";
import { theme } from "../../constants/theme";
import { motionEasing, motionExitDuration } from "../ui/motion";

/**
 * FAQ 한 줄. 디자인 시스템 Accordion 과 같은 움직임(펼칠 때 200ms, 닫을 때 120ms)에
 * 앞에 조용한 Q(16/700 primary-strong) 를 붙이고, 답은 Q 너비만큼 들여 쓴다.
 */
export function FaqItem({
  question,
  answer,
  style,
}: {
  question: string;
  answer: string;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(0);

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
    <View style={[styles.item, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Text style={styles.q}>Q</Text>
        <Text style={styles.question}>{question}</Text>
        <Animated.View style={chevronStyle}>
          <AppIcon
            name="chevron-right"
            size={20}
            color={theme.colors.borderStrong}
          />
        </Animated.View>
      </Pressable>
      <Animated.View
        style={[styles.body, bodyStyle]}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      >
        <View style={styles.content} onLayout={onContentLayout}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const Q_WIDTH = 20;

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing["3"],
    paddingVertical: theme.spacing["4"],
  },
  q: {
    width: Q_WIDTH,
    color: theme.colors.primaryStrong,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  question: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  body: {
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingLeft: Q_WIDTH + theme.spacing["3"],
    paddingBottom: theme.spacing["4"],
  },
  answer: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: 22,
  },
});
