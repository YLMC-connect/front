import { AppIcon } from "@/components/ui/app-icon";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { StickyHeaderScreen } from "../../src/components/layout/StickyHeaderScreen";
import {
  AppText,
  Avatar,
  Badge,
  Card,
  ErrorState,
  ListSkeleton,
  MotionEnter,
  MotionPressable,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useHomeOverview } from "../../src/hooks/useHome";
import { useAuthStore } from "../../src/store/authStore";

function resolveCategoryAndDate(
  timeLabel: string,
  explicitDate?: string,
): { category: string; date: string } {
  const parts = timeLabel.split(" · ");
  const category = parts[0]?.trim() || timeLabel;
  const date = explicitDate?.trim() || parts.slice(1).join(" · ").trim();
  return { category, date };
}

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const overview = useHomeOverview();
  const [sermonThumbFallback, setSermonThumbFallback] = useState(false);
  const fullName = currentUser?.name?.trim() || "성도";
  const sundaySermon = overview.data?.sundaySermon ?? null;
  const dawnPrayer = overview.data?.dawnPrayer ?? null;
  const sermonMeta = sundaySermon
    ? resolveCategoryAndDate(sundaySermon.timeLabel, sundaySermon.dateLabel)
    : null;
  const dawnMeta = dawnPrayer
    ? resolveCategoryAndDate(dawnPrayer.timeLabel, dawnPrayer.dateLabel)
    : null;
  const sermonThumbnailUri = sundaySermon
    ? sermonThumbFallback
      ? sundaySermon.thumbnailUrl.replace(
          "/maxresdefault.jpg",
          "/hqdefault.jpg",
        )
      : sundaySermon.thumbnailUrl
    : "";

  return (
    <StickyHeaderScreen
      compact
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
            <AppText variant="heading" style={styles.userName}>
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
              color={theme.colors.primaryStrong}
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
            {sundaySermon ? (
              <MotionPressable
                accessibilityHint="유튜브에서 이번 주일 말씀 영상을 엽니다"
                accessibilityLabel={`${sundaySermon.timeLabel} ${sundaySermon.title}`}
                accessibilityRole="link"
                onPress={() => {
                  if (sundaySermon.videoUrl) {
                    void Linking.openURL(sundaySermon.videoUrl);
                  }
                }}
                style={styles.dawnCard}
                testID="home-sunday-sermon"
              >
                <View style={styles.sermonHeader}>
                  <Badge tone="info">
                    {sermonMeta?.category ?? sundaySermon.timeLabel}
                  </Badge>
                  {sermonMeta?.date ? (
                    <AppText variant="caption" tone="muted">
                      {sermonMeta.date}
                    </AppText>
                  ) : null}
                </View>
                <View style={styles.sermonInsetThumbWrap}>
                  <Image
                    accessibilityIgnoresInvertColors
                    contentFit="cover"
                    onError={() => {
                      if (!sermonThumbFallback) {
                        setSermonThumbFallback(true);
                      }
                    }}
                    source={{ uri: sermonThumbnailUri }}
                    style={styles.sermonThumb}
                    testID="home-sunday-sermon-thumbnail"
                    transition={180}
                  />
                  <View pointerEvents="none" style={styles.sermonYoutubeBadge}>
                    <View style={styles.sermonYoutubeDot} />
                    <AppText
                      variant="caption"
                      tone="inverse"
                      style={styles.sermonYoutubeBadgeText}
                    >
                      YouTube 설교 보기
                    </AppText>
                  </View>
                </View>
                <View style={styles.sermonContent}>
                  <AppText variant="heading" style={styles.dawnTitle}>
                    {sundaySermon.title}
                  </AppText>
                  <AppText variant="label" tone="muted">
                    {sundaySermon.summary}
                  </AppText>
                </View>
              </MotionPressable>
            ) : null}

            <View style={styles.dailyCard} testID="home-daily-prayer">
              <View style={styles.cardHeaderRow}>
                <View style={styles.dailyCategoryBadge}>
                  <AppText
                    variant="caption"
                    tone="inverse"
                    style={styles.dailyCategoryBadgeText}
                  >
                    오늘의 기도
                  </AppText>
                </View>
                <AppText
                  variant="caption"
                  tone="inverse"
                  style={styles.dailyDateText}
                >
                  {overview.data.dailyPrayer.dateLabel}{" "}
                  {overview.data.dailyPrayer.weekdayLabel}
                </AppText>
              </View>
              <AppText
                variant="heading"
                tone="inverse"
                style={styles.dailyTitle}
              >
                {overview.data.dailyPrayer.title}
              </AppText>
              <AppText
                variant="body"
                tone="inverse"
                style={styles.dailySummary}
              >
                {overview.data.dailyPrayer.summary}
              </AppText>
            </View>

            {dawnPrayer ? (
              <Card
                onPress={() => router.push(dawnPrayer.href as Href)}
                style={styles.cardInset}
                testID="home-dawn-prayer"
              >
                <View style={styles.cardHeaderRow}>
                  <Badge tone="info">
                    {dawnMeta?.category ?? dawnPrayer.timeLabel}
                  </Badge>
                  {dawnMeta?.date ? (
                    <AppText variant="caption" tone="muted">
                      {dawnMeta.date}
                    </AppText>
                  ) : null}
                </View>
                <AppText variant="heading" style={styles.dawnTitle}>
                  {dawnPrayer.title}
                </AppText>
                {dawnPrayer.summary ? (
                  <AppText
                    variant="body"
                    numberOfLines={2}
                    style={styles.dawnSummary}
                  >
                    {dawnPrayer.summary}
                  </AppText>
                ) : null}
                <View style={styles.dawnAction}>
                  <AppText variant="label" weight="semibold" tone="brand">
                    말씀요약 더 보기
                  </AppText>
                  <AppIcon
                    name="chevron-right"
                    size={18}
                    color={theme.colors.primaryStrong}
                  />
                </View>
              </Card>
            ) : null}
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
    // 디자인 시스템: 홈의 큰 카드는 radius-xl + primary 바탕.
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing[5],
  },
  dailyEyebrow: {
    marginBottom: theme.spacing[1],
    opacity: 0.92,
  },
  dailyTitle: {
    marginTop: theme.spacing[1],
    marginBottom: theme.spacing[2],
  },
  dailySummary: {
    opacity: 0.92,
  },
  dawnCard: {
    marginHorizontal: theme.layout.screenX,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  cardInset: {
    marginHorizontal: theme.layout.screenX,
  },
  sermonContent: {
    padding: theme.spacing[4],
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: theme.spacing[3],
  },
  dailyCategoryBadge: {
    minHeight: theme.size.badgeHeight,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: theme.spacing[1],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryStrong,
  },
  dailyCategoryBadgeText: {
    fontWeight: theme.fontWeight.semibold,
  },
  dailyDateText: {
    opacity: 0.92,
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
  sermonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  sermonInsetThumbWrap: {
    position: "relative",
    marginHorizontal: theme.spacing[4],
    aspectRatio: 16 / 9,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  sermonThumb: {
    width: "100%",
    height: "100%",
  },
  sermonYoutubeBadge: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(25, 31, 40, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
  sermonYoutubeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.dangerIcon,
  },
  sermonYoutubeBadgeText: {
    fontWeight: theme.fontWeight.semibold,
  },
});
