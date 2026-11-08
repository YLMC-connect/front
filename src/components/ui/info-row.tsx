import type { ComponentProps } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { Text } from "./text";

type IconName = ComponentProps<typeof AppIcon>["name"];

/**
 * 정보 줄(디자인 시스템 PlaceCard). 칸 없이 위아래 1px `surface-subtle` 선 사이에
 * 아이콘 18 → 이름(폭 64) → 값 14/600 을 한 줄로 둔다. 기본은 "수령 장소".
 * 여러 줄을 이어 붙이면 줄 사이 선은 하나만 보인다(`first` 가 아닌 줄은 위 선을 그리지 않음).
 */
export function PlaceCard({
  icon = "place",
  label = "수령 장소",
  value,
  first = true,
  style,
  testID,
}: {
  icon?: IconName;
  label?: string;
  value: string;
  /** 이어 붙인 줄의 첫 줄인지. 아니면 위 선을 생략한다. */
  first?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${value}`}
      style={[styles.row, first ? styles.rowFirst : null, style]}
      testID={testID}
    >
      <AppIcon name={icon} size={18} color={theme.colors.textMuted} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["2"],
    marginHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing["3"],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSubtle,
  },
  label: {
    ...theme.typography.label,
    width: 64,
    color: theme.colors.textMuted,
  },
  value: {
    ...theme.typography.label,
    flex: 1,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.text,
  },
});
