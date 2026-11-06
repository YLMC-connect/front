import { AppIcon } from "@/components/ui/app-icon";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { usePrayerOverview } from "../../hooks/usePrayers";
import {
  AnimatedProgressFill,
  AppText,
  Empty,
  ErrorState,
  MotionEnter,
  MotionPressable,
  SectionHeader,
} from "../ui";
import { OverviewLoading, PrayerDayBadge } from "./FaithParts";
import {
  periodLabels,
  requestStatusLabels,
  roomStatusLabels,
  weekdayLabels,
} from "./faithLabels";
import { styles } from "./faithSectionsStyles";

export function PrayerContent() {
  const { data, isError, isPending, refetch } = usePrayerOverview();

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
  const todayCompleted = joinedRooms.reduce(
    (total, room) => total + (room.completedCount ?? 0),
    0,
  );
  const todayMembers = joinedRooms.reduce(
    (total, room) => total + room.memberCount,
    0,
  );
  const todayPercent = todayMembers
    ? Math.round((todayCompleted / todayMembers) * 100)
    : 0;

  return (
    <MotionEnter style={styles.contentFill}>
      <View style={styles.todayCard}>
        <View style={styles.todayTop}>
          <View>
            <AppText variant="caption" tone="brand">
              오늘의 기도 진행
            </AppText>
            <AppText variant="sectionTitle" style={styles.todayTitle}>
              함께 기도한 성도 {todayCompleted}명
            </AppText>
          </View>
          <AppText variant="screenTitle" tone="brand">
            {todayPercent}%
          </AppText>
        </View>
        <View style={styles.todayTrack}>
          <AnimatedProgressFill
            percent={todayPercent}
            style={styles.todayFill}
          />
        </View>
        <AppText variant="caption" tone="muted" style={styles.todayMeta}>
          참여 중인 기도방 {joinedRooms.length}개 · 전체 {todayMembers}명
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
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
            data.rooms.map((room) => {
              const rate =
                room.participationRate ??
                (room.completedCount && room.memberCount
                  ? Math.round((room.completedCount / room.memberCount) * 100)
                  : 0);

              return (
                <MotionPressable
                  key={room.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/prayer/${room.id}`)}
                  pressedScale={0.985}
                  style={styles.roomCard}
                >
                  <View style={styles.roomCardMain}>
                    <PrayerDayBadge
                      weekday={room.weekday}
                      period={room.period}
                    />
                    <View style={styles.cardText}>
                      <View style={styles.badgeRow}>
                        <AppText variant="cardTitle">
                          {room.title ??
                            `${weekdayLabels[room.weekday].long} ${periodLabels[room.period]}`}
                        </AppText>
                        <View
                          style={[
                            styles.statusBadge,
                            room.status !== "joined" ? styles.warnBadge : null,
                          ]}
                        >
                          <Text style={styles.statusBadgeText}>
                            {roomStatusLabels[room.status]}
                          </Text>
                        </View>
                      </View>
                      <AppText
                        variant="caption"
                        tone="muted"
                        style={styles.mutedText}
                      >
                        멤버 {room.memberCount}명 · 오늘 완료{" "}
                        {room.completedCount == null
                          ? "승인 대기"
                          : `${room.completedCount}명`}
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
                        기도방 보기
                      </AppText>
                      <AppIcon
                        name="chevron-right"
                        size={16}
                        color={theme.colors.primaryDeep}
                      />
                    </View>
                  </View>

                  {room.status === "joined" ? (
                    <View style={styles.roomProgressSection}>
                      <View style={styles.roomProgressHeader}>
                        <AppText variant="caption" tone="muted">
                          오늘 기도 참여율
                        </AppText>
                        <AppText
                          variant="caption"
                          tone="brand"
                          style={styles.roomRateText}
                        >
                          {rate}%
                        </AppText>
                      </View>
                      <View style={styles.roomProgressTrack}>
                        <View
                          style={[
                            styles.roomProgressFill,
                            { width: `${Math.min(rate, 100)}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ) : null}
                </MotionPressable>
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
            data.requests.map((item) => (
              <View
                key={item.id}
                testID={`prayer-request-card-${item.id}`}
                style={styles.requestCard}
              >
                <View style={styles.cardText}>
                  <View style={styles.badgeRow}>
                    <View style={styles.muteBadge}>
                      <Text style={styles.muteBadgeText}>{item.category}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {requestStatusLabels[item.status]}
                      </Text>
                    </View>
                  </View>
                  <AppText variant="cardTitle" style={styles.requestTitle}>
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
            ))
          )}
        </View>
      </View>
    </MotionEnter>
  );
}
