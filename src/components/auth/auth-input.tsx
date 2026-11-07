import { forwardRef, useState, type ReactNode } from "react";
import { StyleSheet, type TextInputProps } from "react-native";
import { TextInput } from "@/components/ui/text";
import { theme } from "../../constants/theme";
import { InputSurface, inputTextStyles } from "../ui/inputs";

export type AuthInputProps = Omit<TextInputProps, "style"> & {
  hasError?: boolean;
  trailing?: ReactNode;
};

/** 로그인·가입 입력창. 겉모양은 공통 InputSurface(디자인 시스템 Input)를 쓴다. */
export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  function AuthInput(
    {
      hasError = false,
      onBlur,
      onFocus,
      testID,
      trailing,
      editable,
      ...inputProps
    }: AuthInputProps,
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const readOnly = editable === false;

    return (
      <InputSurface
        focused={focused}
        error={hasError}
        readOnly={readOnly}
        testID={testID}
        style={[styles.surface, trailing ? styles.surfaceWithTrailing : null]}
      >
        <TextInput
          {...inputProps}
          ref={ref}
          testID={testID}
          editable={editable}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={
            inputProps.placeholderTextColor ?? theme.colors.textMuted
          }
          style={[
            inputTextStyles.input,
            styles.input,
            readOnly ? inputTextStyles.readOnly : null,
          ]}
        />
        {trailing}
      </InputSurface>
    );
  },
);

const styles = StyleSheet.create({
  surface: {
    height: theme.size.inputHeight,
    gap: theme.spacing["2"],
  },
  surfaceWithTrailing: {
    paddingRight: 10,
  },
  input: {
    minHeight: 44,
  },
});
