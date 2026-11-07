import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/layout/Screen";
import {
  Badge,
  Card,
  Empty,
  ErrorState,
  MotionEnter,
  motionStaggerDelay,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useMyPrayerHistory } from "../../src/hooks/usePrayers";
import type { PrayerHistoryItem } from "../../src/types/prayerApi";

/** 목록 첫 진입 때 60ms 간격으로 떠오르는 카드 수(디자인 시스템 motion: 첫 8개). */
const LIST_STAGGER_LIMIT = 8;

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

export default function PrayerHistoryScreen() {
  const history = useMyPrayerHistory();
  const rows = history.data ?? [];

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="중보기도 활동 이력" back />
        <ScrollView contentContainerStyle={styles.body}>
          {history.isPending ? (
            <Text style={styles.sectionMeta}>서버에서 불러오는 중입니다.</Text>
          ) : null}
          {history.isError ? (
            <ErrorState
              message="활동 이력을 불러오지 못했어요. 다시 시도해주세요."
              onRetry={() => void history.refetch()}
            />
          ) : null}
          {!history.isPending && !history.isError && rows.length === 0 ? (
            <Empty
              icon="hands-pray"
              title="중보기도 활동 이력이 없어요"
              description="기도방에 참여하면 활동 기간이 여기에 표시돼요."
              testID="prayer-history-empty"
            />
          ) : null}
          {rows.length > 0 ? (
            <View style={styles.stack}>
              {rows.map((item, index) => {
                const period = historyPeriod(item);
                return (
                  <MotionEnter
                    key={`${item.cohortId}-${item.joinedAt ?? index}`}
                    mode="fadeUp"
                    enabled={index < LIST_STAGGER_LIMIT}
                    delay={motionStaggerDelay(index)}
                  >
                    <Card style={styles.card}>
                      <View style={styles.badgeRow}>
                        <Badge tone={item.active ? "info" : "neutral"}>
                          {item.active ? "활동중" : "종료"}
                        </Badge>
                        {item.memberRole ? (
                          <Badge tone="neutral">
                            {item.memberRole === "LEADER" ? "팀장" : "멤버"}
                          </Badge>
                        ) : null}
                        {item.cohortYear ? (
                          <Badge tone="neutral">{`${item.cohortYear}년`}</Badge>
                        ) : null}
                      </View>
                      <Text style={styles.title}>{historyTitle(item)}</Text>
                      {period ? (
                        <Text style={styles.meta}>{period}</Text>
                      ) : null}
                      {item.leaveReason ? (
                        <Text style={styles.meta}>
                          {`종료 사유: ${item.leaveReason}`}
                        </Text>
                      ) : null}
                    </Card>
                  </MotionEnter>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingBottom: 24,
    gap: 12,
  },
  sectionMeta: {
    paddingHorizontal: theme.layout.screenX,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  stack: {
    paddingHorizontal: theme.layout.screenX,
    gap: 16,
  },
  card: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  title: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
