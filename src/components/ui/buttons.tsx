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

export function Button({
  children,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "soft" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
}) {
  const buttonStyle = StyleSheet.flatten([
    styles.button,
    variant === "primary" && styles.buttonPrimary,
    variant === "soft" && styles.buttonSoft,
    variant === "ghost" && styles.buttonGhost,
    variant === "danger" && styles.buttonDanger,
    disabled && styles.disabled,
  ]);
  const textStyle = [
    styles.buttonText,
    (variant === "soft" || variant === "ghost") && styles.buttonTextSoft,
    variant === "danger" && styles.buttonTextInverse,
  ];

  return (
    <MotionPressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? "#fff"
              : theme.colors.primaryDeep
          }
        />
      ) : (
        <>
          {icon ? (
            <AppIcon
              name={icon}
              size={20}
              color={
                variant === "primary" || variant === "danger"
                  ? "#fff"
                  : theme.colors.primaryDeep
              }
            />
          ) : null}
          <Text style={textStyle}>{children}</Text>
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
      <AppIcon name={icon} size={18} color="#fff" />
      <Text style={styles.fabText}>{label}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  buttonSoft: { backgroundColor: theme.colors.primarySoft },
  buttonGhost: { backgroundColor: "transparent" },
  buttonDanger: { backgroundColor: theme.colors.danger },
  buttonText: {
    color: theme.colors.white,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    fontSize: theme.fontSize.base,
  },
  buttonTextSoft: { color: theme.colors.primaryDeep },
  buttonTextInverse: { color: theme.colors.white },
  disabled: { opacity: 0.45 },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 86,
    zIndex: 20,
    minWidth: 46,
    height: 46,
    borderRadius: theme.radius.pill,
    paddingLeft: 12,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    ...theme.shadow.fab,
  },
  fabCompact: {
    width: 46,
    paddingLeft: 0,
    paddingRight: 0,
  },
  fabText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: theme.fontWeight.bold,
  },
});
