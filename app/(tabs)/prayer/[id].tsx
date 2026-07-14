import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  Card,
  DetailBadge,
  TopBar,
  UnderlineTabs,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

type TabKey = "pray" | "answers" | "status";

const tabs: readonly { key: TabKey; label: string }[] = [
  { key: "pray", label: "기도" },
  { key: "answers", label: "응답" },
  { key: "status", label: "현황" },
];

const urgent = [
  {
    category: "치유",
    title: "수술 후 회복을 위해",
    author: "박지훈",
    text: "어머니 수술 후 회복 과정이 안정되도록 함께 기도해주세요.",
    when: "오늘",
    urgent: true,
  },
] as const;

const progress = [
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
] as const;

const answers = [
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
] as const;

const completedPeople = ["김은혜", "박정아", "이수진", "김지영"];
const pendingPeople = ["한수연", "오지연"];

export default function PrayerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "pray";
  const activeTab: TabKey =
    variant === "status" ||
    variant === "status-empty" ||
    variant === "leader-status"
      ? "status"
      : variant === "answers" || variant === "answers-empty"
        ? "answers"
        : "pray";
  const isCompleted = variant === "pray-completed";
  const isPrayEmpty = variant === "pray-empty";
  const isStatusEmpty = variant === "status-empty";
  const isAnswersEmpty = variant === "answers-empty";

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="월요일 오전 기도방" back onBack={() => router.back()} />
        <View style={styles.badges}>
          <DetailBadge tone="primary">참여중</DetailBadge>
          <DetailBadge>멤버 45명</DetailBadge>
          <DetailBadge tone="warn">오늘 긴급 1건</DetailBadge>
          {isCompleted ? (
            <DetailBadge tone="primary">오늘 완료</DetailBadge>
          ) : null}
        </View>

        <UnderlineTabs items={tabs} active={activeTab} />

        <ScrollView
          contentContainerStyle={[
            styles.body,
            activeTab === "pray" ? styles.bodyWithAction : null,
          ]}
        >
          {activeTab === "status" ? (
            <StatusPanel empty={isStatusEmpty} />
          ) : activeTab === "answers" ? (
            <AnswersPanel empty={isAnswersEmpty} />
          ) : (
            <PrayerPanel empty={isPrayEmpty} />
          )}
        </ScrollView>

        {activeTab === "pray" && !isPrayEmpty ? (
          <View style={styles.bottomAction}>
            <Pressable
              accessibilityRole="button"
              style={[
                styles.prayButton,
                isCompleted ? styles.prayButtonDone : null,
              ]}
            >
              <AppIcon
                name="check"
                size={18}
                color={
                  isCompleted ? theme.colors.primaryDeep : theme.colors.white
                }
              />
              <Text
                style={[
                  styles.prayButtonText,
                  isCompleted ? styles.prayButtonTextDone : null,
                ]}
              >
                {isCompleted ? "오늘 기도 완료됨" : "오늘 기도 완료"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function PrayerPanel({ empty }: { empty: boolean }) {
  if (empty) {
    return (
      <EmptyMessage
        icon="volunteer-activism"
        title="기도할 제목이 없어요"
        desc="새 기도제목이 승인되면 이곳에 표시됩니다."
      />
    );
  }

  return (
    <View style={styles.stack}>
      <Section title="긴급 기도제목">
        {urgent.map((item) => (
          <PrayerItem key={item.title} item={item} />
        ))}
      </Section>
      <Section title="최근 기도응답">
        {answers.slice(0, 1).map((item) => (
          <PrayerItem key={item.title} item={item} answer />
        ))}
      </Section>
      <Section title="진행 중 기도제목">
        {progress.map((item) => (
          <PrayerItem key={item.title} item={item} />
        ))}
      </Section>
    </View>
  );
}

function AnswersPanel({ empty }: { empty: boolean }) {
  if (empty) {
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
      {answers.map((item) => (
        <PrayerItem key={item.title} item={item} answer />
      ))}
    </View>
  );
}

function StatusPanel({ empty }: { empty: boolean }) {
  const completed = empty ? "0명" : "34명";
  const pending = empty ? "0명" : "11명";
  const rate = empty ? "-" : "75%";

  return (
    <View style={styles.stack}>
      <Card style={styles.statusCard}>
        <View style={styles.statusHead}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>월</Text>
            <Text style={styles.timeText}>오전</Text>
          </View>
          <Text style={styles.statusTitle}>기도 현황</Text>
        </View>
        <View style={styles.stats}>
          <Stat label="완료" value={completed} active />
          <Stat label="미완료" value={pending} />
          <Stat label="참여율" value={rate} />
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: empty ? "0%" : "75%" }]}
          />
        </View>
      </Card>

      <Card style={styles.statusCard}>
        <View style={styles.statusListHead}>
          <Text style={styles.statusListTitle}>기도 완료한 사람</Text>
          <Text style={styles.smallMuted}>
            {empty ? 0 : completedPeople.length}명
          </Text>
        </View>
        {empty ? (
          <EmptyMessage
            compact
            icon="volunteer-activism"
            title="기도 완료 현황이 없어요"
            desc="기도방 참여자가 생기면 완료 여부가 이곳에 표시됩니다."
          />
        ) : (
          completedPeople.map((name) => (
            <PersonRow key={name} name={name} done />
          ))
        )}
        {!empty ? (
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
  item: {
    category: string;
    title: string;
    author: string;
    text: string;
    answer?: string;
    when: string;
    urgent?: boolean;
  };
  answer?: boolean;
}) {
  return (
    <Card style={styles.prayerCard}>
      <View style={styles.prayerTop}>
        <View
          style={[styles.topicChip, item.urgent ? styles.topicChipWarn : null]}
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
        <Text style={styles.smallMuted}>{item.when}</Text>
      </View>
      <Text style={styles.prayerTitle}>{item.title}</Text>
      <Text style={styles.prayerText}>{item.text}</Text>
      {answer && item.answer ? (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>응답</Text>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      ) : null}
      <View style={styles.prayerFooter}>
        <Text style={styles.smallMuted}>{item.author}</Text>
        <View style={styles.pillAction}>
          <AppIcon
            name={answer ? "check" : "favorite"}
            size={14}
            color={theme.colors.primaryDeep}
          />
          <Text style={styles.pillActionText}>
            {answer ? "응답완료" : "함께 기도"}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function PersonRow({ name, done = false }: { name: string; done?: boolean }) {
  return (
    <View style={styles.personRow}>
      <View style={[styles.personDot, done ? styles.personDotDone : null]}>
        <AppIcon
          name={done ? "check" : "schedule"}
          size={13}
          color={done ? theme.colors.white : theme.colors.inkMute}
        />
      </View>
      <Text style={styles.personName}>{name}</Text>
      <Text style={styles.smallMuted}>{done ? "완료" : "대기"}</Text>
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
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 12,
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
    gap: 8,
  },
  prayerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    justifyContent: "space-between",
    gap: 8,
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
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillActionText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  bottomAction: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 24,
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
    borderColor: "rgba(91,122,176,0.22)",
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
  dayBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
  },
  timeText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
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
    paddingVertical: 10,
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
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  personDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  personDotDone: {
    backgroundColor: theme.colors.primary,
  },
  personName: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
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
