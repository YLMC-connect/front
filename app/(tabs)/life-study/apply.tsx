import { AppIcon } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { TopBar, VisualThumb } from "../../../src/components/ui";
import { LinearGradient } from "expo-linear-gradient";
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
    courseTitle?: string;
  }>();
  const { data: member } = useMemberMe();
  const { data: overview } = useLifeStudyOverview();

  const openCohort =
    overview?.openCourses.find((c) => String(c.id) === params.cohortId) ??
    overview?.openCourses[0];
  const cohortId =
    params.cohortId || (openCohort ? String(openCohort.id) : "1");
  const courseTitle = params.courseTitle || openCohort?.title || "생명의 삶";
  const courseMeta = openCohort
    ? `${openCohort.summary ? `${openCohort.summary} · ` : ""}총 ${openCohort.weekCount || 13}주`
    : "매주 수 19:30 · 본당 3층 소예배실\n2026.07.08 ~ 2026.10.07 (총 13주)";

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
        <TopBar title="수강 신청" back onBack={() => router.back()} />
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

            <View style={styles.infoBox}>
              <InfoRow label="신청 기간" value="6.24 ~ 7.05" />
              <InfoRow label="정원" value="18 / 24명" />
              <Text style={styles.infoHint}>
                생명의 삶은 이후 필수·선택 과정을 위한 첫 과정입니다.
              </Text>
            </View>

            <View style={styles.form}>
              <Field label="이름" value={memberName} editable={false} />
              <View style={styles.twoCols}>
                <Field label="연락처" value={memberPhone} editable={false} />
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
                <View style={styles.chips}>
                  {faithYears.map((item, index) => {
                    const selected = index === faithYearIndex;
                    return (
                      <Pressable
                        key={item}
                        accessibilityRole="button"
                        onPress={() => setFaithYearIndex(index)}
                        style={[styles.chip, selected ? styles.chipOn : null]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected ? styles.chipTextOn : null,
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={styles.label}>신청 동기</Text>
                <TextInput
                  multiline
                  placeholder="신청하시는 이유를 자유롭게 적어주세요"
                  placeholderTextColor={theme.colors.inkHint}
                  style={[styles.input, styles.textarea]}
                  value={memo}
                  onChangeText={setMemo}
                />
              </View>

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: promiseAgreed }}
                onPress={() => setPromiseAgreed(!promiseAgreed)}
                style={styles.promiseBox}
              >
                <View
                  style={[
                    styles.checkBox,
                    !promiseAgreed ? styles.checkBoxOff : null,
                  ]}
                >
                  {promiseAgreed ? (
                    <AppIcon
                      name="check"
                      size={14}
                      color={theme.colors.white}
                    />
                  ) : null}
                </View>
                <Text style={styles.promiseText}>
                  <Text style={styles.promiseStrong}>
                    수강 약속에 동의합니다
                  </Text>
                  {"\n"}
                  <Text style={styles.promiseMuted}>
                    13주 과정 중 80% 이상 출석하며, 매주 묵상 과제를 성실히
                    수행하겠습니다.
                  </Text>
                </Text>
              </Pressable>

              {formError ? (
                <Text style={styles.errorText}>{formError}</Text>
              ) : null}
            </View>
          </Pressable>
        </ScrollView>

        <View pointerEvents="box-none" style={styles.bottom}>
          <LinearGradient
            colors={[
              "rgba(246,247,249,0)",
              "rgba(246,247,249,0.78)",
              "rgba(246,247,249,0.96)",
            ]}
            locations={[0, 0.38, 1]}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            testID="life-study-apply-bottom-bar"
          />
          <Pressable
            accessibilityRole="button"
            disabled={applyMutation.isPending}
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              applyMutation.isPending ? styles.submitButtonDisabled : null,
            ]}
          >
            {applyMutation.isPending ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <Text style={styles.submitText}>수강 신청하기</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
      <TextInput
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkHint}
        style={[styles.input, !editable ? styles.inputDisabled : null]}
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
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 112,
  },
  summaryCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
  },
  courseTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  courseMeta: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  infoBox: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  infoLabel: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
  },
  infoValue: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: theme.fontWeight.extrabold,
  },
  infoHint: {
    marginTop: 8,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
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
    marginBottom: 7,
    color: theme.colors.inkSoft,
    fontSize: theme.typography.formLabel.fontSize,
    fontWeight: theme.fontWeight.bold,
  },
  input: {
    minHeight: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
  },
  textarea: {
    minHeight: 98,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  promiseBox: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkBoxOff: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.line,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.inkSoft,
  },

  errorText: {
    marginTop: 4,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  promiseText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    lineHeight: 21,
  },
  promiseStrong: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.semibold,
  },
  promiseMuted: {
    color: theme.colors.inkMute,
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
});
