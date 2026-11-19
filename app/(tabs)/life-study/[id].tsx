import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../../src/components/layout/Screen";
import { InfoRow } from "../../../src/components/life-study/detail/LifeStudyDetailParts";
import {
  lifeStudyStatusLabel,
  routeId,
} from "../../../src/components/life-study/detail/lifeStudyDetailData";
import { styles } from "../../../src/components/life-study/detail/lifeStudyDetailStyles";
import { InfoBox } from "@/components/ui/info-box";
import {
  Badge,
  Card,
  Empty,
  ErrorState,
  FloatingBottomBar,
  MotionEnter,
  MOTION_STAGGER_LIMIT,
  motionStaggerDelay,
  TopBar,
} from "../../../src/components/ui";
import {
  useLifeStudyCohortDetail,
  useLifeStudyCourseLessons,
  useLifeStudyOverview,
} from "../../../src/hooks/useLifeStudyCourses";

function LiveLifeStudyDetail({
  id,
  cohortIdParam,
}: {
  id: string;
  cohortIdParam?: string;
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

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={course?.title || "삶공부 과정"}
          back
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={[
            styles.body,
            !openCohort ? styles.bodyNoBottomBar : null,
          ]}
        >
          <View style={styles.hero}>
            {overview.isPending ? (
              <Text style={styles.desc}>불러오는 중이에요.</Text>
            ) : null}
            {overview.isError ? (
              <Text style={styles.desc}>과정을 다시 불러와주세요.</Text>
            ) : null}
            {overview.isSuccess && !course ? (
              <Empty
                icon="book-open-page-variant-outline"
                title="등록된 삶공부 과정이 없어요"
                description="과정 정보를 찾을 수 없어요."
              />
            ) : null}
            {course ? (
              <>
                <View style={styles.badgeRow}>
                  <Badge tone={openCohort ? "success" : "neutral"}>
                    {openCohort
                      ? "신청 가능"
                      : lifeStudyStatusLabel[course.status ?? "pending"]}
                  </Badge>
                  <Badge tone="neutral">
                    {course.kind === "required" ? "필수" : "선택"}
                  </Badge>
                  {course.weekCount > 0 ? (
                    <Text style={styles.caption}>
                      {course.weekCount}주 과정
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.title}>{course.title || "이름 없음"}</Text>
                {course.summary ? (
                  <Text style={styles.desc}>{course.summary}</Text>
                ) : null}

                {course.instructorName ||
                course.teamLeaderName ||
                course.bookName ||
                course.target ||
                course.eligibility ||
                course.weekCount > 0 ? (
                  <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>과정 정보</Text>
                    {course.instructorName ? (
                      <InfoRow label="강사" value={course.instructorName} />
                    ) : null}
                    {course.teamLeaderName &&
                    course.teamLeaderName !== course.instructorName ? (
                      <InfoRow label="팀장" value={course.teamLeaderName} />
                    ) : null}
                    {course.bookName ? (
                      <InfoRow label="교재" value={course.bookName} />
                    ) : null}
                    {course.target ? (
                      <InfoRow label="수강 대상" value={course.target} />
                    ) : null}
                    {course.eligibility ? (
                      <InfoRow label="신청 조건" value={course.eligibility} />
                    ) : null}
                    {course.weekCount > 0 ? (
                      <InfoRow label="주 수" value={`${course.weekCount}주`} />
                    ) : null}
                  </Card>
                ) : null}

                {openCohort ? (
                  <View style={styles.sectionMargin}>
                    <Text style={styles.subSectionTitle}>신청 안내</Text>
                    <Card style={styles.infoCard}>
                      {openCohort.applicationPeriod ? (
                        <InfoRow
                          label="신청 기간"
                          value={openCohort.applicationPeriod}
                        />
                      ) : null}
                      {openCohort.lifeStudyDate ? (
                        <InfoRow
                          label="개강일"
                          value={openCohort.lifeStudyDate}
                        />
                      ) : null}
                      {openCohort.studyPlace ? (
                        <InfoRow
                          label="수업 장소"
                          value={openCohort.studyPlace}
                        />
                      ) : null}
                      {openCohort.capacity != null ? (
                        <InfoRow
                          label="정원"
                          value={`${openCohort.enrolledCount ?? 0} / ${openCohort.capacity}명`}
                        />
                      ) : null}
                    </Card>
                  </View>
                ) : (
                  <View style={styles.sectionMargin}>
                    <Text style={styles.subSectionTitle}>신청 안내</Text>
                    <InfoBox
                      title="지금 모집 중인 기수가 없어요"
                      description="다음 기수 개강 일정 및 모집 기간이 확정되면 안내해 드릴게요."
                    />
                  </View>
                )}

                <View
                  style={[
                    styles.sectionMargin,
                    lessons.length === 0 ? styles.sectionMarginFill : null,
                  ]}
                >
                  <Text style={styles.subSectionTitle}>커리큘럼</Text>
                  {lessons.length > 0 ? (
                    <Card style={styles.infoCard}>
                      {lessons.map((lesson, index) => (
                        <MotionEnter
                          key={lesson.id}
                          mode="fadeUp"
                          enabled={index < MOTION_STAGGER_LIMIT}
                          delay={motionStaggerDelay(index)}
                          style={[
                            styles.curriculumRow,
                            index < lessons.length - 1
                              ? styles.rowBorder
                              : null,
                          ]}
                        >
                          <View style={styles.weekBadge}>
                            <Text style={styles.weekNumber}>
                              {lesson.orderNum}
                            </Text>
                          </View>
                          <View style={styles.rowText}>
                            <Text style={styles.caption}>
                              WEEK {lesson.orderNum}
                            </Text>
                            <Text style={styles.curriculumTitle}>
                              {lesson.lessonName}
                            </Text>
                          </View>
                        </MotionEnter>
                      ))}
                    </Card>
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
              </>
            ) : null}
          </View>
        </ScrollView>

        {openCohort ? (
          <FloatingBottomBar
            disabled={isAlreadyApplied}
            label={
              isAlreadyApplied ? "이미 수강 신청한 과정이에요" : "수강 신청하기"
            }
            onPress={() => {
              if (!isAlreadyApplied) {
                router.push({
                  pathname: "/life-study/apply",
                  params: {
                    cohortId: activeCohortId ?? openCohort.id,
                    courseId: openCohort.id,
                    courseTitle: openCohort.title,
                  },
                });
              }
            }}
            testID="life-study-detail-bottom-bar"
          />
        ) : null}
      </View>
    </Screen>
  );
}

export default function LifeStudyDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    cohortId?: string;
  }>();
  const id = routeId(params.id);
  const cohortIdParam = routeId(params.cohortId);
  // id 가 없으면 찾는 과정이 없으므로 "과정 정보를 찾을 수 없어요" 빈 상태가 보인다
  return <LiveLifeStudyDetail id={id ?? ""} cohortIdParam={cohortIdParam} />;
}
