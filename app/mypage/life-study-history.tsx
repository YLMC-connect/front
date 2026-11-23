import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../src/components/layout/Screen";
import {
  cohortLabel,
  joinParts,
  textOf,
} from "../../src/components/life-study/lifeStudyFormat";
import {
  Button,
  Empty,
  ErrorState,
  ListSkeleton,
  MotionEnter,
  MOTION_STAGGER_LIMIT,
  motionStaggerDelay,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useMyLifeStudies } from "../../src/hooks/useLifeStudyCourses";

type CourseRow = {
  key: string;
  name: string;
  meta: string;
};

export default function LifeStudyHistoryScreen() {
  const history = useMyLifeStudies();

  const ongoing: CourseRow[] = (history.data?.ongoing ?? []).map(
    (item, index) => ({
      key: `ongoing-${textOf(item.cohortId) ?? index}`,
      name: textOf(item.name) ?? "이름 없는 과정",
      meta: joinParts([cohortLabel(item.cohortNumber), textOf(item.period)]),
    }),
  );
  const completed: CourseRow[] = (history.data?.completed ?? []).map(
    (item, index) => {
      const completedAt = textOf(item.completedAt);
      return {
        key: `completed-${textOf(item.cohortId) ?? index}`,
        name: textOf(item.name) ?? "이름 없는 과정",
        meta: joinParts([
          cohortLabel(item.cohortNumber),
          completedAt ? `${completedAt} 수료` : undefined,
        ]),
      };
    },
  );
  const isEmpty =
    history.isSuccess && ongoing.length === 0 && completed.length === 0;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title="수강 내역" back />
        <ScrollView contentContainerStyle={styles.body}>
          {history.isPending ? (
            <ListSkeleton rows={3} thumbnail={false} />
          ) : null}
          {history.isError ? (
            <ErrorState
              message="수강 내역을 불러오지 못했어요. 다시 시도해 주세요."
              onRetry={() => void history.refetch()}
            />
          ) : null}
          {isEmpty ? (
            <View style={styles.empty} testID="life-study-history-empty">
              <Empty
                icon="book-open-page-variant-outline"
                title="수료한 과정이 없어요"
                description="지금 신청 가능한 과정을 둘러보세요"
                style={styles.emptyState}
              />
              <Button
                variant="secondary"
                onPress={() => router.push("/life-study")}
                testID="life-study-history-browse"
              >
                과정 보기
              </Button>
            </View>
          ) : null}
          {history.isSuccess && !isEmpty ? (
            <>
              <CourseGroup
                title="수강 중"
                rows={ongoing}
                status="ongoing"
                emptyText="지금 수강 중인 과정이 없어요."
                offset={0}
              />
              <CourseGroup
                title="수료"
                rows={completed}
                status="completed"
                emptyText="아직 수료한 과정이 없어요."
                offset={ongoing.length}
                style={styles.groupGap}
              />
            </>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

function CourseGroup({
  title,
  rows,
  status,
  emptyText,
  offset,
  style,
}: {
  title: string;
  rows: CourseRow[];
  status: "ongoing" | "completed";
  emptyText: string;
  offset: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.groupCount}>{rows.length}</Text>
      </View>
      {rows.length === 0 ? (
        <Text style={styles.groupEmpty}>{emptyText}</Text>
      ) : (
        rows.map((row, index) => {
          const order = offset + index;
          return (
            <MotionEnter
              key={row.key}
              mode="fadeUp"
              enabled={order < MOTION_STAGGER_LIMIT}
              delay={motionStaggerDelay(order)}
            >
              <View
                style={[
                  styles.row,
                  index === rows.length - 1 ? styles.rowLast : null,
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{row.name}</Text>
                  {row.meta ? (
                    <Text style={styles.rowMeta}>{row.meta}</Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.status,
                    status === "ongoing"
                      ? styles.statusOngoing
                      : styles.statusDone,
                  ]}
                >
                  {status === "ongoing" ? "수강중" : "수료"}
                </Text>
              </View>
            </MotionEnter>
          );
        })
      )}
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: theme.spacing[8],
  },
  emptyState: {
    flex: 0,
    paddingBottom: theme.spacing[4],
  },
  groupGap: {
    marginTop: theme.spacing["5"],
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing["2"],
    paddingTop: theme.spacing["2"],
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.bold,
  },
  groupCount: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  groupEmpty: {
    paddingVertical: theme.spacing["4"],
    color: theme.colors.textMuted,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
    paddingVertical: theme.spacing["4"],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  rowMeta: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  status: {
    overflow: "hidden",
    borderRadius: 6,
    paddingHorizontal: 6,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  statusOngoing: {
    backgroundColor: theme.colors.infoSubtle,
    color: theme.colors.primaryStrong,
  },
  statusDone: {
    backgroundColor: theme.colors.surfaceSubtle,
    color: theme.colors.neutral700,
  },
});
