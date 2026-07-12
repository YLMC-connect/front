import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { TopBar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { authApiErrorMessages } from "../../src/constants/apiErrorMessages";
import { useAuth } from "../../src/hooks/useAuth";
import { getApiErrorMessage } from "../../src/lib/apiErrorMessage";
import { readDesignVariant } from "../../src/lib/designVariant";

type FormValues = {
  id: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  phone: string;
  email: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type IdAvailability = {
  value: string;
  available: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(values: FormValues) {
  const errors: FormErrors = {};
  if (values.id.trim().length < 3) {
    errors.id = "아이디는 3자 이상 입력해주세요.";
  }
  if (values.password.length < 8) {
    errors.password = "비밀번호는 8자 이상 입력해주세요.";
  }
  if (!values.passwordConfirm) {
    errors.passwordConfirm = "비밀번호를 한 번 더 입력해주세요.";
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다";
  }
  if (values.userName.trim().length < 2) {
    errors.userName = "이름을 입력해주세요.";
  }
  if (values.phone.trim().length < 10) {
    errors.phone = "연락처를 입력해주세요.";
  }
  if (values.email && !emailPattern.test(values.email)) {
    errors.email = "이메일 형식이 올바르지 않습니다.";
  }
  return errors;
}

export default function SignupScreen() {
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const { checkAvailability, signup } = useAuth();
  const variant = readDesignVariant(params.designVariant) ?? "default";
  const isDefault = variant === "default";
  const isPwError = variant === "pw-error";
  const isPhoneError = variant === "phone-error";
  const isPhoneDup = variant === "phone-dup";
  const isLoading = variant === "loading";
  const [values, setValues] = useState<FormValues>(
    isDefault
      ? {
          id: "",
          password: "",
          passwordConfirm: "",
          userName: "",
          phone: "",
          email: "",
        }
      : {
          id: "gracekim",
          password: isPwError ? "1234" : "spring2026!",
          passwordConfirm: isPwError ? "spring2026" : "spring2026!",
          userName: "김은혜",
          phone: isPhoneError ? "010-2222" : "010-2345-6789",
          email: "",
        },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [idAvailability, setIdAvailability] = useState<IdAvailability | null>(
    null,
  );
  const currentIdAvailability =
    idAvailability?.value === values.id.trim()
      ? idAvailability.available
      : null;

  const setField =
    (field: keyof FormValues) =>
    (value: string): void => {
      setValues((current) => ({ ...current, [field]: value }));
      if (field === "id") setIdAvailability(null);
    };

  const onCheckIdAvailability = () => {
    const id = values.id.trim();
    if (id.length < 3) {
      setErrors((current) => ({
        ...current,
        id: "아이디는 3자 이상 입력해주세요.",
      }));
      return;
    }

    setErrors((current) => ({ ...current, id: undefined }));
    checkAvailability.mutate(
      { searchType: "id", searchValue: id },
      {
        onSuccess: ({ available }) =>
          setIdAvailability({ value: id, available }),
      },
    );
  };

  const onSubmit = () => {
    const nextErrors = validateSignup(values);
    if (isDefault && currentIdAvailability !== true) {
      nextErrors.id = "아이디 중복 확인이 필요합니다.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { passwordConfirm: _passwordConfirm, ...signupInput } = values;

    signup.mutate(signupInput, {
      onSuccess: () => router.replace("/"),
    });
  };
  const allFilled = Boolean(
    values.id &&
    values.password &&
    values.passwordConfirm &&
    values.userName &&
    values.phone,
  );
  const isSubmitDisabled = !allFilled && isDefault;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="회원가입" back onBack={() => router.back()} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.display}>정보를 입력해주세요</Text>

          <View style={styles.avatarPreview}>
            <AutoAvatar name={values.userName} />
            <Text style={styles.avatarCaption}>
              {values.userName
                ? "이름 두 글자로 자동 생성된 프로필"
                : "이름을 입력하면 미리보기가 표시됩니다"}
            </Text>
          </View>

          <View style={styles.form}>
            <Field label="아이디">
              <View style={styles.idRow}>
                <View style={styles.idInputWrap}>
                  <SignupInput
                    testID="signup-id-input"
                    value={values.id}
                    onChangeText={setField("id")}
                    placeholder="아이디"
                    hasError={
                      currentIdAvailability === false ||
                      variant === "id-dup" ||
                      Boolean(errors.id)
                    }
                  />
                </View>
                <Pressable
                  testID="signup-check-id"
                  accessibilityRole="button"
                  onPress={onCheckIdAvailability}
                  disabled={checkAvailability.isPending}
                  style={styles.checkButton}
                >
                  {checkAvailability.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primaryDeep}
                    />
                  ) : (
                    <Text style={styles.checkButtonText}>중복 확인</Text>
                  )}
                </Pressable>
              </View>
              <InlineError>
                {errors.id ??
                  (currentIdAvailability === false || variant === "id-dup"
                    ? "이미 사용 중인 아이디입니다"
                    : undefined)}
              </InlineError>
              {currentIdAvailability === true ? (
                <FieldHint>사용 가능한 아이디입니다</FieldHint>
              ) : null}
            </Field>

            <Field label="비밀번호">
              <SignupInput
                testID="signup-password-input"
                value={values.password}
                onChangeText={setField("password")}
                placeholder="비밀번호"
                secureTextEntry
                hasError={isPwError || Boolean(errors.password)}
              />
              {isPwError || errors.password ? (
                <InlineError>
                  {isPwError
                    ? "비밀번호는 8자 이상, 영문·숫자를 모두 포함해야 합니다"
                    : errors.password}
                </InlineError>
              ) : (
                <FieldHint>8자 이상, 영문·숫자 조합</FieldHint>
              )}
            </Field>

            <Field label="비밀번호 확인">
              <SignupInput
                testID="signup-password-confirm-input"
                value={values.passwordConfirm}
                onChangeText={setField("passwordConfirm")}
                placeholder="비밀번호 확인"
                secureTextEntry
                hasError={isPwError || Boolean(errors.passwordConfirm)}
              />
              <InlineError>
                {isPwError
                  ? "비밀번호가 일치하지 않습니다"
                  : errors.passwordConfirm}
              </InlineError>
            </Field>

            <Field label="이름">
              <SignupInput
                testID="signup-name-input"
                value={values.userName}
                onChangeText={setField("userName")}
                placeholder="실명을 입력해주세요"
                hasError={Boolean(errors.userName)}
              />
              <InlineError>{errors.userName}</InlineError>
              {!errors.userName ? (
                <FieldHint>2~10자, 특수문자는 사용할 수 없어요</FieldHint>
              ) : null}
            </Field>

            <Field label="연락처">
              <SignupInput
                testID="signup-phone-input"
                value={values.phone}
                onChangeText={setField("phone")}
                placeholder="010-XXXX-XXXX"
                keyboardType="phone-pad"
                hasError={isPhoneError || isPhoneDup || Boolean(errors.phone)}
              />
              <InlineError>
                {isPhoneError
                  ? "연락처는 010-XXXX-XXXX 형식으로 입력해주세요"
                  : isPhoneDup
                    ? "이미 가입된 연락처입니다"
                    : errors.phone}
              </InlineError>
              {!isPhoneError && !isPhoneDup && !errors.phone ? (
                <FieldHint>
                  숫자만 입력하면 자동으로 하이픈이 추가돼요
                </FieldHint>
              ) : null}
            </Field>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons
              name="info"
              size={17}
              color={theme.colors.primaryDeep}
            />
            <Text style={styles.infoText}>
              목장과 부서는 가입 후 관리자가 확인하여 배정해드려요.
            </Text>
          </View>

          {signup.error ? (
            <Text style={styles.error}>
              {getApiErrorMessage(
                signup.error,
                authApiErrorMessages,
                "회원가입에 실패했습니다. 입력 정보를 확인해주세요.",
              )}
            </Text>
          ) : null}
        </ScrollView>

        <View style={styles.bottomFlat}>
          <Pressable
            testID="signup-submit"
            accessibilityRole="button"
            onPress={onSubmit}
            disabled={isSubmitDisabled || signup.isPending || isLoading}
            style={[
              styles.submitButton,
              isSubmitDisabled ? styles.submitButtonDisabled : null,
            ]}
          >
            {signup.isPending || isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.submitText}>가입 완료</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function AutoAvatar({ name }: { name?: string }) {
  const trimmed = name?.trim() ?? "";
  const initials = trimmed ? trimmed.slice(-2) : "";

  return (
    <View
      style={[
        styles.avatar,
        trimmed ? styles.avatarFilled : styles.avatarEmpty,
      ]}
    >
      {trimmed ? (
        <Text style={styles.avatarInitials}>{initials}</Text>
      ) : (
        <MaterialIcons
          name="person-outline"
          size={34}
          color={theme.colors.inkHint}
        />
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function SignupInput({
  testID,
  value,
  onChangeText,
  placeholder,
  hasError,
  secureTextEntry,
  keyboardType = "default",
}: {
  testID?: string;
  value?: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  hasError?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View
      style={[
        styles.inputWrap,
        hasError ? styles.inputWrapError : null,
        secureTextEntry ? styles.inputWrapWithIcon : null,
      ]}
    >
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkMute}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={styles.input}
      />
      {secureTextEntry ? (
        <MaterialIcons
          name="visibility-off"
          size={20}
          color={theme.colors.inkMute}
        />
      ) : null}
    </View>
  );
}

function InlineError({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <View style={styles.errorRow}>
      <MaterialIcons
        name="error-outline"
        size={14}
        color={theme.colors.danger}
      />
      <Text style={styles.inlineError}>{children}</Text>
    </View>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  display: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.display,
    lineHeight: theme.lineHeight.display,
    fontWeight: "900",
  },
  avatarPreview: {
    marginTop: 22,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFilled: {
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91,122,176,0.50)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 11,
    elevation: 4,
  },
  avatarEmpty: {
    backgroundColor: theme.colors.surface2,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.lineStrong,
  },
  avatarInitials: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "900",
  },
  avatarCaption: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  form: {
    marginTop: 28,
    gap: 20,
  },
  label: {
    marginBottom: 6,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.semibold,
  },
  idRow: {
    flexDirection: "row",
    gap: 8,
  },
  idInputWrap: { flex: 1, minWidth: 0 },
  inputWrap: {
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapWithIcon: {
    paddingRight: 10,
  },
  inputWrapError: {
    borderColor: theme.colors.danger,
    backgroundColor: "#FDF4F1",
  },
  input: {
    flex: 1,
    height: "100%",
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    padding: 0,
  },
  checkButton: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.semibold,
  },
  errorRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inlineError: {
    flex: 1,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
    fontWeight: theme.fontWeight.medium,
  },
  hint: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  infoBox: {
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: "row",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  bottomFlat: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  submitButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  error: { color: theme.colors.danger, fontSize: 13 },
});
