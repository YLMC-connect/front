import { createContext, useContext, type RefObject } from "react";
import type { View } from "react-native";

export const TabBlurTargetContext =
  createContext<RefObject<View | null> | null>(null);

export function useTabBlurTarget() {
  return useContext(TabBlurTargetContext);
}
