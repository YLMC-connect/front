import { AppIcon } from "@/components/ui/app-icon";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";
import { StickyHeaderScreen } from "../../src/components/layout/StickyHeaderScreen";
import {
  AppText,
  Avatar,
  ErrorState,
  ListSkeleton,
  MotionEnter,
  MotionPressable,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useHomeOverview } from "../../src/hooks/useHome";
import { homeSundaySermon } from "../../src/mocks/home";
import { useAuthStore } from "../../src/store/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const overview = useHomeOverview();
  const fullName = currentUser?.name?.trim() || "성도";
  const sundaySermon = overview.data?.sundaySermon ?? homeSundaySermon;

  return (
    <StickyHeaderScreen
      contentContainerStyle={styles.content}
      testID="screen-home"
      title="열린문 커넥트"
      refreshing={overview.isRefetching}
      onRefresh={() => void overview.refetch()}
    >
      <View style={styles.body}>
        <View style={styles.greetingCard} testID="home-greeting">
          <View style={styles.userRow}>
            <Avatar name={fullName} size={36} seed={fullName} />
            <AppText variant="sectionTitle" style={styles.userName}>
              {fullName}
            </AppText>
          </View>
          <MotionPressable
            accessibilityHint="마이페이지로 이동합니다"
            accessibilityLabel="내 정보"
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => router.push("/mypage")}
            style={styles.profileButton}
            testID="home-open-mypage"
          >
            <AppText variant="caption" tone="brand" style={styles.profileLabel}>
              내 정보
            </AppText>
            <AppIcon
              name="chevron-right"
              size={16}
              color={theme.colors.primaryDeep}
            />
          </MotionPressable>
        </View>

        {overview.isPending ? (
          <View style={styles.loading}>
            <ListSkeleton rows={2} />
          </View>
        ) : overview.isError || !overview.data ? (
          <View style={styles.errorWrap}>
            <ErrorState
              message="홈 정보를 불러오지 못했습니다. 다시 시도해주세요."
              onRetry={() => overview.refetch()}
            />
          </View>
        ) : (
          <MotionEnter style={styles.cardsWrap}>
            <MotionPressable
              accessibilityHint="유튜브에서 이번 주일 말씀 영상을 엽니다"
              accessibilityLabel={`${sundaySermon.timeLabel} ${sundaySermon.title}`}
              accessibilityRole="link"
              onPress={() => void Linking.openURL(sundaySermon.videoUrl)}
              pressedScale={0.985}
              style={styles.dawnCard}
              testID="home-sunday-sermon"
            >
              <View style={styles.sermonThumbWrap}>
                <Image
                  accessibilityIgnoresInvertColors
                  contentFit="cover"
                  source={{ uri: sundaySermon.thumbnailUrl }}
                  style={styles.sermonThumb}
                  testID="home-sunday-sermon-thumbnail"
                  transition={180}
                />
                <View pointerEvents="none" style={styles.sermonPlayBadge}>
                  <AppIcon
                    color={theme.colors.white}
                    fill={theme.colors.white}
                    name="play"
                    size={22}
                  />
                </View>
              </View>
              <View style={styles.sermonContent}>
                <AppText
                  variant="caption"
                  tone="muted"
                  style={styles.dawnEyebrow}
                >
                  {sundaySermon.timeLabel}
                </AppText>
                <AppText variant="sectionTitle" style={styles.dawnTitle}>
                  {sundaySermon.title}
                </AppText>
                <AppText
                  variant="body"
                  tone="secondary"
                  style={styles.dawnSummary}
                >
                  {sundaySermon.summary}
                </AppText>
                <View style={styles.dawnAction}>
                  <AppText variant="caption" tone="brand">
                    유튜브로 말씀 보기
                  </AppText>
                  <AppIcon
                    name="chevron-right"
                    size={18}
                    color={theme.colors.primaryDeep}
                  />
                </View>
              </View>
            </MotionPressable>

            <MotionPressable
              accessibilityRole="button"
              onPress={() =>
                router.push(overview.data.dailyPrayer.href as Href)
              }
              pressedScale={0.985}
              style={styles.dailyCard}
              testID="home-daily-prayer"
            >
              <AppText
                variant="caption"
                tone="inverse"
                style={styles.dailyEyebrow}
              >
                오늘의 기도 · {overview.data.dailyPrayer.dateLabel}{" "}
                {overview.data.dailyPrayer.weekdayLabel}
              </AppText>
              <AppText
                variant="sectionTitle"
                tone="inverse"
                style={styles.dailyTitle}
              >
                {overview.data.dailyPrayer.title}
              </AppText>
              <AppText
                variant="caption"
                tone="inverse"
                style={styles.dailySummary}
              >
                {overview.data.dailyPrayer.summary}
              </AppText>
              <View style={styles.cardAction}>
                <AppText variant="caption" tone="inverse">
                  기도 보러가기
                </AppText>
                <AppIcon name="chevron-right" size={18} color="#fff" />
              </View>
            </MotionPressable>

            <MotionPressable
              accessibilityRole="button"
              onPress={() => router.push(overview.data.dawnPrayer.href as Href)}
              pressedScale={0.985}
              style={styles.dawnCard}
              testID="home-dawn-prayer"
            >
              <AppText
                variant="caption"
                tone="muted"
                style={styles.dawnEyebrow}
              >
                {overview.data.dawnPrayer.timeLabel}
              </AppText>
              <AppText variant="sectionTitle" style={styles.dawnTitle}>
                {overview.data.dawnPrayer.title}
              </AppText>
              <AppText
                variant="body"
                tone="secondary"
                style={styles.dawnSummary}
              >
                {overview.data.dawnPrayer.summary}
              </AppText>
              <View style={styles.dawnAction}>
                <AppText variant="caption" tone="brand">
                  말씀요약 더 보기
                </AppText>
                <AppIcon
                  name="chevron-right"
                  size={18}
                  color={theme.colors.primaryDeep}
                />
              </View>
            </MotionPressable>
          </MotionEnter>
        )}
      </View>
    </StickyHeaderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 112,
  },
  profileButton: {
    minHeight: theme.layout.touchTarget,
    paddingVertical: theme.spacing[1],
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  profileLabel: {
    fontWeight: theme.fontWeight.semibold,
  },
  loading: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[2],
  },
  errorWrap: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[6],
  },
  body: {
    gap: theme.layout.screenX,
    paddingTop: theme.spacing[1],
  },
  cardsWrap: {
    gap: theme.layout.screenX,
  },
  greetingCard: {
    marginHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing[1],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  userRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userName: {
    flexShrink: 1,
  },
  dailyCard: {
    marginHorizontal: theme.layout.screenX,
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    padding: theme.layout.cardPadding + 4,
    ...theme.shadow.primary,
  },
  dailyEyebrow: {
    marginBottom: theme.spacing[1],
    opacity: 0.92,
  },
  dailyTitle: {
    marginBottom: theme.spacing[2],
  },
  dailySummary: {
    marginBottom: theme.spacing[3],
    opacity: 0.92,
  },
  cardAction: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    opacity: 0.96,
  },
  dawnCard: {
    marginHorizontal: theme.layout.screenX,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  sermonContent: {
    padding: theme.spacing[4],
  },
  dawnEyebrow: {
    marginBottom: theme.spacing[1],
  },
  dawnTitle: {
    marginBottom: theme.spacing[2],
  },
  dawnSummary: {
    marginBottom: theme.spacing[3],
  },
  dawnAction: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sermonThumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  sermonThumb: {
    width: "100%",
    height: "100%",
  },
  sermonPlayBadge: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(25, 31, 40, 0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },
});
