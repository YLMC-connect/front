import { useState, type ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";
import { theme } from "../../constants/theme";

type AuthInputProps = Omit<TextInputProps, "style"> & {
  hasError?: boolean;
  trailing?: ReactNode;
};

export function AuthInput({
  hasError = false,
  onBlur,
  onFocus,
  testID,
  trailing,
  ...inputProps
}: AuthInputProps) {
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
          inputProps.placeholderTextColor ?? theme.colors.inkMute
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
}

const styles = StyleSheet.create({
  surface: {
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  focusRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.md,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  focusRingError: {
    borderColor: theme.colors.danger,
  },
  surfaceError: {
    borderColor: theme.colors.danger,
    backgroundColor: "#FDF4F1",
  },
  surfaceWithTrailing: {
    paddingRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    padding: 0,
    outlineColor: "transparent",
    outlineWidth: 0,
  },
});
