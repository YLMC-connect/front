import { AppIcon } from "@/components/ui/app-icon";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import type { LifeStudyOverviewCourse } from "../../types/lifeStudy";
import type { PrayerPeriod, PrayerWeekday } from "../../types/prayer";
import {
  AppText,
  FloatingActionButton,
  ListSkeleton,
  MotionEnter,
  MotionPressable,
} from "../ui";
import {
  lifeStudyStatusLabels,
  periodLabels,
  weekdayLabels,
} from "./faithLabels";
import { styles } from "./faithSectionsStyles";

export function OverviewLoading() {
  return (
    <View style={styles.overviewState}>
      <ListSkeleton rows={3} thumbnail={false} />
    </View>
  );
}

export function PrayerDayBadge({
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

export function CourseCard({
  course,
  open,
}: {
  course: LifeStudyOverviewCourse;
  open?: boolean;
}) {
  const detailHref =
    open && course.cohortId
      ? (`/life-study/${course.id}?cohortId=${course.cohortId}` as const)
      : (`/life-study/${course.id}` as const);

  const targetInfo =
    course.target ||
    course.eligibility ||
    (course.kind === "required" ? "등록교인 누구나" : undefined);

  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={() => router.push(detailHref)}
      pressedScale={0.985}
      style={styles.courseCard}
    >
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
      <AppText variant="heading" style={styles.courseTitle}>
        {course.title}
      </AppText>
      <AppText variant="body" tone="primary" style={styles.courseSummary}>
        {course.summary}
      </AppText>
      {open ? (
        <>
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
          <View style={styles.openCourseActionRow}>
            <AppText
              variant="caption"
              tone="brand"
              style={styles.openCourseActionText}
            >
              수강 신청
            </AppText>
            <AppIcon
              name="chevron-right"
              size={16}
              color={theme.colors.primaryStrong}
            />
          </View>
        </>
      ) : (
        <>
          {targetInfo ? (
            <Text style={styles.targetText}>신청대상: {targetInfo}</Text>
          ) : null}
          <View style={styles.courseCardFooter}>
            <Text style={styles.courseFooterHint}>개강 일정 및 상세 정보</Text>
            <View style={styles.openCourseActionRow}>
              <AppText
                variant="caption"
                tone="brand"
                style={styles.openCourseActionText}
              >
                과정 확인
              </AppText>
              <AppIcon
                name="chevron-right"
                size={16}
                color={theme.colors.primaryStrong}
              />
            </View>
          </View>
        </>
      )}
    </MotionPressable>
  );
}

export function PrayerFloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <Pressable
          accessibilityLabel="메뉴 닫기"
          accessibilityRole="button"
          onPress={() => setOpen(false)}
          style={styles.fabBackdrop}
          testID="prayer-fab-backdrop"
        />
      ) : null}
      <View pointerEvents="box-none" style={styles.fabContainer}>
        {open ? (
          <View style={styles.fabMenu}>
            <MotionEnter delay={40} mode="fadeUp">
              <MotionPressable
                accessibilityLabel="중보기도 신청"
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  router.push("/prayer/apply");
                }}
                hitSlop={{ top: 3, bottom: 3 }}
                style={styles.fabMenuItem}
                testID="prayer-fab-apply-item"
              >
                <AppIcon
                  name="prayer-apply"
                  size={18}
                  color={theme.colors.primaryStrong}
                />
                <AppText variant="caption" style={styles.fabMenuItemText}>
                  중보기도 신청
                </AppText>
              </MotionPressable>
            </MotionEnter>

            <MotionEnter delay={0} mode="fadeUp">
              <MotionPressable
                accessibilityLabel="기도제목 작성"
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  router.push("/modal/prayer-new");
                }}
                hitSlop={{ top: 3, bottom: 3 }}
                style={styles.fabMenuItem}
                testID="prayer-fab-write-item"
              >
                <AppIcon
                  name="edit"
                  size={18}
                  color={theme.colors.primaryStrong}
                />
                <AppText variant="caption" style={styles.fabMenuItemText}>
                  기도제목 작성
                </AppText>
              </MotionPressable>
            </MotionEnter>
          </View>
        ) : null}

        <FloatingActionButton
          accessibilityLabel={open ? "기도 신청 메뉴 닫기" : "기도 신청 메뉴"}
          icon={open ? "close" : "add"}
          label={open ? "닫기" : "신청 및 작성"}
          onPress={() => setOpen((prev) => !prev)}
          style={styles.fabButton}
          testID="prayer-fab-toggle"
        />
      </View>
    </>
  );
}
