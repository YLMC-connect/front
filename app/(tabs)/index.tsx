import { AppIcon } from "@/components/ui/app-icon";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { StickyHeaderScreen } from "../../src/components/layout/StickyHeaderScreen";
import {
  AppText,
  Avatar,
  ErrorState,
  ListSkeleton,
  MotionPressable,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useHomeOverview } from "../../src/hooks/useHome";
import { getGivenName } from "../../src/lib/koreanName";
import { useAuthStore } from "../../src/store/authStore";

function greetingForHour(hour: number): string {
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "좋은 저녁이에요";
}

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const overview = useHomeOverview();
  const fullName = currentUser?.name?.trim() || "성도";
  const givenName = getGivenName(fullName) || fullName;
  const greeting = greetingForHour(new Date().getHours());

  return (
    <StickyHeaderScreen
      contentContainerStyle={styles.content}
      right={
        <MotionPressable
          accessibilityHint="마이페이지로 이동합니다"
          accessibilityLabel="내 정보"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.push("/mypage")}
          style={styles.profileButton}
          testID="home-open-mypage"
        >
          {/* Circle: given name (성 제외). Label: 내 정보. */}
          <Avatar name={fullName} size={32} seed={fullName} />
          <AppText variant="caption" tone="brand" style={styles.profileLabel}>
            내 정보
          </AppText>
          <AppIcon
            name="chevron-right"
            size={16}
            color={theme.colors.primaryDeep}
          />
        </MotionPressable>
      }
      testID="screen-home"
      title="열린문 커넥트"
    >
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
        <View style={styles.body}>
          <View style={styles.greeting} testID="home-greeting">
            <AppText variant="sectionTitle">
              {givenName} 님, {greeting}
            </AppText>
            <AppText variant="caption" tone="secondary" style={styles.greetingSub}>
              오늘도 은혜 가운데 하루를 열어 보세요.
            </AppText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(overview.data.dailyPrayer.href as Href)
            }
            style={styles.dailyCard}
            testID="home-daily-prayer"
          >
            <View style={styles.dailyOrb} />
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
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(overview.data.dawnPrayer.href as Href)}
            style={styles.dawnCard}
            testID="home-dawn-prayer"
          >
            <AppText variant="caption" tone="muted" style={styles.dawnEyebrow}>
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
          </Pressable>
        </View>
      )}
    </StickyHeaderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 112,
  },
  profileButton: {
    minWidth: 108,
    minHeight: theme.layout.touchTarget,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
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
    gap: theme.layout.sectionGap,
    paddingTop: theme.spacing[1],
  },
  greeting: {
    paddingHorizontal: theme.layout.screenX,
  },
  greetingSub: {
    marginTop: theme.spacing[1],
  },
  dailyCard: {
    marginHorizontal: theme.layout.screenX,
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing[5],
    minHeight: 168,
    ...theme.shadow.primary,
  },
  dailyOrb: {
    position: "absolute",
    right: -22,
    bottom: -38,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  dailyEyebrow: {
    opacity: 0.92,
  },
  dailyTitle: {
    marginTop: theme.spacing[2],
  },
  dailySummary: {
    marginTop: theme.spacing[2],
    opacity: 0.92,
  },
  cardAction: {
    marginTop: theme.spacing[4],
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
    padding: theme.layout.cardPadding + 4,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
