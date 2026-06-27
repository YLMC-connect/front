import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen, Section } from "../../../src/components/layout/Screen";
import { Badge, Button, TopBar, VisualThumb } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

const applications = [
  {
    name: "생명의 삶",
    when: "2026.07.08 개강",
    status: "신청 접수",
    next: "관리자 확인 후 수강 여부가 확정됩니다",
    seed: 1,
  },
] as const;

const ongoing = [
  {
    name: "생명의 삶",
    when: "2026.07 ~ 2026.10",
    progress: 31,
    week: "4/13주차",
    status: "수강 중",
    next: "다음 수업 6.24 수 19:30",
    seed: 1,
  },
] as const;

const waiting = [
  {
    name: "생명언어의 삶",
    when: "생명의 삶 수료 후 추천",
    status: "대기",
    next: "다음 추천 과정",
    seed: 2,
  },
] as const;

const completed = [
  {
    name: "말씀통독의 삶",
    when: "2025.03 ~ 2026.02",
    status: "완료",
    seed: 0,
  },
  {
    name: "기도의 삶",
    when: "2025.09 ~ 2025.11",
    status: "완료",
    seed: 2,
  },
  {
    name: "부부의 삶",
    when: "2024.10 ~ 2025.01",
    status: "미수료",
    seed: 3,
  },
] as const;

export default function LifeStudyHistoryScreen() {
  const router = useRouter();

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="수강 내역" back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <Section title="신청중">
            <View style={styles.stack}>
              {applications.map((course) => (
                <CourseCard key={course.name} course={course} action />
              ))}
            </View>
          </Section>

          <Section title="수강 중">
            <View style={styles.stack}>
              {ongoing.map((course) => (
                <ProgressCard key={course.name} course={course} />
              ))}
            </View>
          </Section>

          <Section title="추천 과정">
            <View style={styles.stack}>
              {waiting.map((course) => (
                <CourseCard key={course.name} course={course} />
              ))}
            </View>
          </Section>

          <Section title="지난 과정">
            <View style={styles.flatList}>
              {completed.map((course, index) => (
                <HistoryRow
                  key={course.name}
                  course={course}
                  last={index === completed.length - 1}
                />
              ))}
            </View>
          </Section>

          <Section title="수료 뱃지">
            <View style={styles.badgeCard}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeIconText}>✓</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.title}>수료 과목 2개</Text>
                <Text style={styles.desc}>
                  MY에서 수료 연도와 기수를 확인할 수 있어요.
                </Text>
              </View>
              <Button variant="soft">수료 뱃지 보기</Button>
            </View>
          </Section>
        </ScrollView>
      </View>
    </Screen>
  );
}

function CourseCard({
  course,
  action,
}: {
  course: (typeof applications)[number] | (typeof waiting)[number];
  action?: boolean;
}) {
  return (
    <View style={styles.card}>
      <VisualThumb size={56} seed={course.seed} icon="menu-book" />
      <View style={styles.cardText}>
        <Text style={styles.title}>{course.name}</Text>
        <Text style={styles.meta}>{course.when}</Text>
        <Text style={styles.desc}>{course.next}</Text>
      </View>
      <View style={styles.side}>
        <Badge tone="warn">{course.status}</Badge>
        {action ? <Text style={styles.softAction}>신청 상태 확인</Text> : null}
      </View>
    </View>
  );
}

function ProgressCard({ course }: { course: (typeof ongoing)[number] }) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.cardTop}>
        <VisualThumb size={56} seed={course.seed} icon="menu-book" />
        <View style={styles.cardText}>
          <Text style={styles.title}>{course.name}</Text>
          <Text style={styles.meta}>{course.when}</Text>
        </View>
        <Badge>{course.status}</Badge>
      </View>
      <View style={styles.progressHead}>
        <Text style={styles.week}>{course.week}</Text>
        <Text style={styles.percent}>{course.progress}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${course.progress}%` }]} />
      </View>
      <Text style={styles.desc}>{course.next}</Text>
    </View>
  );
}

function HistoryRow({
  course,
  last,
}: {
  course: (typeof completed)[number];
  last: boolean;
}) {
  const done = course.status === "완료";
  return (
    <View style={[styles.historyRow, last ? styles.historyRowLast : null]}>
      <VisualThumb size={56} seed={course.seed} icon="menu-book" />
      <View style={styles.cardText}>
        <Text style={styles.historyTitle}>{course.name}</Text>
        <Text style={styles.meta}>{course.when}</Text>
      </View>
      <View style={[styles.statusPill, done ? styles.donePill : null]}>
        <Text style={[styles.statusText, done ? styles.doneText : null]}>
          {course.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingBottom: 24,
  },
  stack: {
    paddingHorizontal: 18,
    gap: 12,
  },
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  progressCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow.card,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  historyTitle: {
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.semibold,
  },
  meta: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  desc: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  side: {
    alignItems: "flex-end",
    gap: 8,
  },
  softAction: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  progressHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  week: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  percent: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.line,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  flatList: {
    paddingHorizontal: 18,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  statusPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  donePill: {
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  doneText: {
    color: theme.colors.white,
  },
  badgeCard: {
    marginHorizontal: 18,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeIconText: {
    color: theme.colors.primaryDeep,
    fontSize: 22,
    fontWeight: theme.fontWeight.extrabold,
  },
});
