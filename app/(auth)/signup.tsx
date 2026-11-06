import { AppIcon } from "@/components/ui/app-icon";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";
import {
  type TermKey,
  TermsSheet,
} from "../../src/components/auth/TermsAgreementScreen";
import { Screen } from "../../src/components/layout/Screen";
import {
  AppText,
  FloatingBottomBar,
  MotionEnter,
  MotionFadeIn,
  MotionPop,
  MotionShake,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { authApiErrorMessages } from "../../src/constants/apiErrorMessages";
import { useAuth } from "../../src/hooks/useAuth";
import { getApiErrorMessage } from "../../src/lib/apiErrorMessage";
import { isValidLoginId, sanitizeLoginId } from "../../src/lib/authValidation";
import { readDesignVariant } from "../../src/lib/designVariant";
import {
  emailPattern,
  formatPhoneNumber,
  phoneDigits,
  type Availability,
  type FormErrors,
  type FormValues,
  validateSignup,
} from "../../src/components/auth/signup/signupForm";
import {
  CheckBadge,
  Field,
  InlineError,
  SignupInput,
} from "../../src/components/auth/signup/SignupParts";
import { styles } from "../../src/components/auth/signup/signupStyles";

const AUTO_ADVANCE_DEBOUNCE = process.env.NODE_ENV === "test" ? 0 : 500;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateLayout = (reduceMotion: boolean) => {
  if (reduceMotion) return;
  try {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  } catch {
    // 의도된 무시: 레이아웃 애니메이션을 못 쓰는 환경이면 애니메이션 없이 바뀐다.
  }
};

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
  const reduceMotion = useReducedMotion();

  const scrollRef = useRef<ScrollView>(null);
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
  const openTermsSheet = (key: TermKey) => {
    Keyboard.dismiss();
    setTermsSheetKey(key);
  };
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
        const raw = phoneDigits(nextValue);
        if (raw.length === 11 && raw.startsWith("010")) {
          emailInputRef.current?.focus();
        }
      } else if (field === "id") {
        nextValue = sanitizeLoginId(value);
      }
      setValues((current) => ({
        ...current,
        [field]: nextValue,
        // Keep password and passwordConfirm in sync automatically
        ...(field === "password" ? { passwordConfirm: nextValue } : {}),
      }));
      setErrors((current) =>
        current[field] ? { ...current, [field]: undefined } : current,
      );
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

  const onNameBlur = () => {
    const trimmed = values.userName.trim();
    if (trimmed.length > 0) {
      if (!/^[가-힣]+$/.test(trimmed)) {
        setErrors((current) => ({
          ...current,
          userName: "이름은 한글만 입력할 수 있어요.",
        }));
      } else if (trimmed.length < 2) {
        setErrors((current) => ({
          ...current,
          userName: "이름을 2자 이상 입력해주세요.",
        }));
      } else if (trimmed.length > 10) {
        setErrors((current) => ({
          ...current,
          userName: "이름은 10자 이하로 입력해주세요.",
        }));
      }
    }
  };

  const onPhoneBlur = () => {
    const raw = phoneDigits(values.phone);
    if (raw.length > 0) {
      if (!raw.startsWith("010")) {
        setErrors((current) => ({
          ...current,
          phone: "연락처는 010으로 시작해야 해요.",
        }));
      } else if (raw.length < 10) {
        setErrors((current) => ({
          ...current,
          phone: "연락처는 10~11자리로 입력해주세요.",
        }));
      }
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
  const isKoreanOnly = trimmedName.length > 0 && /^[가-힣]+$/.test(trimmedName);
  const isNameValid = hasNameLength && isKoreanOnly;
  const nameErrorMessage = errors.userName;

  const rawPhoneDigits = phoneDigits(values.phone);
  const hasPhonePrefix = rawPhoneDigits.startsWith("010");
  const hasPhoneLength =
    rawPhoneDigits.length >= 10 && rawPhoneDigits.length <= 11;
  const isPhoneValid =
    hasPhonePrefix && hasPhoneLength && !isPhoneError && !isPhoneDup;
  const phoneErrorMessage = isPhoneError
    ? "연락처는 010-XXXX-XXXX 형식으로 입력해주세요"
    : isPhoneDup
      ? "이미 가입된 연락처입니다"
      : errors.phone;

  const trimmedEmail = values.email.trim();
  const hasValidEmailFormat = emailPattern.test(trimmedEmail);
  const isEmailChecked = currentEmailAvailability === true;

  const isCard2Complete = Boolean(
    isNameValid &&
    !nameErrorMessage &&
    isPhoneValid &&
    !phoneErrorMessage &&
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

  if (AUTO_ADVANCE_DEBOUNCE === 0) {
    if (isCard1Complete && unlockedStep < 2) {
      setUnlockedStep(2);
    } else if (unlockedStep >= 2 && isCard2Complete && unlockedStep < 3) {
      setUnlockedStep(3);
    }
  }

  // Test-only immediate focus when AUTO_ADVANCE_DEBOUNCE === 0
  useEffect(() => {
    if (AUTO_ADVANCE_DEBOUNCE === 0 && isCard1Complete && unlockedStep < 2) {
      nameInputRef.current?.focus();
    }
  }, [isCard1Complete, unlockedStep]);

  // Auto-advance to Step 3 when Card 2 is completed and email availability is verified
  useEffect(() => {
    if (
      AUTO_ADVANCE_DEBOUNCE > 0 &&
      unlockedStep >= 2 &&
      isCard2Complete &&
      currentEmailAvailability === true &&
      unlockedStep < 3
    ) {
      const timer = setTimeout(() => {
        animateLayout(reduceMotion);
        setUnlockedStep(3);
        Keyboard.dismiss();
        scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [unlockedStep, isCard2Complete, currentEmailAvailability, reduceMotion]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
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
          ref={scrollRef}
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
                <Animated.View
                  entering={
                    enterMotion
                      ? FadeInDown.duration(380).easing(
                          Easing.out(Easing.cubic),
                        )
                      : undefined
                  }
                  layout={LinearTransition.duration(350).easing(
                    Easing.out(Easing.cubic),
                  )}
                  style={styles.termsCard}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>3</Text>
                    </View>
                    <Text style={styles.sectionTitle}>약관 동의</Text>
                  </View>

                  <Pressable
                    testID="signup-terms-all"
                    hitSlop={{ top: 7, bottom: 7 }}
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
                          <Text style={styles.termsRequired}>[필수]</Text>{" "}
                          서비스 이용약관
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="서비스 이용약관 보기"
                        onPress={() => openTermsSheet("tos")}
                        style={styles.termsDetailButton}
                      >
                        <Text style={styles.termsDetailText}>보기</Text>
                        <AppIcon
                          name="chevron-right"
                          size={14}
                          color={theme.colors.textMuted}
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
                          <Text style={styles.termsRequired}>[필수]</Text>{" "}
                          개인정보 처리방침
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="개인정보 처리방침 보기"
                        onPress={() => openTermsSheet("privacy")}
                        style={styles.termsDetailButton}
                      >
                        <Text style={styles.termsDetailText}>보기</Text>
                        <AppIcon
                          name="chevron-right"
                          size={14}
                          color={theme.colors.textMuted}
                        />
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              ) : null}

              {/* 섹션 2: 성도 정보 (새로 작성할 카드가 위쪽에 추가) */}
              {unlockedStep >= 2 ? (
                <Animated.View
                  entering={
                    enterMotion
                      ? FadeInDown.duration(380).easing(
                          Easing.out(Easing.cubic),
                        )
                      : undefined
                  }
                  layout={LinearTransition.duration(350).easing(
                    Easing.out(Easing.cubic),
                  )}
                  style={styles.sectionCard}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>2</Text>
                    </View>
                    <Text style={styles.sectionTitle}>성도 정보</Text>
                  </View>

                  <Field label="이름">
                    <MotionShake trigger={nameErrorMessage}>
                      <SignupInput
                        ref={nameInputRef}
                        testID="signup-name-input"
                        value={values.userName}
                        onChangeText={setField("userName")}
                        onBlur={onNameBlur}
                        placeholder="실명을 입력해주세요"
                        autoComplete="name"
                        textContentType="name"
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          onNameBlur();
                          phoneInputRef.current?.focus();
                        }}
                        hasError={Boolean(nameErrorMessage)}
                        trailing={
                          isNameValid ? (
                            <MotionPop>
                              <AppIcon
                                name="check-circle"
                                size={18}
                                color={theme.colors.successIcon}
                              />
                            </MotionPop>
                          ) : null
                        }
                      />
                    </MotionShake>

                    <InlineError>{nameErrorMessage}</InlineError>
                  </Field>

                  <Field label="연락처">
                    <MotionShake trigger={phoneErrorMessage}>
                      <SignupInput
                        ref={phoneInputRef}
                        testID="signup-phone-input"
                        value={values.phone}
                        onChangeText={setField("phone")}
                        onBlur={onPhoneBlur}
                        placeholder="010-XXXX-XXXX"
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        textContentType="telephoneNumber"
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          onPhoneBlur();
                          emailInputRef.current?.focus();
                        }}
                        hasError={Boolean(phoneErrorMessage)}
                        trailing={
                          isPhoneValid ? (
                            <MotionPop>
                              <AppIcon
                                name="check-circle"
                                size={18}
                                color={theme.colors.successIcon}
                              />
                            </MotionPop>
                          ) : null
                        }
                      />
                    </MotionShake>

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
                            animateLayout(reduceMotion);
                            setUnlockedStep((prev) => Math.max(prev, 3));
                            scrollRef.current?.scrollTo({
                              y: 0,
                              animated: !reduceMotion,
                            });
                          }
                        }}
                        hasError={Boolean(emailErrorMessage)}
                        trailing={
                          checkAvailability.isPending &&
                          lastAvailabilityTarget === "email" ? (
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primaryStrong}
                            />
                          ) : currentEmailAvailability === true ? (
                            <MotionPop>
                              <AppIcon
                                name="check-circle"
                                size={18}
                                color={theme.colors.successIcon}
                              />
                            </MotionPop>
                          ) : null
                        }
                      />
                    </MotionShake>

                    {/* Realtime email criteria feedback */}
                    <View style={styles.passwordRulesRow}>
                      <View
                        accessible
                        accessibilityLabel={`이메일 형식 ${hasValidEmailFormat ? "충족" : "미충족"}`}
                        style={styles.ruleItem}
                      >
                        <AppIcon
                          name={hasValidEmailFormat ? "check" : "circle"}
                          size={12}
                          color={
                            hasValidEmailFormat
                              ? theme.colors.primaryStrong
                              : theme.colors.textMuted
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
                      <View
                        accessible
                        accessibilityLabel={`중복 확인 ${isEmailChecked ? "완료" : "미완료"}`}
                        style={styles.ruleItem}
                      >
                        <AppIcon
                          name={isEmailChecked ? "check" : "circle"}
                          size={12}
                          color={
                            isEmailChecked
                              ? theme.colors.primaryStrong
                              : theme.colors.textMuted
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
                            color={theme.colors.successIcon}
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
                </Animated.View>
              ) : null}

              {/* 섹션 1: 계정 정보 (최하단) */}
              <Animated.View
                layout={LinearTransition.duration(350).easing(
                  Easing.out(Easing.cubic),
                )}
                style={styles.sectionCard}
              >
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
                            color={theme.colors.primaryStrong}
                          />
                        ) : currentIdAvailability === true ? (
                          <MotionPop>
                            <AppIcon
                              name="check-circle"
                              size={18}
                              color={theme.colors.successIcon}
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
                          color={theme.colors.successIcon}
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
                      onBlur={() => {
                        if (isCard1Complete && unlockedStep < 2) {
                          animateLayout(reduceMotion);
                          setUnlockedStep(2);
                          scrollRef.current?.scrollTo({
                            y: 0,
                            animated: !reduceMotion,
                          });
                        }
                      }}
                      onSubmitEditing={() => {
                        if (isCard1Complete) {
                          animateLayout(reduceMotion);
                          setUnlockedStep((prev) => Math.max(prev, 2));
                          scrollRef.current?.scrollTo({
                            y: 0,
                            animated: !reduceMotion,
                          });
                          setTimeout(() => nameInputRef.current?.focus(), 250);
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
                            ? theme.colors.primaryStrong
                            : theme.colors.textMuted
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
                            ? theme.colors.primaryStrong
                            : theme.colors.textMuted
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
              </Animated.View>
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

        <FloatingBottomBar
          disabled={isSubmitDisabled || signup.isPending || isLoading}
          label="회원 가입"
          loading={signup.isPending || isLoading}
          onPress={onSubmit}
          testID="signup-submit"
        />

        <TermsSheet
          termKey={termsSheetKey}
          onClose={() => setTermsSheetKey(null)}
        />
      </View>
    </Screen>
  );
}
