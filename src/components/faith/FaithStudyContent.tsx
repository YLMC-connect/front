import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useLifeStudyOverview } from "../../hooks/useLifeStudyCourses";
import {
  AppText,
  Empty,
  ErrorState,
  MotionEnter,
  motionStaggerDelay,
} from "../ui";
import { ProgressBar } from "../ui/progress-bar";
import { CourseCard, OverviewLoading, STAGGER_LIMIT } from "./FaithParts";
import { styles } from "./faithSectionsStyles";

export function StudyContent() {
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

  const progressPercent = data.path.totalRequired
    ? Math.round((data.path.completedRequired / data.path.totalRequired) * 100)
    : 0;
  const openCourses = data.openCourses;
  const courses = data.courses;

  return (
    <MotionEnter style={styles.contentFill}>
      <View style={styles.section}>
        <AppText variant="heading" style={styles.sectionTitle}>
          내 학습경로
        </AppText>
        <View style={styles.pathCard}>
          <View style={styles.pathTop}>
            <View>
              <AppText variant="caption" tone="brand">
                필수 과정 진행률
              </AppText>
              <AppText variant="heading" style={styles.pathTitle}>
                {data.path.completedRequired} / {data.path.totalRequired} 완료
              </AppText>
            </View>
          </View>
          <ProgressBar
            label="필수 과정"
            value={progressPercent}
            style={styles.pathProgress}
            testID="life-study-path-progress"
          />
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
        <AppText variant="heading" style={styles.sectionTitle}>
          지금 신청 가능한 과정
        </AppText>
        <View style={styles.stack}>
          {openCourses.length === 0 ? (
            <Empty
              icon="book-open-page-variant-outline"
              title="지금 신청 가능한 과정이 없어요"
              description="새로운 과정이 개설되면 안내해 드릴게요."
              style={styles.inlineEmpty}
              testID="life-study-open-courses-empty"
            />
          ) : (
            openCourses.map((course, index) => (
              <MotionEnter
                key={course.cohortId ?? course.id}
                enabled={index < STAGGER_LIMIT}
                mode="fadeUp"
                delay={motionStaggerDelay(index)}
              >
                <CourseCard course={course} open />
              </MotionEnter>
            ))
          )}
        </View>
      </View>

      <View
        style={[
          styles.section,
          courses.length === 0 ? styles.lastSectionEmpty : null,
        ]}
      >
        <AppText variant="heading" style={styles.sectionTitle}>
          전체 과정
        </AppText>
        <View
          style={[
            styles.stack,
            courses.length === 0 ? styles.stackEmpty : null,
          ]}
        >
          {courses.length === 0 ? (
            <Empty
              icon="book-open-page-variant-outline"
              title="개설된 과정이 없어요"
              description="개설 예정인 삶공부 과정을 준비 중이에요."
              style={styles.inlineEmpty}
              testID="life-study-courses-empty"
            />
          ) : (
            courses.map((course, index) => (
              <MotionEnter
                key={course.id}
                enabled={index < STAGGER_LIMIT}
                mode="fadeUp"
                delay={motionStaggerDelay(index)}
              >
                <CourseCard course={course} />
              </MotionEnter>
            ))
          )}
        </View>
      </View>
    </MotionEnter>
  );
}
