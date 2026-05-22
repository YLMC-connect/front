import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

export function Screen({
  children,
  scroll = true,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            padded ? styles.padded : null,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padded ? styles.padded : null]}>
          {children}
        </View>
      )}
    </SafeAreaView>
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
  content: { paddingBottom: 112 },
  padded: { paddingHorizontal: 18, gap: 16 },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 17 },
});
