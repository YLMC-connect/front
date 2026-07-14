import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, type StyleProp, View, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { MotionPressable } from "./motion";

export function SectionHeader({
  title,
  onViewAll,
  style,
  testID,
}: {
  title: string;
  onViewAll?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <View testID={testID} style={[styles.root, style]}>
      <AppText variant="sectionTitle">{title}</AppText>
      {onViewAll ? (
        <MotionPressable
          accessibilityLabel={`${title} 전체보기`}
          accessibilityRole="button"
          onPress={onViewAll}
          style={styles.viewAll}
          testID={testID ? `${testID}-view-all` : undefined}
        >
          <AppText variant="caption" tone="brand">
            전체보기
          </AppText>
          <MaterialIcons
            name="chevron-right"
            size={18}
            color={theme.colors.primaryDeep}
            testID={testID ? `${testID}-view-all-icon` : undefined}
          />
        </MotionPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAll: {
    minHeight: theme.layout.touchTarget,
    marginVertical: -8,
    paddingLeft: 8,
    paddingRight: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
