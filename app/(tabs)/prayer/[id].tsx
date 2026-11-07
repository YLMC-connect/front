import { ProgressBar } from "@/components/ui/progress-bar";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  FloatingBottomBar,
  TopBar,
  UnderlineTabs,
} from "../../../src/components/ui";
import { readDesignVariant } from "../../../src/lib/designVariant";
import { useTogglePrayerCompletion } from "../../../src/hooks/usePrayers";
import {
  fetchPrayerCohortStatus,
  fetchPrayerTopicBoard,
} from "../../../src/services/prayerService";
import {
  formatPrayerDate,
  parsePrayerRoomDayPeriod,
} from "../../../src/services/prayerMapper";
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

  const roomTitle = room?.cohortName || "기도방";
  const { day, period } = parsePrayerRoomDayPeriod(room?.cohortName);
  // 서버가 이번 주에 완료할 수 없다고 하면 버튼을 막는다(null 은 막지 않는다).
  const completionBlocked = isHttp && room?.canComplete === false;

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
          when: formatPrayerDate(t.createdAt),
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
          when: formatPrayerDate(t.createdAt),
        }))
      : [];

  const answerItems: readonly PrayerItemData[] =
    board?.recentAnswers && board.recentAnswers.length > 0
      ? board.recentAnswers.map((t) => ({
          category: t.categoryName || "일반",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          answer: t.answerContent || undefined,
          when: formatPrayerDate(t.answeredAt ?? t.createdAt),
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
                  <Badge tone="neutral">{`멤버 ${totalMembers}명`}</Badge>
                  {urgentItems.length > 0 ? (
                    <Badge
                      tone="warning"
                      icon="warning-amber"
                    >{`긴급 ${urgentItems.length}건`}</Badge>
                  ) : null}
                  {isCompleted ? (
                    <Badge tone="success" icon="check">
                      이번 주 완료
                    </Badge>
                  ) : null}
                </View>
              </View>
            </View>

            <ProgressBar
              label={`이번 주 완료 ${completedCount}명 / 전체 ${totalMembers}명`}
              value={completionRate}
              style={styles.heroProgress}
              testID="prayer-detail-progress"
            />
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
            {completionBlocked ? (
              <Text
                style={styles.completeHint}
                testID="prayer-detail-complete-hint"
              >
                지금은 기도 완료를 처리할 수 없는 주예요.
              </Text>
            ) : null}
            <Button
              disabled={toggleCompletion.isPending || completionBlocked}
              icon="check"
              loading={toggleCompletion.isPending}
              onPress={handleToggleCompletion}
              size="lg"
              testID="prayer-detail-complete"
              variant={isCompleted ? "secondary" : "primary"}
            >
              {isCompleted ? "이번 주 기도 완료됨" : "이번 주 기도 완료"}
            </Button>
          </FloatingBottomBar>
        ) : null}
      </View>
    </Screen>
  );
}
