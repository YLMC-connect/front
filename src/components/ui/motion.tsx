import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** motion.md 곡선: 빠름 ease-out · 보통/느림 standard · 퇴장 exit. */
export const motionEasing = {
  fast: Easing.bezier(...theme.motion.easing.fast),
  standard: Easing.bezier(...theme.motion.easing.standard),
  exit: Easing.bezier(...theme.motion.easing.exit),
};
const standardTiming = (duration: number) => ({
  duration,
  easing: motionEasing.standard,
});

/** 퇴장 시간 = 등장 시간의 60% (200 → 120, 300 → 180). */
export function motionExitDuration(enterDuration: number) {
  return Math.round(enterDuration * theme.motion.exitRatio);
}

export type MotionPressableProps = PressableProps & {
  pressedScale?: number;
};

export function MotionPressable({
  disabled,
  onPressIn,
  onPressOut,
  pressedScale = theme.motion.scale.pressed,
  style,
  ...props
}: MotionPressableProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const updateScale = (nextScale: number) => {
    scale.set(
      reduceMotion
        ? 1
        : withTiming(nextScale, {
            duration: theme.motion.duration.fast,
            easing: motionEasing.fast,
          }),
    );
  };

  // Reanimated 의 AnimatedPressable 은 함수 style 을 버린다(배열로 평탄화하면 함수가 무시됨).
  // 눌림 상태를 직접 들고 함수를 미리 풀어 일반 style 로 넘긴다.
  const [pressed, setPressed] = useState(false);
  const resolvedStyle =
    typeof style === "function"
      ? style({ pressed } as PressableStateCallbackType)
      : style;
  const motionStyle = [resolvedStyle, animatedStyle];

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) updateScale(pressedScale);
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!disabled) updateScale(1);
        setPressed(false);
        onPressOut?.(event);
      }}
      style={motionStyle}
    />
  );
}

type MotionPresenceOptions = {
  /** 등장 시간. 기본 보통(200ms). */
  duration?: number;
  /** 퇴장 시간. 기본 등장의 60%. */
  exitDuration?: number;
  enterReady?: boolean;
};

export function useMotionPresence(
  visible: boolean,
  {
    duration = theme.motion.duration.base,
    exitDuration = motionExitDuration(duration),
    enterReady = true,
  }: MotionPresenceOptions = {},
) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const mountedRef = useRef(visible);
  const [mounted, setMounted] = useState(visible);
  const finishUnmount = useCallback(() => {
    mountedRef.current = false;
    setMounted(false);
  }, []);
  const hideImmediately = useCallback(() => {
    cancelAnimation(progress);
    progress.set(0);
    mountedRef.current = false;
    setMounted(false);
  }, [progress]);

  useEffect(() => {
    if (visible) {
      if (!mountedRef.current) {
        mountedRef.current = true;
        setMounted(true);
      }

      if (enterReady) {
        progress.set(
          reduceMotion ? 1 : withTiming(1, standardTiming(duration)),
        );
      }
      return;
    }

    if (!mountedRef.current) return;

    if (reduceMotion) {
      progress.set(0);
      queueMicrotask(finishUnmount);
      return;
    }

    progress.set(
      withTiming(
        0,
        { duration: exitDuration, easing: motionEasing.exit },
        (finished) => {
          if (finished) {
            runOnJS(finishUnmount)();
          }
        },
      ),
    );
  }, [
    duration,
    enterReady,
    exitDuration,
    finishUnmount,
    progress,
    reduceMotion,
    visible,
  ]);

  return { hideImmediately, mounted, progress, reduceMotion };
}

export function motionStaggerDelay(index: number) {
  return index * theme.motion.stagger;
}

type MotionEnterProps = {
  children: ReactNode;
  delay?: number;
  enabled?: boolean;
  mode?: "fade" | "fadeUp" | "settle";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * 화면 첫 진입: 느림(300ms), standard 곡선. fadeUp 은 8px 아래에서 떠오름.
 * Uses in-flow opacity/transform (not layout `entering`) so web keeps reserved space
 * and children do not float over later form fields.
 */
export function MotionEnter({
  children,
  delay = 0,
  enabled = true,
  mode = "fade",
  style,
  testID,
}: MotionEnterProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = enabled && !reduceMotion;
  const progress = useSharedValue(shouldAnimate ? 0 : 1);

  useEffect(() => {
    if (!shouldAnimate) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, standardTiming(theme.motion.duration.slow)),
    );
  }, [delay, progress, shouldAnimate]);

  const animatedStyle = useAnimatedStyle(() => {
    if (mode === "settle") {
      const scale =
        theme.motion.scale.enterFrom +
        progress.value * (1 - theme.motion.scale.enterFrom);
      return {
        opacity: progress.value,
        transform: [{ scale }],
      };
    }

    if (mode === "fadeUp") {
      return {
        opacity: progress.value,
        transform: [
          {
            translateY: theme.motion.distance.sm * (1 - progress.value),
          },
        ],
      };
    }

    return {
      opacity: progress.value,
    };
  });

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

type MotionShakeProps = {
  children: ReactNode;
  /** Change this value to fire a single shake (e.g. error text or timestamp). */
  trigger?: string | number | boolean | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** 로그인 실패 전용 흔들기: 좌우 6px 두 번, 전체 느림(300ms). 입력 오류에는 쓰지 않는다. */
export function MotionShake({
  children,
  trigger,
  style,
  testID,
}: MotionShakeProps) {
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(0);
  const lastTrigger = useRef<string | number | boolean | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (trigger == null || trigger === false || trigger === "") {
      lastTrigger.current = trigger;
      return;
    }
    if (lastTrigger.current === trigger) return;
    lastTrigger.current = trigger;

    if (reduceMotion) {
      offset.value = 0;
      return;
    }

    const distance = theme.motion.distance.shake;
    const step = standardTiming(Math.round(theme.motion.duration.slow / 5));
    offset.value = withSequence(
      withTiming(-distance, step),
      withTiming(distance, step),
      withTiming(-distance, step),
      withTiming(distance, step),
      withTiming(0, step),
    );
  }, [offset, reduceMotion, trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

type MotionFadeInProps = {
  children: ReactNode;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** 오류·안내 문구 등장: 8px 아래에서 떠오름(보통 200ms). Keeps layout in flow. */
export function MotionFadeIn({
  children,
  visible = true,
  style,
  testID,
}: MotionFadeInProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(
    reduceMotion || !visible ? (visible ? 1 : 0) : 0,
  );

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      return;
    }
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, standardTiming(theme.motion.duration.base));
  }, [progress, reduceMotion, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: theme.motion.distance.sm * (1 - progress.value) },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

type MotionPopProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Soft scale-in for success hints. Keeps layout in flow (no layout entering). */
export function MotionPop({ children, style, testID }: MotionPopProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, standardTiming(theme.motion.duration.base));
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale =
      theme.motion.scale.popFrom +
      progress.value * (1 - theme.motion.scale.popFrom);
    return {
      opacity: progress.value,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

type AnimatedProgressFillProps = {
  percent: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Smoothly fills a progress bar from 0% to `percent`% on mount and updates. */
export function AnimatedProgressFill({
  percent,
  style,
  testID,
}: AnimatedProgressFillProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, percent));
  const widthPercent = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    if (reduceMotion) {
      widthPercent.value = clamped;
      return;
    }
    widthPercent.value = withTiming(
      clamped,
      standardTiming(theme.motion.duration.slow),
    );
  }, [clamped, reduceMotion, widthPercent]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value}%`,
  }));

  return <Animated.View testID={testID} style={[style, animatedStyle]} />;
}
