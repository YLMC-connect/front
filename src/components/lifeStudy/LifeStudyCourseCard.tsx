import { Link } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  type DimensionValue,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
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

  return (
    <Link
      href={{ pathname: "/life-study/[id]", params: { id: course.id } }}
      asChild
    >
      <Pressable>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.icon}>
              <MaterialIcons
                name="menu-book"
                size={26}
                color={theme.colors.primaryDeep}
              />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{course.title}</Text>
              <Text style={styles.meta}>
                {course.instructor.name} · {course.schedule}
              </Text>
            </View>
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
          </View>
          <Text numberOfLines={2} style={styles.desc}>
            {course.description}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` as DimensionValue },
              ]}
            />
          </View>
          <View style={styles.footer}>
            <Text style={styles.meta}>
              {course.currentSession}/{course.sessions}회차
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
  card: { gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryTint,
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  desc: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 20 },
  meta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  progressTrack: {
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
  footer: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});
