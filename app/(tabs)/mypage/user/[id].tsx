import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../../src/components/layout/Screen";
import { ConfirmDialog, Toast, TopBar } from "../../../../src/components/ui";
import { theme } from "../../../../src/constants/theme";

type Variant =
  | "default"
  | "block-confirm"
  | "block-toast"
  | "blocked"
  | "withdrawn";

function variantOf(value: string | string[] | undefined): Variant {
  const variant = Array.isArray(value) ? value[0] : value;
  if (
    variant === "block-confirm" ||
    variant === "block-toast" ||
    variant === "blocked" ||
    variant === "withdrawn"
  ) {
    return variant;
  }
  return "default";
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = variantOf(params.variant);
  const isBlockedView = variant === "blocked";
  const isWithdrawn = variant === "withdrawn";
  const name = isWithdrawn ? "알 수 없음" : "박정아";
  const initial = isWithdrawn ? "?" : "정아";

  if (isBlockedView) {
    return (
      <Screen scroll={false} padded={false}>
        <TopBar title="프로필" back onBack={() => router.back()} />
        <View style={styles.centerBody}>
          <View style={styles.blockedIcon}>
            <MaterialIcons
              name="block"
              size={38}
              color={theme.colors.inkHint}
            />
          </View>
          <Text style={styles.blockedTitle}>확인할 수 없는 프로필입니다</Text>
          <Text style={styles.blockedText}>
            차단한 사용자의 프로필은 볼 수 없어요.{"\n"}
            마이페이지 &gt; 차단 사용자 관리에서 해제할 수 있어요.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="프로필" back onBack={() => router.back()} />
        <View style={styles.body}>
          <View style={styles.profileBlock}>
            <View
              style={[
                styles.avatar,
                isWithdrawn ? styles.avatarWithdrawn : null,
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  isWithdrawn ? styles.avatarTextWithdrawn : null,
                ]}
              >
                {initial}
              </Text>
            </View>
            <Text
              style={[styles.name, isWithdrawn ? styles.nameWithdrawn : null]}
            >
              {name}
            </Text>
            {isWithdrawn ? (
              <Text style={styles.withdrawnText}>탈퇴한 사용자</Text>
            ) : null}
          </View>

          {!isWithdrawn ? (
            <Pressable accessibilityRole="button" style={styles.blockButton}>
              <MaterialIcons
                name="block"
                size={18}
                color={theme.colors.inkSoft}
              />
              <Text style={styles.blockButtonText}>차단</Text>
            </Pressable>
          ) : null}
        </View>

        <ConfirmDialog
          visible={variant === "block-confirm"}
          title={`${name}님을 차단할까요?`}
          message="차단한 사용자의 게시글과 댓글은 보이지 않으며, 상대도 회원님의 활동을 볼 수 없어요."
          confirmText="차단"
          danger
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
        />
        <Toast
          message={variant === "block-toast" ? "차단되었습니다" : undefined}
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
    paddingHorizontal: 24,
  },
  centerBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  blockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface2,
  },
  blockedTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: theme.fontWeight.bold,
  },
  blockedText: {
    marginTop: 10,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
    textAlign: "center",
  },
  profileBlock: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.raised,
  },
  avatarWithdrawn: {
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface2,
    shadowOpacity: 0,
    elevation: 0,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 36,
    fontWeight: theme.fontWeight.extrabold,
  },
  avatarTextWithdrawn: {
    color: theme.colors.inkHint,
  },
  name: {
    marginTop: 18,
    color: theme.colors.ink,
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.extrabold,
  },
  nameWithdrawn: {
    color: theme.colors.inkMute,
  },
  withdrawnText: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  blockButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  blockButtonText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
