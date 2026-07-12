import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { MotionPressable } from "./motion";

export function UnderlineTabs<T extends string>({
  items,
  active,
  onChange,
  variant = "indicator",
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange?: (key: T) => void;
  variant?: "indicator" | "border";
}) {
  return (
    <View
      style={[styles.tabs, variant === "border" ? styles.borderTabs : null]}
    >
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <MotionPressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={selected ? { selected: true } : {}}
            disabled={!onChange}
            onPress={() => {
              if (!selected) onChange?.(item.key);
            }}
            style={[
              styles.tab,
              variant === "border" ? styles.borderTab : null,
              variant === "border" && selected ? styles.borderTabOn : null,
            ]}
          >
            <Text style={[styles.text, selected ? styles.textOn : null]}>
              {item.label}
            </Text>
            {variant === "indicator" && selected ? (
              <View style={styles.indicator} />
            ) : null}
          </MotionPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingHorizontal: 18,
  },
  borderTabs: {
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  borderTab: {
    minHeight: 0,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  borderTabOn: {
    borderBottomColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  textOn: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  indicator: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: -1,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.primary,
  },
});
