import { AppIcon } from "@/components/ui/app-icon";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { Chip } from "./display";
import { MotionPressable } from "./motion";

const SEGMENT_GAP = 4;
const SEGMENT_PADDING = 4;

export function TopBar({
  title,
  subtitle,
  back,
  right,
  onBack,
  testID,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  onBack?: () => void;
  testID?: string;
}) {
  return (
    <View testID={testID} style={styles.topBar}>
      {back ? (
        <MotionPressable
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <AppIcon name="chevron-left" size={22} color={theme.colors.inkSoft} />
          <AppText variant="caption" tone="secondary">
            뒤로
          </AppText>
        </MotionPressable>
      ) : null}
      <View
        testID={testID ? `${testID}-title` : undefined}
        pointerEvents={back ? "none" : "auto"}
        style={[styles.topTextWrap, back ? styles.topTextWrapCentered : null]}
      >
        <AppText numberOfLines={1} variant="sectionTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" style={styles.topSubtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={styles.topRight}>{right}</View> : null}
    </View>
  );
}

export function SegmentedTabs<T extends string>({
  items,
  active,
  onChange,
  style,
  testIDPrefix,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
  testIDPrefix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const gapWidth = Math.max(items.length - 1, 0) * SEGMENT_GAP;
  const contentWidth = Math.max(trackWidth - SEGMENT_PADDING * 2 - gapWidth, 0);
  const itemWidth = items.length > 0 ? contentWidth / items.length : 0;
  const selectedIndex = Math.max(
    items.findIndex((item) => item.key === active),
    0,
  );
  const indicatorIndex = useSharedValue(selectedIndex);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current || reduceMotion) {
      indicatorIndex.value = selectedIndex;
      didMount.current = true;
      return;
    }

    indicatorIndex.value = withTiming(selectedIndex, {
      duration: theme.motion.duration.base,
    });
  }, [indicatorIndex, reduceMotion, selectedIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: itemWidth > 0 ? 1 : 0,
    width: itemWidth,
    transform: [
      { translateX: indicatorIndex.value * (itemWidth + SEGMENT_GAP) },
    ],
  }));

  return (
    <View
      style={[styles.segmented, style]}
      testID={testIDPrefix ? `${testIDPrefix}-track` : undefined}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (!Number.isFinite(width) || width <= 0) return;

        setTrackWidth((current) => (current === width ? current : width));
      }}
    >
      <Animated.View
        pointerEvents="none"
        testID={testIDPrefix ? `${testIDPrefix}-indicator` : undefined}
        style={[styles.segmentIndicator, indicatorStyle]}
      />
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <MotionPressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={selected ? { selected: true } : {}}
            hitSlop={{ top: 6, bottom: 6 }}
            testID={testIDPrefix ? `${testIDPrefix}-${item.key}` : undefined}
            onPress={() => {
              if (!selected) onChange(item.key);
            }}
            style={styles.segment}
          >
            <Text
              style={[
                styles.segmentText,
                selected && styles.segmentTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </MotionPressable>
        );
      })}
    </View>
  );
}

export function HorizontalChips<T extends string>({
  items,
  active,
  onChange,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.horizontalChipsScroll}
      contentContainerStyle={styles.horizontalChips}
    >
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          selected={active === item.key}
          onPress={() => onChange(item.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 56,
    paddingHorizontal: theme.layout.screenX,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  topTextWrap: { flex: 1, minWidth: 0 },
  topTextWrapCentered: {
    position: "absolute",
    left: theme.layout.screenX + 68,
    right: theme.layout.screenX + 68,
    alignItems: "center",
  },
  topRight: { marginLeft: 8, zIndex: 1 },
  topSubtitle: {
    marginTop: 2,
  },
  backButton: {
    minWidth: 68,
    height: theme.layout.touchTarget,
    marginLeft: -12,
    marginRight: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
  },
  segmented: {
    position: "relative",
    flexDirection: "row",
    height: 40,
    gap: SEGMENT_GAP,
    padding: SEGMENT_PADDING,
    backgroundColor: "rgba(30,41,32,0.05)",
    borderRadius: theme.radius.pill,
  },
  segment: {
    flex: 1,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    zIndex: 1,
  },
  segmentIndicator: {
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  segmentText: {
    color: theme.colors.inkMute,
    fontWeight: theme.fontWeight.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  segmentTextSelected: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
  },
  horizontalChipsScroll: { flexGrow: 0 },
  horizontalChips: { gap: 8, paddingHorizontal: 18, paddingVertical: 6 },
});
