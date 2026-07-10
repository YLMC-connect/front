import type { ReactNode } from "react";
import { usePathname } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const rootTabPaths = new Set([
  "/",
  "/market",
  "/group",
  "/prayer",
  "/life-study",
]);
const designStatusBarHeight = 44;

export function Screen({
  children,
  scroll = true,
  padded = true,
  testID,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  testID?: string;
}) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const contentStyle = rootTabPaths.has(pathname)
    ? styles.contentWithTab
    : styles.content;

  return (
    <View
      testID={testID}
      style={[
        styles.safe,
        { paddingTop: Math.max(insets.top, designStatusBarHeight) },
      ]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[contentStyle, padded ? styles.padded : null]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padded ? styles.padded : null]}>
          {children}
        </View>
      )}
    </View>
  );
}

export function Section({
  title,
  children,
  trailing,
}: {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  fill: { flex: 1 },
  content: { paddingBottom: 28 },
  contentWithTab: { paddingBottom: 100 },
  padded: { paddingHorizontal: 18, gap: 16 },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
    fontSize: 15,
  },
});
