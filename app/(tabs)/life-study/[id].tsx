import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, type DimensionValue, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Section } from "../../../src/components/layout/Screen";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Toast,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useCancelLifeStudyEnrollment,
  useEnrollLifeStudyCourse,
  useLifeStudyCourse,
} from "../../../src/hooks/useLifeStudyCourses";

export default function LifeStudyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = id ?? "";
  const { data: course, isError } = useLifeStudyCourse(courseId);
  const enroll = useEnrollLifeStudyCourse(courseId);
  const cancel = useCancelLifeStudyEnrollment(courseId);
  const [toast, setToast] = useState("");

  if (isError)
    return (
      <Screen>
        <EmptyState
          title="존재하지 않는 삶공부 과정입니다"
          icon="error-outline"
        />
      </Screen>
    );
  if (!course)
    return (
      <Screen>
        <Text style={styles.meta}>과정을 불러오는 중입니다.</Text>
      </Screen>
    );

  const progress =
    course.sessions === 0
      ? 0
      : Math.round((course.currentSession / course.sessions) * 100);

  return (
    <Screen>
      <TopBar title="삶공부 상세" back onBack={() => router.back()} />
      <Card style={styles.headerCard}>
        <View style={styles.headerIcon}>
          <MaterialIcons
            name="menu-book"
            size={34}
            color={theme.colors.primaryDeep}
          />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{course.title}</Text>
          <Badge
            tone={
              course.status === "completed"
                ? "mute"
                : course.status === "ongoing"
                  ? "success"
                  : "primary"
            }
          >
            {course.status === "upcoming"
              ? "예정"
              : course.status === "ongoing"
                ? "진행중"
                : "완료"}
          </Badge>
        </View>
        <Text style={styles.description}>{course.description}</Text>
      </Card>

      <Card style={styles.info}>
        <InfoRow icon="event" label="일정" value={course.schedule} />
        <InfoRow icon="place" label="장소" value={course.location} />
        <InfoRow
          icon="people"
          label="정원"
          value={`${course.enrolledCount} / ${course.capacity}명`}
        />
        <View style={styles.instructor}>
          <Avatar name={course.instructor.name} size={34} />
          <View>
            <Text style={styles.infoValue}>{course.instructor.name}</Text>
            <Text style={styles.meta}>강사</Text>
          </View>
        </View>
      </Card>

      <Section title="진도">
        <Card style={styles.progressCard}>
          <Text style={styles.progressText}>
            {course.currentSession} / {course.sessions}회차 · {progress}%
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` as DimensionValue },
              ]}
            />
          </View>
        </Card>
      </Section>

      <Section title="커리큘럼">
        <Card style={styles.curriculum}>
          {course.curriculum.map((item, index) => (
            <View key={item} style={styles.curriculumRow}>
              <Text style={styles.curriculumIndex}>{index + 1}</Text>
              <Text style={styles.curriculumText}>{item}</Text>
            </View>
          ))}
        </Card>
      </Section>

      {course.isEnrolled ? (
        <Button
          variant="soft"
          onPress={() =>
            cancel.mutate(undefined, {
              onSuccess: () => setToast("수강 신청을 취소했습니다."),
            })
          }
          loading={cancel.isPending}
        >
          신청 취소
        </Button>
      ) : (
        <Button
          disabled={course.status === "completed"}
          onPress={() =>
            enroll.mutate(undefined, {
              onSuccess: () => setToast("수강 신청이 완료되었습니다."),
              onError: (error) =>
                setToast(
                  error instanceof Error
                    ? error.message
                    : "신청할 수 없습니다.",
                ),
            })
          }
          loading={enroll.isPending}
        >
          신청하기
        </Button>
      )}
      <Toast message={toast} />
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color={theme.colors.primaryDeep} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: { gap: 12 },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryTint,
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  description: { color: theme.colors.inkSoft, fontSize: 15, lineHeight: 23 },
  info: { gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  infoLabel: {
    color: theme.colors.inkMute,
    fontSize: 13,
    fontWeight: "800",
    width: 42,
  },
  infoValue: { color: theme.colors.ink, fontWeight: "800" },
  instructor: { flexDirection: "row", alignItems: "center", gap: 10 },
  meta: { color: theme.colors.inkMute, fontSize: 13, lineHeight: 19 },
  progressCard: { gap: 10 },
  progressText: { color: theme.colors.ink, fontWeight: "900" },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: theme.colors.surface2,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  curriculum: { gap: 10 },
  curriculumRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  curriculumIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    lineHeight: 26,
    color: theme.colors.primaryDeep,
    fontWeight: "900",
    backgroundColor: theme.colors.primaryTint,
  },
  curriculumText: { flex: 1, color: theme.colors.inkSoft, fontWeight: "700" },
});
