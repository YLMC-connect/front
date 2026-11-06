import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { Empty, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { queryKeys } from "../../../src/lib/queryKeys";
import { fetchMyLifeStudyCompletions } from "../../../src/services/lifeStudyService";

export default function LifeStudyHistoryScreen() {
  const completions = useQuery({
    queryKey: queryKeys.lifeStudy.myCompletions(),
    queryFn: fetchMyLifeStudyCompletions,
  });

  const rows = completions.data ?? [];
  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="수강 내역" back />
        <ScrollView contentContainerStyle={styles.body}>
          <HistorySection title="내 수료 기록">
            {completions.isPending ? (
              <Text style={styles.sectionMeta}>
                서버에서 불러오는 중입니다.
              </Text>
            ) : null}
            {completions.isError ? (
              <Text style={styles.sectionMeta}>
                수강 내역을 다시 불러와주세요.
              </Text>
            ) : null}
            {!completions.isPending &&
            !completions.isError &&
            rows.length === 0 ? (
              <Empty
                icon="book-open-page-variant-outline"
                title="수료 기록이 없어요"
                description="삶공부 과정을 수료하면 수료 기록이 여기에 표시돼요."
              />
            ) : null}
            {rows.length > 0 ? (
              <View style={styles.stack}>
                {rows.map((course) => (
                  <View key={course.id} style={styles.card}>
                    <View style={styles.cardText}>
                      <Text style={styles.title}>
                        {course.title || "이름 없음"}
                      </Text>
                      <Text style={styles.meta}>
                        {course.completedAt
                          ? `수료 ${course.completedAt}`
                          : "수료일 없음"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </HistorySection>
        </ScrollView>
      </View>
    </Screen>
  );
}

function HistorySection({
  title,
  children,
  trailing,
}: {
  title: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingBottom: 24,
    gap: 24,
  },
  section: {
    flex: 1,
    gap: 12,
  },
  sectionHeader: {
    paddingHorizontal: theme.layout.screenX,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  sectionMeta: {
    paddingHorizontal: theme.layout.screenX,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
  stack: {
    paddingHorizontal: theme.layout.screenX,
    gap: 12,
  },
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...theme.shadow.card,
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
  meta: {
    marginTop: 4,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
  },
});
