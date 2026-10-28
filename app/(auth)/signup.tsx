import { AppIcon } from "@/components/ui/app-icon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
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
import {
  type TermKey,
  TermsSheet,
} from "../../src/components/auth/TermsAgreementScreen";
import { Screen } from "../../src/components/layout/Screen";
import {
  AppText,
  MotionEnter,
  MotionFadeIn,
  MotionPop,
  MotionPressable,
  MotionShake,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { authApiErrorMessages } from "../../src/constants/apiErrorMessages";
import { useAuth } from "../../src/hooks/useAuth";
import { getApiErrorMessage } from "../../src/lib/apiErrorMessage";
import { isValidLoginId, sanitizeLoginId } from "../../src/lib/authValidation";
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
type Availability = {
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
  } else if (!isValidLoginId(values.id.trim())) {
    errors.id = "영문 소문자와 숫자만 입력할 수 있어요.";
  }
  if (values.password.length < 8) {
    errors.password = "비밀번호는 8자 이상 입력해주세요.";
  }
  if (values.userName.trim().length < 2) {
    errors.userName = "이름을 입력해주세요.";
  }
  if (phoneDigits(values.phone).length < 10) {
    errors.phone = "연락처를 입력해주세요.";
  }
  if (!emailPattern.test(values.email)) {
    errors.email = "이메일을 입력해주세요.";
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

  const idInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

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
          passwordConfirm: isPwError ? "1234" : "spring2026!",
          userName: "김은혜",
          phone: isPhoneError ? "010-2222" : "010-2345-6789",
          email: "",
        },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [idAvailability, setIdAvailability] = useState<Availability | null>(
    null,
  );
  const [emailAvailability, setEmailAvailability] =
    useState<Availability | null>(null);
  const [lastAvailabilityTarget, setLastAvailabilityTarget] = useState<
    "id" | "email" | null
  >(null);

  // Terms state (unchecked by default)
  const [termsSheetKey, setTermsSheetKey] = useState<TermKey | null>(null);
  const [agreedTerms, setAgreedTerms] = useState<{
    tos: boolean;
    privacy: boolean;
  }>({
    tos: false,
    privacy: false,
  });

  const allTermsAgreed = agreedTerms.tos && agreedTerms.privacy;
  const toggleAllTerms = () => {
    const next = !allTermsAgreed;
    setAgreedTerms({ tos: next, privacy: next });
  };

  const currentIdAvailability =
    idAvailability?.value === values.id.trim()
      ? idAvailability.available
      : null;
  const currentEmailAvailability =
    emailAvailability?.value === values.email.trim()
      ? emailAvailability.available
      : null;

  const setField =
    (field: keyof FormValues) =>
    (value: string): void => {
      let nextValue = value;
      if (field === "phone") {
        nextValue = formatPhoneNumber(value);
      } else if (field === "id") {
        nextValue = sanitizeLoginId(value);
      }
      setValues((current) => ({
        ...current,
        [field]: nextValue,
        // Keep password and passwordConfirm in sync automatically
        ...(field === "password" ? { passwordConfirm: nextValue } : {}),
      }));
      if (field === "id" || field === "email") {
        if (field === "id") setIdAvailability(null);
        if (field === "email") setEmailAvailability(null);
        setLastAvailabilityTarget(null);
        checkAvailability.reset();
      }
    };

  const onCheckAvailability = (target: "id" | "email") => {
    const value = values[target].trim();
    if (target === "id") {
      if (value.length < 3) {
        setErrors((current) => ({
          ...current,
          id: "아이디는 3자 이상 입력해주세요.",
        }));
        return;
      }
      if (!isValidLoginId(value)) {
        setErrors((current) => ({
          ...current,
          id: "영문 소문자와 숫자만 입력할 수 있어요.",
        }));
        return;
      }
    }
    if (target === "email" && !emailPattern.test(value)) {
      setErrors((current) => ({
        ...current,
        email: "이메일 형식이 올바르지 않습니다.",
      }));
      return;
    }

    setErrors((current) => ({ ...current, [target]: undefined }));
    setLastAvailabilityTarget(target);
    checkAvailability.mutate(
      { searchType: target, searchValue: value },
      {
        onSuccess: ({ available }) => {
          const result = { value, available };
          if (target === "id") setIdAvailability(result);
          else setEmailAvailability(result);
        },
      },
    );
  };

  const onIdBlur = () => {
    const trimmed = values.id.trim();
    if (
      trimmed.length >= 3 &&
      isValidLoginId(trimmed) &&
      currentIdAvailability === null
    ) {
      onCheckAvailability("id");
    }
  };

  const onEmailBlur = () => {
    const trimmed = values.email.trim();
    if (emailPattern.test(trimmed) && currentEmailAvailability === null) {
      onCheckAvailability("email");
    }
  };

  const onSubmit = () => {
    const nextErrors = validateSignup(values);
    if (isDefault && currentIdAvailability !== true) {
      nextErrors.id = "아이디 중복 확인이 필요합니다.";
    }
    if (isDefault && currentEmailAvailability !== true) {
      nextErrors.email = "이메일 중복 확인이 필요합니다.";
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
    values.userName &&
    values.phone &&
    values.email,
  );
  const isSubmitDisabled = (!allFilled || !allTermsAgreed) && isDefault;

  const availabilityErrorMessage = checkAvailability.error
    ? getApiErrorMessage(
        checkAvailability.error,
        authApiErrorMessages,
        "중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.",
      )
    : undefined;
  const idErrorMessage =
    errors.id ??
    (lastAvailabilityTarget === "id" ? availabilityErrorMessage : undefined) ??
    (currentIdAvailability === false || variant === "id-dup"
      ? "이미 사용 중인 아이디입니다"
      : undefined);
  const emailErrorMessage =
    errors.email ??
    (lastAvailabilityTarget === "email"
      ? availabilityErrorMessage
      : undefined) ??
    (currentEmailAvailability === false
      ? "이미 사용 중인 이메일입니다"
      : undefined);
  const passwordErrorMessage = isPwError
    ? "비밀번호는 8자 이상, 영문·숫자를 모두 포함해야 합니다"
    : errors.password;
  const phoneErrorMessage = isPhoneError
    ? "연락처는 010-XXXX-XXXX 형식으로 입력해주세요"
    : isPhoneDup
      ? "이미 가입된 연락처입니다"
      : errors.phone;

  // Realtime password criteria
  const hasMinLength = values.password.length >= 8;
  const hasAlphaNumeric =
    /[a-zA-Z]/.test(values.password) && /\d/.test(values.password);

  // Progressive card unlock conditions
  const isCard1Complete = Boolean(
    values.id.trim().length >= 3 &&
      isValidLoginId(values.id.trim()) &&
      currentIdAvailability === true &&
      hasMinLength &&
      hasAlphaNumeric &&
      !errors.password,
  );

  // Realtime member info criteria
  const trimmedName = values.userName.trim();
  const hasNameLength = trimmedName.length >= 2 && trimmedName.length <= 10;
  const hasNoSpecialChars =
    trimmedName.length > 0 && /^[a-zA-Z가-힣0-9\s]+$/.test(trimmedName);
  const isNameValid = hasNameLength && hasNoSpecialChars;

  const rawPhoneDigits = phoneDigits(values.phone);
  const hasPhonePrefix = rawPhoneDigits.startsWith("010");
  const hasPhoneLength =
    rawPhoneDigits.length >= 10 && rawPhoneDigits.length <= 11;
  const isPhoneValid =
    hasPhonePrefix && hasPhoneLength && !isPhoneError && !isPhoneDup;

  const trimmedEmail = values.email.trim();
  const hasValidEmailFormat = emailPattern.test(trimmedEmail);
  const isEmailChecked = currentEmailAvailability === true;

  const isCard2Complete = Boolean(
    isNameValid &&
      isPhoneValid &&
      hasValidEmailFormat &&
      currentEmailAvailability !== false &&
      !errors.userName &&
      !errors.phone &&
      !errors.email &&
      !isPhoneError &&
      !isPhoneDup,
  );

  const [unlockedStep, setUnlockedStep] = useState<number>(() => {
    if (isCard1Complete && isCard2Complete) return 3;
    if (isCard1Complete) return 2;
    return 1;
  });

  // Auto-advance to Step 2 when Card 1 is completed
  useEffect(() => {
    if (isCard1Complete && unlockedStep < 2) {
      setUnlockedStep(2);
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isCard1Complete, unlockedStep]);

  // Auto-advance to Step 3 when Card 2 is completed
  useEffect(() => {
    if (unlockedStep >= 2 && isCard2Complete && unlockedStep < 3) {
      setUnlockedStep(3);
    }
  }, [unlockedStep, isCard2Complete]);

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
          contentContainerStyle={[styles.body, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessible={false}
            onPress={Keyboard.dismiss}
            style={{ flexGrow: 1 }}
          >
            <MotionEnter enabled={enterMotion}>
              <AppText variant="display">정보를 입력해주세요</AppText>
              <Text style={styles.headerSubtitle}>
                열린문 커넥트의 성도로 함께 소통해요
              </Text>
            </MotionEnter>

            <MotionEnter enabled={enterMotion} style={styles.form}>
              {/* 섹션 3: 약관 동의 (새로 작성할 카드가 위쪽에 추가) */}
              {unlockedStep >= 3 ? (
                <MotionEnter mode="fade" enabled={enterMotion}>
                  <View style={styles.termsCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionBadge}>
                        <Text style={styles.sectionBadgeText}>3</Text>
                      </View>
                      <Text style={styles.sectionTitle}>약관 동의</Text>
                    </View>

                    <Pressable
                      testID="signup-terms-all"
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: allTermsAgreed }}
                      onPress={toggleAllTerms}
                      style={[
                        styles.termsAllRow,
                        allTermsAgreed ? styles.termsAllRowOn : null,
                      ]}
                    >
                      <CheckBadge on={allTermsAgreed} big />
                      <Text style={styles.termsAllText}>약관 전체 동의하기</Text>
                    </Pressable>

                    <View style={styles.termsList}>
                      <View style={styles.termsRow}>
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: agreedTerms.tos }}
                          onPress={() =>
                            setAgreedTerms((prev) => ({
                              ...prev,
                              tos: !prev.tos,
                            }))
                          }
                          style={styles.termsCheckWrap}
                        >
                          <CheckBadge on={agreedTerms.tos} />
                          <Text style={styles.termsItemText}>
                            <Text style={styles.termsRequired}>[필수]</Text> 서비스
                            이용약관
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setTermsSheetKey("tos")}
                          style={styles.termsDetailButton}
                        >
                          <Text style={styles.termsDetailText}>보기</Text>
                          <AppIcon
                            name="chevron-right"
                            size={14}
                            color={theme.colors.inkMute}
                          />
                        </Pressable>
                      </View>

                      <View style={styles.termsRow}>
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: agreedTerms.privacy }}
                          onPress={() =>
                            setAgreedTerms((prev) => ({
                              ...prev,
                              privacy: !prev.privacy,
                            }))
                          }
                          style={styles.termsCheckWrap}
                        >
                          <CheckBadge on={agreedTerms.privacy} />
                          <Text style={styles.termsItemText}>
                            <Text style={styles.termsRequired}>[필수]</Text> 개인정보
                            처리방침
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setTermsSheetKey("privacy")}
                          style={styles.termsDetailButton}
                        >
                          <Text style={styles.termsDetailText}>보기</Text>
                          <AppIcon
                            name="chevron-right"
                            size={14}
                            color={theme.colors.inkMute}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </MotionEnter>
              ) : null}

              {/* 섹션 2: 성도 정보 (새로 작성할 카드가 위쪽에 추가) */}
              {unlockedStep >= 2 ? (
                <MotionEnter mode="fade" enabled={enterMotion}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionBadge}>
                        <Text style={styles.sectionBadgeText}>2</Text>
                      </View>
                      <Text style={styles.sectionTitle}>성도 정보</Text>
                    </View>

                    <Field label="이름">
                      <MotionShake trigger={errors.userName}>
                        <SignupInput
                          ref={nameInputRef}
                          testID="signup-name-input"
                          value={values.userName}
                          onChangeText={setField("userName")}
                          placeholder="실명을 입력해주세요"
                          autoComplete="name"
                          textContentType="name"
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            phoneInputRef.current?.focus()
                          }
                          hasError={Boolean(errors.userName)}
                          trailing={
                            isNameValid ? (
                              <MotionPop>
                                <AppIcon
                                  name="check-circle"
                                  size={18}
                                  color={theme.colors.success}
                                />
                              </MotionPop>
                            ) : null
                          }
                        />
                      </MotionShake>

                      {/* Realtime name criteria feedback */}
                      <View style={styles.passwordRulesRow}>
                        <View style={styles.ruleItem}>
                          <AppIcon
                            name={hasNameLength ? "check" : "circle"}
                            size={12}
                            color={
                              hasNameLength
                                ? theme.colors.primaryDeep
                                : theme.colors.inkMute
                            }
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              hasNameLength ? styles.ruleTextPass : null,
                            ]}
                          >
                            2~10자
                          </Text>
                        </View>
                        <View style={styles.ruleItem}>
                          <AppIcon
                            name={hasNoSpecialChars ? "check" : "circle"}
                            size={12}
                            color={
                              hasNoSpecialChars
                                ? theme.colors.primaryDeep
                                : theme.colors.inkMute
                            }
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              hasNoSpecialChars ? styles.ruleTextPass : null,
                            ]}
                          >
                            특수문자 제외
                          </Text>
                        </View>
                      </View>

                      <InlineError>{errors.userName}</InlineError>
                    </Field>

                    <Field label="연락처">
                      <MotionShake
                        trigger={
                          phoneErrorMessage ??
                          (isPhoneError || isPhoneDup
                            ? "phone-error"
                            : undefined)
                        }
                      >
                        <SignupInput
                          ref={phoneInputRef}
                          testID="signup-phone-input"
                          value={values.phone}
                          onChangeText={setField("phone")}
                          placeholder="010-XXXX-XXXX"
                          keyboardType="phone-pad"
                          autoComplete="tel"
                          textContentType="telephoneNumber"
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            emailInputRef.current?.focus()
                          }
                          hasError={
                            isPhoneError ||
                            isPhoneDup ||
                            Boolean(errors.phone)
                          }
                          trailing={
                            isPhoneValid ? (
                              <MotionPop>
                                <AppIcon
                                  name="check-circle"
                                  size={18}
                                  color={theme.colors.success}
                                />
                              </MotionPop>
                            ) : null
                          }
                        />
                      </MotionShake>

                      {/* Realtime phone criteria feedback */}
                      <View style={styles.passwordRulesRow}>
                        <View style={styles.ruleItem}>
                          <AppIcon
                            name={hasPhonePrefix ? "check" : "circle"}
                            size={12}
                            color={
                              hasPhonePrefix
                                ? theme.colors.primaryDeep
                                : theme.colors.inkMute
                            }
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              hasPhonePrefix ? styles.ruleTextPass : null,
                            ]}
                          >
                            010 시작
                          </Text>
                        </View>
                        <View style={styles.ruleItem}>
                          <AppIcon
                            name={hasPhoneLength ? "check" : "circle"}
                            size={12}
                            color={
                              hasPhoneLength
                                ? theme.colors.primaryDeep
                                : theme.colors.inkMute
                            }
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              hasPhoneLength ? styles.ruleTextPass : null,
                            ]}
                          >
                            10~11자리
                          </Text>
                        </View>
                      </View>

                      <InlineError>{phoneErrorMessage}</InlineError>
                    </Field>

                    <Field label="이메일">
                      <MotionShake trigger={emailErrorMessage}>
                        <SignupInput
                          ref={emailInputRef}
                          testID="signup-email-input"
                          value={values.email}
                          onChangeText={setField("email")}
                          placeholder="이메일 주소"
                          keyboardType="email-address"
                          autoComplete="email"
                          textContentType="emailAddress"
                          autoCapitalize="none"
                          returnKeyType="done"
                          onBlur={onEmailBlur}
                          onSubmitEditing={() => {
                            emailInputRef.current?.blur();
                            onEmailBlur();
                            if (isCard2Complete) {
                              setUnlockedStep((prev) => Math.max(prev, 3));
                            }
                          }}
                          hasError={Boolean(emailErrorMessage)}
                          trailing={
                            checkAvailability.isPending &&
                            lastAvailabilityTarget === "email" ? (
                              <ActivityIndicator
                                size="small"
                                color={theme.colors.primaryDeep}
                              />
                            ) : currentEmailAvailability === true ? (
                              <MotionPop>
                                <AppIcon
                                  name="check-circle"
                                  size={18}
                                  color={theme.colors.success}
                                />
                              </MotionPop>
                            ) : null
                          }
                        />
                      </MotionShake>

                      {/* Realtime email criteria feedback */}
                      <View style={styles.passwordRulesRow}>
                        <View style={styles.ruleItem}>
                          <AppIcon
                            name={hasValidEmailFormat ? "check" : "circle"}
                            size={12}
                            color={
                              hasValidEmailFormat
                                ? theme.colors.primaryDeep
                                : theme.colors.inkMute
                            }
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              hasValidEmailFormat ? styles.ruleTextPass : null,
                            ]}
                          >
                            이메일 형식
                          </Text>
                        </View>
                        <View style={styles.ruleItem}>
                          <AppIcon
                            name={isEmailChecked ? "check" : "circle"}
                            size={12}
                            color={
                              isEmailChecked
                                ? theme.colors.primaryDeep
                                : theme.colors.inkMute
                            }
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              isEmailChecked ? styles.ruleTextPass : null,
                            ]}
                          >
                            중복 확인 완료
                          </Text>
                        </View>
                      </View>

                      {/* Invisible trigger for automated tests and scripts */}
                      <Pressable
                        testID="signup-check-email"
                        accessibilityRole="button"
                        accessibilityLabel="이메일 중복 확인"
                        onPress={() => onCheckAvailability("email")}
                        style={styles.hiddenTrigger}
                      />
                      <InlineError>{emailErrorMessage}</InlineError>
                      {currentEmailAvailability === true ? (
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
                              사용 가능한 이메일입니다
                            </AppText>
                          </View>
                        </MotionPop>
                      ) : null}
                    </Field>
                  </View>
                </MotionEnter>
              ) : null}

              {/* 섹션 1: 계정 정보 (최하단) */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>1</Text>
                  </View>
                  <Text style={styles.sectionTitle}>계정 정보</Text>
                </View>

                <Field label="아이디">
                  <MotionShake trigger={idErrorMessage}>
                    <SignupInput
                      ref={idInputRef}
                      testID="signup-id-input"
                      value={values.id}
                      keyboardType="ascii-capable"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="username"
                      textContentType="username"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      onBlur={onIdBlur}
                      onChangeText={setField("id")}
                      placeholder="아이디"
                      hasError={Boolean(idErrorMessage)}
                      trailing={
                        checkAvailability.isPending &&
                        lastAvailabilityTarget === "id" ? (
                          <ActivityIndicator
                            size="small"
                            color={theme.colors.primaryDeep}
                          />
                        ) : currentIdAvailability === true ? (
                          <MotionPop>
                            <AppIcon
                              name="check-circle"
                              size={18}
                              color={theme.colors.success}
                            />
                          </MotionPop>
                        ) : null
                      }
                    />
                  </MotionShake>
                  {/* Invisible trigger for automated tests and scripts */}
                  <Pressable
                    testID="signup-check-id"
                    accessibilityRole="button"
                    accessibilityLabel="중복 확인"
                    onPress={() => onCheckAvailability("id")}
                    style={styles.hiddenTrigger}
                  />
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
                      passwordErrorMessage ??
                      (isPwError ? "pw-error" : undefined)
                    }
                  >
                    <SignupInput
                      ref={passwordInputRef}
                      testID="signup-password-input"
                      value={values.password}
                      onChangeText={setField("password")}
                      placeholder="비밀번호 입력"
                      secureTextEntry
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        if (isCard1Complete) {
                          setUnlockedStep((prev) => Math.max(prev, 2));
                          setTimeout(() => nameInputRef.current?.focus(), 60);
                        } else if (nameInputRef.current) {
                          nameInputRef.current.focus();
                        }
                      }}
                      hasError={isPwError || Boolean(errors.password)}
                    />
                  </MotionShake>

                  {/* Realtime password criteria feedback */}
                  <View style={styles.passwordRulesRow}>
                    <View style={styles.ruleItem}>
                      <AppIcon
                        name={hasMinLength ? "check" : "circle"}
                        size={12}
                        color={
                          hasMinLength
                            ? theme.colors.primaryDeep
                            : theme.colors.inkMute
                        }
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          hasMinLength ? styles.ruleTextPass : null,
                        ]}
                      >
                        8자 이상
                      </Text>
                    </View>
                    <View style={styles.ruleItem}>
                      <AppIcon
                        name={hasAlphaNumeric ? "check" : "circle"}
                        size={12}
                        color={
                          hasAlphaNumeric
                            ? theme.colors.primaryDeep
                            : theme.colors.inkMute
                        }
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          hasAlphaNumeric ? styles.ruleTextPass : null,
                        ]}
                      >
                        영문·숫자 조합
                      </Text>
                    </View>
                  </View>

                  {isPwError || errors.password ? (
                    <InlineError>{passwordErrorMessage}</InlineError>
                  ) : null}
                </Field>
              </View>
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
          </Pressable>
        </ScrollView>

        <MotionEnter enabled={enterMotion}>
          <View style={styles.bottomFlat}>
            <SubmitButton
              disabled={isSubmitDisabled || signup.isPending || isLoading}
              loading={signup.isPending || isLoading}
              onPress={onSubmit}
            />
          </View>
        </MotionEnter>

        <TermsSheet
          termKey={termsSheetKey}
          onClose={() => setTermsSheetKey(null)}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function CheckBadge({ on, big = false }: { on: boolean; big?: boolean }) {
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
        <AppIcon name="check" size={size * 0.65} color={theme.colors.white} />
      ) : null}
    </View>
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
          <Text style={styles.submitText}>회원 가입</Text>
        )}
      </MotionPressable>
    </Animated.View>
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

const SignupInput = forwardRef<
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
      keyboardType={keyboardType}
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
  headerSubtitle: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  bottomFlat: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[7],
  },
  form: {
    marginTop: theme.spacing[5],
    gap: theme.spacing[4],
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    gap: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 2,
  },
  sectionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: theme.fontWeight.extrabold,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
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
  checkButtonVerified: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  checkButtonVerifiedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkButtonText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.semibold,
  },
  checkButtonTextVerified: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm + 1,
    fontWeight: theme.fontWeight.semibold,
  },
  passwordRulesRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ruleText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  ruleTextPass: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  hiddenTrigger: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
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
  termsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 14,
    gap: 10,
  },
  termsAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: theme.radius.md,
  },
  termsAllRowOn: {
    backgroundColor: theme.colors.primaryTint,
  },
  termsAllText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  termsList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    paddingTop: 8,
    gap: 8,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    minHeight: 32,
  },
  termsCheckWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  termsItemText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
  },
  termsRequired: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  termsDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  termsDetailText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  checkBadge: {
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadgeOn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
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
