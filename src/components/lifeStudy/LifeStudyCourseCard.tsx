import { Link } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  type DimensionValue,
  View,
} from "react-native";
import { Badge, Card } from "../ui";
import { theme } from "../../constants/theme";
import type { LifeStudyCourse } from "../../types/lifeStudy";

const statusLabel = {
  upcoming: "예정",
  ongoing: "진행중",
  completed: "완료",
} as const;

export function LifeStudyCourseCard({ course }: { course: LifeStudyCourse }) {
  const progress =
    course.sessions === 0
      ? 0
      : Math.round((course.currentSession / course.sessions) * 100);
  const isOngoing = course.status === "ongoing";

  return (
    <Link
      href={{ pathname: "/life-study/[id]", params: { id: course.id } }}
      asChild
    >
      <Pressable>
        <Card style={styles.card}>
          <View style={styles.orb} />
          <View style={styles.badgeRow}>
            <Badge
              tone={
                course.status === "completed"
                  ? "mute"
                  : course.status === "ongoing"
                    ? "success"
                    : "primary"
              }
            >
              {statusLabel[course.status]}
            </Badge>
            <Text numberOfLines={1} style={styles.meta}>
              {course.schedule}
            </Text>
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{course.title}</Text>
            <Text numberOfLines={2} style={styles.desc}>
              {course.description}
            </Text>
          </View>
          {isOngoing ? (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress}%` as DimensionValue },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          ) : null}
          <View style={styles.footer}>
            <Text style={styles.meta}>
              {course.instructor.name} · {course.currentSession}/
              {course.sessions}회차
            </Text>
            <Text style={styles.meta}>
              {course.enrolledCount}/{course.capacity}명
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, overflow: "hidden" },
  orb: {
    position: "absolute",
    right: -12,
    top: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(91,122,176,0.14)",
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { color: theme.colors.ink, fontSize: 18, fontWeight: "900" },
  desc: {
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  meta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: theme.colors.surface2,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: "900",
  },
  footer: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});
