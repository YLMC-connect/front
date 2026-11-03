import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Screen } from "../src/components/layout/Screen";
import { Button, Empty, TopBar } from "../src/components/ui";
import { theme } from "../src/constants/theme";

export default function NotFoundScreen() {
  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title="페이지를 찾을 수 없습니다"
          back
          onBack={() => router.replace("/")}
        />
        <View style={styles.content}>
          <Empty
            icon="error-outline"
            title="요청하신 페이지가 존재하지 않아요"
            description="주소가 잘못 입력되었거나 삭제된 페이지입니다."
            testID="not-found-empty"
          />
          <View style={styles.actionWrap}>
            <Button
              variant="primary"
              onPress={() => router.replace("/")}
              testID="not-found-home-button"
            >
              홈으로 돌아가기
            </Button>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.layout.screenX,
    gap: theme.spacing[6],
  },
  actionWrap: {
    width: "100%",
    maxWidth: 240,
  },
});
