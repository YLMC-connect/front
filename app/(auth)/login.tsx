import { AppIcon } from "@/components/ui/app-icon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AuthInput } from "../../src/components/auth/auth-input";
import { Screen } from "../../src/components/layout/Screen";
import { AppText, Button, Toast } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { authApiErrorMessages } from "../../src/constants/apiErrorMessages";
import { useAuth } from "../../src/hooks/useAuth";
import { getApiErrorMessage } from "../../src/lib/apiErrorMessage";
import { readDesignVariant } from "../../src/lib/designVariant";
import { MOCK_LOGIN_CREDENTIALS } from "../../src/mocks/auth";

type FormValues = {
  id: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
function validateLogin(values: FormValues) {
  const errors: FormErrors = {};
  if (!values.id.trim()) errors.id = "아이디를 입력해주세요.";
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
  const { login } = useAuth();
  const [values, setValues] = useState<FormValues>({
    id: isDefault ? "" : MOCK_LOGIN_CREDENTIALS.id,
    password: isDefault ? "" : MOCK_LOGIN_CREDENTIALS.password,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const isFilled = values.id.length > 0 && values.password.length > 0;

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
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
              ? "height"
              : undefined
        }
        style={styles.keyboard}
      >
        <ScrollView
          testID="login-scroll"
          contentContainerStyle={styles.root}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View testID="login-content" style={styles.content}>
            <View style={styles.hero}>
              <View style={styles.logo}>
                <AppIcon name="door-front" size={38} color="#fff" />
              </View>
              <AppText variant="screenTitle" style={styles.title}>
                열린문 커넥트
              </AppText>
              <AppText variant="body" tone="secondary" style={styles.subtitle}>
                교회 가족과 함께하는 일상
              </AppText>
            </View>

            <View style={styles.form}>
              <AuthField
                testID="login-id-input"
                label="아이디"
                value={values.id}
                onChangeText={(id) =>
                  setValues((current) => ({ ...current, id }))
                }
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
              {login.error || isError ? (
                <AppText variant="caption" tone="danger">
                  {login.error
                    ? getApiErrorMessage(
                        login.error,
                        authApiErrorMessages,
                        "아이디 또는 비밀번호를 확인해주세요.",
                      )
                    : "아이디 또는 비밀번호가 올바르지 않습니다"}
                </AppText>
              ) : null}
              <Button
                onPress={onSubmit}
                loading={login.isPending || isLoading}
                disabled={!isFilled && isDefault}
              >
                로그인
              </Button>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFeedback("비밀번호 찾기는 준비 중입니다")}
                style={styles.findPassword}
              >
                <AppText variant="caption" tone="muted">
                  비밀번호 찾기
                </AppText>
              </Pressable>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <AppText variant="caption" tone="disabled">
                  처음이신가요?
                </AppText>
                <View style={styles.divider} />
              </View>
              <Link href="/signup" style={styles.signupButton}>
                회원가입
              </Link>
            </View>
          </View>
          <AppText variant="caption" tone="disabled" style={styles.copy}>
            © 열린문교회
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast
        message={feedback || (isToast ? "네트워크 연결을 확인해주세요" : "")}
        icon={feedback ? "info" : "sync"}
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
}) {
  return (
    <View>
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
        trailing={
          trailingIcon ? (
            <Pressable
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
            </Pressable>
          ) : null
        }
      />
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.fieldError}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  root: {
    flexGrow: 1,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[3],
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: theme.spacing[5],
    paddingBottom: 72,
  },
  hero: { alignItems: "center" },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91,122,176,0.55)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    marginTop: 16,
  },
  subtitle: { marginTop: theme.spacing[1] },
  form: { gap: 14, marginTop: 36 },
  fieldLabel: {
    marginBottom: 6,
  },
  trailingButton: {
    width: 40,
    height: 40,
    marginRight: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldError: { marginTop: 6 },
  findPassword: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  divider: { flex: 1, height: 1, backgroundColor: theme.colors.line },
  signupButton: {
    color: theme.colors.primaryDeep,
    textAlign: "center",
    fontWeight: "800",
    paddingVertical: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
  },
  copy: {
    textAlign: "center",
    paddingVertical: theme.spacing[3],
  },
});
