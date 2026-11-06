import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import {
  ConfirmDialog,
  FloatingBottomBar,
  TopBar,
} from "../../src/components/ui";
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
        <TopBar title="회원 탈퇴" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>정말 떠나시나요?</Text>
            <Text style={styles.desc}>
              탈퇴 전에 아래 안내를 꼭 확인해주세요.
            </Text>
          </View>

          <View style={styles.cautionBox}>
            <View style={styles.cautionHead}>
              <AppIcon
                name="warning-amber"
                size={16}
                color={theme.colors.dangerIcon}
              />
              <Text style={styles.cautionTitle}>탈퇴 전 안내사항</Text>
            </View>
            <View style={styles.cautionList}>
              {cautions.map((item) => (
                <View key={item} style={styles.cautionRow}>
                  <View style={styles.dot} />
                  <Text style={styles.cautionText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              계정과 모든 활동 내역이 영구적으로 삭제됩니다. 신중히
              결정해주세요.
            </Text>
          </View>
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
  cautionBox: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger100,
    backgroundColor: theme.colors.dangerSubtle,
    padding: 16,
  },
  cautionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cautionTitle: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  cautionList: {
    gap: 10,
  },
  cautionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.dangerIcon,
    marginTop: 8,
    flexShrink: 0,
  },
  cautionText: {
    flex: 1,
    color: theme.colors.dangerText,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  infoBox: {
    marginTop: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: theme.colors.barGlass,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
