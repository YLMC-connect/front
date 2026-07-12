import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";

export function Skeleton({
  width = "100%",
  height,
  radius = theme.radius.sm,
  style,
  testID,
}: {
  width?: ViewStyle["width"];
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.48);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.62;
      return;
    }
    opacity.value = withRepeat(withTiming(0.82, { duration: 720 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ListSkeleton({
  rows = 3,
  thumbnail = true,
  testID = "list-skeleton",
}: {
  rows?: number;
  thumbnail?: boolean;
  testID?: string;
}) {
  return (
    <View
      accessibilityLabel="콘텐츠 불러오는 중"
      accessibilityRole="progressbar"
      testID={testID}
      style={styles.list}
    >
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.row}>
          {thumbnail ? (
            <Skeleton width={76} height={76} radius={theme.radius.md} />
          ) : null}
          <View style={styles.lines}>
            <Skeleton width="78%" height={18} />
            <Skeleton width="100%" height={14} />
            <Skeleton width="42%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.lineStrong,
  },
  list: { width: "100%" },
  row: {
    minHeight: 104,
    marginHorizontal: theme.layout.screenX,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.layout.listGap,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  lines: {
    flex: 1,
    gap: theme.spacing[2],
  },
});
