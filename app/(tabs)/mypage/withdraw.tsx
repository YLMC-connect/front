import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Button, ConfirmDialog, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

const cautions = [
  "작성한 나눔 게시글·댓글은 익명으로 남습니다",
  "탈퇴 후 재가입해도 기존 데이터는 복구할 수 없습니다",
  "탈퇴 즉시 개인정보가 파기됩니다",
  "소모임장인 경우 가장 먼저 가입한 멤버에게 자동 이관됩니다",
] as const;

function variantOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "default") : (value ?? "default");
}

export default function WithdrawScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ variant?: string }>();
  const showConfirm = variantOf(params.variant) === "confirm";

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
              <MaterialIcons
                name="warning-amber"
                size={16}
                color={theme.colors.danger}
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

        <View style={styles.bottomBar}>
          <Button variant="danger">탈퇴하기</Button>
        </View>

        <ConfirmDialog
          visible={showConfirm}
          title="정말 탈퇴하시겠습니까?"
          message="이 작업은 되돌릴 수 없으며, 모든 데이터가 즉시 삭제됩니다."
          confirmText="탈퇴"
          danger
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
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
    paddingBottom: 96,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 18,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: theme.fontWeight.bold,
  },
  desc: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.body,
  },
  cautionBox: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(201,124,110,0.20)",
    backgroundColor: "rgba(201,124,110,0.10)",
    padding: 16,
  },
  cautionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cautionTitle: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
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
    backgroundColor: theme.colors.danger,
    marginTop: 8,
    flexShrink: 0,
  },
  cautionText: {
    flex: 1,
    color: "#7B3A2D",
    fontSize: 13.5,
    lineHeight: 21,
  },
  infoBox: {
    marginTop: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  infoText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: 19,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: theme.colors.glass,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
});
