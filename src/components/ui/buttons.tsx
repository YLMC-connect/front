import { AppIcon } from "@/components/ui/app-icon";
import { type ComponentProps, type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

type IconName = ComponentProps<typeof AppIcon>["name"];

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

const { colors } = theme;

/** 디자인 시스템 Button: 변형별 바탕·눌림·글자 색. */
const variantColors: Record<
  ButtonVariant,
  {
    bg: string;
    pressedBg: string;
    fg: string;
    border?: string;
    pressedBorder?: string;
  }
> = {
  primary: {
    bg: colors.primary,
    pressedBg: colors.primaryStrong,
    fg: colors.onPrimary,
  },
  secondary: {
    bg: colors.primarySubtle,
    pressedBg: colors.primary200,
    fg: colors.primaryStrong,
  },
  outline: {
    bg: colors.surface,
    pressedBg: colors.surfaceSubtle,
    fg: colors.text,
    border: colors.borderButton,
    pressedBorder: colors.neutral400,
  },
  ghost: {
    bg: "transparent",
    pressedBg: colors.surfaceSubtle,
    fg: colors.primaryStrong,
  },
  danger: {
    bg: colors.dangerBold,
    pressedBg: colors.dangerPressed,
    fg: colors.onPrimary,
  },
};

/**
 * 알약 버튼. `md` 44(카드 안·보조), `lg` 52(화면 하단 주 버튼).
 * 한 화면에 primary 는 하나만 둔다.
 */
export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
  testID,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  testID?: string;
}) {
  const tone = variantColors[variant];
  const fg = disabled ? colors.textDisabled : tone.fg;

  return (
    <MotionPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === "lg" ? styles.buttonLg : styles.buttonMd,
        { backgroundColor: pressed ? tone.pressedBg : tone.bg },
        tone.border
          ? {
              borderWidth: 1,
              borderColor: pressed ? tone.pressedBorder : tone.border,
            }
          : null,
        disabled ? styles.disabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <AppIcon name={icon} size={18} color={fg} /> : null}
          <Text
            style={[
              size === "lg" ? styles.textLg : styles.textMd,
              { color: fg },
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </MotionPressable>
  );
}

export function FloatingActionButton({
  label,
  icon = "add",
  compact = false,
  style,
  ...pressableProps
}: PressableProps & {
  label: string;
  icon?: IconName;
  compact?: boolean;
}) {
  const fabStyle = StyleSheet.flatten([
    styles.fab,
    compact ? styles.fabCompact : null,
    typeof style === "function" ? undefined : style,
  ]);

  return (
    <MotionPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      {...pressableProps}
      style={fabStyle}
    >
      <AppIcon name={icon} size={18} color={colors.onPrimary} />
      <Text style={styles.fabText}>{label}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing["2"],
  },
  buttonMd: {
    minHeight: theme.size.buttonHeightSm,
    paddingHorizontal: theme.spacing["5"],
  },
  buttonLg: {
    minHeight: theme.size.buttonHeight,
    paddingHorizontal: theme.spacing["6"],
  },
  textMd: {
    ...theme.typography.label,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
  },
  textLg: {
    ...theme.typography.body,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
  },
  disabled: { backgroundColor: theme.colors.surfaceSubtle, borderWidth: 0 },
  fab: {
    position: "absolute",
    right: theme.spacing["5"],
    bottom: 86,
    zIndex: 20,
    minWidth: theme.size.fabHeight,
    height: theme.size.fabHeight,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing["4"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    ...theme.shadow.fab,
  },
  fabCompact: {
    width: theme.size.fabHeight,
    paddingHorizontal: 0,
  },
  fabText: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    fontFamily: theme.font.bold,
    fontWeight: "normal",
  },
});
