import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";

export function ScreenHeader({
  title,
  subtitle,
  right,
  testID = "screen-header",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  testID?: string;
}) {
  return (
    <View testID={testID} style={styles.header}>
      <View style={[styles.text, right ? styles.textWithAction : null]}>
        <AppText variant="screenTitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={styles.action}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingTop: 6,
    paddingHorizontal: theme.layout.screenX,
    position: "relative",
  },
  text: {
    minWidth: 0,
  },
  textWithAction: {
    paddingRight: theme.layout.touchTarget + theme.spacing[2],
  },
  subtitle: {
    marginTop: 2,
  },
  action: {
    position: "absolute",
    top: 10,
    right: theme.layout.screenX,
    minWidth: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
