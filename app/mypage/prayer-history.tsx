import { AppIcon } from "@/components/ui/app-icon";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import {
  Card,
  Empty,
  ErrorState,
  MotionEnter,
  MOTION_STAGGER_LIMIT,
  motionStaggerDelay,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useMyPrayerHistory } from "../../src/hooks/usePrayers";
import type { PrayerHistoryItem } from "../../src/types/prayerApi";

/** yoil 0(일)~6(토). */
const YOIL_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function historyTitle(item: PrayerHistoryItem) {
  if (item.cohortName) return item.cohortName;
  const day = item.yoil == null ? undefined : YOIL_LABELS[item.yoil];
  const slot =
    item.timeSlot === "AM" ? "오전" : item.timeSlot === "PM" ? "오후" : "";
  return day
    ? [`${day}요일`, slot, "기도방"].filter(Boolean).join(" ")
    : "기도방";
}

function historyPeriod(item: PrayerHistoryItem) {
  const end = item.leftAt ?? (item.active ? "현재" : "");
  if (!item.joinedAt && !end) return undefined;
  return `${item.joinedAt ?? ""} ~ ${end}`.trim();
}

function roleLabel(item: PrayerHistoryItem) {
  if (item.memberRole === "LEADER") return "팀장";
  if (item.memberRole === "MEMBER") return "멤버";
  return undefined;
}

export default function PrayerHistoryScreen() {
  const history = useMyPrayerHistory();
  const rows = history.data ?? [];
  const current = rows.filter((item) => item.active);
  const past = rows.filter((item) => !item.active);
  const roomCount = new Set(rows.map((item) => item.cohortId)).size;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="중보기도 활동" back />
        <ScrollView contentContainerStyle={styles.body}>
          {history.isPending ? (
            <Text style={styles.sectionMeta}>불러오는 중이에요.</Text>
          ) : null}
          {history.isError ? (
            <ErrorState
              message="활동 이력을 불러오지 못했어요. 다시 시도해 주세요."
              onRetry={() => void history.refetch()}
            />
          ) : null}
          {!history.isPending && !history.isError && rows.length === 0 ? (
            <Empty
              icon="hands-pray"
              title="중보기도 활동이 없어요"
              description="기도방에 참여하면 활동 기간이 여기에 보여요."
              testID="prayer-history-empty"
            />
          ) : null}
          {rows.length > 0 ? (
            <>
              {/* 서버가 주는 참여 기록으로 셀 수 있는 값만 보여 준다. */}
              <Card style={styles.summary}>
                <Stat value={`${current.length}곳`} label="활동 중" />
                <View style={styles.statDivider} />
                <Stat value={`${roomCount}곳`} label="참여 기도방" />
              </Card>
              <HistoryGroup title="활동 중" items={current} offset={0} />
              <HistoryGroup
                title="지난 기도방"
                items={past}
                offset={current.length}
              />
            </>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HistoryGroup({
  title,
  items,
  offset,
}: {
  title: string;
  items: PrayerHistoryItem[];
  offset: number;
}) {
  if (items.length === 0) return null;
  return (
    <View>
      <Text style={styles.groupTitle}>{title}</Text>
      {items.map((item, index) => {
        const order = offset + index;
        const period = historyPeriod(item);
        const role = roleLabel(item);
        return (
          <MotionEnter
            key={`${item.cohortId}-${item.joinedAt ?? order}`}
            mode="fadeUp"
            enabled={order < MOTION_STAGGER_LIMIT}
            delay={motionStaggerDelay(order)}
          >
            <View
              style={[
                styles.row,
                index === items.length - 1 ? styles.rowLast : null,
              ]}
            >
              <View style={styles.rowIcon}>
                <AppIcon
                  name="hands-pray"
                  size={18}
                  color={theme.colors.primaryStrong}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{historyTitle(item)}</Text>
                {period ? <Text style={styles.rowMeta}>{period}</Text> : null}
                {item.leaveReason ? (
                  <Text style={styles.rowMeta}>
                    {`종료 사유: ${item.leaveReason}`}
                  </Text>
                ) : null}
              </View>
              {role ? <Text style={styles.rowTrailing}>{role}</Text> : null}
            </View>
          </MotionEnter>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: theme.spacing["2"],
    paddingBottom: theme.spacing["8"],
  },
  sectionMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  summary: {
    flexDirection: "row",
    padding: 0,
    marginBottom: theme.spacing["1"],
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: theme.spacing["4"],
  },
  statDivider: {
    width: 1,
    marginVertical: theme.spacing["4"],
    backgroundColor: theme.colors.border,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.typography.heading.fontSize,
    lineHeight: theme.typography.heading.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  groupTitle: {
    paddingTop: theme.spacing["4"],
    paddingBottom: theme.spacing["1"],
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing["3"],
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.infoSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  rowMeta: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  rowTrailing: {
    paddingTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
