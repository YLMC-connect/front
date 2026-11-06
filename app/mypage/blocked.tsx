import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import { StaggerItem } from "../../src/components/mypage/StaggerItem";
import {
  Button,
  ConfirmDialog,
  Empty,
  Toast,
  TopBar,
} from "../../src/components/ui";
import { InfoBox } from "../../src/components/ui/info-box";
import { PersonRow } from "../../src/components/ui/list-row";
import { theme } from "../../src/constants/theme";
import { readDesignVariant } from "../../src/lib/designVariant";

const blockedUsers = [
  { name: "이모씨", seed: 1, when: "2025.11.20" },
  { name: "박모씨", seed: 3, when: "2025.09.04" },
  { name: "정모씨", seed: 5, when: "2025.06.15" },
] as const;

export default function BlockedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "default";
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
            <InfoBox
              description="차단된 사용자의 게시글과 댓글은 보이지 않으며, 상대도 회원님의 활동을 볼 수 없습니다."
              style={styles.notice}
            />
          ) : null}

          <View style={styles.list}>
            {users.length === 0 ? (
              <Empty
                icon="block"
                title="차단한 사용자가 없어요"
                description={
                  "프로필 화면에서 언제든지\n상대를 차단할 수 있어요."
                }
              />
            ) : (
              users.map((user, index) => (
                <StaggerItem key={user.name} index={index}>
                  <PersonRow
                    name={user.name}
                    subtitle={`${user.when} 차단`}
                    avatarSeed={user.seed}
                    divider={index < users.length - 1}
                    trailing={
                      <Button variant="secondary" icon="check">
                        차단 해제
                      </Button>
                    }
                  />
                </StaggerItem>
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
    flexGrow: 1,
    paddingBottom: 24,
  },
  notice: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 8,
    marginBottom: 14,
  },
  list: {
    flex: 1,
  },
  emptyWrap: {
    paddingHorizontal: 14,
    paddingTop: 80,
    paddingBottom: 80,
  },
});
