import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function ModalFormSection({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function SectionDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
  },
  sectionHead: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionLabel: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  required: {
    color: theme.colors.danger,
  },
  sectionHint: {
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  divider: {
    height: 8,
    backgroundColor: "rgba(20,30,18,0.04)",
  },
});
