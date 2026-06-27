import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { FloatingActionButton } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";

type FaithSection = "pray" | "study";

const sections: readonly { key: FaithSection; label: string }[] = [
  { key: "pray", label: "기도" },
  { key: "study", label: "삶공부" },
];

const prayerRooms = [
  {
    day: "월",
    time: "오전",
    members: 45,
    done: "34명",
    rate: "75%",
    status: "참여중",
  },
  {
    day: "목",
    time: "오후",
    members: 10,
    done: "승인 대기",
    rate: "-",
    status: "승인 대기",
  },
] as const;

const prayerRequests = [
  {
    title: "어머니 수술 후 회복",
    category: "치유",
    status: "검토중",
    desc: "관리자 검토 후 공개됩니다",
  },
  {
    title: "가족의 신앙 회복",
    category: "구원",
    status: "공개중",
    desc: "중보기도요원에게 공개 중입니다",
  },
  {
    title: "새로운 자리에서의 평안",
    category: "일반",
    status: "반려",
    desc: "개인정보 표현 수정이 필요합니다",
  },
] as const;

const openCourses = [
  {
    name: "생명의 삶",
    type: "필수",
    weeks: "13주",
    leader: "박귀원",
    period: "6.24 ~ 7.05",
    seats: "18 / 24명",
    summary: "신앙의 근본을 바로 세우는 가장 기본 과정",
  },
  {
    name: "생명언어의 삶",
    type: "선택",
    weeks: "13주",
    leader: "김숙자 이연홍",
    period: "6.24 ~ 7.05",
    seats: "10 / 16명",
    summary: "하나님 자녀의 품격에 맞는 언어습관 훈련",
  },
  {
    name: "기도의 삶",
    type: "선택",
    weeks: "8주",
    leader: "김경숙",
    period: "6.24 ~ 7.05",
    seats: "12 / 20명",
    summary: "중보기도 원칙과 실제 적용을 배우는 과정",
  },
] as const;

const requiredCourses = [
  {
    name: "생명의 삶",
    weeks: "13주",
    leader: "박귀원",
    status: "수료",
    summary: "구원의 확신과 신앙의 근본을 바로 세우는 가장 기본 과정",
    target: "등록교인 누구나",
  },
  {
    name: "새로운 삶",
    weeks: "13주",
    leader: "손현종",
    status: "추천",
    summary: "하나님 나라의 가치관과 매일 QT의 첫걸음을 돕는 과정",
    target: "생명의 삶 수료자",
  },
  {
    name: "경건의 삶",
    weeks: "13주",
    leader: "서상오",
    status: "대기",
    summary: "경건 훈련으로 하나님과 이웃과의 사랑의 관계를 연습",
    target: "새로운 삶 수료자",
  },
] as const;

export default function FaithScreen({
  forcedSection,
}: {
  forcedSection?: FaithSection;
}) {
  const params = useLocalSearchParams<{ section?: string }>();
  const paramSection = Array.isArray(params.section)
    ? params.section[0]
    : params.section;
  const section: FaithSection =
    forcedSection ?? (paramSection === "study" ? "study" : "pray");

  const changeSection = (next: FaithSection) => {
    router.replace(next === "study" ? "/faith?section=study" : "/faith");
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <View style={styles.topText}>
            <Text style={styles.title}>
              {section === "study" ? "삶공부" : "기도"}
            </Text>
            <Text style={styles.subtitle}>
              {section === "study"
                ? "말씀으로 배우고 삶으로 자라가요"
                : "함께 기도하고 응답을 나눠요"}
            </Text>
          </View>
          {section === "study" ? (
            <View style={styles.searchButton}>
              <MaterialIcons
                name="search"
                size={22}
                color={theme.colors.inkSoft}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.segmented}>
          {sections.map((item) => {
            const selected = item.key === section;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={selected ? { selected: true } : {}}
                onPress={() => changeSection(item.key)}
                style={[styles.segment, selected ? styles.segmentOn : null]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected ? styles.segmentTextOn : null,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {section === "study" ? <StudyContent /> : <PrayerContent />}
        </ScrollView>

        {section === "pray" ? (
          <FloatingActionButton
            label="기도제목"
            icon="add"
            style={styles.fab}
            onPress={() => router.push("/modal/prayer-new")}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function PrayerContent() {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 기도방</Text>
        <View style={styles.stack}>
          {prayerRooms.map((room) => (
            <Pressable key={`${room.day}-${room.time}`} style={styles.roomCard}>
              <PrayerDayBadge day={room.day} time={room.time} />
              <View style={styles.cardText}>
                <View style={styles.badgeRow}>
                  <Text style={styles.roomTitle}>
                    {dayName(room.day)} {room.time}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      room.status !== "참여중" ? styles.warnBadge : null,
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>{room.status}</Text>
                  </View>
                </View>
                <Text style={styles.mutedText}>
                  멤버 {room.members}명 · 오늘 완료 {room.done} · 참여율{" "}
                  {room.rate}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={theme.colors.inkMute}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 기도제목</Text>
        <View style={styles.stack}>
          {prayerRequests.map((item) => (
            <Pressable key={item.title} style={styles.requestCard}>
              <View style={styles.cardText}>
                <View style={styles.badgeRow}>
                  <View style={styles.muteBadge}>
                    <Text style={styles.muteBadgeText}>{item.category}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.requestTitle}>{item.title}</Text>
                <Text style={styles.mutedText}>{item.desc}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={theme.colors.inkMute}
              />
            </Pressable>
          ))}
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>내 기도제목 전체보기</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>중보기도 신청</Text>
        <View style={styles.applyCard}>
          <View style={styles.applyIcon}>
            <MaterialIcons
              name="volunteer-activism"
              size={24}
              color={theme.colors.primaryDeep}
            />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.applyTitle}>중보기도 신청</Text>
            <Text style={styles.applyDesc}>
              월-토 오전/오후 기도방은 신청 화면에서 선택해요.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

function StudyContent() {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 학습경로</Text>
        <View style={styles.pathCard}>
          <View style={styles.pathTop}>
            <View>
              <Text style={styles.pathEyebrow}>필수 과정 진행률</Text>
              <Text style={styles.pathTitle}>1 / 5 완료</Text>
            </View>
            <Text style={styles.pathPercent}>20%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.pathGrid}>
            <View style={styles.pathMetric}>
              <Text style={styles.metricLabel}>다음 추천</Text>
              <Text style={styles.metricValue}>생명언어의 삶</Text>
            </View>
            <View style={styles.pathMetric}>
              <Text style={styles.metricLabel}>수강 기준</Text>
              <Text style={styles.metricValue}>생명의 삶 이후 가능</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>지금 신청 가능한 과정</Text>
        <View style={styles.stack}>
          {openCourses.map((course) => (
            <CourseCard key={course.name} course={course} open />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>전체 과정</Text>
        <View style={styles.stack}>
          {requiredCourses.map((course) => (
            <CourseCard key={course.name} course={course} />
          ))}
        </View>
      </View>
    </>
  );
}

function PrayerDayBadge({ day, time }: { day: string; time: string }) {
  return (
    <View style={styles.dayBadge}>
      <Text style={styles.dayText}>{day}</Text>
      <Text style={styles.timeText}>{time}</Text>
    </View>
  );
}

function CourseCard({
  course,
  open,
}: {
  course: {
    name: string;
    type?: string;
    weeks: string;
    leader: string;
    period?: string;
    seats?: string;
    status?: string;
    summary: string;
    target?: string;
  };
  open?: boolean;
}) {
  return (
    <Pressable style={styles.courseCard}>
      <View style={styles.courseOrb} />
      <View style={styles.badgeRow}>
        <View style={open ? styles.warnBadge : styles.muteBadge}>
          <Text style={open ? styles.statusBadgeText : styles.muteBadgeText}>
            {open ? "신청 기간" : (course.status ?? "대기")}
          </Text>
        </View>
        <View style={styles.muteBadge}>
          <Text style={styles.muteBadgeText}>{course.type ?? "필수"}</Text>
        </View>
        <Text style={styles.mutedText}>
          {course.weeks} · {course.leader}
        </Text>
      </View>
      <Text style={styles.courseTitle}>{course.name}</Text>
      <Text style={styles.courseSummary}>{course.summary}</Text>
      {open ? (
        <View style={styles.courseGrid}>
          <View style={styles.courseMetric}>
            <Text style={styles.metricLabel}>신청 기간</Text>
            <Text style={styles.metricValue}>{course.period}</Text>
          </View>
          <View style={styles.courseMetric}>
            <Text style={styles.metricLabel}>정원</Text>
            <Text style={styles.metricValue}>{course.seats}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.targetText}>신청대상: {course.target}</Text>
      )}
    </Pressable>
  );
}

function dayName(day: string) {
  const names: Record<string, string> = {
    월: "월요일",
    화: "화요일",
    수: "수요일",
    목: "목요일",
    금: "금요일",
    토: "토요일",
  };
  return names[day] ?? `${day}요일`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.ink,
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.extrabold,
  },
  subtitle: {
    marginTop: 2,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  searchButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  segmented: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ring,
    padding: 4,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  segmentText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  segmentTextOn: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
  },
  body: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  stack: {
    paddingHorizontal: 18,
    gap: 10,
  },
  roomCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.sageSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayText: {
    color: theme.colors.primaryDeep,
    fontSize: 16,
    lineHeight: 17,
    fontWeight: "800",
  },
  timeText: {
    marginTop: 2,
    color: theme.colors.primaryDeep,
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "800",
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  roomTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
  statusBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  warnBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.amberSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  muteBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  muteBadgeText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  mutedText: {
    marginTop: 5,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.lineHeight.xs,
  },
  requestCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    ...theme.shadow.card,
  },
  requestTitle: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
  outlineButton: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  applyCard: {
    marginHorizontal: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(91,122,176,0.22)",
    backgroundColor: theme.colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
  },
  applyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  applyTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: "800",
  },
  applyDesc: {
    marginTop: 5,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  pathCard: {
    marginHorizontal: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(107,130,96,0.14)",
    backgroundColor: "#F4F8EE",
    padding: 16,
  },
  pathTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  pathEyebrow: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.extrabold,
  },
  pathTitle: {
    marginTop: 5,
    color: theme.colors.ink,
    fontSize: theme.fontSize.xl,
    fontWeight: "900",
  },
  pathPercent: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize["2xl"],
    fontWeight: "900",
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.72)",
    overflow: "hidden",
  },
  progressFill: {
    width: "20%",
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  pathGrid: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  pathMetric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(255,255,255,0.70)",
    padding: 11,
  },
  metricLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  metricValue: {
    marginTop: 3,
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
  },
  courseCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow.card,
  },
  courseOrb: {
    position: "absolute",
    right: -18,
    top: -18,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primarySoft,
  },
  courseTitle: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  courseSummary: {
    marginTop: 5,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  courseGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  courseMetric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface2,
    padding: 10,
  },
  targetText: {
    marginTop: 7,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 86,
  },
});
