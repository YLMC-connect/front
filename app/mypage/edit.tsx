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
import { formatPhoneNumber } from "../../src/components/auth/signup/signupForm";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import {
  FormFieldHint,
  FormFieldLabel,
} from "../../src/components/mypage/FormField";
import {
  Avatar,
  Card,
  FLOATING_BOTTOM_BAR_INSET,
  FloatingBottomBar,
  TopBar,
} from "../../src/components/ui";
import { ModalFormTextInput } from "../../src/components/ui/modal-form-layout";
import { theme } from "../../src/constants/theme";
import { useMemberMe, useUpdateMemberMe } from "../../src/hooks/useMember";

const PHONE_DUP_MESSAGE = "이미 사용 중인 연락처예요";

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: member } = useMemberMe();
  const updateMember = useUpdateMemberMe();

  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const phone = phoneInput ?? member?.phone ?? "";
  const memberName = member?.name || "사용자";
  const churchLabel = member?.department
    ? `열린문교회 · ${member.department}`
    : "열린문교회";

  const hasChange =
    phone.trim() !== "" && phone.trim() !== (member?.phone || "");

  const handleSave = async () => {
    if (!hasChange || updateMember.isPending) return;
    setPhoneError(null);

    try {
      await updateMember.mutateAsync({ phone: phone.trim() });
      Alert.alert("알림", "프로필을 저장했어요.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "MEM002") {
        setPhoneError(PHONE_DUP_MESSAGE);
      } else {
        Alert.alert(
          "오류",
          err.message || "저장하지 못했어요. 다시 시도해 주세요.",
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
        <TopBar title="프로필 수정" close onBack={() => router.back()} />
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
              <View style={styles.profileRow}>
                <Avatar name={memberName} size={56} seed={memberName} />
                <View style={styles.profileText}>
                  <Text style={styles.readonlyLabel}>이름</Text>
                  <Text style={styles.name}>{memberName}</Text>
                </View>
              </View>
              <Text style={styles.readonlyHint}>
                이름은 교회 사무실에서 바꿀 수 있어요.
              </Text>
            </Card>

            <Card>
              <FormFieldLabel required>연락처</FormFieldLabel>
              <ModalFormTextInput
                value={phone}
                onChangeText={(text) => {
                  setPhoneInput(formatPhoneNumber(text));
                  setPhoneError(null);
                }}
                placeholder="010-XXXX-XXXX"
                keyboardType="phone-pad"
                error={phoneError ?? undefined}
                style={styles.input}
              />
              {phoneError ? null : (
                <FormFieldHint>기도방·소모임 연락에만 쓰여요.</FormFieldHint>
              )}
            </Card>

            <Card>
              <FormFieldLabel>소속 교회</FormFieldLabel>
              {/* 소속을 바꾸는 API 가 없어 읽기 전용으로 보여 준다. */}
              <ModalFormTextInput
                editable={false}
                value={churchLabel}
                placeholder="소속 교회"
                style={styles.input}
              />
            </Card>

            <View style={styles.withdrawWrap}>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/mypage/withdraw")}
                style={styles.withdrawLink}
                testID="profile-edit-withdraw"
              >
                <Text style={styles.withdrawText}>회원 탈퇴</Text>
              </Pressable>
            </View>
          </Pressable>
        </ScrollView>
        <FloatingBottomBar
          label="저장하기"
          disabled={!hasChange}
          loading={updateMember.isPending}
          onPress={() => void handleSave()}
          testID="profile-edit-save"
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
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["4"],
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
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  readonlyHint: {
    marginTop: theme.spacing["4"],
    paddingTop: theme.spacing["3"],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  input: {
    // 카드가 좌우 여백을 주므로 입력 기본 좌우 여백(screenX)은 뺀다.
    marginHorizontal: 0,
  },
  withdrawWrap: {
    marginTop: theme.spacing["2"],
    alignItems: "center",
  },
  withdrawLink: {
    minHeight: theme.size.buttonHeightSm,
    justifyContent: "center",
    paddingHorizontal: theme.spacing["3"],
  },
  withdrawText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textDecorationLine: "underline",
  },
});
