import { AppIcon } from "@/components/ui/app-icon";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  AnimatedProgressFill,
  Card,
  DetailBadge,
  ErrorState,
  FloatingBottomBar,
  MotionPop,
  MotionPressable,
  TopBar,
  UnderlineTabs,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";
import { useTogglePrayerCompletion } from "../../../src/hooks/usePrayers";
import {
  fetchPrayerCohortStatus,
  fetchPrayerTopicBoard,
} from "../../../src/services/prayerService";
import {
  AnswersPanel,
  PrayerPanel,
  StatusPanel,
  type PrayerItemData,
  type TabKey,
} from "../../../src/components/prayer/detail/PrayerDetailParts";
import { styles } from "../../../src/components/prayer/detail/prayerDetailStyles";

const tabs: readonly { key: TabKey; label: string }[] = [
  { key: "pray", label: "기도" },
  { key: "answers", label: "응답" },
  { key: "status", label: "현황" },
];

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDayAndPeriod(
  id?: string,
  name?: string,
): { day: string; period: string } {
  const text = (name ?? id ?? "").toLowerCase();
  let day = "월";
  if (text.includes("화") || text.includes("tue")) day = "화";
  else if (text.includes("수") || text.includes("wed")) day = "수";
  else if (text.includes("목") || text.includes("thu")) day = "목";
  else if (text.includes("금") || text.includes("fri")) day = "금";
  else if (text.includes("토") || text.includes("sat")) day = "토";
  else if (text.includes("일") || text.includes("sun")) day = "일";

  let period = "오전";
  if (text.includes("오후") || text.includes("pm") || text.includes("저녁")) {
    period = "오후";
  }
  return { day, period };
}

export default function PrayerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const id = routeId(params.id);
  const variant = readDesignVariant(params.designVariant) ?? "pray";
  const [completedOverride, setCompletedOverride] = useState<boolean | null>(
    null,
  );

  const initialTab: TabKey =
    variant === "status" ||
    variant === "status-empty" ||
    variant === "leader-status"
      ? "status"
      : variant === "answers" || variant === "answers-empty"
        ? "answers"
        : "pray";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const isHttp = !params.designVariant;
  const toggleCompletion = useTogglePrayerCompletion(id ?? "1");
  const statusQuery = useQuery({
    queryKey: ["prayer", "cohort-status", id ?? "1"],
    queryFn: () => fetchPrayerCohortStatus(id ?? "1"),
    enabled: Boolean(id),
  });
  const boardQuery = useQuery({
    queryKey: ["prayer", "topic-board"],
    queryFn: fetchPrayerTopicBoard,
  });

  const room = statusQuery.data;
  const board = boardQuery.data;
  // 게시판 조회가 실패하면 빈 목록이 아니라 오류로 보여준다(기도제목·응답 탭 공통)
  const boardFailed = boardQuery.isError && !board;
  const boardError = boardFailed ? (
    <ErrorState
      message="기도제목을 불러오지 못했어요. 다시 시도해주세요."
      onRetry={() => void boardQuery.refetch()}
    />
  ) : null;
  const statusFailed = statusQuery.isError && !room;

  const roomTitle = room?.cohortName || "월요일 오전 기도방";
  const { day, period } = parseDayAndPeriod(id, roomTitle);

  const isCompleted =
    completedOverride ??
    (room ? room.myCompleted : variant === "pray-completed");

  const totalMembers = room?.totalMembers ?? 0;
  const completedCount = room?.completedCount ?? 0;
  const pendingCount = room?.notCompletedCount ?? 0;
  const completionRate = room?.completionRate ?? 0;

  const urgentItems: readonly PrayerItemData[] =
    board?.emergency && board.emergency.length > 0
      ? board.emergency.map((t) => ({
          category: t.categoryName || "긴급",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          when: "오늘",
          urgent: true,
        }))
      : [];

  const ongoingItems: readonly PrayerItemData[] =
    board?.ongoing && board.ongoing.length > 0
      ? board.ongoing.map((t) => ({
          category: t.categoryName || "일반",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          when: "진행 중",
        }))
      : [];

  const answerItems: readonly PrayerItemData[] =
    board?.recentAnswers && board.recentAnswers.length > 0
      ? board.recentAnswers.map((t) => ({
          category: t.categoryName || "일반",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          answer: t.answerContent ?? "기도에 응답해 주셨습니다.",
          when: "최근",
        }))
      : [];

  const completedPeople =
    room?.completed && room.completed.length > 0
      ? room.completed.map((m) => m.userName)
      : [];

  const pendingPeople =
    room?.notCompleted && room.notCompleted.length > 0
      ? room.notCompleted.map((m) => m.userName)
      : [];

  const isPrayEmpty =
    variant === "pray-empty" ||
    (urgentItems.length === 0 && ongoingItems.length === 0);
  const isStatusEmpty =
    variant === "status-empty" ||
    (completedPeople.length === 0 && pendingPeople.length === 0);
  const isAnswersEmpty =
    variant === "answers-empty" || answerItems.length === 0;

  const handleToggleCompletion = () => {
    if (isHttp && id) {
      toggleCompletion.mutate(Boolean(isCompleted), {
        onError: (err) => {
          Alert.alert(
            "기도 완료 실패",
            err instanceof Error
              ? err.message
              : "기도 완료 처리에 실패했습니다. 다시 시도해주세요.",
          );
        },
      });
    } else {
      setCompletedOverride((prev) => !(prev ?? isCompleted));
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title={roomTitle} back onBack={() => router.back()} />

        <View style={styles.heroSection}>
          <Card style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.timeText}>{period}</Text>
              </View>
              <View style={styles.heroMetaCol}>
                <View style={styles.badges}>
                  <DetailBadge tone="primary">참여중</DetailBadge>
                  <DetailBadge>{`멤버 ${totalMembers}명`}</DetailBadge>
                  {urgentItems.length > 0 ? (
                    <DetailBadge tone="warn">{`오늘 긴급 ${urgentItems.length}건`}</DetailBadge>
                  ) : null}
                  {isCompleted ? (
                    <DetailBadge tone="primary">오늘 완료</DetailBadge>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.heroProgressSection}>
              <View style={styles.heroProgressHeader}>
                <Text style={styles.heroProgressLabel}>
                  오늘 완료 {completedCount}명 / 전체 {totalMembers}명
                </Text>
                <Text style={styles.heroProgressRate}>{completionRate}%</Text>
              </View>
              <View style={styles.heroProgressBar}>
                <AnimatedProgressFill
                  percent={completionRate}
                  style={styles.heroProgressFill}
                />
              </View>
            </View>
          </Card>
        </View>

        <UnderlineTabs
          items={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />

        <ScrollView
          contentContainerStyle={[
            styles.body,
            activeTab === "pray" ? styles.bodyWithAction : null,
          ]}
        >
          {activeTab === "status" && statusFailed ? (
            <ErrorState
              message="기도 현황을 불러오지 못했어요. 다시 시도해주세요."
              onRetry={() => void statusQuery.refetch()}
            />
          ) : activeTab === "status" ? (
            <StatusPanel
              empty={isStatusEmpty}
              completedCount={completedCount}
              pendingCount={pendingCount}
              completionRate={completionRate}
              completedPeople={completedPeople}
              pendingPeople={pendingPeople}
              day={day}
              period={period}
            />
          ) : boardError ? (
            boardError
          ) : activeTab === "answers" ? (
            <AnswersPanel empty={isAnswersEmpty} items={answerItems} />
          ) : (
            <PrayerPanel
              empty={isPrayEmpty}
              urgent={urgentItems}
              progress={ongoingItems}
              answers={answerItems}
            />
          )}
        </ScrollView>

        {activeTab === "pray" && !isPrayEmpty ? (
          <FloatingBottomBar testID="prayer-detail-bottom-bar">
            <MotionPressable
              accessibilityRole="button"
              disabled={toggleCompletion.isPending}
              onPress={handleToggleCompletion}
              pressedScale={0.96}
              style={[
                styles.prayButton,
                isCompleted ? styles.prayButtonDone : null,
                toggleCompletion.isPending ? { opacity: 0.7 } : null,
              ]}
            >
              <MotionPop key={isCompleted ? "done" : "todo"}>
                <AppIcon
                  name="check"
                  size={18}
                  color={
                    isCompleted ? theme.colors.primaryDeep : theme.colors.white
                  }
                />
              </MotionPop>
              <Text
                style={[
                  styles.prayButtonText,
                  isCompleted ? styles.prayButtonTextDone : null,
                ]}
              >
                {isCompleted ? "오늘 기도 완료됨" : "오늘 기도 완료"}
              </Text>
            </MotionPressable>
          </FloatingBottomBar>
        ) : null}
      </View>
    </Screen>
  );
}
