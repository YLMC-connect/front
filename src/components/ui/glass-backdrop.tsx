import { BlurView } from "expo-blur";
import type { RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";

export function GlassBackdrop({
  blurTarget,
  intensity = 32,
  testID,
  tintColor = theme.colors.bg,
  tintOpacity = 0.72,
}: {
  blurTarget?: RefObject<View | null>;
  intensity?: number;
  testID: string;
  tintColor?: string;
  tintOpacity?: number;
}) {
  return (
    <>
      <BlurView
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget}
        intensity={intensity}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        testID={`${testID}-blur`}
        tint="light"
      />
      <View
        pointerEvents="none"
        style={[
          styles.tint,
          { backgroundColor: tintColor, opacity: tintOpacity },
        ]}
        testID={`${testID}-tint`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
});
