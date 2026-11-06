import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { Avatar, TopBar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import {
  useChangePassword,
  useMemberMe,
  useUpdateMemberMe,
} from "../../src/hooks/useMember";
import { readDesignVariant } from "../../src/lib/designVariant";

type Variant =
  | "default"
  | "changed"
  | "phone-dup"
  | "current-pw-error"
  | "pw-mismatch";

function variantOf(value: string | string[] | undefined): Variant {
  const variant = Array.isArray(value) ? value[0] : value;
  if (
    variant === "changed" ||
    variant === "phone-dup" ||
    variant === "current-pw-error" ||
    variant === "pw-mismatch"
  ) {
    return variant;
  }
  return "default";
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function FieldHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

function InlineError({ children }: { children: string }) {
  return <Text style={styles.error}>{children}</Text>;
}

function ProfileTextInput({
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  editable = true,
}: {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
  error?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "phone-pad";
  editable?: boolean;
}) {
  return (
    <TextInput
      editable={editable}
      // 비밀번호 칸은 영문 자판으로 연다(iOS 비밀번호 칸은 한글 조합이 막혀 입력되지 않음)
      keyboardType={secureTextEntry ? "ascii-capable" : keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      secureTextEntry={secureTextEntry}
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const { data: member } = useMemberMe();
  const updateMember = useUpdateMemberMe();
  const changePasswordMutation = useChangePassword();

  const rawVariant = readDesignVariant(params.designVariant);
  const isMockVariant = rawVariant !== undefined && rawVariant !== "default";
  const variant = variantOf(rawVariant);

  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [currentPwError, setCurrentPwError] = useState<string | null>(null);
  const [pwMismatchError, setPwMismatchError] = useState<string | null>(null);

  const phone = phoneInput ?? member?.phone ?? "";
  const memberName = member?.name || "사용자";

  const isPhoneDup = isMockVariant
    ? variant === "phone-dup"
    : Boolean(phoneError);
  const isCurrentPwError = isMockVariant
    ? variant === "current-pw-error"
    : Boolean(currentPwError);
  const isPwMismatch = isMockVariant
    ? variant === "pw-mismatch"
    : Boolean(pwMismatchError);

  const displayPhone = isMockVariant
    ? variant === "phone-dup"
      ? "010-9999-9999"
      : member?.phone || "010-2345-6789"
    : phone;
  const displayCurrentPw = isMockVariant
    ? variant !== "default"
      ? "••••••••"
      : ""
    : currentPassword;
  const displayNewPw = isMockVariant
    ? variant !== "default"
      ? "spring2026!"
      : ""
    : newPassword;
  const displayConfirmPw = isMockVariant
    ? variant !== "default"
      ? variant === "pw-mismatch"
        ? "spring2025"
        : "spring2026!"
      : ""
    : confirmPassword;

  const hasChange = isMockVariant
    ? variant !== "default"
    : (phone.trim() !== "" && phone.trim() !== (member?.phone || "")) ||
      newPassword.length > 0 ||
      currentPassword.length > 0;

  const isSaving = updateMember.isPending || changePasswordMutation.isPending;

  const handleSave = async () => {
    if (isMockVariant || !hasChange || isSaving) return;

    setPhoneError(null);
    setCurrentPwError(null);
    setPwMismatchError(null);

    let hasError = false;

    if (newPassword.length > 0 || currentPassword.length > 0) {
      if (!currentPassword) {
        setCurrentPwError("현재 비밀번호를 입력해주세요");
        hasError = true;
      }
      if (!newPassword) {
        Alert.alert("알림", "새 비밀번호를 입력해주세요.");
        hasError = true;
      } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
        Alert.alert(
          "알림",
          "새 비밀번호는 8자 이상 영문·숫자 조합이어야 합니다.",
        );
        hasError = true;
      } else if (newPassword !== confirmPassword) {
        setPwMismatchError("비밀번호가 일치하지 않습니다");
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      if (phone.trim() && phone.trim() !== (member?.phone || "")) {
        await updateMember.mutateAsync({ phone: phone.trim() });
      }

      if (newPassword.length > 0 && currentPassword.length > 0) {
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        });
      }

      Alert.alert("알림", "프로필 정보가 저장되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "MEM006") {
        setCurrentPwError("현재 비밀번호가 올바르지 않습니다");
      } else if (err.code === "MEM007") {
        Alert.alert(
          "알림",
          "새 비밀번호는 8자 이상, 영문·숫자 조합이어야 합니다.",
        );
      } else if (err.code === "MEM002") {
        setPhoneError("이미 사용 중인 연락처입니다");
      } else {
        Alert.alert(
          "오류",
          err.message || "저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        );
      }
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title="프로필 수정"
          back
          onBack={() => router.back()}
          right={
            <Pressable
              accessibilityRole="button"
              disabled={!hasChange || isSaving}
              hitSlop={{ top: 7, bottom: 7 }}
              onPress={() => void handleSave()}
              style={styles.saveButton}
            >
              <Text
                style={[
                  styles.saveText,
                  (!hasChange || isSaving) && styles.saveMuted,
                ]}
              >
                저장
              </Text>
            </Pressable>
          }
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.body, { flexGrow: 1 }]}
        >
          <Pressable
            accessible={false}
            onPress={Keyboard.dismiss}
            style={{ flexGrow: 1 }}
          >
            <View style={styles.profileCard}>
              <Avatar name={memberName} size={48} seed={memberName} />
              <View style={styles.profileText}>
                <Text style={styles.readonlyLabel}>이름</Text>
                <Text style={styles.name}>{memberName}</Text>
                <Text style={styles.readonlyHint}>
                  이름과 프로필은 변경할 수 없어요
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <FieldLabel>연락처</FieldLabel>
              <ProfileTextInput
                editable={!isMockVariant}
                value={displayPhone}
                onChangeText={(text) => {
                  setPhoneInput(text);
                  setPhoneError(null);
                }}
                placeholder="010-XXXX-XXXX"
                keyboardType="phone-pad"
                error={isPhoneDup}
              />
              {isPhoneDup ? (
                <InlineError>이미 사용 중인 연락처입니다</InlineError>
              ) : (
                <FieldHint>
                  숫자만 입력하면 자동으로 하이픈이 추가돼요
                </FieldHint>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>비밀번호 변경</Text>

            <View style={styles.passwordFields}>
              <View>
                <FieldLabel>현재 비밀번호</FieldLabel>
                <ProfileTextInput
                  editable={!isMockVariant}
                  value={displayCurrentPw}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    setCurrentPwError(null);
                  }}
                  placeholder="현재 비밀번호"
                  secureTextEntry
                  error={isCurrentPwError}
                />
                {isCurrentPwError ? (
                  <InlineError>현재 비밀번호가 올바르지 않습니다</InlineError>
                ) : null}
              </View>

              <View>
                <FieldLabel>새 비밀번호</FieldLabel>
                <ProfileTextInput
                  editable={!isMockVariant}
                  value={displayNewPw}
                  onChangeText={setNewPassword}
                  placeholder="새 비밀번호"
                  secureTextEntry
                />
                <FieldHint>8자 이상, 영문·숫자 조합</FieldHint>
              </View>

              <View>
                <FieldLabel>새 비밀번호 확인</FieldLabel>
                <ProfileTextInput
                  editable={!isMockVariant}
                  value={displayConfirmPw}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setPwMismatchError(null);
                  }}
                  placeholder="새 비밀번호 확인"
                  secureTextEntry
                  error={isPwMismatch}
                />
                {isPwMismatch ? (
                  <InlineError>비밀번호가 일치하지 않습니다</InlineError>
                ) : null}
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  saveText: {
    color: theme.colors.primary,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  saveMuted: {
    color: theme.colors.textDisabled,
  },
  profileCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  readonlyLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  name: {
    marginTop: 2,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  readonlyHint: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  section: {
    marginTop: 22,
  },
  label: {
    marginBottom: 6,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
  },
  input: {
    height: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  inputError: {
    borderColor: theme.colors.dangerText,
    backgroundColor: theme.colors.dangerSubtle,
  },
  hint: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  error: {
    marginTop: 6,
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  divider: {
    height: 1,
    marginTop: 28,
    marginBottom: 18,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    marginBottom: 14,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  passwordFields: {
    gap: 18,
  },
});
