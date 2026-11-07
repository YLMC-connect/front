import { AppIcon } from "@/components/ui/app-icon";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "@/components/ui/text";
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
/** 사진 위 헤더: 위쪽을 60% 어둡게 해 흰 글자가 보이게 한다. 디자인 시스템에 토큰이 없는 그라데이션. */
const OVER_PHOTO_GRADIENT = ["rgba(25,31,40,0.6)", "rgba(25,31,40,0)"] as const;

export function TopBar({
  title,
  subtitle,
  back,
  close,
  overPhoto,
  right,
  onBack,
  returnUrl: returnUrlProp,
  testID,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  /** 입력하는 집중 화면: 뒤로 대신 같은 자리에 닫기 ×. onBack·returnUrl 을 똑같이 따른다. */
  close?: boolean;
  /** 사진 위 헤더: 흰 글자·아이콘 + 위쪽 어두운 그라데이션. */
  overPhoto?: boolean;
  right?: ReactNode;
  onBack?: () => void;
  returnUrl?: string;
  testID?: string;
}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnUrl?: string | string[] }>();
  const rawReturnUrl = returnUrlProp ?? params.returnUrl;
  const returnUrl = Array.isArray(rawReturnUrl)
    ? rawReturnUrl[0]
    : rawReturnUrl;

  const handleBack = () => {
    if (returnUrl) {
      router.replace(returnUrl as Href);
      return;
    }
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const leading = close ? "close" : back ? "back" : null;
  const tint = overPhoto ? theme.colors.onPrimary : null;

  return (
    <View testID={testID} style={styles.topBar}>
      {overPhoto ? (
        <LinearGradient
          colors={OVER_PHOTO_GRADIENT}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          testID={testID ? `${testID}-gradient` : undefined}
        />
      ) : null}
      {leading === "close" ? (
        <MotionPressable
          accessibilityLabel="닫기"
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.closeButton}
        >
          <AppIcon name="close" size={24} color={tint ?? theme.colors.text} />
        </MotionPressable>
      ) : leading === "back" ? (
        <MotionPressable
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleBack}
          style={styles.backButton}
        >
          <AppIcon
            name="chevron-left"
            size={22}
            color={tint ?? theme.colors.textMuted}
          />
          <AppText variant="caption" tone={overPhoto ? "inverse" : "muted"}>
            뒤로
          </AppText>
        </MotionPressable>
      ) : null}
      <View
        testID={testID ? `${testID}-title` : undefined}
        pointerEvents={leading ? "none" : "auto"}
        style={[
          styles.topTextWrap,
          leading ? styles.topTextWrapCentered : null,
        ]}
      >
        <AppText
          numberOfLines={1}
          variant="heading"
          weight="semibold"
          tone={overPhoto ? "inverse" : "primary"}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            variant="caption"
            tone={overPhoto ? "inverse" : "muted"}
            style={styles.topSubtitle}
          >
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
    height: theme.size.topbarHeight,
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
    marginRight: 4,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    gap: 2,
  },
  closeButton: {
    width: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    marginRight: 4,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  segmented: {
    position: "relative",
    flexDirection: "row",
    minHeight: theme.size.segmentHeight,
    gap: SEGMENT_GAP,
    padding: SEGMENT_PADDING,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.full,
  },
  segment: {
    flex: 1,
    minHeight: theme.size.segmentItemHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    zIndex: 1,
  },
  segmentIndicator: {
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  segmentText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.semibold,
  },
  segmentTextSelected: {
    color: theme.colors.text,
  },
  horizontalChipsScroll: { flexGrow: 0 },
  horizontalChips: { gap: 8, paddingHorizontal: 18, paddingVertical: 6 },
});
