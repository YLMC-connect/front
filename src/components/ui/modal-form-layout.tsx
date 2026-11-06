import { useState, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { theme } from "../../constants/theme";
import { InputErrorText, InputSurface, inputTextStyles } from "./inputs";

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
  /** 입력 아래에 아이콘과 함께 띄울 오류 문구. 주면 테두리도 dangerText 가 된다. */
  error?: string;
};

/** 자리·크기 값은 바깥 입력창으로, 나머지(글자 정렬 등)는 TextInput 으로 나눈다. */
const OUTER_STYLE_KEYS = new Set<string>([
  "width",
  "minWidth",
  "maxWidth",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "alignSelf",
  "margin",
  "marginHorizontal",
  "marginVertical",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "marginStart",
  "marginEnd",
]);

function splitInputStyle(style: TextInputProps["style"]) {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    (OUTER_STYLE_KEYS.has(key) ? outer : inner)[key] = value;
  }
  return { outer: outer as ViewStyle, inner: inner as TextStyle };
}

export function ModalFormTextInput({
  multiline,
  onBlur,
  onFocus,
  placeholderTextColor = theme.colors.textMuted,
  style,
  size = "md",
  height,
  error,
  editable,
  testID,
  ...props
}: ModalFormTextInputProps) {
  const [focused, setFocused] = useState(false);
  const resolvedHeight = height ?? MODAL_FORM_INPUT_HEIGHTS[size];
  const readOnly = editable === false;
  const { outer, inner } = splitInputStyle(style);

  return (
    <View
      testID={testID ? `${testID}-field` : undefined}
      style={[styles.field, outer]}
    >
      <InputSurface
        focused={focused}
        error={Boolean(error)}
        readOnly={readOnly}
        testID={testID}
      >
        <TextInput
          {...props}
          testID={testID}
          editable={editable}
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
            inputTextStyles.input,
            multiline ? inputTextStyles.multiline : { height: resolvedHeight },
            readOnly ? inputTextStyles.readOnly : null,
            inner,
          ]}
        />
      </InputSurface>
      {error ? <InputErrorText>{error}</InputErrorText> : null}
    </View>
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
    marginBottom: theme.spacing["2"],
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
  field: {
    marginHorizontal: theme.layout.screenX,
    gap: theme.spacing["2"],
  },
});
