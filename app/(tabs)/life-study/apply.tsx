import { AppText } from "@/components/ui/app-text";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoBox } from "@/components/ui/info-box";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  formatMonthDay,
  formatPeriod,
  joinParts,
} from "../../../src/components/life-study/lifeStudyFormat";
import {
  Avatar,
  Empty,
  FloatingBottomBar,
  TopBar,
} from "../../../src/components/ui";
import { lifeStudyApiErrorMessages } from "../../../src/constants/apiErrorMessages";
import { theme } from "../../../src/constants/theme";
import {
  useApplyLifeStudyCohort,
  useLifeStudyOverview,
} from "../../../src/hooks/useLifeStudyCourses";
import { useMemberMe } from "../../../src/hooks/useMember";
import { getApiErrorMessage } from "../../../src/lib/apiErrorMessage";

export default function LifeStudyApplyScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cohortId?: string;
    courseId?: string;
    courseTitle?: string;
  }>();
  const { data: member } = useMemberMe();
  const { data: overview, isPending } = useLifeStudyOverview();

  const hasRequestedCourse = Boolean(params.cohortId || params.courseId);
  // 요청한 기수가 신청 가능 목록에 없으면 다른 기수로 대신 신청하지 않는다.
  const openCohort = hasRequestedCourse
    ? overview?.openCourses.find(
        (c) =>
          (params.cohortId &&
            (c.cohortId === params.cohortId ||
              String(c.id) === params.cohortId)) ||
          (params.courseId && String(c.id) === params.courseId),
      )
    : overview?.openCourses[0];
  const cohortId = openCohort
    ? openCohort.cohortId || String(openCohort.id)
    : "";
  const courseTitle = openCohort?.title || params.courseTitle || "삶공부 과정";
  const weekCount = openCohort?.weekCount ?? 0;
  const startDate = formatMonthDay(openCohort?.lifeStudyDate);
  const courseMeta = joinParts([
    openCohort?.cohortNumber != null ? `${openCohort.cohortNumber}기` : null,
    startDate ? `${startDate} 개강` : null,
    weekCount > 0 ? `${weekCount}주` : null,
  ]);
  const period = formatPeriod(openCohort?.applicationPeriod);
  const notice = joinParts([
    period ? `신청 기간 ${period}` : null,
    openCohort?.capacity != null
      ? `정원 ${openCohort.enrolledCount ?? 0} / ${openCohort.capacity}명`
      : null,
    openCohort?.eligibility ? `조건 ${openCohort.eligibility}` : null,
  ]);
  const hasNoOpenCourse = !isPending && !openCohort;

  const memberName = member?.name || "사용자";
  const memberPhone = member?.phone || "등록된 전화번호 없음";
  const promiseDetail = `${weekCount > 0 ? `${weekCount}주 과정 중 ` : ""}80% 이상 출석하며, 매주 묵상 과제를 성실히 수행하겠습니다.`;

  const [promiseAgreed, setPromiseAgreed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const applyMutation = useApplyLifeStudyCohort();

  const handleSubmit = async () => {
    setFormError(null);
    if (!cohortId) {
      setFormError("지금 신청 가능한 삶공부 기수가 없어요.");
      return;
    }
    if (!promiseAgreed) {
      setFormError("수강 약속에 동의해주세요.");
      return;
    }

    try {
      await applyMutation.mutateAsync({
        cohortId,
        // 생년·신앙연차·소속부서는 서버에서 선택 항목이 되어 보내지 않는다
        input: {},
      });
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        lifeStudyApiErrorMessages,
        "수강 신청하지 못했어요. 신청 기간과 정원을 확인하고 다시 시도해주세요.",
      );
      setFormError(message);
      Alert.alert("수강 신청 실패", message);
      return;
    }
    // 상세로 돌아가 "수강 신청했어요" 토스트를 보인다
    router.dismissTo({
      pathname: "/life-study/[id]",
      params: {
        id: openCohort?.id ?? params.courseId ?? "",
        cohortId,
        applied: "1",
      },
    });
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="수강 신청" close onBack={() => router.back()} />
        {hasNoOpenCourse ? (
          <View style={styles.emptyWrap}>
            <Empty
              icon="book-open-page-variant-outline"
              title={
                hasRequestedCourse
                  ? "신청할 수 없는 과정이에요"
                  : "지금 신청 가능한 과정이 없어요"
              }
              description="모집 기간 중인 삶공부 과정만 신청할 수 있어요."
            />
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.body}>
              {notice ? <InfoBox description={notice} /> : null}

              <View style={styles.card} testID="life-study-apply-summary">
                <AppText variant="body" weight="semibold">
                  {courseTitle}
                </AppText>
                {courseMeta ? (
                  <AppText variant="caption" tone="muted">
                    {courseMeta}
                  </AppText>
                ) : null}
              </View>

              <View style={styles.card}>
                <AppText variant="caption" weight="semibold" tone="muted">
                  신청자
                </AppText>
                <View style={styles.applicant}>
                  <Avatar
                    name={memberName}
                    size={40}
                    seed={member?.id}
                    uri={member?.profileImage}
                  />
                  <View style={styles.applicantText}>
                    <AppText variant="label" weight="semibold">
                      {memberName}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {memberPhone}
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" tone="muted">
                  바꾸려면 마이페이지 › 프로필 수정에서 바꿔 주세요.
                </AppText>
              </View>

              <View style={styles.card}>
                <Checkbox
                  checked={promiseAgreed}
                  onChange={setPromiseAgreed}
                  accessibilityLabel={`수강 약속에 동의합니다. ${promiseDetail}`}
                  style={styles.promise}
                  label={
                    <>
                      <AppText variant="label" weight="semibold">
                        수강 약속에 동의합니다
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {promiseDetail}
                      </AppText>
                    </>
                  }
                />
              </View>

              {formError ? (
                <AppText variant="caption" weight="semibold" tone="danger">
                  {formError}
                </AppText>
              ) : null}
            </ScrollView>

            <FloatingBottomBar
              disabled={applyMutation.isPending || !cohortId}
              label="수강 신청하기"
              loading={applyMutation.isPending}
              onPress={handleSubmit}
              testID="life-study-apply"
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.layout.screenX,
  },
  body: {
    gap: theme.spacing[4],
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing[1],
    paddingBottom: 132,
  },
  card: {
    gap: theme.spacing[1],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  applicant: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    marginVertical: theme.spacing[2],
  },
  applicantText: {
    flex: 1,
    minWidth: 0,
  },
  promise: {
    alignItems: "flex-start",
  },
});
