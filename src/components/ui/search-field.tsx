import { AppIcon } from "@/components/ui/app-icon";
import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";
import { theme } from "../../constants/theme";

export const SEARCH_FIELD_STICKY_HEIGHT = 56;

type SearchFieldProps = Pick<
  TextInputProps,
  | "accessibilityLabel"
  | "autoFocus"
  | "onChangeText"
  | "placeholder"
  | "testID"
  | "value"
>;

export function SearchField({ testID, ...inputProps }: SearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[styles.container, focused ? styles.containerFocused : null]}
      testID={testID ? `${testID}-container` : undefined}
    >
      <AppIcon name="search" size={20} color={theme.colors.textMuted} />
      <TextInput
        {...inputProps}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: theme.size.inputHeight,
    marginHorizontal: theme.layout.screenX,
    marginBottom: 10,
    paddingHorizontal: theme.spacing["4"],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["2"],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
    backgroundColor: theme.colors.surface,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    paddingHorizontal: theme.spacing["4"] - 1,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    outlineColor: "transparent",
    outlineWidth: 0,
  },
});
