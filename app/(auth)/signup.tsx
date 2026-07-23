import { AppIcon } from "@/components/ui/app-icon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AuthInput } from "../../src/components/auth/auth-input";
import { Screen } from "../../src/components/layout/Screen";
import {
  AppText,
  MotionEnter,
  MotionFadeIn,
  MotionPop,
  MotionPressable,
  MotionShake,
  TopBar,
  motionStaggerDelay,
} from "../../src/components/ui";
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
const softEasing = Easing.out(Easing.cubic);

/** Korean mobile display: digits only → 010-XXXX-XXXX (max 11 digits). */
function formatPhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

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
  if (phoneDigits(values.phone).length < 10) {
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
  const enterMotion = isDefault;
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
          id: "admin",
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
      const nextValue = field === "phone" ? formatPhoneNumber(value) : value;
      setValues((current) => ({ ...current, [field]: nextValue }));
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
  const idErrorMessage =
    errors.id ??
    (currentIdAvailability === false || variant === "id-dup"
      ? "이미 사용 중인 아이디입니다"
      : undefined);
  const passwordErrorMessage = isPwError
    ? "비밀번호는 8자 이상, 영문·숫자를 모두 포함해야 합니다"
    : errors.password;
  const passwordConfirmErrorMessage = isPwError
    ? "비밀번호가 일치하지 않습니다"
    : errors.passwordConfirm;
  const phoneErrorMessage = isPhoneError
    ? "연락처는 010-XXXX-XXXX 형식으로 입력해주세요"
    : isPhoneDup
      ? "이미 가입된 연락처입니다"
      : errors.phone;

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
        style={styles.root}
      >
        <TopBar
          title="회원가입"
          back
          onBack={() => {
            // Web refresh / deep link can open /signup with an empty stack.
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace("/login");
          }}
        />
        <ScrollView
          testID="signup-scroll"
          style={styles.scroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MotionEnter enabled={enterMotion} delay={motionStaggerDelay(0)}>
            <AppText variant="display">정보를 입력해주세요</AppText>
          </MotionEnter>

          <MotionEnter
            enabled={enterMotion}
            delay={motionStaggerDelay(1)}
            style={styles.avatarPreview}
          >
            <AutoAvatar name={values.userName} />
            <AppText variant="caption" tone="muted">
              {values.userName
                ? "이름 두 글자로 자동 생성된 프로필"
                : "이름을 입력하면 미리보기가 표시됩니다"}
            </AppText>
          </MotionEnter>

          <MotionEnter
            enabled={enterMotion}
            delay={motionStaggerDelay(2)}
            style={styles.form}
          >
            <Field label="아이디">
              <MotionShake trigger={idErrorMessage}>
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
                  <MotionPressable
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
                  </MotionPressable>
                </View>
              </MotionShake>
              <InlineError>{idErrorMessage}</InlineError>
              {currentIdAvailability === true ? (
                <MotionPop>
                  <View style={styles.successRow}>
                    <AppIcon
                      name="check-circle"
                      size={14}
                      color={theme.colors.success}
                    />
                    <AppText
                      variant="caption"
                      tone="success"
                      style={styles.successHint}
                    >
                      사용 가능한 아이디입니다
                    </AppText>
                  </View>
                </MotionPop>
              ) : null}
            </Field>

            <Field label="비밀번호">
              <MotionShake
                trigger={
                  passwordErrorMessage ?? (isPwError ? "pw-error" : undefined)
                }
              >
                <SignupInput
                  testID="signup-password-input"
                  value={values.password}
                  onChangeText={setField("password")}
                  placeholder="비밀번호"
                  secureTextEntry
                  hasError={isPwError || Boolean(errors.password)}
                />
              </MotionShake>
              {isPwError || errors.password ? (
                <InlineError>{passwordErrorMessage}</InlineError>
              ) : (
                <FieldHint>8자 이상, 영문·숫자 조합</FieldHint>
              )}
            </Field>

            <Field label="비밀번호 확인">
              <MotionShake
                trigger={
                  passwordConfirmErrorMessage ??
                  (isPwError ? "pw-confirm-error" : undefined)
                }
              >
                <SignupInput
                  testID="signup-password-confirm-input"
                  value={values.passwordConfirm}
                  onChangeText={setField("passwordConfirm")}
                  placeholder="비밀번호 확인"
                  secureTextEntry
                  hasError={isPwError || Boolean(errors.passwordConfirm)}
                />
              </MotionShake>
              <InlineError>{passwordConfirmErrorMessage}</InlineError>
            </Field>

            <Field label="이름">
              <MotionShake trigger={errors.userName}>
                <SignupInput
                  testID="signup-name-input"
                  value={values.userName}
                  onChangeText={setField("userName")}
                  placeholder="실명을 입력해주세요"
                  hasError={Boolean(errors.userName)}
                />
              </MotionShake>
              <InlineError>{errors.userName}</InlineError>
              {!errors.userName ? (
                <FieldHint>2~10자, 특수문자는 사용할 수 없어요</FieldHint>
              ) : null}
            </Field>

            <Field label="연락처">
              <MotionShake
                trigger={
                  phoneErrorMessage ??
                  (isPhoneError || isPhoneDup ? "phone-error" : undefined)
                }
              >
                <SignupInput
                  testID="signup-phone-input"
                  value={values.phone}
                  onChangeText={setField("phone")}
                  placeholder="010-XXXX-XXXX"
                  keyboardType="phone-pad"
                  hasError={
                    isPhoneError || isPhoneDup || Boolean(errors.phone)
                  }
                />
              </MotionShake>
              <InlineError>{phoneErrorMessage}</InlineError>
            </Field>
          </MotionEnter>

          {signup.error ? (
            <MotionFadeIn>
              <Text style={styles.error}>
                {getApiErrorMessage(
                  signup.error,
                  authApiErrorMessages,
                  "회원가입에 실패했습니다. 입력 정보를 확인해주세요.",
                )}
              </Text>
            </MotionFadeIn>
          ) : null}
        </ScrollView>

        <MotionEnter enabled={enterMotion} delay={motionStaggerDelay(3)}>
          <View style={styles.bottomFlat}>
            <SubmitButton
              disabled={isSubmitDisabled || signup.isPending || isLoading}
              loading={signup.isPending || isLoading}
              onPress={onSubmit}
            />
          </View>
        </MotionEnter>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SubmitButton({
  disabled,
  loading,
  onPress,
}: {
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const enabledProgress = useSharedValue(disabled ? 0 : 1);
  const wasDisabled = useRef(disabled);

  useEffect(() => {
    const becameEnabled = wasDisabled.current && !disabled;
    wasDisabled.current = disabled;

    if (reduceMotion) {
      enabledProgress.value = disabled ? 0 : 1;
      return;
    }

    if (becameEnabled) {
      enabledProgress.value = 0;
      enabledProgress.value = withTiming(1, {
        duration: theme.motion.duration.base,
        easing: softEasing,
      });
      return;
    }

    enabledProgress.value = withTiming(disabled ? 0 : 1, {
      duration: theme.motion.duration.fast,
      easing: softEasing,
    });
  }, [disabled, enabledProgress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + enabledProgress.value * 0.6,
    transform: [
      {
        scale: 0.98 + enabledProgress.value * 0.02,
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MotionPressable
        testID="signup-submit"
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={styles.submitButton}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.white} />
        ) : (
          <Text style={styles.submitText}>가입 완료</Text>
        )}
      </MotionPressable>
    </Animated.View>
  );
}

function AutoAvatar({ name }: { name?: string }) {
  const trimmed = name?.trim() ?? "";
  const filled = trimmed.length > 0;
  const initials = filled ? trimmed.slice(-2) : "";

  // Single layer only — dual empty/filled opacity layers stacked poorly on web.
  if (!filled) {
    return (
      <View style={[styles.avatar, styles.avatarEmpty]}>
        <AppIcon name="person-outline" size={34} color={theme.colors.inkHint} />
      </View>
    );
  }

  return (
    <MotionPop key="avatar-filled">
      <View style={[styles.avatar, styles.avatarFilled]}>
        <MotionFadeIn key={initials}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </MotionFadeIn>
      </View>
    </MotionPop>
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <AuthInput
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry && !passwordVisible}
      keyboardType={keyboardType}
      hasError={hasError}
      trailing={
        secureTextEntry ? (
          <MotionPressable
            accessibilityLabel={
              passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
            }
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.visibilityButton}
          >
            <MaterialIcons
              name={passwordVisible ? "visibility" : "visibility-off"}
              size={20}
              color={theme.colors.inkMute}
            />
          </MotionPressable>
        ) : null
      }
    />
  );
}

function InlineError({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <MotionFadeIn>
      <View style={styles.errorRow}>
        <AppIcon name="error-outline" size={14} color={theme.colors.danger} />
        <Text style={styles.inlineError}>{children}</Text>
      </View>
    </MotionFadeIn>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <AppText variant="caption" tone="muted" style={styles.hint}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  body: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[4],
  },
  bottomFlat: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[7],
  },
  avatarPreview: {
    marginTop: theme.spacing[5],
    alignItems: "center",
    gap: theme.spacing[2],
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
  form: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[5],
  },
  label: {
    marginBottom: theme.spacing[2],
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  idRow: {
    flexDirection: "row",
    gap: 8,
  },
  idInputWrap: { flex: 1, minWidth: 0 },
  visibilityButton: {
    width: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    marginRight: -8,
    alignItems: "center",
    justifyContent: "center",
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
  successRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  successHint: {
    flex: 1,
  },
  hint: {
    marginTop: 6,
  },
  submitButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  error: { color: theme.colors.danger, fontSize: 13 },
});
