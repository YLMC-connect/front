import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Avatar,
  ConfirmDialog,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

const blockedUsers = [
  { name: "이모씨", seed: 1, when: "2025.11.20" },
  { name: "박모씨", seed: 3, when: "2025.09.04" },
  { name: "정모씨", seed: 5, when: "2025.06.15" },
] as const;

function variantOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "default") : (value ?? "default");
}

export default function BlockedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = variantOf(params.variant);
  const users =
    variant === "empty"
      ? []
      : variant === "toast"
        ? blockedUsers.slice(1)
        : blockedUsers;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="차단 사용자" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          {users.length > 0 ? (
            <Text style={styles.notice}>
              차단된 사용자의 게시글과 댓글은 보이지 않으며, 상대도 회원님의
              활동을 볼 수 없습니다.
            </Text>
          ) : null}

          <View style={styles.list}>
            {users.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons
                    name="block"
                    size={38}
                    color={theme.colors.inkHint}
                  />
                </View>
                <Text style={styles.emptyTitle}>차단한 사용자가 없습니다</Text>
                <Text style={styles.emptyText}>
                  프로필 화면에서 언제든지{"\n"}상대를 차단할 수 있어요.
                </Text>
              </View>
            ) : (
              users.map((user, index) => (
                <View
                  key={user.name}
                  style={[
                    styles.row,
                    index < users.length - 1 ? styles.rowBorder : null,
                  ]}
                >
                  <Avatar name={user.name} seed={user.seed} size={42} />
                  <View style={styles.userText}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.when}>{user.when} 차단</Text>
                  </View>
                  <Pressable accessibilityRole="button" style={styles.release}>
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={theme.colors.primaryDeep}
                    />
                    <Text style={styles.releaseText}>차단 해제</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <ConfirmDialog
          visible={variant === "confirm"}
          title="이모씨님의 차단을 해제할까요?"
          message="해제 후에는 상대의 게시글과 댓글이 다시 보이며, 상대도 회원님의 활동을 볼 수 있게 됩니다."
          confirmText="차단 해제"
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
        />
        <Toast
          message={variant === "toast" ? "차단이 해제되었습니다" : undefined}
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
    paddingBottom: 24,
  },
  notice: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  userText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.bold,
  },
  when: {
    marginTop: 2,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  release: {
    height: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  releaseText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  emptyText: {
    marginTop: 8,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
  },
});
