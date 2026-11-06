import { useState, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
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

export const MODAL_FORM_INPUT_HEIGHTS = {
  xs: 40,
  sm: 44,
  md: 48,
  lg: 52,
  xl: 56,
} as const;

export type ModalFormTextInputSize = keyof typeof MODAL_FORM_INPUT_HEIGHTS;

export type ModalFormTextInputProps = TextInputProps & {
  size?: ModalFormTextInputSize;
  height?: number;
};

export function ModalFormTextInput({
  multiline,
  onBlur,
  onFocus,
  placeholderTextColor = theme.colors.textMuted,
  style,
  size = "md",
  height,
  ...props
}: ModalFormTextInputProps) {
  const [focused, setFocused] = useState(false);
  const resolvedHeight = height ?? MODAL_FORM_INPUT_HEIGHTS[size];

  return (
    <TextInput
      {...props}
      multiline={multiline}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      placeholderTextColor={placeholderTextColor}
      style={[
        styles.input,
        multiline ? styles.textarea : { height: resolvedHeight },
        style,
        focused ? styles.inputFocused : null,
      ]}
    />
  );
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
    ...theme.typography.label,
    color: theme.colors.text,
  },
  required: {
    color: theme.colors.dangerText,
  },
  sectionHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.bg,
  },
  input: {
    minHeight: theme.size.inputHeight,
    marginHorizontal: theme.layout.screenX,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing["4"],
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    outlineColor: "transparent",
    outlineWidth: 0,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    paddingHorizontal: theme.spacing["4"] - 1,
  },
  textarea: {
    minHeight: 132,
    paddingTop: theme.spacing["3"],
    lineHeight: theme.typography.body.lineHeight,
  },
});
