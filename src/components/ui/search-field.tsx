import { MaterialIcons } from "@expo/vector-icons";
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
      <MaterialIcons name="search" size={19} color={theme.colors.inkMute} />
      <TextInput
        {...inputProps}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        placeholderTextColor={theme.colors.inkMute}
        style={styles.input}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 46,
    marginHorizontal: theme.layout.screenX,
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    outlineColor: "transparent",
    outlineWidth: 0,
  },
});
