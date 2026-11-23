import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { InfoLine } from "../../../src/components/life-study/detail/LifeStudyDetailParts";
import {
  lifeStudyStatusLabel,
  routeId,
} from "../../../src/components/life-study/detail/lifeStudyDetailData";
import { styles } from "../../../src/components/life-study/detail/lifeStudyDetailStyles";
import {
  courseKindLabel,
  courseScheduleLabel,
  formatMonthDay,
  formatPeriod,
  joinParts,
  seatsLeft,
} from "../../../src/components/life-study/lifeStudyFormat";
import { InfoBox } from "@/components/ui/info-box";
import {
  AppText,
  Badge,
  Button,
  Empty,
  ErrorState,
  FloatingBottomBar,
  Skeleton,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import {
  useLifeStudyCohortDetail,
  useLifeStudyCourseLessons,
  useLifeStudyOverview,
} from "../../../src/hooks/useLifeStudyCourses";

const TOAST_MS = 2400;

function LiveLifeStudyDetail({
  id,
  cohortIdParam,
  justApplied,
}: {
  id: string;
  cohortIdParam?: string;
  justApplied: boolean;
}) {
  const router = useRouter();
  const overview = useLifeStudyOverview();
  const openCohort = overview.data?.openCourses.find(
    (item) =>
      (cohortIdParam && item.cohortId === cohortIdParam) ||
      item.cohortId === id ||
      item.id === id,
  );
  const catalogCourse = overview.data?.courses.find((item) => item.id === id);
  const course = openCohort ?? catalogCourse;
  const activeCohortId = cohortIdParam || openCohort?.cohortId;
  const cohortDetailQuery = useLifeStudyCohortDetail(activeCohortId);
  const cohortDetail = cohortDetailQuery.data;
  const isAlreadyApplied = Boolean(cohortDetail?.applied);
  // 커리큘럼은 과정 단위 API 로 받는다. 모집 중인 기수가 없어도 보인다.
  const courseLessonsQuery = useLifeStudyCourseLessons(course?.id);
  const lessons = courseLessonsQuery.data ?? cohortDetail?.lessons ?? [];

  // 신청을 마치고 돌아오면 토스트를 잠깐 보이고 표시를 지운다
  useEffect(() => {
    if (!justApplied) return;
    const timer = setTimeout(
      () => router.setParams({ applied: undefined }),
      TOAST_MS,
    );
    return () => clearTimeout(timer);
  }, [justApplied, router]);

  const instructor = course
    ? joinParts([
        course.instructorName,
        course.teamLeaderName && course.teamLeaderName !== course.instructorName
          ? `팀장 ${course.teamLeaderName}`
          : undefined,
      ])
    : "";
  const schedule = course
    ? joinParts([
        courseScheduleLabel(course),
        course.weekCount > 0 ? `${course.weekCount}주` : undefined,
      ])
    : "";
  const period = formatPeriod(openCohort?.applicationPeriod);
  const notice = course
    ? joinParts([
        period ? `신청 기간 ${period}` : undefined,
        course.target ? `대상 ${course.target}` : undefined,
        course.eligibility ? `조건 ${course.eligibility}` : undefined,
      ])
    : "";
  const deadline = formatMonthDay(openCohort?.applicationEndDate);
  const seats = openCohort ? seatsLeft(openCohort) : undefined;
  const showBarCaption = !isAlreadyApplied && (deadline || seats != null);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="삶공부" back onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={[
            styles.body,
            !openCohort ? styles.bodyNoBottomBar : null,
          ]}
        >
          {overview.isPending ? (
            <View style={styles.skeleton} testID="life-study-detail-skeleton">
              <Skeleton width={120} height={24} />
              <Skeleton width="70%" height={30} />
              <Skeleton width="100%" height={20} />
              <Skeleton width="100%" height={180} />
            </View>
          ) : null}
          {overview.isError ? (
            <ErrorState
              message="과정을 다시 불러와주세요."
              onRetry={() => void overview.refetch()}
            />
          ) : null}
          {overview.isSuccess && !course ? (
            <Empty
              icon="book-open-page-variant-outline"
              title="등록된 삶공부 과정이 없어요"
              description="과정 정보를 찾을 수 없어요."
            />
          ) : null}
          {course ? (
            <View style={styles.content}>
              <View style={styles.badgeRow}>
                <Badge tone={openCohort ? "success" : "neutral"}>
                  {openCohort
                    ? "신청 가능"
                    : lifeStudyStatusLabel[course.status ?? "pending"]}
                </Badge>
                <Badge tone="neutral">{courseKindLabel(course.kind)}</Badge>
              </View>
              <AppText variant="title">{course.title || "이름 없음"}</AppText>
              {course.summary ? (
                <AppText variant="body" style={styles.desc}>
                  {course.summary}
                </AppText>
              ) : null}

              <View style={styles.infoLines}>
                {instructor ? (
                  <InfoLine
                    icon="person-outline"
                    label="강사"
                    value={instructor}
                  />
                ) : null}
                {schedule ? (
                  <InfoLine icon="schedule" label="일정" value={schedule} />
                ) : null}
                {course.studyPlace ? (
                  <InfoLine
                    icon="place"
                    label="장소"
                    value={course.studyPlace}
                  />
                ) : null}
                {course.capacity != null ? (
                  <InfoLine
                    icon="groups"
                    label="정원"
                    value={
                      <AppText variant="label" weight="semibold">
                        <AppText variant="label" weight="semibold" tone="brand">
                          {course.enrolledCount ?? 0}
                        </AppText>{" "}
                        / {course.capacity}명
                      </AppText>
                    }
                  />
                ) : null}
                {course.bookName ? (
                  <InfoLine
                    icon="menu-book"
                    label="교재"
                    value={course.bookName}
                  />
                ) : null}
              </View>

              {openCohort ? (
                notice ? (
                  <InfoBox description={notice} style={styles.notice} />
                ) : null
              ) : (
                <InfoBox
                  title="지금 모집 중인 기수가 없어요"
                  description={
                    notice ||
                    "다음 기수 개강 일정과 모집 기간이 정해지면 알려 드릴게요."
                  }
                  style={styles.notice}
                />
              )}

              <View
                style={[
                  styles.curriculumHead,
                  lessons.length === 0 ? styles.sectionFill : null,
                ]}
              >
                <View style={styles.curriculumTitleRow}>
                  <AppText variant="body" weight="bold">
                    커리큘럼
                  </AppText>
                  {lessons.length > 0 ? (
                    <AppText variant="caption" tone="muted" style={styles.push}>
                      {lessons.length}주
                    </AppText>
                  ) : null}
                </View>
                {lessons.length > 0 ? (
                  lessons.map((lesson, index) => (
                    <View
                      key={lesson.id}
                      style={[
                        styles.lessonRow,
                        index < lessons.length - 1 ? styles.rowBorder : null,
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight="semibold"
                        tone="muted"
                        style={styles.lessonWeek}
                      >
                        {lesson.orderNum}주차
                      </AppText>
                      <AppText
                        variant="label"
                        weight="medium"
                        style={styles.lessonName}
                      >
                        {lesson.lessonName}
                      </AppText>
                    </View>
                  ))
                ) : courseLessonsQuery.isError ? (
                  <ErrorState
                    message="커리큘럼을 불러오지 못했어요. 다시 시도해주세요."
                    onRetry={() => void courseLessonsQuery.refetch()}
                  />
                ) : (
                  <Empty
                    icon="book-open-page-variant-outline"
                    title="등록된 커리큘럼이 없어요"
                    description="개강하면 주차별 강의 커리큘럼이 공개돼요."
                  />
                )}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {openCohort ? (
          <FloatingBottomBar>
            {showBarCaption ? (
              <AppText
                variant="caption"
                tone="muted"
                style={styles.barCaption}
                testID="life-study-detail-deadline"
              >
                {deadline ? `${deadline} 마감` : null}
                {deadline && seats != null ? " · " : null}
                {seats != null ? (
                  <>
                    <AppText variant="caption" weight="semibold" tone="brand">
                      {seats}자리
                    </AppText>{" "}
                    남았어요
                  </>
                ) : null}
              </AppText>
            ) : null}
            <Button
              size="lg"
              disabled={isAlreadyApplied}
              testID="life-study-detail-bottom-bar"
              onPress={() => {
                if (isAlreadyApplied) return;
                router.push({
                  pathname: "/life-study/apply",
                  params: {
                    cohortId: activeCohortId ?? openCohort.id,
                    courseId: openCohort.id,
                    courseTitle: openCohort.title,
                  },
                });
              }}
            >
              {isAlreadyApplied
                ? "이미 수강 신청한 과정이에요"
                : "수강 신청하기"}
            </Button>
          </FloatingBottomBar>
        ) : null}
        <Toast
          message={justApplied ? "수강 신청했어요" : undefined}
          offset={openCohort ? 140 : 28}
        />
      </View>
    </Screen>
  );
}

export default function LifeStudyDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    cohortId?: string;
    applied?: string;
  }>();
  const id = routeId(params.id);
  const cohortIdParam = routeId(params.cohortId);
  // id 가 없으면 찾는 과정이 없으므로 "과정 정보를 찾을 수 없어요" 빈 상태가 보인다
  return (
    <LiveLifeStudyDetail
      id={id ?? ""}
      cohortIdParam={cohortIdParam}
      justApplied={routeId(params.applied) === "1"}
    />
  );
}
