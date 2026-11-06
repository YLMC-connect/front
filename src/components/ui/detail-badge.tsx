import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function DetailBadge({
  children,
  tone = "mute",
  bordered = false,
}: {
  children: ReactNode;
  tone?: "primary" | "mute" | "warn";
  bordered?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        bordered ? styles.bordered : null,
        tone === "primary" ? styles.primary : null,
        tone === "warn" ? styles.warn : null,
      ]}
    >
      <Text
        style={[
          styles.text,
          bordered ? styles.borderedText : null,
          tone === "primary" ? styles.primaryText : null,
          tone === "warn" ? styles.warnText : null,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  primary: {
    borderColor: "transparent",
    backgroundColor: theme.colors.primary,
  },
  warn: {
    borderColor: "transparent",
    backgroundColor: theme.colors.amberSoft,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  borderedText: {
    color: theme.colors.textMuted,
  },
  primaryText: {
    color: theme.colors.onPrimary,
  },
  warnText: {
    color: theme.colors.warningText,
  },
});
