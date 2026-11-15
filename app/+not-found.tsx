import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "../src/components/layout/Screen";
import { AppIcon } from "../src/components/ui/app-icon";
import { Button, MotionEnter, TopBar } from "../src/components/ui";
import { theme } from "../src/constants/theme";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="" back onBack={handleBack} testID="not-found-topbar" />

        <MotionEnter mode="fadeUp" style={styles.contentWrap}>
          <View style={styles.content} testID="not-found-empty">
            <Text style={styles.code}>404</Text>

            <View style={styles.illustration}>
              <AppIcon
                name="search-off"
                size={36}
                color={theme.colors.primaryStrong}
              />
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.title}>페이지를 찾을 수 없어요</Text>
              <Text style={styles.description}>
                주소가 잘못됐거나{"\n"}
                페이지가 옮겨졌거나 삭제됐을 수 있어요
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                주소를 다시 확인하거나 홈으로 이동해 주세요
              </Text>
            </View>
          </View>

          {/* Bottom Action Controls */}
          <View
            style={[
              styles.actionContainer,
              { paddingBottom: Math.max(insets.bottom, theme.spacing[6]) },
            ]}
          >
            <View style={styles.buttonRow}>
              <View style={styles.buttonFlex}>
                <Button
                  variant="secondary"
                  icon="chevron-left"
                  onPress={handleBack}
                  testID="not-found-back-button"
                >
                  이전으로
                </Button>
              </View>
              <View style={styles.buttonFlexPrimary}>
                <Button
                  variant="primary"
                  icon="home"
                  onPress={() => router.replace("/")}
                  testID="not-found-home-button"
                >
                  홈으로 가기
                </Button>
              </View>
            </View>
          </View>
        </MotionEnter>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentWrap: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.layout.screenX,
    paddingBottom: theme.spacing[6],
  },
  code: {
    marginBottom: theme.spacing[3],
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
  },
  // 빈 상태 일러스트 규격: 84 원, primary-subtle 바탕, primary-strong 아이콘.
  illustration: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing[5],
  },
  textBlock: {
    alignItems: "center",
    gap: theme.spacing[2],
  },
  title: {
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  tipCard: {
    marginTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    ...theme.shadow.sm,
  },
  tipText: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  actionContainer: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[3],
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  buttonFlex: {
    flex: 1,
  },
  buttonFlexPrimary: {
    flex: 1.4,
  },
});
