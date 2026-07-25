import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";
import { fontFamilyForWeight } from "../../constants/fonts";
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
  const role = theme.typography[variant];
  const flatStyle = StyleSheet.flatten(style);
  const weight = flatStyle?.fontWeight ?? role.fontWeight;

  return (
    <Text
      {...textProps}
      style={[
        styles.base,
        role,
        {
          color: toneColors[tone],
          fontFamily: fontFamilyForWeight(weight),
          // Weight-specific Pretendard files already encode boldness.
          fontWeight: "normal",
        },
        style,
        // Re-apply family after style so callers' fontWeight still maps correctly.
        flatStyle?.fontWeight
          ? { fontFamily: fontFamilyForWeight(flatStyle.fontWeight) }
          : null,
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
