import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { StyleSheet, Text } from "react-native";
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

/**
 * 작은 글자 버튼(높이 약 18)의 누르는 곳을 세로 44 로 맞춘다.
 * 옆 버튼과는 6 씩만 넓혀, 쓰는 곳의 간격(12·14)에서 서로 겹치지 않게 한다.
 */
const MINI_ACTION_HIT_SLOP = { top: 13, bottom: 13, left: 6, right: 6 };

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
  const color = danger ? theme.colors.dangerText : theme.colors.text;

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
      hitSlop={onPress ? MINI_ACTION_HIT_SLOP : undefined}
      onPress={onPress}
      style={styles.miniAction}
    >
      <AppIcon
        name={icon}
        size={14}
        color={danger ? theme.colors.dangerText : theme.colors.textMuted}
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
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: theme.fontWeight.semibold,
  },
  dangerText: {
    color: theme.colors.dangerText,
  },
  miniAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniActionText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
});
