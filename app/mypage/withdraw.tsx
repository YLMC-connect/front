import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import {
  ConfirmDialog,
  FloatingBottomBar,
  TopBar,
} from "../../src/components/ui";
import { InfoBox } from "../../src/components/ui/info-box";
import { theme } from "../../src/constants/theme";
import { useWithdrawMember } from "../../src/hooks/useMember";
import { readDesignVariant } from "../../src/lib/designVariant";

const cautions = [
  "작성한 나눔 게시글·댓글은 익명으로 남습니다",
  "탈퇴 후 재가입해도 기존 데이터는 복구할 수 없습니다",
  "탈퇴 즉시 개인정보가 파기됩니다",
  "소모임장인 경우 가장 먼저 가입한 멤버에게 자동 이관됩니다",
] as const;

export default function WithdrawScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const showConfirm = readDesignVariant(params.designVariant) === "confirm";
  const [confirmVisible, setConfirmVisible] = useState(false);
  const withdrawMutation = useWithdrawMember();

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync();
      router.replace("/login");
    } catch (error) {
      if (__DEV__) console.warn("[withdraw] 회원 탈퇴 실패", error);
      Alert.alert(
        "오류",
        "탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="회원 탈퇴" close onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>정말 떠나시나요?</Text>
            <Text style={styles.desc}>
              탈퇴 전에 아래 안내를 꼭 확인해주세요.
            </Text>
          </View>

          <InfoBox
            tone="danger"
            title="탈퇴 전 안내사항"
            description={cautions.map((item) => `· ${item}`).join("\n")}
          />

          <Text style={styles.infoText}>
            계정과 모든 활동 내역이 영구적으로 삭제됩니다. 신중히 결정해주세요.
          </Text>
        </ScrollView>

        <FloatingBottomBar
          disabled={withdrawMutation.isPending}
          label="탈퇴하기"
          loading={withdrawMutation.isPending}
          onPress={() => setConfirmVisible(true)}
          testID="mypage-withdraw"
          variant="danger"
        />

        <ConfirmDialog
          visible={showConfirm || confirmVisible}
          title="정말 탈퇴하시겠습니까?"
          message="이 작업은 되돌릴 수 없으며, 모든 데이터가 즉시 삭제됩니다."
          confirmText="탈퇴"
          danger
          onCancel={() => {
            setConfirmVisible(false);
            if (showConfirm) router.back();
          }}
          onConfirm={() => {
            setConfirmVisible(false);
            if (showConfirm) {
              router.back();
            } else {
              void handleWithdraw();
            }
          }}
        />
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
    paddingBottom: 130,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 18,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  desc: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  infoText: {
    marginTop: 18,
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
});
