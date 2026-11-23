import { useQuery } from "@tanstack/react-query";
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
  Empty,
  ErrorState,
  MotionEnter,
  MOTION_STAGGER_LIMIT,
  motionStaggerDelay,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { queryKeys } from "../../src/lib/queryKeys";
import { fetchMyPageActivityLifeStudies } from "../../src/services/mypageService";

type CourseRow = {
  key: string;
  name: string;
  meta: string;
};

/** 수강 내역 원소는 값 타입이 정해지지 않아(unknown) 글자·숫자일 때만 쓴다. */
function textOf(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function cohortLabel(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}기`;
  return textOf(value);
}

function joinMeta(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" · ");
}

export default function LifeStudyHistoryScreen() {
  const history = useQuery({
    queryKey: [...queryKeys.mypage.all, "life-studies"],
    queryFn: fetchMyPageActivityLifeStudies,
  });

  const ongoing: CourseRow[] = (history.data?.ongoing ?? []).map(
    (item, index) => ({
      key: `ongoing-${textOf(item.cohortId) ?? index}`,
      name: textOf(item.name) ?? "이름 없는 과정",
      meta: joinMeta([cohortLabel(item.cohortNumber), textOf(item.period)]),
    }),
  );
  const completed: CourseRow[] = (history.data?.completed ?? []).map(
    (item, index) => {
      const completedAt = textOf(item.completedAt);
      return {
        key: `completed-${textOf(item.cohortId) ?? index}`,
        name: textOf(item.name) ?? "이름 없는 과정",
        meta: joinMeta([
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
            <Text style={styles.sectionMeta}>불러오는 중이에요.</Text>
          ) : null}
          {history.isError ? (
            <ErrorState
              message="수강 내역을 불러오지 못했어요. 다시 시도해 주세요."
              onRetry={() => void history.refetch()}
            />
          ) : null}
          {isEmpty ? (
            <Empty
              icon="book-open-page-variant-outline"
              title="수강 내역이 없어요"
              description="삶공부 과정을 수강하면 여기에 보여요."
              testID="life-study-history-empty"
            />
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
  sectionMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
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
