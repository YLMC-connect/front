import { AppIcon } from "@/components/ui/app-icon";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { StyleSheet, Text, View, type PressableProps } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { MotionPressable, motionEasing } from "./motion";

type IconName = ComponentProps<typeof AppIcon>["name"];

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

const { colors } = theme;

/** 디자인 시스템 Button: 변형별 바탕·눌림·글자 색. */
const variantColors: Record<
  ButtonVariant,
  {
    bg: string;
    /** 없으면 눌러도 바탕은 그대로(97% 작아짐만). */
    pressedBg?: string;
    fg: string;
    border?: string;
    pressedBorder?: string;
  }
> = {
  primary: {
    bg: colors.primary,
    pressedBg: colors.primaryStrong,
    fg: colors.onPrimary,
  },
  secondary: {
    bg: colors.primarySubtle,
    fg: colors.primaryStrong,
  },
  outline: {
    bg: colors.surface,
    pressedBg: colors.surfaceSubtle,
    fg: colors.text,
    border: colors.borderButton,
    pressedBorder: colors.neutral400,
  },
  ghost: {
    bg: "transparent",
    fg: colors.primaryStrong,
  },
  danger: {
    bg: colors.dangerBold,
    pressedBg: colors.dangerPressed,
    fg: colors.onPrimary,
  },
};

/**
 * 알약 버튼. `md` 44(카드 안·보조), `dialog` 48(다이얼로그 버튼), `lg` 52(화면 하단 주 버튼).
 * 한 화면에 primary 는 하나만 둔다.
 */
export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
  testID,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: "md" | "dialog" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  testID?: string;
  /** 처리 중(loading)에도 남는 낭독 이름. 없으면 children 이 문자열일 때 그 문자열. */
  accessibilityLabel?: string;
}) {
  const tone = variantColors[variant];
  const fg = disabled ? colors.textDisabled : tone.fg;
  const reduceMotion = useReducedMotion();
  // 비활성 바탕(surface-subtle)을 덮개로 얹고, 활성이 되면 200ms 동안 걷어 낸다.
  const disabledCover = useSharedValue(disabled ? 1 : 0);
  const disabledCoverStyle = useAnimatedStyle(() => ({
    opacity: disabledCover.value,
  }));

  useEffect(() => {
    const target = disabled ? 1 : 0;
    disabledCover.set(
      reduceMotion
        ? target
        : withTiming(target, {
            duration: theme.motion.duration.base,
            easing: motionEasing.standard,
          }),
    );
  }, [disabled, disabledCover, reduceMotion]);

  return (
    <MotionPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (typeof children === "string" ? children : undefined)
      }
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === "lg"
          ? styles.buttonLg
          : size === "dialog"
            ? styles.buttonDialog
            : styles.buttonMd,
        {
          backgroundColor: pressed && tone.pressedBg ? tone.pressedBg : tone.bg,
        },
        tone.border && !disabled
          ? {
              borderWidth: 1,
              borderColor: pressed ? tone.pressedBorder : tone.border,
            }
          : null,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.disabledCover, disabledCoverStyle]}
        testID={testID ? `${testID}-disabled-cover` : undefined}
      />
      {loading ? (
        <LoadingDots
          color={fg}
          testID={testID ? `${testID}-loading` : undefined}
        />
      ) : (
        <>
          {icon ? <AppIcon name={icon} size={18} color={fg} /> : null}
          <Text
            style={[
              size === "lg" ? styles.textLg : styles.textMd,
              { color: fg },
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </MotionPressable>
  );
}

const LOADING_DOT_COUNT = 3;
/** 점 하나가 진해지는(또는 흐려지는) 시간. 다음 점은 그 절반만큼 늦게 시작한다. */
const LOADING_DOT_STEP = 400;

function LoadingDot({
  color,
  index,
  reduceMotion,
  testID,
}: {
  color: string;
  index: number;
  reduceMotion: boolean;
  testID?: string;
}) {
  const opacity = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(opacity);
      opacity.set(1);
      return;
    }
    const dim = theme.opacity.disabled;
    opacity.set(dim);
    opacity.set(
      withDelay(
        index * (LOADING_DOT_STEP / 2),
        withRepeat(
          withSequence(
            withTiming(1, { duration: LOADING_DOT_STEP }),
            withTiming(dim, { duration: LOADING_DOT_STEP }),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(opacity);
  }, [index, opacity, reduceMotion]);

  return (
    <Animated.View
      style={[styles.loadingDot, { backgroundColor: color }, style]}
      testID={testID}
    />
  );
}

/**
 * 처리 중 표시. 글자 대신 점 세 개가 차례로 진해진다.
 * 동작 줄이기 설정이면 세 점이 모두 보이는 모습으로 멈춘다.
 */
export function LoadingDots({
  color = colors.textMuted,
  testID,
}: {
  color?: string;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <View style={styles.loadingDots} testID={testID}>
      {Array.from({ length: LOADING_DOT_COUNT }, (_, index) => (
        <LoadingDot
          key={index}
          color={color}
          index={index}
          reduceMotion={reduceMotion}
          testID={testID ? `${testID}-${index}` : undefined}
        />
      ))}
    </View>
  );
}

/** 탭바(바닥에서 14 + 높이 64) 위 16. */
export const FAB_BOTTOM = 14 + theme.size.tabbarHeight + theme.spacing["4"];

export function FloatingActionButton({
  label,
  icon = "add",
  compact = false,
  style,
  ...pressableProps
}: PressableProps & {
  label: string;
  icon?: IconName;
  compact?: boolean;
}) {
  const fabStyle = StyleSheet.flatten([
    styles.fab,
    compact ? styles.fabCompact : null,
    typeof style === "function" ? undefined : style,
  ]);

  return (
    <MotionPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      {...pressableProps}
      style={fabStyle}
    >
      <AppIcon name={icon} size={18} color={colors.onPrimary} />
      <Text style={styles.fabText}>{label}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing["2"],
  },
  buttonMd: {
    minHeight: theme.size.buttonHeightSm,
    paddingHorizontal: theme.spacing["5"],
  },
  buttonDialog: {
    minHeight: theme.size.inputHeight,
    paddingHorizontal: theme.spacing["5"],
  },
  buttonLg: {
    minHeight: theme.size.buttonHeight,
    paddingHorizontal: theme.spacing["6"],
  },
  textMd: {
    ...theme.typography.label,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
  },
  textLg: {
    ...theme.typography.body,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
  },
  disabledCover: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["1"],
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
  },
  fab: {
    position: "absolute",
    right: theme.spacing["5"],
    bottom: FAB_BOTTOM,
    zIndex: theme.zIndex.tabbar,
    minWidth: theme.size.fabHeight,
    height: theme.size.fabHeight,
    borderRadius: theme.radius.full,
    paddingLeft: theme.spacing["3"],
    paddingRight: theme.spacing["4"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing["2"],
    backgroundColor: theme.colors.primary,
    ...theme.shadow.fab,
  },
  fabCompact: {
    width: theme.size.fabHeight,
    paddingLeft: 0,
    paddingRight: 0,
  },
  fabText: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    fontFamily: theme.font.bold,
    fontWeight: "normal",
  },
});
