import { AppText } from "@/components/ui/app-text";
import { Checkbox, RadioRow } from "@/components/ui/checkbox";
import { InfoBox } from "@/components/ui/info-box";
import { ModalFormTextInput } from "@/components/ui/modal-form-layout";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Empty,
  FloatingBottomBar,
  TopBar,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useApplyLifeStudyCohort,
  useLifeStudyOverview,
} from "../../../src/hooks/useLifeStudyCourses";
import { useMemberMe } from "../../../src/hooks/useMember";

const faithYears = ["1년 미만", "1-3년", "3-5년", "5-10년", "10년 이상"];

export default function LifeStudyApplyScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cohortId?: string;
    courseId?: string;
    courseTitle?: string;
  }>();
  const { data: member } = useMemberMe();
  const { data: overview, isPending } = useLifeStudyOverview();

  const openCohort =
    overview?.openCourses.find(
      (c) =>
        (params.cohortId &&
          (c.cohortId === params.cohortId ||
            String(c.id) === params.cohortId)) ||
        (params.courseId && String(c.id) === params.courseId),
    ) ?? overview?.openCourses[0];
  const cohortId =
    openCohort?.cohortId ||
    params.cohortId ||
    (openCohort ? String(openCohort.id) : "");
  const courseTitle = openCohort?.title || params.courseTitle || "삶공부 과정";
  const weekCount = openCohort?.weekCount || 13;
  const courseMetaParts = [
    openCohort?.instructorName ? `강사 ${openCohort.instructorName}` : null,
    openCohort?.studyPlace || null,
    `총 ${weekCount}주`,
  ].filter(Boolean);
  const courseMeta =
    courseMetaParts.join(" · ") ||
    (openCohort?.summary
      ? `${openCohort.summary} · 총 ${weekCount}주`
      : `총 ${weekCount}주 과정`);
  const applicationPeriodLabel = openCohort?.applicationPeriod || "-";
  const capacityLabel =
    openCohort?.capacity != null
      ? `${openCohort.enrolledCount ?? 0} / ${openCohort.capacity}명`
      : "-";
  const hasNoOpenCourse =
    !isPending && overview != null && !openCohort && !params.cohortId;

  const memberName = member?.name || "사용자";
  const memberPhone = member?.phone || "010-1234-5678";

  const [userYear, setUserYear] = useState("1988");
  const [userPart, setUserPart] = useState("");
  const [faithYearIndex, setFaithYearIndex] = useState(3);
  const [memo, setMemo] = useState("");
  const [promiseAgreed, setPromiseAgreed] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const applyMutation = useApplyLifeStudyCohort();

  const handleSubmit = async () => {
    setFormError(null);
    if (!cohortId) {
      setFormError("현재 신청 가능한 삶공부 기수가 없습니다.");
      return;
    }
    const trimmedYear = userYear.trim();
    if (!/^\d{4}$/.test(trimmedYear)) {
      setFormError("생년은 4자리 숫자로 입력해주세요 (예: 1994).");
      return;
    }
    const trimmedPart = userPart.trim();
    if (!trimmedPart) {
      setFormError("소속 부서를 입력해주세요 (예: 4부 청장년부).");
      return;
    }
    if (!promiseAgreed) {
      setFormError("수강 약속에 동의해주세요.");
      return;
    }

    try {
      await applyMutation.mutateAsync({
        cohortId,
        input: {
          userYear: trimmedYear,
          userFaithYears: faithYears[faithYearIndex],
          userPart: trimmedPart,
        },
      });
      Alert.alert("수강 신청 완료", "삶공부 수강 신청이 완료되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "수강신청 중 오류가 발생했습니다.";
      setFormError(message);
      Alert.alert("수강 신청 실패", message);
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="수강 신청" close onBack={() => router.back()} />
        {hasNoOpenCourse ? (
          <View style={styles.emptyWrap}>
            <Empty
              icon="book-open-page-variant-outline"
              title="지금 신청 가능한 과정이 없어요"
              description="모집 기간 중인 삶공부 과정만 신청할 수 있습니다."
            />
          </View>
        ) : (
          <>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={[styles.body, { flexGrow: 1 }]}
            >
              <Pressable
                accessible={false}
                onPress={Keyboard.dismiss}
                style={{ flexGrow: 1 }}
              >
                <View style={styles.summaryCard}>
                  <VisualThumb size={72} seed={1} icon="menu-book" />
                  <View style={styles.summaryText}>
                    <Text style={styles.courseTitle}>{courseTitle}</Text>
                    <Text style={styles.courseMeta}>{courseMeta}</Text>
                  </View>
                </View>

                <InfoBox
                  title={`신청 기간 ${applicationPeriodLabel}`}
                  description={[
                    `정원 ${capacityLabel}`,
                    openCohort?.eligibility
                      ? `신청 조건: ${openCohort.eligibility}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                  style={styles.infoBox}
                />

                <View style={styles.form}>
                  <Field label="이름" value={memberName} editable={false} />
                  <View style={styles.twoCols}>
                    <Field
                      label="연락처"
                      value={memberPhone}
                      editable={false}
                    />
                    <Field
                      label="생년"
                      value={userYear}
                      onChangeText={setUserYear}
                      keyboardType="number-pad"
                      maxLength={4}
                      placeholder="예: 1988"
                    />
                  </View>
                  <Field
                    label="소속 부서"
                    value={userPart}
                    onChangeText={setUserPart}
                    placeholder="예) 4부 청장년부"
                  />

                  <View>
                    <Text style={styles.label}>신앙 연차</Text>
                    <View
                      style={styles.options}
                      accessibilityRole="radiogroup"
                      accessibilityLabel="신앙 연차"
                    >
                      {faithYears.map((item, index) => (
                        <RadioRow
                          key={item}
                          label={item}
                          selected={index === faithYearIndex}
                          onPress={() => setFaithYearIndex(index)}
                        />
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.label}>신청 동기</Text>
                    <ModalFormTextInput
                      multiline
                      placeholder="신청하시는 이유를 자유롭게 적어주세요"
                      style={styles.textarea}
                      value={memo}
                      onChangeText={setMemo}
                    />
                  </View>

                  <Checkbox
                    checked={promiseAgreed}
                    onChange={setPromiseAgreed}
                    accessibilityLabel={`수강 약속에 동의합니다. ${weekCount}주 과정 중 80% 이상 출석하며, 매주 묵상 과제를 성실히 수행하겠습니다.`}
                    style={styles.promise}
                    label={
                      <>
                        <AppText variant="body" weight="semibold">
                          수강 약속에 동의합니다
                        </AppText>
                        <AppText variant="label" tone="muted">
                          {weekCount}주 과정 중 80% 이상 출석하며, 매주 묵상
                          과제를 성실히 수행하겠습니다.
                        </AppText>
                      </>
                    }
                  />

                  {formError ? (
                    <Text style={styles.errorText}>{formError}</Text>
                  ) : null}
                </View>
              </Pressable>
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

function Field({
  label,
  value,
  placeholder,
  editable = true,
  onChangeText,
  keyboardType = "default",
  maxLength,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "number-pad";
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <ModalFormTextInput
        editable={editable}
        placeholder={placeholder}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
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
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 112,
  },
  summaryCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.sm,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
  },
  courseTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  courseMeta: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  infoBox: {
    marginBottom: 20,
  },
  form: {
    gap: 20,
  },
  twoCols: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  input: {
    marginHorizontal: 0,
  },
  textarea: {
    marginHorizontal: 0,
  },
  options: {
    gap: 8,
  },
  promise: {
    alignItems: "flex-start",
  },
  errorText: {
    marginTop: 4,
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.fontWeight.semibold,
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: 24,
  },
  submitButton: {
    height: 52,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
});
