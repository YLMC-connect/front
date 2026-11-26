import { AppIcon } from "@/components/ui/app-icon";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import {
  Card,
  Checkbox,
  ConfirmDialog,
  FLOATING_BOTTOM_BAR_INSET,
  FloatingBottomBar,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useWithdrawMember } from "../../src/hooks/useMember";

// 서버는 탈퇴 후 30일 동안 계정을 보관하고(복구용) 그 뒤 개인정보를 파기한다 (개인정보 처리방침 4번)
const cautions = [
  "작성한 나눔 글과 댓글은 30일 뒤 “탈퇴한 성도”로 바뀌어 남아요",
  "참여 중인 기도방과 소모임에서 빠져요",
  "소모임장이라면 가장 먼저 가입한 멤버에게 넘어가요",
  "30일 안에는 교회에 요청해 계정을 되살릴 수 있어요",
  "30일 동안은 같은 이메일·연락처로 다시 가입할 수 없어요",
  "30일이 지나면 계정과 기록을 되살릴 수 없어요",
] as const;

export default function WithdrawScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const withdrawMutation = useWithdrawMember();

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync();
      router.replace("/login");
    } catch (error) {
      if (__DEV__) console.warn("[withdraw] 회원 탈퇴 실패", error);
      Alert.alert("오류", "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="회원 탈퇴" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>{"탈퇴하기 전에\n확인해 주세요"}</Text>
            <Text style={styles.desc}>
              계정과 개인정보는 탈퇴 30일 뒤에 완전히 지워져요.
            </Text>
          </View>

          <Card>
            <View style={styles.cautionHead}>
              <AppIcon
                name="warning-amber"
                size={18}
                color={theme.colors.dangerText}
              />
              <Text style={styles.cautionTitle}>탈퇴하면 이렇게 돼요</Text>
            </View>
            <View style={styles.cautionList}>
              {cautions.map((item) => (
                <View key={item} style={styles.cautionRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.cautionText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card style={styles.agreeCard}>
            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              accessibilityLabel="안내 내용을 모두 확인했어요"
              label={
                <Text style={styles.agreeText}>
                  안내 내용을 모두 확인했어요
                </Text>
              }
              testID="withdraw-agree"
            />
          </Card>
        </ScrollView>

        <FloatingBottomBar
          disabled={!agreed || withdrawMutation.isPending}
          label="탈퇴하기"
          loading={withdrawMutation.isPending}
          onPress={() => setConfirmVisible(true)}
          testID="mypage-withdraw"
          variant="danger"
        />

        <ConfirmDialog
          visible={confirmVisible}
          title="정말 탈퇴할까요?"
          message="30일이 지나면 되돌릴 수 없어요."
          confirmText="탈퇴"
          danger
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => {
            setConfirmVisible(false);
            void handleWithdraw();
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
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: FLOATING_BOTTOM_BAR_INSET,
    gap: theme.spacing["4"],
  },
  header: {
    paddingTop: theme.spacing["4"],
    paddingBottom: theme.spacing["1"],
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  desc: {
    marginTop: theme.spacing["2"],
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  cautionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["2"],
    marginBottom: theme.spacing["4"],
  },
  cautionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  cautionList: {
    gap: theme.spacing["3"],
  },
  cautionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing["3"],
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 9,
    backgroundColor: theme.colors.neutral400,
  },
  cautionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: 22,
  },
  agreeCard: {
    // 체크 줄이 누르는 높이 44 를 가지므로 카드 위아래 여백을 줄여 56 높이를 맞춘다.
    paddingVertical: 6,
  },
  agreeText: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
});
