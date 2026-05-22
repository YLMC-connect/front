import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen, Section } from "../../../src/components/layout/Screen";
import { LifeStudyCourseCard } from "../../../src/components/lifeStudy/LifeStudyCourseCard";
import {
  EmptyState,
  ErrorState,
  SegmentedTabs,
  TopBar,
} from "../../../src/components/ui";
import { LIFE_STUDY_STATUS_TABS } from "../../../src/constants/domainOptions";
import { theme } from "../../../src/constants/theme";
import {
  useLifeStudyCourses,
  useLifeStudyHistory,
} from "../../../src/hooks/useLifeStudyCourses";
import type { LifeStudyStatus } from "../../../src/types/lifeStudy";

export default function LifeStudyScreen() {
  const [status, setStatus] = useState<LifeStudyStatus>("all");
  const { data = [], isLoading, isError } = useLifeStudyCourses(status);
  const { data: history = [] } = useLifeStudyHistory();

  return (
    <Screen>
      <TopBar
        testID="screen-life-study"
        title="삶공부"
        subtitle="과정 신청과 수강 현황"
      />
      <SegmentedTabs
        items={LIFE_STUDY_STATUS_TABS}
        active={status}
        onChange={setStatus}
      />

      <Section title="과정 목록">
        <View style={styles.stack}>
          {isError ? (
            <ErrorState />
          ) : isLoading ? (
            <Text style={styles.loading}>삶공부 과정을 불러오는 중입니다.</Text>
          ) : data.length === 0 ? (
            <EmptyState
              title="과정이 없습니다"
              description="새 과정이 열리면 이곳에 표시됩니다."
              icon="menu-book"
            />
          ) : (
            data.map((course) => (
              <LifeStudyCourseCard key={course.id} course={course} />
            ))
          )}
        </View>
      </Section>

      <Section title="내 수강 이력">
        {history.length === 0 ? (
          <EmptyState title="수강 이력이 없습니다" icon="school" />
        ) : (
          <View style={styles.historyList}>
            {history.map((entry) => (
              <View key={entry.id} style={styles.historyRow}>
                <Text style={styles.historyTitle}>{entry.title}</Text>
                <Text style={styles.historyMeta}>
                  {entry.completedSessions}회 수강 ·{" "}
                  {entry.certificateIssued ? "수료증 발급" : "수료증 미발급"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  loading: { color: theme.colors.inkMute },
  historyList: { gap: 8 },
  historyRow: {
    borderRadius: theme.radius.md,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  historyTitle: { color: theme.colors.ink, fontWeight: "900" },
  historyMeta: { color: theme.colors.inkMute, marginTop: 4, fontSize: 13 },
});
