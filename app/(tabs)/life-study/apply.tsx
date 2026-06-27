import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { TopBar, VisualThumb } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

const faithYears = ["1년 미만", "1-3년", "3-5년", "5-10년", "10년 이상"];

export default function LifeStudyApplyScreenRoute() {
  const router = useRouter();

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="수강 신청" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.summaryCard}>
            <VisualThumb size={72} seed={1} icon="menu-book" />
            <View style={styles.summaryText}>
              <Text style={styles.courseTitle}>생명의 삶</Text>
              <Text style={styles.courseMeta}>
                매주 수 19:30 · 본당 3층 소예배실{"\n"}2026.07.08 ~ 2026.10.07
                (총 13주)
              </Text>
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
            <Field label="이름" value="김은혜" />
            <View style={styles.twoCols}>
              <Field label="연락처" value="010-1234-5678" />
              <Field label="생년" value="1988" />
            </View>
            <Field label="소속 부서" placeholder="예) 4부 청장년부" />

            <View>
              <Text style={styles.label}>신앙 연차</Text>
              <View style={styles.chips}>
                {faithYears.map((item, index) => {
                  const selected = index === 3;
                  return (
                    <View
                      key={item}
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
                    </View>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={styles.label}>신청 동기</Text>
              <TextInput
                editable={false}
                multiline
                placeholder="신청하시는 이유를 자유롭게 적어주세요"
                placeholderTextColor={theme.colors.inkHint}
                style={[styles.input, styles.textarea]}
              />
            </View>

            <View style={styles.promiseBox}>
              <View style={styles.checkBox}>
                <MaterialIcons
                  name="check"
                  size={14}
                  color={theme.colors.white}
                />
              </View>
              <Text style={styles.promiseText}>
                <Text style={styles.promiseStrong}>수강 약속에 동의합니다</Text>
                {"\n"}
                <Text style={styles.promiseMuted}>
                  13주 과정 중 80% 이상 출석하며, 매주 묵상 과제를 성실히
                  수행하겠습니다.
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <Pressable accessibilityRole="button" style={styles.submitButton}>
            <Text style={styles.submitText}>수강 신청하기</Text>
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
}: {
  label: string;
  value?: string;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        editable={false}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkHint}
        style={styles.input}
        value={value}
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
    fontSize: theme.fontSize.sm,
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
    fontSize: theme.fontSize.md,
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: theme.colors.glass,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  submitButton: {
    height: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.primary,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
});
