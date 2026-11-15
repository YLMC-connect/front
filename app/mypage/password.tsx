import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import {
  FormFieldHint,
  FormFieldLabel,
} from "../../src/components/mypage/FormField";
import {
  Card,
  FLOATING_BOTTOM_BAR_INSET,
  FloatingBottomBar,
  PasswordStrength,
  TopBar,
} from "../../src/components/ui";
import { ModalFormTextInput } from "../../src/components/ui/modal-form-layout";
import { theme } from "../../src/constants/theme";
import { useChangePassword } from "../../src/hooks/useMember";

/** 가입과 같은 규칙: 8자 이상 + 영문·숫자 조합. */
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const RULE_HINT = "영문·숫자 8자 이상";

function PasswordInput({
  value,
  onChangeText,
  placeholder,
  error,
  testID,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  testID?: string;
}) {
  return (
    <ModalFormTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      error={error}
      secureTextEntry
      // 비밀번호 칸은 영문 자판으로 연다(iOS 비밀번호 칸은 한글 조합이 막혀 입력되지 않음)
      keyboardType="ascii-capable"
      autoCapitalize="none"
      style={styles.input}
      testID={testID}
    />
  );
}

export default function PasswordChangeScreen() {
  const router = useRouter();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || changePassword.isPending) return;

    setCurrentError(null);
    setNewError(null);
    setConfirmError(null);

    if (!PASSWORD_RULE.test(newPassword)) {
      setNewError("새 비밀번호는 영문·숫자를 섞어 8자 이상으로 써 주세요");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("비밀번호가 일치하지 않아요");
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      Alert.alert("알림", "비밀번호를 바꿨어요.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "MEM006") {
        setCurrentError("현재 비밀번호가 올바르지 않아요");
      } else if (err.code === "MEM007") {
        setNewError("새 비밀번호는 영문·숫자를 섞어 8자 이상으로 써 주세요");
      } else {
        Alert.alert(
          "오류",
          err.message || "비밀번호를 바꾸지 못했어요. 다시 시도해 주세요.",
        );
      }
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <TopBar title="비밀번호 변경" close onBack={() => router.back()} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.body}
        >
          <Pressable
            accessible={false}
            onPress={Keyboard.dismiss}
            style={styles.stack}
          >
            <Card>
              <FormFieldLabel required>현재 비밀번호</FormFieldLabel>
              <PasswordInput
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setCurrentError(null);
                }}
                placeholder="현재 비밀번호"
                error={currentError ?? undefined}
                testID="password-current"
              />
            </Card>

            <Card>
              <FormFieldLabel required>새 비밀번호</FormFieldLabel>
              <PasswordInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setNewError(null);
                }}
                placeholder="새 비밀번호"
                error={newError ?? undefined}
                testID="password-new"
              />
              {newPassword.length > 0 ? (
                <PasswordStrength password={newPassword} />
              ) : null}
              <FormFieldHint>{RULE_HINT}</FormFieldHint>

              <View style={styles.fieldGap} />

              <FormFieldLabel required>새 비밀번호 확인</FormFieldLabel>
              <PasswordInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmError(null);
                }}
                placeholder="한 번 더 입력"
                error={confirmError ?? undefined}
                testID="password-confirm"
              />
            </Card>
          </Pressable>
        </ScrollView>
        <FloatingBottomBar
          label="변경하기"
          disabled={!canSubmit}
          loading={changePassword.isPending}
          onPress={() => void handleSubmit()}
          testID="password-change-submit"
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: FLOATING_BOTTOM_BAR_INSET,
  },
  stack: {
    flexGrow: 1,
    gap: theme.spacing["4"],
  },
  input: {
    // 카드가 좌우 여백을 주므로 입력 기본 좌우 여백(screenX)은 뺀다.
    marginHorizontal: 0,
  },
  fieldGap: {
    height: theme.spacing["5"],
  },
});
