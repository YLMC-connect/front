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
  | "muted"
  | "disabled"
  | "brand"
  | "inverse"
  | "danger"
  | "success";

const toneColors: Record<AppTextTone, string> = {
  primary: theme.colors.text,
  muted: theme.colors.textMuted,
  disabled: theme.colors.textDisabled,
  brand: theme.colors.primaryStrong,
  inverse: theme.colors.onPrimary,
  danger: theme.colors.dangerText,
  success: theme.colors.successText,
};

export function AppText({
  children,
  variant = "body",
  tone = "primary",
  weight,
  style,
  ...textProps
}: TextProps & {
  children?: ReactNode;
  variant?: AppTextVariant;
  tone?: AppTextTone;
  /** 역할의 기본 굵기를 바꿀 때. 카드 제목은 `variant="body" weight="semibold"`. */
  weight?: Exclude<keyof typeof theme.fontWeight, "extrabold">;
  style?: StyleProp<TextStyle>;
}) {
  const role = theme.typography[variant];
  const flatStyle = StyleSheet.flatten(style);
  const resolvedWeight =
    flatStyle?.fontWeight ??
    (weight ? theme.fontWeight[weight] : role.fontWeight);

  return (
    <Text
      // 한국어는 낱글자가 아니라 어절 단위로 줄을 바꾼다(iOS 기본은 글자 단위).
      lineBreakStrategyIOS="hangul-word"
      {...textProps}
      style={[
        styles.base,
        role,
        {
          color: toneColors[tone],
          fontFamily: fontFamilyForWeight(resolvedWeight),
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
