import { AppIcon } from "@/components/ui/app-icon";
import { forwardRef, type ReactNode, useState } from "react";
import { type TextInputProps, View } from "react-native";
import { Text, TextInput } from "@/components/ui/text";
import { AuthInput } from "../auth-input";
import { MotionFadeIn, MotionPressable } from "../../ui";
import { theme } from "../../../constants/theme";
import { styles } from "./signupStyles";

export function CheckBadge({
  on,
  big = false,
}: {
  on: boolean;
  big?: boolean;
}) {
  const size = big ? 22 : 18;
  return (
    <View
      style={[
        styles.checkBadge,
        { width: size, height: size, borderRadius: size / 2 },
        on ? styles.checkBadgeOn : null,
      ]}
    >
      {on ? (
        <AppIcon
          name="check"
          size={size * 0.65}
          color={theme.colors.onPrimary}
        />
      ) : null}
    </View>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export const SignupInput = forwardRef<
  TextInput,
  {
    testID?: string;
    value?: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    hasError?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: TextInputProps["keyboardType"];
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    autoComplete?: TextInputProps["autoComplete"];
    textContentType?: TextInputProps["textContentType"];
    returnKeyType?: TextInputProps["returnKeyType"];
    onSubmitEditing?: TextInputProps["onSubmitEditing"];
    onBlur?: TextInputProps["onBlur"];
    trailing?: ReactNode;
  }
>(function SignupInput(
  {
    testID,
    value,
    onChangeText,
    placeholder,
    hasError,
    secureTextEntry,
    keyboardType = "default",
    autoCapitalize,
    autoCorrect,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    onBlur,
    trailing,
  },
  ref,
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const resolvedTrailing = secureTextEntry ? (
    <MotionPressable
      accessibilityLabel={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => setPasswordVisible((visible) => !visible)}
      style={styles.visibilityButton}
    >
      <AppIcon
        name={passwordVisible ? "visibility" : "visibility-off"}
        size={20}
        color={theme.colors.textMuted}
      />
    </MotionPressable>
  ) : (
    trailing
  );

  return (
    <AuthInput
      ref={ref}
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry && !passwordVisible}
      // 비밀번호 칸은 영문 자판으로 연다(iOS 비밀번호 칸은 한글 조합이 막혀 입력되지 않음)
      keyboardType={secureTextEntry ? "ascii-capable" : keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      textContentType={textContentType}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      onBlur={onBlur}
      hasError={hasError}
      trailing={resolvedTrailing}
    />
  );
});

export function InlineError({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <MotionFadeIn>
      <View style={styles.errorRow}>
        <AppIcon
          name="error-outline"
          size={14}
          color={theme.colors.dangerIcon}
        />
        <Text style={styles.inlineError}>{children}</Text>
      </View>
    </MotionFadeIn>
  );
}
