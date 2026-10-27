import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AuthInput } from "../../src/components/auth/auth-input";
import { Screen } from "../../src/components/layout/Screen";
import {
  AppText,
  MotionEnter,
  MotionFadeIn,
  MotionPressable,
  MotionShake,
  Toast,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { authApiErrorMessages } from "../../src/constants/apiErrorMessages";
import { useAuth } from "../../src/hooks/useAuth";
import { getApiErrorMessage } from "../../src/lib/apiErrorMessage";
import { isValidLoginId, sanitizeLoginId } from "../../src/lib/authValidation";
import { readDesignVariant } from "../../src/lib/designVariant";
import { MOCK_LOGIN_CREDENTIALS } from "../../src/mocks/auth";

type FormValues = {
  id: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
function validateLogin(values: FormValues) {
  const errors: FormErrors = {};
  if (!values.id.trim()) {
    errors.id = "아이디를 입력해주세요.";
  } else if (!isValidLoginId(values.id.trim())) {
    errors.id = "영문 소문자와 숫자만 입력할 수 있어요.";
  }
  if (!values.password.trim()) errors.password = "비밀번호를 입력해주세요.";
  return errors;
}

export default function LoginScreen() {
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "default";
  const isDefault = variant === "default";
  const isError = variant === "error";
  const isLoading = variant === "loading";
  const isToast = variant === "toast";
  const enterMotion = isDefault;
  const { login } = useAuth();
  const [values, setValues] = useState<FormValues>({
    id: isDefault ? "" : MOCK_LOGIN_CREDENTIALS.id,
    password: isDefault ? "" : MOCK_LOGIN_CREDENTIALS.password,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const isFilled = values.id.length > 0 && values.password.length > 0;
  const formErrorMessage = login.error
    ? getApiErrorMessage(
        login.error,
        authApiErrorMessages,
        "아이디 또는 비밀번호를 확인해주세요.",
      )
    : isError
      ? "아이디 또는 비밀번호가 올바르지 않습니다"
      : "";

  const onSubmit = () => {
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  };

  return (
    <Screen scroll={false} padded={false}>
      <ScrollView
        testID="login-scroll"
        style={styles.scroll}
        contentContainerStyle={[
          styles.root,
          lockedHeight != null ? { minHeight: lockedHeight } : null,
        ]}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height;
          if (nextHeight <= 0) return;
          // 키보드가 높이를 줄여도 가운데 정렬을 다시 계산하지 않는다.
          setLockedHeight((current) => current ?? nextHeight);
        }}
      >
        <Pressable
          accessible={false}
          onPress={Keyboard.dismiss}
          testID="login-content"
          style={styles.content}
        >
          <View style={styles.mainSection}>
            <View style={styles.hero}>
              <MotionEnter enabled={enterMotion} style={styles.heroCopy}>
                <View style={styles.brandBadge}>
                  <AppText
                    variant="caption"
                    tone="brand"
                    style={styles.eyebrow}
                  >
                    열린문교회 커뮤니티
                  </AppText>
                </View>
                <AppText variant="display" style={styles.title}>
                  {"열린문 커넥트에\n오신 것을 환영합니다"}
                </AppText>
                <AppText
                  variant="body"
                  tone="secondary"
                  style={styles.subtitle}
                >
                  교회 가족과 함께하는 따뜻한 일상
                </AppText>
              </MotionEnter>
            </View>

            <MotionEnter enabled={enterMotion} style={styles.form}>
              <AuthField
                testID="login-id-input"
                label="아이디"
                value={values.id}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(id) => {
                  const sanitized = sanitizeLoginId(id);
                  setValues((current) => ({ ...current, id: sanitized }));
                  if (errors.id) {
                    setErrors((current) => ({ ...current, id: undefined }));
                  }
                }}
                placeholder="아이디를 입력해주세요"
                error={errors.id}
                hasError={isError}
              />
              <AuthField
                testID="login-password-input"
                label="비밀번호"
                value={values.password}
                onChangeText={(password) =>
                  setValues((current) => ({ ...current, password }))
                }
                placeholder="비밀번호를 입력해주세요"
                secureTextEntry={!passwordVisible}
                error={errors.password}
                hasError={isError}
                trailingIcon={passwordVisible ? "visibility" : "visibility-off"}
                trailingLabel={
                  passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
                }
                onTrailingPress={() =>
                  setPasswordVisible((visible) => !visible)
                }
              />
              {formErrorMessage ? (
                <MotionShake trigger={formErrorMessage}>
                  <MotionFadeIn>
                    <AppText variant="caption" tone="danger">
                      {formErrorMessage}
                    </AppText>
                  </MotionFadeIn>
                </MotionShake>
              ) : null}

              <MotionPressable
                accessibilityRole="button"
                disabled={login.isPending || isLoading}
                onPress={onSubmit}
                style={[
                  styles.loginButton,
                  !isFilled && isDefault ? styles.loginButtonDisabled : null,
                ]}
              >
                {login.isPending || isLoading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <AppText variant="body" style={styles.loginButtonText}>
                    로그인
                  </AppText>
                )}
              </MotionPressable>
            </MotionEnter>
          </View>

          <MotionEnter enabled={enterMotion} style={styles.footerBlock}>
            <View style={styles.signupCard}>
              <AppText variant="caption" tone="secondary">
                열린문 커넥트가 처음이신가요?
              </AppText>
              <MotionPressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => router.push("/signup")}
                style={styles.signupLink}
              >
                <AppText
                  variant="caption"
                  tone="brand"
                  style={styles.signupLinkText}
                >
                  회원가입하기
                </AppText>
              </MotionPressable>
            </View>
          </MotionEnter>
        </Pressable>
      </ScrollView>
      <Toast
        message={isToast ? "네트워크 연결을 확인해주세요" : ""}
        icon="sync"
      />
    </Screen>
  );
}

function AuthField({
  testID,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  hasError = false,
  trailingIcon,
  trailingLabel,
  onTrailingPress,
  autoCapitalize,
  autoCorrect,
}: {
  testID?: string;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  hasError?: boolean;
  trailingIcon?: "visibility" | "visibility-off";
  trailingLabel?: string;
  onTrailingPress?: () => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}) {
  const shakeTrigger = error ?? (hasError ? "error" : undefined);

  return (
    <MotionShake trigger={shakeTrigger}>
      <AppText variant="caption" tone="secondary" style={styles.fieldLabel}>
        {label}
      </AppText>
      <AuthInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        hasError={hasError || Boolean(error)}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        trailing={
          trailingIcon ? (
            <MotionPressable
              accessibilityLabel={trailingLabel}
              accessibilityRole="button"
              hitSlop={8}
              onPress={onTrailingPress}
              style={styles.trailingButton}
            >
              <MaterialIcons
                name={trailingIcon}
                size={20}
                color={theme.colors.inkMute}
              />
            </MotionPressable>
          ) : null
        }
      />
      {error ? (
        <MotionFadeIn>
          <AppText variant="caption" tone="danger" style={styles.fieldError}>
            {error}
          </AppText>
        </MotionFadeIn>
      ) : null}
    </MotionShake>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  root: {
    flexGrow: 1,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[3],
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[6],
  },
  mainSection: {
    gap: theme.spacing[8],
  },
  hero: { alignItems: "flex-start" },
  heroCopy: { alignItems: "flex-start" },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    marginBottom: theme.spacing[3],
  },
  eyebrow: {
    fontWeight: theme.fontWeight.semibold,
  },
  title: {
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: { marginTop: theme.spacing[2] },
  form: { gap: theme.spacing[5] },
  footerBlock: {
    marginTop: theme.spacing[8],
  },
  fieldLabel: {
    marginBottom: 8,
  },
  trailingButton: {
    width: 40,
    height: 40,
    marginRight: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldError: { marginTop: 6 },
  loginButton: {
    minHeight: 52,
    marginTop: theme.spacing[2],
    borderRadius: theme.radius.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  loginButtonDisabled: {
    opacity: 0.45,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    fontSize: theme.fontSize.base,
  },
  signupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  signupLink: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  signupLinkText: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.semibold,
  },
});
