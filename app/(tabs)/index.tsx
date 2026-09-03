import { AppIcon } from "@/components/ui/app-icon";
import { useRouter, type Href } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeHeroVisual } from "../../src/components/home/HomeHeroVisual";
import { Screen } from "../../src/components/layout/Screen";
import {
  AppText,
  Avatar,
  ErrorState,
  ListSkeleton,
  MotionPressable,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useHomeOverview } from "../../src/hooks/useHome";
import { useHomeTodayProgress } from "../../src/hooks/useHomeTodayProgress";
import { useAuthStore } from "../../src/store/authStore";
import type { HomeTodoItem } from "../../src/types/home";

const HERO_HEIGHT = 360;
const FADE_HEIGHT = 140;
/** How far the rounded white sheet rides up over the hero. */
const SHEET_OVERLAP = 36;
/** Progress card sits slightly above the sheet top edge. */
const PROGRESS_OVERLAP = 20;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.currentUser);
  const overview = useHomeOverview();
  const fullName = currentUser?.name?.trim() || "성도";
  const todos = overview.data?.todos ?? [];
  const todoIds = todos.map((todo) => todo.id);
  const progress = useHomeTodayProgress(todoIds);

  const openTodo = async (todo: HomeTodoItem) => {
    await progress.markDone(todo.id);
    router.push(todo.href as Href);
  };

  return (
    <Screen
      applyTopInset={false}
      backgroundColor={theme.colors.bg}
      padded={false}
      scroll={false}
      testID="screen-home"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        testID="screen-home-scroll"
      >
        {overview.isPending || !progress.ready ? (
          <View style={[styles.loading, { paddingTop: insets.top + 16 }]}>
            <ListSkeleton rows={3} />
          </View>
        ) : overview.isError || !overview.data ? (
          <View style={[styles.errorWrap, { paddingTop: insets.top + 24 }]}>
            <ErrorState
              message="홈 정보를 불러오지 못했습니다. 다시 시도해주세요."
              onRetry={() => overview.refetch()}
            />
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.hero} testID="home-hero">
              <HomeHeroVisual fadeHeight={FADE_HEIGHT}>
                <View
                  style={[styles.heroTopBar, { paddingTop: insets.top + 28 }]}
                >
                  <MotionPressable
                    accessibilityHint="마이페이지로 이동합니다"
                    accessibilityLabel="내 정보"
                    accessibilityRole="button"
                    hitSlop={6}
                    onPress={() => router.push("/mypage")}
                    style={styles.profileButton}
                    testID="home-open-mypage"
                  >
                    <Avatar name={fullName} size={32} seed={fullName} />
                    <AppText
                      variant="caption"
                      tone="brand"
                      style={styles.profileLabel}
                    >
                      내 정보
                    </AppText>
                    <AppIcon
                      name="chevron-right"
                      size={16}
                      color={theme.colors.primaryDeep}
                    />
                  </MotionPressable>
                </View>
              </HomeHeroVisual>
            </View>

            <View style={styles.sheet} testID="home-todo-sheet">
              <View style={styles.progressCard} testID="home-progress">
                <View style={styles.progressHead}>
                  <AppText variant="caption" tone="secondary">
                    오늘 진행
                  </AppText>
                  <AppText variant="cardTitle">
                    {progress.doneCount} / {progress.total}
                  </AppText>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${
                          progress.total === 0
                            ? 0
                            : (progress.doneCount / progress.total) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.todoList} accessibilityLabel="오늘 할 일">
                {todos.map((todo) => {
                  const done = progress.isDone(todo.id);
                  return (
                    <View
                      key={todo.id}
                      style={styles.todoRow}
                      testID={`home-todo-${todo.id}`}
                    >
                      <View
                        style={[
                          styles.todoIconWrap,
                          done ? styles.todoIconWrapDone : null,
                        ]}
                      >
                        <AppIcon
                          name={done ? "check-circle" : todo.icon}
                          size={24}
                          color={
                            done
                              ? theme.colors.primaryDeep
                              : theme.colors.inkSoft
                          }
                        />
                      </View>
                      <View style={styles.todoText}>
                        <AppText variant="cardTitle">{todo.title}</AppText>
                        <AppText
                          numberOfLines={2}
                          variant="caption"
                          tone="secondary"
                          style={styles.todoSubtitle}
                        >
                          {todo.subtitle}
                        </AppText>
                      </View>
                      <MotionPressable
                        accessibilityRole="button"
                        onPress={() => openTodo(todo)}
                        style={[
                          styles.todoAction,
                          done ? styles.todoActionDone : null,
                        ]}
                        testID={`home-todo-action-${todo.id}`}
                      >
                        <AppText
                          variant="caption"
                          tone={done ? "brand" : "inverse"}
                          style={styles.todoActionLabel}
                        >
                          {done ? "완료" : todo.actionLabel}
                        </AppText>
                      </MotionPressable>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
    backgroundColor: theme.colors.bg,
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
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  profileLabel: {
    fontWeight: theme.fontWeight.semibold,
  },
  loading: {
    paddingHorizontal: theme.layout.screenX,
  },
  errorWrap: {
    paddingHorizontal: theme.layout.screenX,
  },
  body: {
    flexGrow: 1,
    backgroundColor: theme.colors.bg,
  },
  hero: {
    width: "100%",
    height: HERO_HEIGHT,
    overflow: "hidden",
    backgroundColor: theme.colors.primaryTint,
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    paddingHorizontal: theme.layout.screenX,
    zIndex: 2,
  },
  /** 상단 라운드 시트 — 앱 공통 크림(bg), 탭까지 연속 */
  sheet: {
    flexGrow: 1,
    minHeight: 320,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[6],
    gap: theme.spacing[4],
    zIndex: 1,
    ...theme.shadow.sheet,
  },
  /** 진행만 흰 카드로 대비 */
  progressCard: {
    marginTop: -PROGRESS_OVERLAP - theme.spacing[5],
    marginHorizontal: theme.layout.screenX,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
    zIndex: 2,
    ...theme.shadow.raised,
  },
  progressHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarTrack: {
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  todoList: {
    paddingHorizontal: theme.layout.screenX,
    gap: theme.spacing[1],
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    minHeight: 64,
  },
  todoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  todoIconWrapDone: {
    backgroundColor: theme.colors.primarySoft,
  },
  todoText: {
    flex: 1,
    minWidth: 0,
  },
  todoSubtitle: {
    marginTop: 2,
  },
  todoAction: {
    minHeight: 36,
    minWidth: 64,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  todoActionDone: {
    backgroundColor: theme.colors.primarySoft,
  },
  todoActionLabel: {
    fontWeight: theme.fontWeight.semibold,
  },
});
