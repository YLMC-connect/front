import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/** Seamless scene (sky + character). */
const heroBanner = require("../../../assets/home/hero-banner.jpg");

type HomeHeroVisualProps = {
  fadeHeight: number;
  children?: ReactNode;
};

/** App canvas cream — theme.colors.bg (#F6F7F2). */
const BG_CREAM = "rgb(246, 247, 242)";

/**
 * 상단 히어로: 단일 배너 + idle 모션 + 하단 크림 페이드(시트와 이음).
 */
export function HomeHeroVisual({ fadeHeight, children }: HomeHeroVisualProps) {
  const reduceMotion = useReducedMotion();
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      floatY.value = 0;
      return;
    }
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, {
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, [floatY, reduceMotion]);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={styles.root} testID="home-hero-visual">
      <Animated.View style={[styles.bannerWrap, bannerStyle]}>
        <Image
          source={heroBanner}
          style={styles.banner}
          contentFit="cover"
          contentPosition="center"
          transition={200}
        />
      </Animated.View>
      <LinearGradient
        colors={[
          "rgba(246,247,242,0)",
          "rgba(246,247,242,0.35)",
          "rgba(246,247,242,0.82)",
          BG_CREAM,
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={[styles.fade, { height: fadeHeight }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bannerWrap: {
    ...StyleSheet.absoluteFillObject,
    top: -8,
    bottom: -8,
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
