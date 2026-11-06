import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
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
            {/* 404 Status Pill */}
            <View style={styles.codeBadge}>
              <View style={styles.codeBadgeDot} />
              <Text style={styles.codeBadgeText}>404 NOT FOUND</Text>
            </View>

            {/* Visual Icon Illustration */}
            <View style={styles.iconGraphicWrapper}>
              <View style={styles.outerGlowCircle} />
              <View style={styles.middleCircle}>
                <View style={styles.innerCircle}>
                  <AppIcon
                    name="search-off"
                    size={36}
                    color={theme.colors.primary}
                  />
                </View>
              </View>
            </View>

            {/* Headline & Description */}
            <View style={styles.textBlock}>
              <Text style={styles.title}>페이지를 찾을 수 없어요</Text>
              <Text style={styles.description}>
                주소가 잘못 입력되었거나{"\n"}
                페이지가 이동 또는 삭제되었을 수 있습니다.
              </Text>
            </View>

            {/* Quick Hint Card */}
            <View style={styles.tipCard}>
              <AppIcon name="info" size={16} color={theme.colors.textMuted} />
              <Text style={styles.tipText}>
                입력하신 주소를 다시 확인하시거나 홈으로 이동해주세요.
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
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySubtle,
    borderWidth: 1,
    borderColor: theme.colors.primarySubtle,
    marginBottom: theme.spacing[5],
  },
  codeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  codeBadgeText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primaryStrong,
    letterSpacing: 0.6,
  },
  iconGraphicWrapper: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing[5],
  },
  outerGlowCircle: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.colors.infoSubtle,
  },
  middleCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: theme.colors.primarySubtle,
    borderWidth: 1,
    borderColor: theme.colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipText: {
    flexShrink: 1,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    color: theme.colors.textMuted,
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
