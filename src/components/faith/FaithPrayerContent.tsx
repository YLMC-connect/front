import { AppIcon } from "@/components/ui/app-icon";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { theme } from "../../constants/theme";
import type { PrayerOverviewRoom } from "../../types/prayer";
import {
  useCancelPrayerApplication,
  usePrayerOverview,
} from "../../hooks/usePrayers";
import {
  AppText,
  Badge,
  ConfirmDialog,
  Empty,
  ErrorState,
  MotionEnter,
  MotionPressable,
  motionStaggerDelay,
  SectionHeader,
} from "../ui";
import { ProgressBar } from "../ui/progress-bar";
import { OverviewLoading, PrayerDayBadge, STAGGER_LIMIT } from "./FaithParts";
import {
  periodLabels,
  requestStatusLabels,
  roomStatusLabels,
  weekdayLabels,
} from "./faithLabels";
import { styles } from "./faithSectionsStyles";

export function PrayerContent() {
  const { data, isError, isPending, refetch } = usePrayerOverview();
  const cancelApplication = useCancelPrayerApplication();
  const [cancelTarget, setCancelTarget] = useState<PrayerOverviewRoom | null>(
    null,
  );

  const confirmCancel = () => {
    const applicationId = cancelTarget?.applicationId;
    setCancelTarget(null);
    if (!applicationId) return;
    cancelApplication.mutate(applicationId, {
      onError: (err) => {
        Alert.alert(
          "신청 취소 실패",
          err instanceof Error
            ? err.message
            : "참여 신청을 취소하지 못했습니다. 다시 시도해주세요.",
        );
      },
    });
  };

  if (isPending) return <OverviewLoading />;
  if (isError || !data) {
    return (
      <ErrorState
        message="기도 정보를 다시 불러와주세요."
        onRetry={() => refetch()}
      />
    );
  }

  const joinedRooms = data.rooms.filter((room) => room.status === "joined");
  // 서버 완료 인원·참여율은 이번 주 기준이다(GET /api/prayer/cohorts/my).
  const weekCompleted = joinedRooms.reduce(
    (total, room) => total + (room.completedCount ?? 0),
    0,
  );
  const weekMembers = joinedRooms.reduce(
    (total, room) => total + room.memberCount,
    0,
  );
  const weekPercent = weekMembers
    ? Math.round((weekCompleted / weekMembers) * 100)
    : 0;

  return (
    <MotionEnter style={styles.contentFill}>
      <View style={styles.todayCard}>
        <View style={styles.todayTop}>
          <View>
            <AppText variant="caption" tone="brand">
              이번 주 기도 진행
            </AppText>
            <AppText variant="heading" style={styles.todayTitle}>
              함께 기도한 성도 {weekCompleted}명
            </AppText>
          </View>
        </View>
        <ProgressBar
          label="이번 주 기도 참여율"
          value={weekPercent}
          style={styles.todayProgress}
          testID="prayer-today-progress"
        />
        <AppText variant="caption" tone="muted" style={styles.todayMeta}>
          참여 중인 기도방 {joinedRooms.length}개 · 전체 {weekMembers}명
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="heading" style={styles.sectionTitle}>
          내 기도방
        </AppText>
        <View style={styles.stack}>
          {data.rooms.length === 0 ? (
            <Empty
              icon="groups"
              title="참여 중인 기도방이 없어요"
              description="중보기도 신청을 통해 기도방에 참여해보세요."
              style={styles.inlineEmpty}
              testID="prayer-rooms-empty"
            />
          ) : (
            data.rooms.map((room, index) => {
              const pending = room.status === "pending";
              const rate =
                room.participationRate ??
                (room.completedCount && room.memberCount
                  ? Math.round((room.completedCount / room.memberCount) * 100)
                  : 0);

              return (
                <MotionEnter
                  key={room.id}
                  enabled={index < STAGGER_LIMIT}
                  mode="fadeUp"
                  delay={motionStaggerDelay(index)}
                >
                  <MotionPressable
                    accessibilityRole="button"
                    accessibilityLabel={pending ? "참여 신청 취소" : undefined}
                    disabled={pending && cancelApplication.isPending}
                    onPress={() =>
                      pending
                        ? setCancelTarget(room)
                        : router.push(`/prayer/${room.id}`)
                    }
                    style={styles.roomCard}
                  >
                    <View style={styles.roomCardMain}>
                      <PrayerDayBadge
                        weekday={room.weekday}
                        period={room.period}
                      />
                      <View style={styles.cardText}>
                        <View style={styles.badgeRow}>
                          <AppText variant="body" weight="semibold">
                            {room.title ??
                              `${weekdayLabels[room.weekday].long} ${periodLabels[room.period]}`}
                          </AppText>
                          <Badge
                            tone={room.status === "joined" ? "info" : "warning"}
                          >
                            {roomStatusLabels[room.status]}
                          </Badge>
                        </View>
                        <AppText
                          variant="caption"
                          tone="muted"
                          style={styles.mutedText}
                        >
                          {pending
                            ? "관리자 승인 후 기도방에 참여해요"
                            : `멤버 ${room.memberCount}명 · 이번 주 완료 ${room.completedCount ?? 0}명`}
                        </AppText>
                      </View>
                      <View
                        testID={`prayer-room-${room.id}-action`}
                        style={styles.roomAction}
                      >
                        <AppText
                          variant="caption"
                          tone="brand"
                          style={styles.roomActionText}
                        >
                          {pending ? "신청 취소" : "기도방 보기"}
                        </AppText>
                        {pending ? null : (
                          <AppIcon
                            name="chevron-right"
                            size={16}
                            color={theme.colors.primaryStrong}
                          />
                        )}
                      </View>
                    </View>

                    {room.status === "joined" ? (
                      <ProgressBar
                        label="이번 주 기도 참여율"
                        value={rate}
                        style={styles.roomProgress}
                        testID={`prayer-room-${room.id}-progress`}
                      />
                    ) : null}
                  </MotionPressable>
                </MotionEnter>
              );
            })
          )}
        </View>
      </View>

      <View
        style={[
          styles.section,
          data.requests.length === 0 ? styles.lastSectionEmpty : null,
        ]}
      >
        <SectionHeader
          title="내 기도제목"
          onViewAll={() => router.push("/prayer/request")}
          style={styles.sectionHeader}
          testID="prayer-request-section-header"
        />
        <View
          style={[
            styles.stack,
            data.requests.length === 0 ? styles.stackEmpty : null,
          ]}
        >
          {data.requests.length === 0 ? (
            <Empty
              icon="hands-pray"
              title="등록된 기도제목이 없어요"
              description="기도제목 작성을 통해 기도제목을 나눠보세요."
              style={styles.inlineEmpty}
              testID="prayer-requests-empty"
            />
          ) : (
            data.requests.map((item, index) => (
              <MotionEnter
                key={item.id}
                enabled={index < STAGGER_LIMIT}
                mode="fadeUp"
                delay={motionStaggerDelay(index)}
              >
                <View
                  testID={`prayer-request-card-${item.id}`}
                  style={styles.requestCard}
                >
                  <View style={styles.cardText}>
                    <View style={styles.badgeRow}>
                      <Badge tone="neutral">{item.category}</Badge>
                      <Badge tone="info">
                        {requestStatusLabels[item.status]}
                      </Badge>
                    </View>
                    <AppText
                      variant="body"
                      weight="semibold"
                      style={styles.requestTitle}
                    >
                      {item.title}
                    </AppText>
                    <AppText
                      variant="caption"
                      tone="muted"
                      style={styles.mutedText}
                    >
                      {item.description}
                    </AppText>
                  </View>
                </View>
              </MotionEnter>
            ))
          )}
        </View>
      </View>

      <ConfirmDialog
        visible={cancelTarget != null}
        title="참여 신청을 취소할까요?"
        message="승인 대기 중인 신청이 취소됩니다."
        confirmText="취소하기"
        cancelText="닫기"
        danger
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </MotionEnter>
  );
}
