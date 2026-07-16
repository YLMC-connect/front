import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
} from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
