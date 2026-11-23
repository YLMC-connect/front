import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import {
  useLifeStudyOverview,
  useMyLifeStudies,
} from "../../hooks/useLifeStudyCourses";
import { useMotionRouteParam } from "../../hooks/useMotionRouteParam";
import { useTabReselect } from "../../hooks/useTabReselect";
import { useScaleHeightForFont } from "../../lib/fontScale";
import type {
  LifeStudyOverview,
  LifeStudyOverviewCourse,
} from "../../types/lifeStudy";
import { StickyHeaderScreen } from "../layout/StickyHeaderScreen";
import { AppIcon } from "../ui/app-icon";
import {
  AppText,
  Empty,
  ErrorState,
  ListSkeleton,
  MotionPressable,
  SegmentedTabs,
  StaggerItem,
} from "../ui";
import {
  buildMyLifeStudySections,
  courseKindLabel,
  formatMonthDay,
  joinParts,
} from "./lifeStudyFormat";

export type LifeStudySegment = "open" | "all" | "mine";

const segments: readonly { key: LifeStudySegment; label: string }[] = [
  { key: "open", label: "신청 가능" },
  { key: "all", label: "전체 과정" },
  { key: "mine", label: "내 수강" },
];

const SEGMENT_STICKY_HEIGHT = 60;

function routeSegment(value?: string): LifeStudySegment {
  return value === "all" || value === "mine" ? value : "open";
}

export function LifeStudyListScreen() {
  const scaleForFont = useScaleHeightForFont();
  const params = useLocalSearchParams<{ segment?: string }>();
  const overview = useLifeStudyOverview();
  const mine = useMyLifeStudies();
  const [segment, setSegment] = useMotionRouteParam<LifeStudySegment>(
    routeSegment(params.segment),
    (next) => {
      router.setParams({ segment: next === "open" ? undefined : next });
    },
  );
  // 삶공부 탭을 다시 누르면 첫 세그먼트(신청 가능)로 돌아간다
  useTabReselect(() => setSegment("open"));

  const current = segment === "mine" ? mine : overview;

  return (
    <StickyHeaderScreen
      testID="screen-faith"
      title="삶공부"
      subtitle="말씀으로 배우고 삶으로 자라가요"
      refreshing={current.isRefetching}
      onRefresh={() => void current.refetch()}
      stickyControls={
        <SegmentedTabs
          items={segments}
          active={segment}
          onChange={setSegment}
          style={[styles.segmented, { height: scaleForFont(40) }]}
          testIDPrefix="life-study-segment"
        />
      }
      stickyControlsHeight={scaleForFont(SEGMENT_STICKY_HEIGHT)}
      stickyControlsHideMode="direction"
      contentContainerStyle={styles.body}
    >
      {segment === "mine" ? (
        <MyCourses query={mine} />
      ) : overview.isPending ? (
        <ListSkeleton rows={4} thumbnail={false} testID="life-study-skeleton" />
      ) : overview.isError || !overview.data ? (
        <ErrorState
          message="삶공부 정보를 다시 불러와주세요."
          onRetry={() => void overview.refetch()}
        />
      ) : (
        <CourseList data={overview.data} segment={segment} />
      )}
    </StickyHeaderScreen>
  );
}

function CourseList({
  data,
  segment,
}: {
  data: LifeStudyOverview;
  segment: Exclude<LifeStudySegment, "mine">;
}) {
  const courses = segment === "open" ? data.openCourses : data.courses;

  return (
    <View style={styles.fill}>
      {data.path.totalRequired > 0 ? <PathCard path={data.path} /> : null}
      {courses.length === 0 ? (
        <Empty
          icon="book-open-page-variant-outline"
          title={
            segment === "open"
              ? "지금 신청 가능한 과정이 없어요"
              : "개설된 과정이 없어요"
          }
          description="다음 기수가 열리면 알려 드릴게요"
          testID={
            segment === "open"
              ? "life-study-open-courses-empty"
              : "life-study-courses-empty"
          }
        />
      ) : (
        <View testID={`life-study-${segment}-list`}>
          {courses.map((course, index) => (
            <StaggerItem
              key={
                segment === "open" ? (course.cohortId ?? course.id) : course.id
              }
              index={index}
            >
              <CourseRow course={course} open={segment === "open"} />
            </StaggerItem>
          ))}
        </View>
      )}
    </View>
  );
}

/** 얇은 진행 카드: 필수 과정 수료 수, 6px 막대, 다음 추천. */
function PathCard({ path }: { path: LifeStudyOverview["path"] }) {
  const percent = Math.round(
    (path.completedRequired / path.totalRequired) * 100,
  );
  return (
    <View style={styles.pathCard} testID="life-study-path">
      <View style={styles.pathTop}>
        <AppText variant="label" weight="semibold">
          필수 과정{" "}
          <AppText variant="label" weight="bold" tone="brand">
            {path.completedRequired}
          </AppText>{" "}
          / {path.totalRequired} 수료
        </AppText>
        <MotionPressable
          accessibilityRole="link"
          onPress={() => router.push("/mypage/life-study-history")}
          style={styles.historyLink}
        >
          <AppText variant="caption" tone="muted">
            수강 내역
          </AppText>
          <AppIcon
            name="chevron-right"
            size={16}
            color={theme.colors.borderStrong}
          />
        </MotionPressable>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        style={styles.track}
        testID="life-study-path-progress"
      >
        <View style={[styles.trackFill, { width: `${percent}%` }]} />
      </View>
      {path.nextRecommendation ? (
        <AppText variant="caption" tone="muted" style={styles.pathNext}>
          다음 추천 ·{" "}
          <AppText variant="caption" weight="semibold">
            {path.nextRecommendation}
          </AppText>
        </AppText>
      ) : null}
    </View>
  );
}

/** 과정 한 줄(썸네일 없음): 구분 · 이름 · 주 수·강사 · 신청 마감·정원. */
function CourseRow({
  course,
  open,
}: {
  course: LifeStudyOverviewCourse;
  open: boolean;
}) {
  const href =
    open && course.cohortId
      ? (`/life-study/${course.id}?cohortId=${course.cohortId}` as const)
      : (`/life-study/${course.id}` as const);
  const completed = !open && course.status === "completed";
  const deadline = formatMonthDay(course.applicationEndDate);
  const meta = joinParts([
    course.weekCount > 0 ? `${course.weekCount}주` : undefined,
    course.instructorName,
  ]);

  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={[styles.row, completed ? styles.rowDone : null]}
      testID={`life-study-row-${open ? (course.cohortId ?? course.id) : course.id}`}
    >
      <AppText variant="caption" weight="semibold" tone="brand">
        {courseKindLabel(course.kind)}
      </AppText>
      <AppText variant="body" weight="semibold" numberOfLines={2}>
        {course.title}
      </AppText>
      {meta ? (
        <AppText variant="label" tone="muted" numberOfLines={1}>
          {meta}
        </AppText>
      ) : null}
      <View style={styles.rowFooter}>
        <AppText variant="caption" tone="muted">
          {open
            ? deadline
              ? `신청 ${deadline}까지`
              : "신청 가능"
            : completed
              ? "수료했어요"
              : course.cohortId
                ? "지금 신청할 수 있어요"
                : ""}
        </AppText>
        {open && course.capacity != null ? (
          <View style={styles.capacity}>
            <AppIcon name="groups" size={14} color={theme.colors.textMuted} />
            <AppText variant="caption" tone="muted">
              <AppText variant="caption" weight="semibold" tone="brand">
                {course.enrolledCount ?? 0}
              </AppText>
              /{course.capacity}명
            </AppText>
          </View>
        ) : null}
      </View>
    </MotionPressable>
  );
}

function MyCourses({ query }: { query: ReturnType<typeof useMyLifeStudies> }) {
  if (query.isPending) {
    return (
      <ListSkeleton rows={3} thumbnail={false} testID="life-study-skeleton" />
    );
  }
  if (query.isError) {
    return (
      <ErrorState
        message="수강 내역을 다시 불러와주세요."
        onRetry={() => void query.refetch()}
      />
    );
  }
  const sections = buildMyLifeStudySections(query.data);
  if (sections.length === 0) {
    return (
      <Empty
        icon="book-open-page-variant-outline"
        title="수강 중인 과정이 없어요"
        description="신청 가능한 과정을 둘러보세요"
        testID="life-study-mine-empty"
      />
    );
  }
  return (
    <View testID="life-study-mine-list">
      {sections.map((section) => (
        <View key={section.key} style={styles.mineSection}>
          <AppText variant="label" weight="semibold" style={styles.mineTitle}>
            {section.title}{" "}
            <AppText variant="label" weight="semibold" tone="brand">
              {section.rows.length}
            </AppText>
          </AppText>
          {section.rows.map((row) => (
            <MotionPressable
              key={row.key}
              accessibilityRole="button"
              disabled={!row.courseId}
              onPress={() =>
                row.courseId
                  ? router.push(`/life-study/${row.courseId}`)
                  : undefined
              }
              style={styles.row}
              testID={`life-study-mine-${row.key}`}
            >
              <AppText variant="body" weight="semibold" numberOfLines={2}>
                {row.name}
              </AppText>
              {row.meta ? (
                <AppText variant="label" tone="muted" numberOfLines={1}>
                  {row.meta}
                </AppText>
              ) : null}
            </MotionPressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingBottom: theme.spacing[8],
  },
  fill: {
    flexGrow: 1,
  },
  segmented: {
    flexShrink: 0,
    height: 40,
    marginHorizontal: theme.layout.screenX,
    marginTop: theme.spacing[1],
    marginBottom: theme.spacing[3],
  },
  pathCard: {
    marginHorizontal: theme.layout.screenX,
    marginBottom: theme.spacing[2],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  pathTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[3],
  },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  track: {
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  pathNext: {
    marginTop: theme.spacing[3],
  },
  row: {
    gap: 2,
    marginHorizontal: theme.layout.screenX,
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowDone: {
    opacity: 0.55,
  },
  rowFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing[1],
  },
  capacity: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  mineSection: {
    marginBottom: theme.spacing[4],
  },
  mineTitle: {
    marginHorizontal: theme.layout.screenX,
    marginTop: theme.spacing[2],
  },
});
