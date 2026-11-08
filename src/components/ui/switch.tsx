import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { motionEasing } from "./motion";
import { Text } from "./text";

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const KNOB = 22;
const KNOB_GAP = (TRACK_HEIGHT - KNOB) / 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB - KNOB_GAP * 2;

/** 트랙 48×28 + 손잡이 22. 꺼짐 `border-button`, 켜짐 `primary`. 200ms 미끄러짐. */
export function SwitchTrack({
  value,
  testID,
}: {
  value: boolean;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    const target = value ? 1 : 0;
    progress.set(
      reduceMotion
        ? target
        : withTiming(target, {
            duration: theme.motion.duration.base,
            easing: motionEasing.standard,
          }),
    );
  }, [value, progress, reduceMotion]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.borderButton, theme.colors.primary],
    ),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * KNOB_TRAVEL }],
  }));

  return (
    <Animated.View style={[styles.track, trackStyle]} testID={testID}>
      <Animated.View style={[styles.knob, knobStyle]} />
    </Animated.View>
  );
}

/**
 * 디자인 시스템 Switch. 누르는 즉시 적용되는 설정 행(최소 높이 52, 행 전체가 눌림).
 * 저장 버튼과 함께 쓰지 않는다.
 */
export function SwitchRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
  testID,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityHint={description}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.row, disabled ? styles.disabled : null]}
      testID={testID}
    >
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <SwitchTrack
        value={value}
        testID={testID ? `${testID}-track` : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: theme.radius.full,
    padding: KNOB_GAP,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  row: {
    minHeight: theme.size.buttonHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
    paddingHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing["2"],
  },
  disabled: {
    opacity: theme.opacity.disabled,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...theme.typography.body,
    fontFamily: theme.font.bold,
    fontWeight: "normal",
    color: theme.colors.text,
  },
  description: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
