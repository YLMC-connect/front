import { forwardRef, useState, type ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";
import { theme } from "../../constants/theme";

export type AuthInputProps = Omit<TextInputProps, "style"> & {
  hasError?: boolean;
  trailing?: ReactNode;
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  function AuthInput(
    {
      hasError = false,
      onBlur,
      onFocus,
      testID,
      trailing,
      ...inputProps
    }: AuthInputProps,
    ref,
  ) {
    const [focused, setFocused] = useState(false);

    return (
      <View
        testID={testID ? `${testID}-container` : undefined}
        style={[
          styles.surface,
          hasError ? styles.surfaceError : null,
          trailing ? styles.surfaceWithTrailing : null,
        ]}
      >
        <TextInput
          {...inputProps}
          ref={ref}
          testID={testID}
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
          style={styles.input}
        />
        {trailing}
        {focused ? (
          <View
            pointerEvents="none"
            testID={testID ? `${testID}-focus-ring` : undefined}
            style={[styles.focusRing, hasError ? styles.focusRingError : null]}
          />
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  surface: {
    height: theme.size.inputHeight,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  focusRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.radius.sm,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  focusRingError: {
    borderColor: theme.colors.dangerText,
  },
  surfaceError: {
    borderColor: theme.colors.dangerText,
  },
  surfaceWithTrailing: {
    paddingRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    padding: 0,
    outlineColor: "transparent",
    outlineWidth: 0,
  },
});
