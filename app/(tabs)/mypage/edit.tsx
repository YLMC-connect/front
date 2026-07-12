import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

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
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
}: {
  value: string;
  placeholder: string;
  error?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <TextInput
      editable={false}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.inkHint}
      secureTextEntry={secureTextEntry}
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
    />
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = variantOf(readDesignVariant(params.designVariant));
  const hasChange = variant !== "default";
  const isPhoneDup = variant === "phone-dup";
  const isCurrentPwError = variant === "current-pw-error";
  const isPwMismatch = variant === "pw-mismatch";
  const phone = isPhoneDup ? "010-9999-9999" : "010-2345-6789";

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
              disabled={!hasChange}
              style={styles.saveButton}
            >
              <Text style={[styles.saveText, !hasChange && styles.saveMuted]}>
                저장
              </Text>
            </Pressable>
          }
        />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>은혜</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.readonlyLabel}>이름</Text>
              <Text style={styles.name}>김은혜</Text>
              <Text style={styles.readonlyHint}>
                이름과 프로필은 변경할 수 없어요
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <FieldLabel>연락처</FieldLabel>
            <ProfileTextInput
              value={phone}
              placeholder="010-XXXX-XXXX"
              keyboardType="phone-pad"
              error={isPhoneDup}
            />
            {isPhoneDup ? (
              <InlineError>이미 사용 중인 연락처입니다</InlineError>
            ) : (
              <FieldHint>숫자만 입력하면 자동으로 하이픈이 추가돼요</FieldHint>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>비밀번호 변경</Text>

          <View style={styles.passwordFields}>
            <View>
              <FieldLabel>현재 비밀번호</FieldLabel>
              <ProfileTextInput
                value={hasChange ? "••••••••" : ""}
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
                value={hasChange ? "spring2026!" : ""}
                placeholder="새 비밀번호"
                secureTextEntry
              />
              <FieldHint>8자 이상, 영문·숫자 조합</FieldHint>
            </View>

            <View>
              <FieldLabel>새 비밀번호 확인</FieldLabel>
              <ProfileTextInput
                value={
                  hasChange ? (isPwMismatch ? "spring2025" : "spring2026!") : ""
                }
                placeholder="새 비밀번호 확인"
                secureTextEntry
                error={isPwMismatch}
              />
              {isPwMismatch ? (
                <InlineError>비밀번호가 일치하지 않습니다</InlineError>
              ) : null}
            </View>
          </View>
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
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  saveMuted: {
    color: theme.colors.inkHint,
  },
  profileCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(120,120,120,0.32)",
  },
  avatarText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 20,
    fontWeight: theme.fontWeight.extrabold,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  readonlyLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  name: {
    marginTop: 2,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  readonlyHint: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  section: {
    marginTop: 22,
  },
  label: {
    marginBottom: 6,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  input: {
    height: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: "rgba(201,124,110,0.08)",
  },
  hint: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  error: {
    marginTop: 6,
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  divider: {
    height: 1,
    marginTop: 28,
    marginBottom: 18,
    backgroundColor: theme.colors.line,
  },
  sectionTitle: {
    marginBottom: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  passwordFields: {
    gap: 18,
  },
});
