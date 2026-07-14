import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { StyleSheet, Text } from "react-native";
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

type DetailActionProps = {
  icon: AppIconName;
  label: string;
  danger?: boolean;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
};

export function DetailAction({
  icon,
  label,
  danger = false,
  onPress,
  testID,
  accessibilityLabel,
}: DetailActionProps) {
  const color = danger ? theme.colors.danger : theme.colors.ink;

  return (
    <MotionPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.action}
    >
      <AppIcon name={icon} size={18} color={color} />
      <Text style={[styles.actionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </MotionPressable>
  );
}

export function DetailMiniAction({
  icon,
  label,
  danger = false,
  onPress,
  testID,
  accessibilityLabel,
}: DetailActionProps) {
  return (
    <MotionPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={styles.miniAction}
    >
      <AppIcon
        name={icon}
        size={14}
        color={danger ? theme.colors.danger : theme.colors.inkMute}
      />
      <Text style={[styles.miniActionText, danger ? styles.dangerText : null]}>
        {label}
      </Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: {
    color: theme.colors.ink,
    fontSize: 13.5,
    fontWeight: theme.fontWeight.semibold,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  miniAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniActionText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
});
