import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import {
  EmptyState,
  ErrorState,
  FloatingActionButton,
  SegmentedTabs,
  VisualThumb,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { useMarketOverview } from "../../../src/hooks/useMarket";
import { readDesignVariant } from "../../../src/lib/designVariant";
import type { MarketOverviewItem } from "../../../src/types/market";

type Status = "all" | "sharing" | "reserved" | "done";

const statusTabs: readonly { key: Status; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "sharing", label: "나눔중" },
  { key: "reserved", label: "예약중" },
  { key: "done", label: "나눔완료" },
];

const statusHrefs = {
  all: "/market?status=all",
  sharing: "/market",
  reserved: "/market?status=reserved",
  done: "/market?status=done",
} as const;

const categories = [
  "전체",
  "의류·잡화",
  "가전·가구",
  "도서·문구",
  "식품·생필품",
  "유아·아동용품",
  "스포츠·취미",
  "기타",
] as const;

export default function MarketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    designVariant?: string;
    status?: string;
  }>();
  const variant = readDesignVariant(params.designVariant);
  const overview = useMarketOverview();
  const isError = variant === "network-error" || overview.isError;
  const isEmpty = variant === "empty";
  const activeStatus =
    params.status === "all" ||
    params.status === "sharing" ||
    params.status === "reserved" ||
    params.status === "done"
      ? params.status
      : variant === "tab-all"
        ? "all"
        : variant === "tab-reserved"
          ? "reserved"
          : variant === "tab-done"
            ? "done"
            : "sharing";
  const visiblePosts =
    isError || isEmpty
      ? []
      : activeStatus === "all"
        ? (overview.data?.items ?? [])
        : (overview.data?.items ?? []).filter(
            (post) => post.status === activeStatus,
          );
  const isLoading = overview.isPending && !isError && !isEmpty;

  return (
    <Screen scroll={false} padded={false} testID="screen-market">
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Text style={styles.title}>나눔</Text>
        </View>

        <SegmentedTabs
          items={statusTabs}
          active={activeStatus}
          onChange={(status) => router.replace(statusHrefs[status])}
          style={styles.statusTabs}
          testIDPrefix="market-status"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          style={styles.categoryScroll}
        >
          {categories.map((category) => {
            const selected = category === "전체";
            return (
              <View
                key={category}
                style={[styles.chip, selected ? styles.chipOn : null]}
              >
                <Text
                  style={[styles.chipText, selected ? styles.chipTextOn : null]}
                >
                  {category}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.list}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : isError ? (
            <ErrorState message="네트워크 연결을 확인하고 다시 시도해주세요." />
          ) : visiblePosts.length === 0 ? (
            <MarketEmptyState status={isEmpty ? null : activeStatus} />
          ) : (
            visiblePosts.map((post, index) => (
              <PostRow
                key={post.id}
                post={post}
                last={index === visiblePosts.length - 1}
                onPress={() => router.push(`/market/${post.id}`)}
              />
            ))
          )}
        </ScrollView>

        <FloatingActionButton
          label="글쓰기"
          icon="add"
          style={styles.fab}
          onPress={() => router.push("/modal/market-new")}
        />
      </View>
    </Screen>
  );
}

function PostRow({
  post,
  last,
  onPress,
}: {
  post: MarketOverviewItem;
  last: boolean;
  onPress: () => void;
}) {
  const done = post.status === "done";
  const reserved = post.status === "reserved";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, last ? styles.rowLast : null]}
    >
      <View style={styles.thumbWrap}>
        <VisualThumb size={86} seed={post.thumbSeed} />
        {done ? (
          <View style={styles.doneOverlay}>
            <Text style={styles.doneText}>나눔완료</Text>
          </View>
        ) : null}
        {reserved ? <StatusBadge /> : null}
      </View>

      <View style={[styles.rowText, done ? styles.rowTextDone : null]}>
        <Text
          numberOfLines={2}
          style={[styles.postTitle, done ? styles.postTitleDone : null]}
        >
          {post.title}
        </Text>
        <Text style={styles.postMeta}>
          {post.authorName} · {post.createdLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function StatusBadge() {
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>예약중</Text>
    </View>
  );
}

function MarketEmptyState({ status }: { status: Status | null }) {
  const message =
    status === "reserved"
      ? {
          title: "예약중인 나눔이 없어요",
          description: "관심 있는 나눔이 있다면\n댓글로 먼저 연락해보세요.",
        }
      : status === "done"
        ? {
            title: "아직 완료된 나눔이 없어요",
            description: "완료된 나눔은 이곳에서\n다시 확인할 수 있어요.",
          }
        : status === "sharing"
          ? {
              title: "진행 중인 나눔이 없어요",
              description:
                "첫 나눔을 시작해보세요.\n받는 분께 사랑을 전할 수 있어요.",
            }
          : {
              title: "아직 나눔 게시글이 없습니다",
              description:
                "첫 나눔을 시작해보세요.\n받는 분께 사랑을 전할 수 있어요.",
            };

  return (
    <View style={styles.emptyWrap}>
      <EmptyState
        title={message.title}
        description={message.description}
        icon="shopping-bag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    minHeight: 56,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  title: {
    color: theme.colors.ink,
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.extrabold,
  },
  statusTabs: {
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 10,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  categories: {
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.white,
  },
  list: {
    paddingBottom: 100,
  },
  loading: {
    paddingTop: 80,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  thumbWrap: {
    width: 86,
    height: 86,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    flexShrink: 0,
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,30,18,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
  },
  statusBadge: {
    position: "absolute",
    left: 6,
    top: 6,
    borderRadius: 6,
    backgroundColor: "#E89A3C",
    paddingHorizontal: 9,
    paddingVertical: 4,
    ...theme.shadow.card,
  },
  statusBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  rowTextDone: {
    opacity: 0.55,
  },
  postTitle: {
    color: theme.colors.ink,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: theme.fontWeight.semibold,
  },
  postTitleDone: {
    color: theme.colors.inkSoft,
  },
  postMeta: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  emptyWrap: {
    paddingHorizontal: 32,
    paddingTop: 56,
    paddingBottom: 60,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 86,
  },
});
