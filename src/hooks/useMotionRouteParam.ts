import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { theme } from "../constants/theme";

export function useMotionRouteParam<T extends string>(
  routeValue: T,
  onCommit: (value: T) => void,
) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(routeValue);
  const commitRef = useRef(onCommit);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  commitRef.current = onCommit;

  useEffect(() => {
    setValue(routeValue);
  }, [routeValue]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const change = (nextValue: T) => {
    if (nextValue === value) return;

    setValue(nextValue);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (reduceMotion) {
      commitRef.current(nextValue);
      return;
    }

    timerRef.current = setTimeout(() => {
      commitRef.current(nextValue);
      timerRef.current = null;
    }, theme.motion.duration.base);
  };

  return [value, change] as const;
}
