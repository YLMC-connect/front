import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { motionEasing } from "./motion";
import { Text } from "./text";

export type PasswordStrengthLevel = "weak" | "medium" | "strong";

/**
 * 비밀번호 강도. 가입 규칙(8자 이상 + 영문·숫자 조합)을 못 채우면 약함,
 * 채우면 보통, 거기에 12자 이상이거나 특수문자가 있으면 강함.
 */
export function passwordStrengthOf(password: string): PasswordStrengthLevel {
  const meetsRule =
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  if (!meetsRule) return "weak";
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) return "strong";
  return "medium";
}

const LEVELS: Record<
  PasswordStrengthLevel,
  { filled: number; label: string; bar: string; text: string }
> = {
  weak: {
    filled: 1,
    label: "약함",
    bar: theme.colors.dangerIcon,
    text: theme.colors.dangerText,
  },
  medium: {
    filled: 2,
    label: "보통",
    bar: theme.colors.warningIcon,
    text: theme.colors.warningText,
  },
  strong: {
    filled: 3,
    label: "강함",
    bar: theme.colors.successIcon,
    text: theme.colors.successText,
  },
};

function StrengthSegment({
  on,
  color,
  delay,
  reduceMotion,
  testID,
}: {
  on: boolean;
  color: string;
  delay: number;
  reduceMotion: boolean;
  testID?: string;
}) {
  const fill = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    const target = on ? 1 : 0;
    fill.set(
      reduceMotion
        ? target
        : withDelay(
            delay * theme.motion.stagger,
            withTiming(target, {
              duration: theme.motion.duration.base,
              easing: motionEasing.standard,
            }),
          ),
    );
  }, [on, fill, reduceMotion, delay]);
  const fillStyle = useAnimatedStyle(() => ({ opacity: fill.value }));

  return (
    <View style={styles.segment} testID={testID}>
      <Animated.View
        style={[styles.segmentFill, { backgroundColor: color }, fillStyle]}
        testID={testID ? `${testID}-fill` : undefined}
      />
    </View>
  );
}

/**
 * 디자인 시스템 PasswordStrength. 막대 세 칸(높이 4, 간격 4)과 단계 이름을 함께 보여
 * 색만으로 강도를 전하지 않는다. 규칙 안내는 이 부품 밖에 둔다.
 */
export function PasswordStrength({
  password,
  testID = "password-strength",
}: {
  password: string;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const level = LEVELS[passwordStrengthOf(password)];

  return (
    <View
      accessible
      accessibilityLabel={`비밀번호 강도 ${level.label}`}
      style={styles.root}
      testID={testID}
    >
      <View style={styles.bars}>
        {[0, 1, 2].map((index) => (
          <StrengthSegment
            key={index}
            on={index < level.filled}
            color={level.bar}
            delay={index}
            reduceMotion={reduceMotion}
            testID={`${testID}-bar-${index}`}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: level.text }]}>{level.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["2"],
    marginTop: theme.spacing["2"],
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing["1"],
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: "hidden",
  },
  segmentFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.radius.full,
  },
  label: {
    ...theme.typography.caption,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
  },
});
