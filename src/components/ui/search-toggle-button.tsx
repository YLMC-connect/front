import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text } from "react-native";
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

export function SearchToggleButton({
  accessibilityLabel,
  onPress,
  open,
  testID,
}: {
  accessibilityLabel: string;
  onPress: () => void;
  open: boolean;
  testID?: string;
}) {
  return (
    <MotionPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
      testID={testID}
    >
      <MaterialIcons
        name={open ? "close" : "search"}
        size={20}
        color={theme.colors.inkSoft}
      />
      <Text style={styles.label}>{open ? "닫기" : "검색"}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    height: theme.layout.touchTarget,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: theme.radius.pill,
  },
  label: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
