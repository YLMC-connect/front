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
/** Gentle ease — less front-loaded than out(cubic), calmer for church-app tone. */
const softEasing = Easing.bezier(0.22, 0.61, 0.36, 1);
const softTiming = (duration: number) => ({
  duration,
  easing: softEasing,
});

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
    scale.value = reduceMotion
      ? 1
      : withTiming(nextScale, { duration: theme.motion.duration.fast });
  };

  const motionStyle =
    typeof style === "function"
      ? (state: PressableStateCallbackType) => [style(state), animatedStyle]
      : [style, animatedStyle];

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) updateScale(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!disabled) updateScale(1);
        onPressOut?.(event);
      }}
      style={motionStyle}
    />
  );
}

type MotionPresenceOptions = {
  duration?: number;
  enterReady?: boolean;
};

export function useMotionPresence(
  visible: boolean,
  {
    duration = theme.motion.duration.overlay,
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
    progress.value = 0;
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
        progress.value = reduceMotion ? 1 : withTiming(1, { duration });
      }
      return;
    }

    if (!mountedRef.current) return;

    if (reduceMotion) {
      progress.value = 0;
      mountedRef.current = false;
      setMounted(false);
      return;
    }

    progress.value = withTiming(0, { duration }, (finished) => {
      if (finished) {
        runOnJS(finishUnmount)();
      }
    });
  }, [duration, enterReady, finishUnmount, progress, reduceMotion, visible]);

  return { hideImmediately, mounted, progress, reduceMotion };
}

export function motionStaggerDelay(index: number) {
  return index * theme.motion.stagger;
}

type MotionEnterProps = {
  children: ReactNode;
  delay?: number;
  enabled?: boolean;
  mode?: "fadeUp" | "settle";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Soft enter for auth/list blocks.
 * Uses in-flow opacity/transform (not layout `entering`) so web keeps reserved space
 * and children do not float over later form fields.
 */
export function MotionEnter({
  children,
  delay = 0,
  enabled = true,
  mode = "fadeUp",
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
      withTiming(1, softTiming(theme.motion.duration.enter)),
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

    return {
      opacity: progress.value,
      transform: [
        {
          translateY: theme.motion.distance.md * (1 - progress.value),
        },
      ],
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

/** One-shot horizontal shake for validation feedback. */
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

    const distance = theme.motion.distance.xs + 1;
    const step = Math.round(theme.motion.duration.base / 5);
    offset.value = withSequence(
      withTiming(-distance, { duration: step, easing: softEasing }),
      withTiming(distance, { duration: step, easing: softEasing }),
      withTiming(-distance, { duration: step, easing: softEasing }),
      withTiming(distance, { duration: step, easing: softEasing }),
      withTiming(0, { duration: step, easing: softEasing }),
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

/** Mount-time fade for inline error / success copy. Keeps layout in flow. */
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
    progress.value = withTiming(1, softTiming(theme.motion.duration.fast));
  }, [progress, reduceMotion, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
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
    progress.value = withTiming(1, softTiming(theme.motion.duration.base));
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
