import { AppIcon } from "@/components/ui/app-icon";
import { Image } from "expo-image";
import { type ComponentProps, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { getGivenName } from "../../lib/koreanName";
import { MotionPressable } from "./motion";

type IconName = ComponentProps<typeof AppIcon>["name"];

/** 사진 없는 아바타 바탕(avatar-1~6). 이름으로 골라 같은 사람은 늘 같은 색. */
const avatarPalettes = [
  theme.colors.avatar1,
  theme.colors.avatar2,
  theme.colors.avatar3,
  theme.colors.avatar4,
  theme.colors.avatar5,
  theme.colors.avatar6,
] as const;

function avatarColorFor(seed: string | number) {
  if (typeof seed === "number") {
    return avatarPalettes[seed % avatarPalettes.length];
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return avatarPalettes[hash % avatarPalettes.length];
}

export function Card({
  children,
  style,
  animated = false,
  animationDelay = 0,
  onPress,
  accessibilityLabel,
  testID,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  animationDelay?: number;
  /** 주면 누를 수 있는 카드가 되고, 누르는 동안 0.97 로 작아진다(120ms). */
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();

  const body = onPress ? (
    <MotionPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={animated ? styles.card : [styles.card, style]}
    >
      {children}
    </MotionPressable>
  ) : null;

  if (animated) {
    return (
      <Animated.View
        testID={onPress ? undefined : testID}
        entering={
          reduceMotion
            ? undefined
            : FadeInUp.duration(theme.motion.duration.base).delay(
                animationDelay,
              )
        }
        style={onPress ? style : [styles.card, style]}
      >
        {body ?? children}
      </Animated.View>
    );
  }

  return (
    body ?? (
      <View testID={testID} style={[styles.card, style]}>
        {children}
      </View>
    )
  );
}

export type BadgeTone = keyof typeof badgeTones;

/**
 * 상태 배지(디자인 시스템 Badge): 높이 26, 12/600, 안쪽 4×10, radius-full.
 * 톤은 info·success·warning·danger·neutral. 옛 이름 primary·mute·warn 도 같은 색으로 받는다.
 */
export function Badge({
  children,
  tone = "primary",
  bordered = false,
  solid = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  /** 1px border 테두리(neutral 톤에서만 보인다). DetailBadge 호환용. */
  bordered?: boolean;
  /** 진한 primary 바탕 + 흰 글자(소모임장·참여중 강조). 규격 톤 밖이라 호환용으로만 둔다. */
  solid?: boolean;
}) {
  const palette = solid
    ? { bg: theme.colors.primary, fg: theme.colors.onPrimary }
    : badgeTones[tone];
  const showBorder = bordered && !solid && badgeTones[tone] === neutral;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg },
        bordered ? styles.badgeBordered : null,
        showBorder ? styles.badgeBorderVisible : null,
      ]}
    >
      <Text style={[styles.badgeText, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

export function Avatar({
  name,
  size = 40,
  seed,
  uri,
}: {
  name: string;
  size?: number;
  seed?: string | number;
  /** 사진 주소. 불러와지면 이름 글자 위로 200ms 크로스페이드한다. */
  uri?: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const givenName = getGivenName(name) || name.trim() || "?";
  const backgroundColor = avatarColorFor(seed ?? name);
  const fontSize =
    givenName.length >= 3
      ? size * 0.28
      : givenName.length === 2
        ? size * 0.34
        : size * 0.42;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.avatarText, { fontSize, maxWidth: size * 0.88 }]}
      >
        {givenName}
      </Text>
      {uri ? (
        <Image
          testID="avatar-image"
          source={{ uri }}
          contentFit="cover"
          transition={reduceMotion ? 0 : theme.motion.duration.base}
          accessibilityIgnoresInvertColors
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}

/** 사진이 없을 때 사진 자리 바탕(thumb-1~6). 장식용이라 무늬 없이 단색. */
const thumbPalettes = [
  theme.colors.thumb1,
  theme.colors.thumb2,
  theme.colors.thumb3,
  theme.colors.thumb4,
  theme.colors.thumb5,
  theme.colors.thumb6,
];

export function VisualThumb({
  size = 86,
  seed = 0,
  icon,
  style,
}: {
  size?: number;
  seed?: number;
  icon?: IconName;
  style?: object;
}) {
  const backgroundColor = thumbPalettes[seed % thumbPalettes.length];

  return (
    <View
      style={[
        styles.visualThumb,
        { width: size, height: size, backgroundColor },
        style,
      ]}
    >
      {icon ? (
        <AppIcon
          name={icon}
          size={Math.max(20, size * 0.34)}
          color={theme.colors.textMuted}
        />
      ) : null}
    </View>
  );
}

const coverPalettes = [
  { bg: "#DDE5CD", fg: "#8FA882", tint: "rgba(255,255,255,0.42)" },
  { bg: "#EAE0CB", fg: "#C7B89D", tint: "rgba(255,255,255,0.36)" },
  { bg: "#D4E1D1", fg: "#7E9C8E", tint: "rgba(255,255,255,0.38)" },
  { bg: "#E7D2CB", fg: "#C97C6E", tint: "rgba(255,255,255,0.34)" },
  { bg: "#DEE5D4", fg: "#A6B79A", tint: "rgba(255,255,255,0.36)" },
  { bg: "#D8E5DD", fg: "#7BA194", tint: "rgba(255,255,255,0.38)" },
];

export function VisualCover({
  height = 88,
  seed = 0,
  icon = "groups",
  label,
  style,
}: {
  height?: number;
  seed?: number;
  icon?: IconName;
  label?: string;
  style?: object;
}) {
  const palette = coverPalettes[seed % coverPalettes.length];

  return (
    <View
      style={[
        styles.visualCover,
        { height, backgroundColor: palette.bg },
        style,
      ]}
    >
      <View
        style={[
          styles.coverWave,
          {
            backgroundColor: palette.fg,
            transform: [{ rotate: `${-8 + (seed % 4) * 4}deg` }],
          },
        ]}
      />
      <View style={[styles.coverCircle, { backgroundColor: palette.tint }]} />
      {label ? (
        <View style={styles.coverLabel}>
          <AppIcon name={icon} size={16} color={palette.fg} />
          <Text style={[styles.coverLabelText, { color: palette.fg }]}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text
        style={[styles.chipText, selected ? styles.chipTextSelected : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.layout.cardPadding,
    ...theme.shadow.sm,
  },
  badge: {
    alignSelf: "flex-start",
    minHeight: theme.size.badgeHeight,
    justifyContent: "center",
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing["1"],
  },
  badgeBordered: {
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 9,
    paddingVertical: theme.spacing["1"] - 1,
  },
  badgeBorderVisible: {
    borderColor: theme.colors.border,
  },
  badgeText: {
    ...theme.typography.caption,
    fontWeight: theme.fontWeight.semibold,
  },
  avatar: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
    textAlign: "center",
  },
  visualThumb: {
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  visualCover: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
    position: "relative",
  },
  coverWave: {
    position: "absolute",
    left: -18,
    right: -18,
    bottom: -34,
    height: 76,
    opacity: 0.32,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 80,
  },
  coverCircle: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    right: 18,
    top: 12,
    opacity: 0.45,
  },
  coverLabel: {
    position: "absolute",
    left: 14,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coverLabelText: { fontSize: 13, fontWeight: "800" },
  chip: {
    minHeight: theme.size.chipHeight,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primarySubtle,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  chipTextSelected: {
    color: theme.colors.primaryStrong,
    fontWeight: theme.fontWeight.semibold,
  },
});

/**
 * 디자인 시스템 Badge 톤. 옛 이름은 그대로 두고 색만 맞춘다:
 * primary = info, mute = neutral, warn = warning.
 */
const info = { bg: theme.colors.infoSubtle, fg: theme.colors.infoText };
const neutral = { bg: theme.colors.surfaceSubtle, fg: theme.colors.neutral700 };
const warning = {
  bg: theme.colors.warningSubtle,
  fg: theme.colors.warningText,
};
const badgeTones = {
  info,
  neutral,
  warning,
  primary: info,
  mute: neutral,
  warn: warning,
  danger: { bg: theme.colors.dangerSubtle, fg: theme.colors.dangerText },
  success: { bg: theme.colors.successSubtle, fg: theme.colors.successText },
};
