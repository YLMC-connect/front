import { AppIcon } from "@/components/ui/app-icon";
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

type IconName = ComponentProps<typeof AppIcon>["name"];

const avatarPalettes = [
  "#8FA882",
  "#C7B89D",
  "#9FBFA0",
  "#C97C6E",
  "#A6B79A",
  "#B79F8C",
  "#7E9C8E",
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
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  animationDelay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (animated) {
    return (
      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : FadeInUp.duration(theme.motion.duration.base).delay(
                animationDelay,
              )
        }
        style={[styles.card, style]}
      >
        {children}
      </Animated.View>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "mute" | "warn" | "danger" | "success";
}) {
  return (
    <View style={[styles.badge, badgeToneStyles[tone]]}>
      <Text
        style={[
          styles.badgeText,
          tone === "mute" ? styles.badgeTextMute : null,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function Avatar({
  name,
  size = 40,
  seed,
}: {
  name: string;
  size?: number;
  seed?: string | number;
}) {
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
    </View>
  );
}

const thumbPalettes = [
  { bg: "#E6EBDB", fg: "#C9D6B2" },
  { bg: "#F3E8D7", fg: "#DBC9A5" },
  { bg: "#E0E9DE", fg: "#B7CCB3" },
  { bg: "#F3DED7", fg: "#DCB1A6" },
  { bg: "#E8E4D3", fg: "#C9C2A4" },
  { bg: "#DDE8E4", fg: "#B0C9C0" },
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
  const palette = thumbPalettes[seed % thumbPalettes.length];
  const largeSize = size * 0.64;
  const largeCenterX = 20 + ((seed * 17) % 60);
  const largeCenterY = 20 + ((seed * 11) % 60);
  const smallSize = size * 0.44;
  const smallCenterX = 60 + ((seed * 7) % 30);
  const smallCenterY = 70 - ((seed * 13) % 30);

  return (
    <View
      style={[
        styles.visualThumb,
        {
          width: size,
          height: size,
          backgroundColor: palette.bg,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.visualOrbLarge,
          {
            width: largeSize,
            height: largeSize,
            borderRadius: largeSize / 2,
            backgroundColor: palette.fg,
            left: size * ((largeCenterX - 32) / 100),
            top: size * ((largeCenterY - 32) / 100),
          },
        ]}
      />
      <View
        style={[
          styles.visualOrbSmall,
          {
            width: smallSize,
            height: smallSize,
            borderRadius: smallSize / 2,
            backgroundColor: palette.fg,
            left: size * ((smallCenterX - 22) / 100),
            top: size * ((smallCenterY - 22) / 100),
          },
        ]}
      />
      {icon ? (
        <AppIcon name={icon} size={Math.max(22, size * 0.34)} color="#fff" />
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
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badge_primary: { backgroundColor: theme.colors.primarySoft },
  badge_mute: { backgroundColor: theme.colors.surface2 },
  badge_warn: { backgroundColor: theme.colors.amberSoft },
  badge_danger: { backgroundColor: "#FDF4F1" },
  badge_success: { backgroundColor: "#EFF7EC" },
  badgeText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    lineHeight: theme.lineHeight.xs,
  },
  badgeTextMute: { color: theme.colors.inkMute },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.sage,
    shadowColor: "rgba(20,30,18,0.10)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
  },
  visualThumb: {
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  visualOrbLarge: {
    position: "absolute",
    opacity: 0.35,
  },
  visualOrbSmall: {
    position: "absolute",
    opacity: 0.22,
  },
  visualCover: {
    borderRadius: theme.radius.lg,
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
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
  chipTextSelected: { color: theme.colors.white },
});

const badgeToneStyles = {
  primary: styles.badge_primary,
  mute: styles.badge_mute,
  warn: styles.badge_warn,
  danger: styles.badge_danger,
  success: styles.badge_success,
};
