import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { theme } from "../../constants/theme";

/** 흰 카드 입력 칸의 이름 줄(14/700, 필수면 빨간 *). */
export function FormFieldLabel({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>
        {children}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
    </View>
  );
}

/** 입력 아래 안내(12 text-muted). */
export function FormFieldHint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  labelRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing["3"],
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  required: {
    color: theme.colors.dangerText,
  },
  hint: {
    marginTop: theme.spacing["2"],
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
