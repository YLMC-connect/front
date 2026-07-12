import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";
import { theme } from "../../constants/theme";

export type AppTextVariant = keyof typeof theme.typography;
export type AppTextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "disabled"
  | "brand"
  | "inverse"
  | "danger"
  | "success";

const toneColors: Record<AppTextTone, string> = {
  primary: theme.colors.textPrimary,
  secondary: theme.colors.textSecondary,
  muted: theme.colors.textMuted,
  disabled: theme.colors.textDisabled,
  brand: theme.colors.primaryDeep,
  inverse: theme.colors.white,
  danger: theme.colors.danger,
  success: theme.colors.success,
};

export function AppText({
  children,
  variant = "body",
  tone = "primary",
  style,
  ...textProps
}: TextProps & {
  children?: ReactNode;
  variant?: AppTextVariant;
  tone?: AppTextTone;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      {...textProps}
      style={[
        styles.base,
        theme.typography[variant],
        { color: toneColors[tone] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
