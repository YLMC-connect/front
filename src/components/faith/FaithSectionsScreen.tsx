import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../constants/theme";
import { useLifeStudyOverview } from "../../hooks/useLifeStudyCourses";
import { usePrayerOverview } from "../../hooks/usePrayers";
import type {
  LifeStudyOverviewCourse,
  LifeStudyOverviewStatus,
} from "../../types/lifeStudy";
import type {
  PrayerOverviewRoomStatus,
  PrayerPeriod,
  PrayerRequestStatus,
  PrayerWeekday,
} from "../../types/prayer";
import { Screen } from "../layout/Screen";
import {
  AppText,
  EmptyState,
  ErrorState,
  FloatingActionButton,
  ListSkeleton,
} from "../ui";

type FaithSection = "pray" | "study";

export function FaithSectionsScreen({ section }: { section: FaithSection }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  return (
    <Screen scroll={false} padded={false} testID="screen-faith">
      <View style={styles.root}>
        <View style={styles.topBar}>
          <View style={styles.topText}>
            <AppText variant="screenTitle">
              {section === "study" ? "삶공부" : "기도"}
            </AppText>
            <AppText variant="caption" tone="secondary" style={styles.subtitle}>
              {section === "study"
                ? "말씀으로 배우고 삶으로 자라가요"
                : "함께 기도하고 응답을 나눠요"}
            </AppText>
          </View>
          {section === "study" ? (
            <Pressable
              accessibilityLabel={
                searchOpen ? "삶공부 검색 닫기" : "삶공부 검색"
              }
              accessibilityRole="button"
              onPress={() => {
                setSearchOpen((open) => !open);
                if (searchOpen) setSearch("");
              }}
              style={styles.searchButton}
            >
              <MaterialIcons
                name={searchOpen ? "close" : "search"}
                size={22}
                color={theme.colors.inkSoft}
              />
            </Pressable>
          ) : null}
        </View>

        {section === "study" && searchOpen ? (
          <View style={styles.searchWrap}>
            <MaterialIcons
              name="search"
              size={19}
              color={theme.colors.inkMute}
            />
            <TextInput
              autoFocus
              accessibilityLabel="삶공부 검색어"
              value={search}
              onChangeText={setSearch}
              placeholder="과정명 또는 강사 검색"
              placeholderTextColor={theme.colors.inkMute}
              style={styles.searchInput}
            />
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={[
            styles.body,
            section === "pray" ? styles.bodyWithFab : styles.bodyWithTab,
          ]}
        >
          {section === "study" ? (
            <StudyContent search={search} />
          ) : (
            <PrayerContent />
          )}
        </ScrollView>

        {section === "pray" ? (
          <FloatingActionButton
            label="기도제목"
            icon="add"
            style={styles.fab}
            onPress={() => router.push("/modal/prayer-new")}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function PrayerContent() {
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
    <>
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
          <View
            style={[
              styles.todayFill,
              { width: `${todayPercent}%` as `${number}%` },
            ]}
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
          {data.rooms.map((room) => (
            <Pressable
              key={room.id}
              accessibilityRole="button"
              onPress={() => router.push(`/prayer/${room.id}`)}
              style={styles.roomCard}
            >
              <PrayerDayBadge weekday={room.weekday} period={room.period} />
              <View style={styles.cardText}>
                <View style={styles.badgeRow}>
                  <AppText variant="cardTitle">
                    {weekdayLabels[room.weekday].long}{" "}
                    {periodLabels[room.period]}
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
                    : `${room.completedCount}명`}{" "}
                  · 참여율{" "}
                  {room.participationRate == null
                    ? "-"
                    : `${room.participationRate}%`}
                </AppText>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={theme.colors.inkMute}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          내 기도제목
        </AppText>
        <View style={styles.stack}>
          {data.requests.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => router.push("/prayer/request")}
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
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={theme.colors.inkMute}
              />
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/prayer/request")}
            style={styles.outlineButton}
          >
            <Text style={styles.outlineButtonText}>내 기도제목 전체보기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          중보기도 신청
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/prayer/apply")}
          style={styles.applyCard}
        >
          <View style={styles.applyIcon}>
            <MaterialIcons
              name="volunteer-activism"
              size={24}
              color={theme.colors.primaryDeep}
            />
          </View>
          <View style={styles.cardText}>
            <AppText variant="cardTitle">중보기도 신청</AppText>
            <AppText variant="body" tone="secondary" style={styles.applyDesc}>
              월-토 오전/오후 기도방은 신청 화면에서 선택해요.
            </AppText>
          </View>
        </Pressable>
      </View>
    </>
  );
}

function StudyContent({ search }: { search: string }) {
  const { data, isError, isPending, refetch } = useLifeStudyOverview();

  if (isPending) return <OverviewLoading />;
  if (isError || !data) {
    return (
      <ErrorState
        message="삶공부 정보를 다시 불러와주세요."
        onRetry={() => refetch()}
      />
    );
  }

  const progressPercent = Math.round(
    (data.path.completedRequired / data.path.totalRequired) * 100,
  );
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const matchesSearch = (course: LifeStudyOverviewCourse) =>
    !normalizedSearch ||
    course.title.toLocaleLowerCase().includes(normalizedSearch) ||
    course.instructorName.toLocaleLowerCase().includes(normalizedSearch);
  const openCourses = data.openCourses.filter(matchesSearch);
  const courses = data.courses.filter(matchesSearch);

  if (normalizedSearch && openCourses.length === 0 && courses.length === 0) {
    return (
      <EmptyState
        title="검색 결과가 없어요"
        description="과정명이나 강사 이름을 바꿔보세요."
        icon="search-off"
      />
    );
  }

  return (
    <>
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          내 학습경로
        </AppText>
        <View style={styles.pathCard}>
          <View style={styles.pathTop}>
            <View>
              <AppText variant="caption" tone="brand">
                필수 과정 진행률
              </AppText>
              <AppText variant="sectionTitle" style={styles.pathTitle}>
                {data.path.completedRequired} / {data.path.totalRequired} 완료
              </AppText>
            </View>
            <AppText variant="screenTitle" tone="brand">
              {progressPercent}%
            </AppText>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` as `${number}%` },
              ]}
            />
          </View>
          <View style={styles.pathGrid}>
            <View style={styles.pathMetric}>
              <Text style={styles.metricLabel}>다음 추천</Text>
              <Text style={styles.metricValue}>
                {data.path.nextRecommendation}
              </Text>
            </View>
            <View style={styles.pathMetric}>
              <Text style={styles.metricLabel}>수강 기준</Text>
              <Text style={styles.metricValue}>{data.path.eligibility}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          지금 신청 가능한 과정
        </AppText>
        <View style={styles.stack}>
          {openCourses.map((course) => (
            <CourseCard key={course.id} course={course} open />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          전체 과정
        </AppText>
        <View style={styles.stack}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>
      </View>
    </>
  );
}

function OverviewLoading() {
  return (
    <View style={styles.overviewState}>
      <ListSkeleton rows={3} thumbnail={false} />
    </View>
  );
}

function PrayerDayBadge({
  weekday,
  period,
}: {
  weekday: PrayerWeekday;
  period: PrayerPeriod;
}) {
  return (
    <View style={styles.dayBadge}>
      <Text style={styles.dayText}>{weekdayLabels[weekday].short}</Text>
      <Text style={styles.timeText}>{periodLabels[period]}</Text>
    </View>
  );
}

function CourseCard({
  course,
  open,
}: {
  course: LifeStudyOverviewCourse;
  open?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/life-study/${course.id}`)}
      style={[
        styles.courseCard,
        open ? styles.courseCardFeatured : styles.courseCardFlat,
      ]}
    >
      <View style={styles.courseOrb} />
      <View style={styles.badgeRow}>
        <View style={open ? styles.warnBadge : styles.muteBadge}>
          <Text style={open ? styles.statusBadgeText : styles.muteBadgeText}>
            {open
              ? "신청 기간"
              : lifeStudyStatusLabels[course.status ?? "pending"]}
          </Text>
        </View>
        <View style={styles.muteBadge}>
          <Text style={styles.muteBadgeText}>
            {course.kind === "required" ? "필수" : "선택"}
          </Text>
        </View>
        <Text style={styles.mutedText}>
          {course.weekCount}주 · {course.instructorName}
        </Text>
      </View>
      <AppText variant="sectionTitle" style={styles.courseTitle}>
        {course.title}
      </AppText>
      <AppText variant="body" tone="secondary" style={styles.courseSummary}>
        {course.summary}
      </AppText>
      {open ? (
        <View style={styles.courseGrid}>
          <View style={styles.courseMetric}>
            <Text style={styles.metricLabel}>신청 기간</Text>
            <Text style={styles.metricValue}>{course.applicationPeriod}</Text>
          </View>
          <View style={styles.courseMetric}>
            <Text style={styles.metricLabel}>정원</Text>
            <Text style={styles.metricValue}>
              {course.enrolledCount} / {course.capacity}명
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.targetText}>신청대상: {course.target}</Text>
      )}
    </Pressable>
  );
}

const weekdayLabels: Record<PrayerWeekday, { short: string; long: string }> = {
  mon: { short: "월", long: "월요일" },
  tue: { short: "화", long: "화요일" },
  wed: { short: "수", long: "수요일" },
  thu: { short: "목", long: "목요일" },
  fri: { short: "금", long: "금요일" },
};

const periodLabels: Record<PrayerPeriod, string> = {
  morning: "오전",
  afternoon: "오후",
};

const roomStatusLabels: Record<PrayerOverviewRoomStatus, string> = {
  joined: "참여중",
  pending: "승인 대기",
};

const requestStatusLabels: Record<PrayerRequestStatus, string> = {
  reviewing: "검토중",
  published: "공개중",
  rejected: "반려",
};

const lifeStudyStatusLabels: Record<LifeStudyOverviewStatus, string> = {
  completed: "수료",
  recommended: "추천",
  pending: "대기",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    minHeight: 56,
    paddingHorizontal: theme.layout.screenX,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topText: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: 2,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    minHeight: 46,
    marginHorizontal: theme.layout.screenX,
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  segmented: {
    marginHorizontal: theme.layout.screenX,
    marginBottom: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ring,
    padding: 4,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  segmentText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  segmentTextOn: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
  },
  body: {
    paddingBottom: 24,
  },
  bodyWithFab: { paddingBottom: 164 },
  bodyWithTab: { paddingBottom: 116 },
  todayCard: {
    marginHorizontal: theme.layout.screenX,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.sageSoft,
    padding: theme.layout.cardPadding,
  },
  todayTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing[3],
  },
  todayTitle: { marginTop: theme.spacing[1] },
  todayTrack: {
    height: 8,
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.76)",
  },
  todayFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  todayMeta: { marginTop: theme.spacing[2] },
  overviewState: {
    paddingVertical: theme.spacing[2],
  },
  section: {
    marginTop: theme.spacing[2],
  },
  sectionTitle: {
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[3],
  },
  stack: {
    paddingHorizontal: theme.layout.screenX,
    gap: 0,
  },
  roomCard: {
    minHeight: 84,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingVertical: theme.spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.sageSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayText: {
    color: theme.colors.primaryDeep,
    fontSize: 16,
    lineHeight: 17,
    fontWeight: "800",
  },
  timeText: {
    marginTop: 2,
    color: theme.colors.primaryDeep,
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "800",
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  statusBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  warnBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.amberSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  muteBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  muteBadgeText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  mutedText: {
    marginTop: 5,
  },
  requestCard: {
    minHeight: 88,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingVertical: theme.spacing[4],
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  requestTitle: {
    marginTop: 8,
  },
  outlineButton: {
    minHeight: 48,
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  applyCard: {
    marginHorizontal: theme.layout.screenX,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(91,122,176,0.22)",
    backgroundColor: theme.colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  applyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  applyDesc: {
    marginTop: 5,
  },
  pathCard: {
    marginHorizontal: theme.layout.screenX,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(107,130,96,0.14)",
    backgroundColor: "#F4F8EE",
    padding: 16,
  },
  pathTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  pathTitle: {
    marginTop: 5,
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.72)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  pathGrid: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  pathMetric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(255,255,255,0.70)",
    padding: 11,
  },
  metricLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  metricValue: {
    marginTop: 3,
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
  },
  courseCard: {
    position: "relative",
    overflow: "hidden",
    paddingVertical: theme.spacing[5],
  },
  courseCardFeatured: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow.card,
  },
  courseCardFlat: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  courseOrb: {
    position: "absolute",
    right: -18,
    top: -18,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primarySoft,
  },
  courseTitle: {
    marginTop: 8,
  },
  courseSummary: {
    marginTop: 5,
  },
  courseGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  courseMetric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface2,
    padding: 10,
  },
  targetText: {
    marginTop: 7,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  fab: {
    position: "absolute",
    right: theme.layout.screenX,
    bottom: 86,
  },
});
