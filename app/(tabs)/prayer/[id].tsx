import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  AnimatedProgressFill,
  Avatar,
  Card,
  DetailBadge,
  MotionPop,
  MotionPressable,
  TopBar,
  UnderlineTabs,
} from "../../../src/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";
import {
  fetchPrayerCohortStatus,
  fetchPrayerTopicBoard,
  resolvePrayerAdapterMode,
} from "../../../src/services/prayerService";

type TabKey = "pray" | "answers" | "status";

const tabs: readonly { key: TabKey; label: string }[] = [
  { key: "pray", label: "기도" },
  { key: "answers", label: "응답" },
  { key: "status", label: "현황" },
];

interface PrayerItemData {
  category: string;
  title: string;
  author: string;
  text: string;
  answer?: string;
  when: string;
  urgent?: boolean;
}

const defaultUrgent: readonly PrayerItemData[] = [
  {
    category: "치유",
    title: "수술 후 회복을 위해",
    author: "박지훈",
    text: "어머니 수술 후 회복 과정이 안정되도록 함께 기도해주세요.",
    when: "오늘",
    urgent: true,
  },
];

const defaultProgress: readonly PrayerItemData[] = [
  {
    category: "구원",
    title: "가족의 신앙 회복",
    author: "김은혜",
    text: "오랫동안 교회를 떠난 가족이 다시 예배 자리로 돌아오도록 기도합니다.",
    when: "어제",
  },
  {
    category: "자녀",
    title: "학교 적응과 관계",
    author: "한수연",
    text: "새 학기 친구 관계와 학업을 지혜롭게 감당하도록 기도해주세요.",
    when: "2일 전",
  },
];

const defaultAnswers: readonly PrayerItemData[] = [
  {
    category: "일반",
    title: "새로운 자리 적응",
    author: "이준호",
    text: "새로운 자리에서 선한 관계를 세우도록 함께 기도했던 제목입니다.",
    answer: "첫 주를 잘 마쳤고 팀 안에서 좋은 도움을 받고 있습니다.",
    when: "오늘",
  },
  {
    category: "일반",
    title: "가족 대화 회복",
    author: "정하은",
    text: "대화가 끊겼던 가족과의 회복을 위해 함께 기도했던 제목입니다.",
    answer: "서로 이야기를 시작했고 함께 예배드리기로 했습니다.",
    when: "3일 전",
  },
];

const defaultCompletedPeople = ["김은혜", "박정아", "이수진", "김지영"];
const defaultPendingPeople = ["한수연", "오지연"];

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDayAndPeriod(id?: string, name?: string): { day: string; period: string } {
  const text = (name ?? id ?? "").toLowerCase();
  let day = "월";
  if (text.includes("화") || text.includes("tue")) day = "화";
  else if (text.includes("수") || text.includes("wed")) day = "수";
  else if (text.includes("목") || text.includes("thu")) day = "목";
  else if (text.includes("금") || text.includes("fri")) day = "금";
  else if (text.includes("토") || text.includes("sat")) day = "토";
  else if (text.includes("일") || text.includes("sun")) day = "일";

  let period = "오전";
  if (text.includes("오후") || text.includes("pm") || text.includes("저녁")) {
    period = "오후";
  }
  return { day, period };
}

export default function PrayerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    designVariant?: string;
  }>();
  const id = routeId(params.id);
  const variant = readDesignVariant(params.designVariant) ?? "pray";
  const [completedOverride, setCompletedOverride] = useState<boolean | null>(null);

  const initialTab: TabKey =
    variant === "status" ||
    variant === "status-empty" ||
    variant === "leader-status"
      ? "status"
      : variant === "answers" || variant === "answers-empty"
        ? "answers"
        : "pray";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const isHttp = resolvePrayerAdapterMode() === "http" && !params.designVariant;
  const statusQuery = useQuery({
    queryKey: ["prayer", "cohort-status", id ?? "1"],
    queryFn: () => fetchPrayerCohortStatus(id ?? "1"),
    enabled: isHttp && Boolean(id),
  });
  const boardQuery = useQuery({
    queryKey: ["prayer", "topic-board"],
    queryFn: fetchPrayerTopicBoard,
    enabled: isHttp,
  });

  const room = statusQuery.data;
  const board = boardQuery.data;

  const roomTitle = room?.cohortName || "월요일 오전 기도방";
  const { day, period } = parseDayAndPeriod(id, roomTitle);

  const isPrayEmpty = variant === "pray-empty";
  const isStatusEmpty = variant === "status-empty";
  const isAnswersEmpty = variant === "answers-empty";

  const isCompleted =
    completedOverride ?? (room ? room.myCompleted : variant === "pray-completed");

  const totalMembers = room?.totalMembers ?? 45;
  const completedCount =
    room?.completedCount ?? (isCompleted ? 35 : 34);
  const pendingCount =
    room?.notCompletedCount ?? (isCompleted ? 10 : 11);
  const completionRate =
    room?.completionRate ?? (isCompleted ? 78 : 75);

  const urgentItems: readonly PrayerItemData[] =
    board?.emergency && board.emergency.length > 0
      ? board.emergency.map((t) => ({
          category: t.categoryName || "긴급",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          when: "오늘",
          urgent: true,
        }))
      : defaultUrgent;

  const ongoingItems: readonly PrayerItemData[] =
    board?.ongoing && board.ongoing.length > 0
      ? board.ongoing.map((t) => ({
          category: t.categoryName || "일반",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          when: "진행 중",
        }))
      : defaultProgress;

  const answerItems: readonly PrayerItemData[] =
    board?.recentAnswers && board.recentAnswers.length > 0
      ? board.recentAnswers.map((t) => ({
          category: t.categoryName || "일반",
          title: t.title,
          author: t.writerName || "성도",
          text: t.content,
          answer: t.answerContent ?? "기도에 응답해 주셨습니다.",
          when: "최근",
        }))
      : defaultAnswers;

  const completedPeople =
    room?.completed && room.completed.length > 0
      ? room.completed.map((m) => m.userName)
      : defaultCompletedPeople;

  const pendingPeople =
    room?.notCompleted && room.notCompleted.length > 0
      ? room.notCompleted.map((m) => m.userName)
      : defaultPendingPeople;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title={roomTitle} back onBack={() => router.back()} />

        <View style={styles.heroSection}>
          <Card style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.timeText}>{period}</Text>
              </View>
              <View style={styles.heroMetaCol}>
                <View style={styles.badges}>
                  <DetailBadge tone="primary">참여중</DetailBadge>
                  <DetailBadge>{`멤버 ${totalMembers}명`}</DetailBadge>
                  {urgentItems.length > 0 ? (
                    <DetailBadge tone="warn">{`오늘 긴급 ${urgentItems.length}건`}</DetailBadge>
                  ) : null}
                  {isCompleted ? (
                    <DetailBadge tone="primary">오늘 완료</DetailBadge>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.heroProgressSection}>
              <View style={styles.heroProgressHeader}>
                <Text style={styles.heroProgressLabel}>
                  오늘 완료 {completedCount}명 / 전체 {totalMembers}명
                </Text>
                <Text style={styles.heroProgressRate}>{completionRate}%</Text>
              </View>
              <View style={styles.heroProgressBar}>
                <AnimatedProgressFill
                  percent={completionRate}
                  style={styles.heroProgressFill}
                />
              </View>
            </View>
          </Card>
        </View>

        <UnderlineTabs items={tabs} active={activeTab} onChange={setActiveTab} />

        <ScrollView
          contentContainerStyle={[
            styles.body,
            activeTab === "pray" ? styles.bodyWithAction : null,
          ]}
        >
          {activeTab === "status" ? (
            <StatusPanel
              empty={isStatusEmpty}
              completedCount={completedCount}
              pendingCount={pendingCount}
              completionRate={completionRate}
              completedPeople={completedPeople}
              pendingPeople={pendingPeople}
              day={day}
              period={period}
            />
          ) : activeTab === "answers" ? (
            <AnswersPanel empty={isAnswersEmpty} items={answerItems} />
          ) : (
            <PrayerPanel
              empty={isPrayEmpty}
              urgent={urgentItems}
              progress={ongoingItems}
              answers={answerItems}
            />
          )}
        </ScrollView>

        {activeTab === "pray" && !isPrayEmpty ? (
          <View pointerEvents="box-none" style={styles.bottomAction}>
            <LinearGradient
              colors={[
                "rgba(246,247,249,0)",
                "rgba(246,247,249,0.78)",
                "rgba(246,247,249,0.96)",
              ]}
              locations={[0, 0.38, 1]}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              testID="prayer-detail-bottom-bar"
            />
            <MotionPressable
              accessibilityRole="button"
              onPress={() =>
                setCompletedOverride(
                  (prev) => !(prev ?? isCompleted),
                )
              }
              pressedScale={0.96}
              style={[
                styles.prayButton,
                isCompleted ? styles.prayButtonDone : null,
              ]}
            >
              <MotionPop key={isCompleted ? "done" : "todo"}>
                <AppIcon
                  name="check"
                  size={18}
                  color={
                    isCompleted ? theme.colors.primaryDeep : theme.colors.white
                  }
                />
              </MotionPop>
              <Text
                style={[
                  styles.prayButtonText,
                  isCompleted ? styles.prayButtonTextDone : null,
                ]}
              >
                {isCompleted ? "오늘 기도 완료됨" : "오늘 기도 완료"}
              </Text>
            </MotionPressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function PrayerPanel({
  empty,
  urgent,
  progress,
  answers,
}: {
  empty: boolean;
  urgent: readonly PrayerItemData[];
  progress: readonly PrayerItemData[];
  answers: readonly PrayerItemData[];
}) {
  if (empty) {
    return (
      <EmptyMessage
        icon="hands-pray"
        title="기도할 제목이 없어요"
        desc="새 기도제목이 승인되면 이곳에 표시됩니다."
      />
    );
  }

  return (
    <View style={styles.stack}>
      {urgent.length > 0 ? (
        <Section title="긴급 기도제목">
          {urgent.map((item) => (
            <PrayerItem key={item.title} item={item} />
          ))}
        </Section>
      ) : null}
      {answers.length > 0 ? (
        <Section title="최근 기도응답">
          {answers.slice(0, 1).map((item) => (
            <PrayerItem key={item.title} item={item} answer />
          ))}
        </Section>
      ) : null}
      {progress.length > 0 ? (
        <Section title="진행 중 기도제목">
          {progress.map((item) => (
            <PrayerItem key={item.title} item={item} />
          ))}
        </Section>
      ) : null}
    </View>
  );
}

function AnswersPanel({
  empty,
  items,
}: {
  empty: boolean;
  items: readonly PrayerItemData[];
}) {
  if (empty || items.length === 0) {
    return (
      <EmptyMessage
        icon="check-circle"
        title="응답완료된 기도제목이 없어요"
        desc="응답완료 처리된 기도제목은 최신순으로 이곳에 표시됩니다."
      />
    );
  }

  return (
    <View style={styles.stack}>
      {items.map((item) => (
        <PrayerItem key={item.title} item={item} answer />
      ))}
    </View>
  );
}

function StatusPanel({
  empty,
  completedCount,
  pendingCount,
  completionRate,
  completedPeople,
  pendingPeople,
  day,
  period,
}: {
  empty: boolean;
  completedCount: number;
  pendingCount: number;
  completionRate: number;
  completedPeople: readonly string[];
  pendingPeople: readonly string[];
  day: string;
  period: string;
}) {
  const completedText = empty ? "0명" : `${completedCount}명`;
  const pendingText = empty ? "0명" : `${pendingCount}명`;
  const rateText = empty ? "-" : `${completionRate}%`;

  return (
    <View style={styles.stack}>
      <Card style={styles.statusCard}>
        <View style={styles.statusHead}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.timeText}>{period}</Text>
          </View>
          <View style={styles.statusHeadInfo}>
            <Text style={styles.statusTitle}>기도 현황</Text>
            <Text style={styles.smallMuted}>오늘의 기도 참여 현황이에요</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <Stat label="완료" value={completedText} active />
          <Stat label="미완료" value={pendingText} />
          <Stat label="참여율" value={rateText} />
        </View>
        <View style={styles.progressBar}>
          <AnimatedProgressFill
            percent={empty ? 0 : completionRate}
            style={styles.progressFill}
          />
        </View>
      </Card>

      <Card style={styles.statusCard}>
        <View style={styles.statusListHead}>
          <Text style={styles.statusListTitle}>기도 완료한 성도</Text>
          <Text style={styles.smallMuted}>
            {empty ? 0 : completedPeople.length}명
          </Text>
        </View>
        {empty ? (
          <EmptyMessage
            compact
            icon="hands-pray"
            title="기도 완료 현황이 없어요"
            desc="기도방 참여자가 생기면 완료 여부가 이곳에 표시됩니다."
          />
        ) : (
          completedPeople.map((name) => (
            <PersonRow key={name} name={name} done />
          ))
        )}
        {!empty && pendingPeople.length > 0 ? (
          <>
            <View style={styles.pendingHead}>
              <Text style={styles.statusListTitle}>아직 완료 전</Text>
              <Text style={styles.smallMuted}>{pendingPeople.length}명</Text>
            </View>
            {pendingPeople.map((name) => (
              <PersonRow key={name} name={name} />
            ))}
          </>
        ) : null}
      </Card>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.stackSmall}>{children}</View>
    </View>
  );
}

function PrayerItem({
  item,
  answer = false,
}: {
  item: PrayerItemData;
  answer?: boolean;
}) {
  const [prayed, setPrayed] = useState(false);

  return (
    <Card style={styles.prayerCard}>
      <View style={styles.prayerTop}>
        <View style={styles.authorRow}>
          <Avatar name={item.author} size={22} />
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.smallMuted}>{item.when}</Text>
        </View>

        <View style={styles.chipRow}>
          {item.urgent ? (
            <View style={styles.urgentBadge}>
              <AppIcon name="warning-amber" size={10} color="#DC2626" />
              <Text style={styles.urgentBadgeText}>긴급</Text>
            </View>
          ) : null}
          <View
            style={[
              styles.topicChip,
              item.urgent ? styles.topicChipWarn : null,
            ]}
          >
            <Text
              style={[
                styles.topicChipText,
                item.urgent ? styles.topicChipTextWarn : null,
              ]}
            >
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.prayerTitle}>{item.title}</Text>
      <Text style={styles.prayerText}>{item.text}</Text>

      {answer && item.answer ? (
        <View style={styles.answerBox}>
          <View style={styles.answerHeader}>
            <AppIcon
              name="check-circle"
              size={14}
              color={theme.colors.primaryDeep}
            />
            <Text style={styles.answerLabel}>응답</Text>
          </View>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      ) : null}

      <View style={styles.prayerFooter}>
        <MotionPressable
          accessibilityRole="button"
          onPress={() => setPrayed((prev) => !prev)}
          pressedScale={0.94}
          style={[
            styles.pillAction,
            prayed ? styles.pillActionActive : null,
          ]}
        >
          <AppIcon
            name={answer ? "check" : "favorite"}
            size={14}
            color={
              answer || prayed
                ? theme.colors.primaryDeep
                : theme.colors.inkMute
            }
          />
          <Text
            style={[
              styles.pillActionText,
              prayed ? styles.pillActionTextActive : null,
            ]}
          >
            {answer ? "응답완료" : prayed ? "기도 중" : "함께 기도"}
          </Text>
        </MotionPressable>
      </View>
    </Card>
  );
}

function PersonRow({ name, done = false }: { name: string; done?: boolean }) {
  return (
    <View style={styles.personRow}>
      <Avatar name={name} size={30} />
      <Text style={styles.personName}>{name}</Text>
      <View
        style={[
          styles.personBadge,
          done ? styles.personBadgeDone : styles.personBadgePending,
        ]}
      >
        <AppIcon
          name={done ? "check" : "schedule"}
          size={11}
          color={done ? theme.colors.primaryDeep : theme.colors.inkMute}
        />
        <Text
          style={[
            styles.personBadgeText,
            done ? styles.personBadgeTextDone : styles.personBadgeTextPending,
          ]}
        >
          {done ? "완료" : "대기"}
        </Text>
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.stat, active ? styles.statActive : null]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function EmptyMessage({
  icon,
  title,
  desc,
  compact = false,
}: {
  icon: AppIconName;
  title: string;
  desc: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.empty, compact ? styles.emptyCompact : null]}>
      <AppIcon
        name={icon}
        size={compact ? 26 : 36}
        color={theme.colors.inkHint}
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroSection: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  heroCard: {
    padding: 14,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroMetaCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heroProgressSection: {
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  heroProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroProgressLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  heroProgressRate: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.extrabold,
  },
  heroProgressBar: {
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  bodyWithAction: {
    paddingBottom: 96,
  },
  stack: {
    gap: 12,
  },
  stackSmall: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  prayerCard: {
    padding: 15,
    gap: 10,
  },
  prayerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  dot: {
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEE2E2",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  urgentBadgeText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: theme.fontWeight.extrabold,
  },
  topicChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  topicChipWarn: {
    backgroundColor: theme.colors.amberSoft,
  },
  topicChipText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  topicChipTextWarn: {
    color: "#9B6B20",
  },
  prayerTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  prayerText: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 20,
  },
  answerBox: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  answerLabel: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  answerText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  prayerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  smallMuted: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  pillAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillActionActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  pillActionText: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  pillActionTextActive: {
    color: theme.colors.primaryDeep,
  },
  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: 24,
  },
  prayButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    ...theme.shadow.primary,
  },
  prayButtonDone: {
    borderWidth: 1,
    borderColor: "rgba(62,104,200,0.22)",
    backgroundColor: theme.colors.primarySoft,
    shadowOpacity: 0,
    elevation: 0,
  },
  prayButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  prayButtonTextDone: {
    color: theme.colors.primaryDeep,
  },
  statusCard: {
    padding: 15,
    gap: 12,
  },
  statusHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusHeadInfo: {
    flex: 1,
    gap: 2,
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayText: {
    color: theme.colors.primaryDeep,
    fontSize: 15,
    lineHeight: 16,
    fontWeight: "800",
  },
  timeText: {
    marginTop: 2,
    color: theme.colors.primaryDeep,
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "800",
  },
  statusTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  stats: {
    flexDirection: "row",
    gap: 8,
  },
  stat: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  statLabel: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  statValue: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(30,41,32,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  statusListHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusListTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: "900",
  },
  pendingHead: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  personName: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  personBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  personBadgeDone: {
    backgroundColor: theme.colors.primarySoft,
  },
  personBadgePending: {
    backgroundColor: theme.colors.surface2,
  },
  personBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  personBadgeTextDone: {
    color: theme.colors.primaryDeep,
  },
  personBadgeTextPending: {
    color: theme.colors.inkMute,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 42,
    gap: 8,
  },
  emptyCompact: {
    backgroundColor: "transparent",
    paddingVertical: 28,
  },
  emptyTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  emptyDesc: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
    textAlign: "center",
  },
});
