import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Button, Card, DetailBadge, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

const course = {
  name: "생명의 삶",
  leader: "박귀원",
  desc: "구원의 확신이 있는지, 지금 죽는다 해도 천국에 갈 수 있는지, 신앙의 근본을 바로 잡도록 돕는 가장 기본적인 삶공부입니다.",
  target: "등록교인 누구나",
  requirement: "등록교인 누구나 신청할 수 있어요",
  next: "생명언어의 삶 → 새로운 삶",
};

const curriculum = [
  { week: 1, title: "구원의 확신", done: true, current: false },
  { week: 2, title: "하나님과의 관계 정립", done: true, current: false },
  { week: 3, title: "성경을 읽고 이해하기", done: true, current: false },
  { week: 4, title: "신앙의 근본 세우기", done: true, current: true },
  { week: 5, title: "신앙적 의문과 답", done: false, current: false },
  { week: 6, title: "하나님과 이웃의 관계", done: false, current: false },
  { week: 7, title: "교회 공동체와 봉사", done: false, current: false },
  { week: 8, title: "생명의 삶 적용", done: false, current: false },
] as const;

const notices = [
  {
    scope: "4주차 공지",
    read: "읽음 18 / 20명",
    title: "이번 주는 구원의 확신과 신앙의 근본을 함께 다룹니다",
  },
  {
    scope: "전체 공지",
    read: "읽음 16 / 20명",
    title: "생명의 삶 수료 후 이후 필수·선택 과정을 신청할 수 있어요",
  },
] as const;

const schedule = [
  {
    week: "4주차",
    title: "신앙의 근본 세우기",
    date: "6.24 수 19:30",
    attendance: "출석 예정",
  },
  {
    week: "3주차",
    title: "성경을 읽고 이해하기",
    date: "6.17 수 19:30",
    attendance: "출석",
  },
  {
    week: "2주차",
    title: "하나님과의 관계 정립",
    date: "6.10 수 19:30",
    attendance: "지각",
  },
] as const;

const assignments = [
  { week: "4주차", title: "구원의 확신 나눔지", state: "미확인" },
  { week: "3주차", title: "성경 읽기 적용 기록", state: "제출 확인" },
] as const;

export default function LifeStudyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant);
  const enrolled = variant === "enrolled";

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title=""
          back
          onBack={() => router.back()}
          right={
            <Pressable accessibilityRole="button" style={styles.iconButton}>
              <MaterialIcons
                name="ios-share"
                size={21}
                color={theme.colors.inkSoft}
              />
            </Pressable>
          }
        />

        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.hero}>
            <View style={styles.badgeRow}>
              <DetailBadge bordered tone={enrolled ? "primary" : "warn"}>
                {enrolled ? "진행중" : "신청 가능"}
              </DetailBadge>
              <DetailBadge bordered>
                {enrolled ? "4주차" : "개설 예정"}
              </DetailBadge>
              <Text style={styles.caption}>13주 · 매주 수요일 19:30</Text>
            </View>

            <Text style={styles.title}>{course.name}</Text>
            <Text style={styles.desc}>{course.desc}</Text>

            <Card style={styles.infoCard}>
              <Text style={styles.infoTitle}>과정 정보</Text>
              <InfoRow label="팀장" value={course.leader} />
              <InfoRow label="교재" value={`${course.name} 교재`} />
              <InfoRow label="수강 대상" value={course.target} />
              <InfoRow label="신청 조건" value={course.requirement} />
              <InfoRow label="다음 추천" value={course.next} primary />
            </Card>
          </View>

          {enrolled ? <EnrolledContent /> : <ApplyInfo />}

          <Section title="커리큘럼">
            {curriculum.map((item, index) => (
              <CurriculumRow
                key={item.week}
                item={item}
                enrolled={enrolled}
                last={index === curriculum.length - 1}
              />
            ))}
          </Section>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button>{enrolled ? "수강 내역 보기" : "수강 신청"}</Button>
        </View>
      </View>
    </Screen>
  );
}

function EnrolledContent() {
  return (
    <>
      <Section title="공지사항">
        {notices.map((notice) => (
          <Card key={notice.title} style={styles.noticeCard}>
            <View style={styles.badgeRow}>
              <DetailBadge bordered tone="warn">
                {notice.scope}
              </DetailBadge>
              <Text style={styles.caption}>{notice.read}</Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
          </Card>
        ))}
      </Section>

      <View style={styles.divider} />

      <Section title="내 진행 상태">
        <View style={styles.progressCard}>
          <View style={styles.progressHead}>
            <Text style={styles.progressLabel}>현재 주차</Text>
            <Text style={styles.progressValue}>4 / 13</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.metricGrid}>
            <Metric label="출석" value="4 / 4" />
            <Metric label="숙제" value="3 / 4" />
          </View>
        </View>
      </Section>

      <Section title="이번 수업·출결">
        <Card style={styles.infoCard}>
          <View style={styles.nextClass}>
            <Text style={styles.caption}>다음 수업</Text>
            <Text style={styles.nextText}>
              6.24 수 19:30 · 본당 3층 소예배실
            </Text>
          </View>
          {schedule.map((item, index) => (
            <ScheduleRow
              key={`${item.week}-${item.title}`}
              item={item}
              last={index === schedule.length - 1}
            />
          ))}
        </Card>
      </Section>

      <Section
        title="숙제 확인"
        subtitle="관리자가 확인한 제출 여부만 보여줍니다."
      >
        {assignments.map((item) => (
          <Card key={item.title} style={styles.assignmentCard}>
            <View>
              <Text style={styles.caption}>{item.week}</Text>
              <Text style={styles.assignmentTitle}>{item.title}</Text>
            </View>
            <DetailBadge
              bordered
              tone={item.state === "제출 확인" ? "primary" : "warn"}
            >
              {item.state}
            </DetailBadge>
          </Card>
        ))}
      </Section>
    </>
  );
}

function ApplyInfo() {
  const rows = [
    ["신청 기간", "6.24 ~ 7.05"],
    ["개강", "2026.07.08"],
    ["시간", "매주 수요일 19:30"],
    ["장소", "본당 3층 소예배실"],
    ["정원", "18 / 24명"],
  ] as const;

  return (
    <Section title="신청 안내">
      <Card style={styles.infoCard}>
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </Card>
    </Section>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, primary ? styles.primaryText : null]}>
        {value}
      </Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ScheduleRow({
  item,
  last,
}: {
  item: (typeof schedule)[number];
  last: boolean;
}) {
  const tone = item.attendance === "출석" ? "primary" : "warn";
  return (
    <View style={[styles.scheduleRow, !last ? styles.rowBorder : null]}>
      <Text style={styles.weekText}>{item.week}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.caption}>{item.date}</Text>
      </View>
      <DetailBadge
        bordered
        tone={item.attendance === "출석 예정" ? "mute" : tone}
      >
        {item.attendance}
      </DetailBadge>
    </View>
  );
}

function CurriculumRow({
  item,
  enrolled,
  last,
}: {
  item: (typeof curriculum)[number];
  enrolled: boolean;
  last: boolean;
}) {
  const done = enrolled && item.done;
  const current = enrolled && item.current;

  return (
    <View style={[styles.curriculumRow, !last ? styles.rowBorder : null]}>
      <View
        style={[
          styles.weekBadge,
          done ? styles.weekBadgeDone : null,
          current ? styles.weekBadgeCurrent : null,
        ]}
      >
        {done && !current ? (
          <MaterialIcons
            name="check"
            size={14}
            color={theme.colors.primaryDeep}
          />
        ) : (
          <Text
            style={[styles.weekNumber, current ? styles.weekNumberOn : null]}
          >
            {item.week}
          </Text>
        )}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.caption}>WEEK {item.week}</Text>
        <Text
          style={[
            styles.curriculumTitle,
            done && !current ? styles.doneText : null,
          ]}
        >
          {item.title}
        </Text>
      </View>
      {current ? (
        <DetailBadge bordered tone="primary">
          이번주
        </DetailBadge>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingBottom: 100,
  },
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  caption: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  title: {
    marginTop: 10,
    color: theme.colors.ink,
    fontSize: theme.fontSize.display,
    lineHeight: theme.lineHeight.display,
    fontWeight: theme.fontWeight.extrabold,
  },
  desc: {
    marginTop: 12,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.body,
  },
  infoCard: {
    marginTop: 14,
    padding: 14,
    gap: 9,
  },
  infoTitle: {
    marginBottom: 1,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
  },
  infoValue: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
    textAlign: "right",
  },
  primaryText: {
    color: theme.colors.primaryDeep,
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  stack: {
    marginTop: 12,
    gap: 10,
  },
  noticeCard: {
    padding: 14,
    gap: 8,
  },
  noticeTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.md,
    fontWeight: theme.fontWeight.extrabold,
  },
  divider: {
    marginTop: 18,
    height: 8,
    backgroundColor: "rgba(30,41,32,0.05)",
  },
  progressCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.sageSoft,
    padding: 16,
  },
  progressHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  progressValue: {
    color: theme.colors.primaryDeep,
    fontSize: 20,
    fontWeight: theme.fontWeight.extrabold,
  },
  progressTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  progressFill: {
    width: "33%",
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  metric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(255,255,255,0.65)",
    padding: 10,
  },
  metricValue: {
    marginTop: 2,
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
  },
  nextClass: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primarySoft,
    padding: 12,
  },
  nextText: {
    marginTop: 3,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.extrabold,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  weekText: {
    width: 48,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
  },
  assignmentCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  assignmentTitle: {
    marginTop: 3,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.glass,
  },
  curriculumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  weekBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(30,41,32,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekBadgeDone: {
    backgroundColor: theme.colors.primarySoft,
  },
  weekBadgeCurrent: {
    backgroundColor: theme.colors.primary,
  },
  weekNumber: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  weekNumberOn: {
    color: theme.colors.white,
  },
  curriculumTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  doneText: {
    color: theme.colors.inkMute,
  },
});
